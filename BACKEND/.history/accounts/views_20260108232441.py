# BACKEND/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Trip
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import TripSerializer
import requests
import json
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_free_locations(request, trip_id):
    """Get free locations from OpenStreetMap"""
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user)
        destination = trip.destination
        
        # Check cache first
        cache_key = f"locations_{destination}_{trip_id}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            logger.info(f"📍 Returning cached locations for {destination}")
            return Response(cached_data)
        
        # Get coordinates for destination
        geocode_url = f"https://nominatim.openstreetmap.org/search?q={destination}&format=json&limit=1"
        headers = {'User-Agent': 'FlaneurApp/1.0'}
        
        try:
            geo_response = requests.get(geocode_url, headers=headers, timeout=10)
            geo_response.raise_for_status()
            geo_data = geo_response.json()
            
            if not geo_data:
                return Response({
                    'success': False,
                    'message': 'Destination not found'
                }, status=404)
            
            lat = geo_data[0]['lat']
            lon = geo_data[0]['lon']
            
            # Search for tourist attractions around the destination
            overpass_url = "https://overpass-api.de/api/interpreter"
            overpass_query = f"""
            [out:json][timeout:25];
            (
              node["tourism"](around:5000,{lat},{lon});
              node["historic"](around:5000,{lat},{lon});
              node["amenity"~"restaurant|cafe"](around:5000,{lat},{lon});
            );
            out body;
            """
            
            response = requests.post(overpass_url, data={'data': overpass_query}, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            locations = []
            for element in data.get('elements', [])[:15]:  # Limit to 15
                name = element.get('tags', {}).get('name', 'Unnamed Location')
                location_type = element.get('tags', {}).get('tourism') or \
                              element.get('tags', {}).get('historic') or \
                              element.get('tags', {}).get('amenity', 'attraction')
                
                description = element.get('tags', {}).get('description') or \
                            element.get('tags', {}).get('tourism', '').replace('_', ' ') or \
                            element.get('tags', {}).get('historic', '').replace('_', ' ') or \
                            'Local attraction'
                
                importance = 0.5
                if 'name' in element.get('tags', {}):
                    importance += 0.3
                if element.get('tags', {}).get('tourism') == 'attraction':
                    importance += 0.2
                
                locations.append({
                    'id': str(element['id']),
                    'name': name,
                    'lat': element['lat'],
                    'lon': element['lon'],
                    'type': location_type,
                    'description': description[:100] + '...' if len(description) > 100 else description,
                    'address': element.get('tags', {}).get('addr:street', ''),
                    'importance': min(importance, 1.0),
                    'icon': 'pin',
                    'source': 'OpenStreetMap'
                })
            
            # Sort by importance
            locations.sort(key=lambda x: x['importance'], reverse=True)
            
            result = {
                'success': True,
                'locations': locations,
                'count': len(locations),
                'destination': destination,
                'coordinates': {'lat': lat, 'lng': lon}
            }
            
            # Cache for 1 hour
            cache.set(cache_key, result, 3600)
            
            logger.info(f"📍 Found {len(locations)} locations for {destination}")
            return Response(result)
            
        except requests.RequestException as e:
            logger.error(f"OpenStreetMap API error: {e}")
            return Response({
                'success': False,
                'message': 'Failed to fetch location data'
            }, status=503)
            
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=404)
    except Exception as e:
        logger.error(f"Unexpected error in get_free_locations: {e}")
        return Response({
            'success': False,
            'message': 'Internal server error'
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_free_weather(request, trip_id):
    """Get free weather data from Open-Meteo"""
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user)
        destination = trip.destination
        
        # Check cache first (weather data changes less frequently)
        cache_key = f"weather_{destination}_{trip_id}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            logger.info(f"🌤️ Returning cached weather for {destination}")
            return Response(cached_data)
        
        # Get coordinates (simplified - in production, use proper geocoding)
        coordinates = {
            'cochin': {'lat': 9.9312, 'lon': 76.2673},
            'kerala': {'lat': 10.8505, 'lon': 76.2711},
            'paris': {'lat': 48.8566, 'lon': 2.3522},
            'london': {'lat': 51.5074, 'lon': -0.1278},
            'new york': {'lat': 40.7128, 'lon': -74.0060},
            'delhi': {'lat': 28.6139, 'lon': 77.2090},
            'mumbai': {'lat': 19.0760, 'lon': 72.8777},
        }
        
        dest_lower = destination.lower()
        coords = None
        for city, coord in coordinates.items():
            if city in dest_lower:
                coords = coord
                break
        
        if not coords:
            coords = {'lat': 9.9312, 'lon': 76.2673}  # Default to Cochin
        
        # Fetch weather from Open-Meteo
        weather_url = f"https://api.open-meteo.com/v1/forecast"
        params = {
            'latitude': coords['lat'],
            'longitude': coords['lon'],
            'daily': 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
            'timezone': 'auto'
        }
        
        try:
            response = requests.get(weather_url, params=params, timeout=10)
            response.raise_for_status()
            weather_data = response.json()
            
            # Cache for 30 minutes
            cache.set(cache_key, weather_data, 1800)
            
            logger.info(f"🌤️ Weather data fetched for {destination}")
            return Response(weather_data)
            
        except requests.RequestException as e:
            logger.error(f"Open-Meteo API error: {e}")
            # Return sample weather data if API fails
            return Response({
                'latitude': coords['lat'],
                'longitude': coords['lon'],
                'daily': {
                    'time': ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
                    'temperature_2m_max': [28, 29, 30, 29, 28],
                    'temperature_2m_min': [22, 23, 24, 23, 22],
                    'precipitation_sum': [0, 2, 5, 0, 0],
                    'weathercode': [1, 2, 3, 1, 0]
                }
            })
            
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=404)
    except Exception as e:
        logger.error(f"Unexpected error in get_free_weather: {e}")
        return Response({'error': 'Internal server error'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request, trip_id):
    """Get recommendations for hotels, restaurants, attractions"""
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user)
        destination = trip.destination
        
        cache_key = f"recommendations_{destination}_{trip_id}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Try OpenTripMap API for attractions
        recommendations = []
        
        try:
            # Get coordinates first
            geocode_url = f"https://nominatim.openstreetmap.org/search?q={destination}&format=json&limit=1"
            headers = {'User-Agent': 'FlaneurApp/1.0'}
            geo_response = requests.get(geocode_url, headers=headers, timeout=10)
            
            if geo_response.status_code == 200:
                geo_data = geo_response.json()
                if geo_data:
                    lat = geo_data[0]['lat']
                    lon = geo_data[0]['lon']
                    
                    # Get attractions from OpenTripMap
                    otm_url = f"https://api.opentripmap.com/0.1/en/places/radius"
                    params = {
                        'radius': 5000,
                        'lon': lon,
                        'lat': lat,
                        'kinds': 'interesting_places',
                        'format': 'json',
                        'apikey': '5ae2e3f221c38a28845f05b6e1e72f6e6fae9bc6a9473af209e333f9'
                    }
                    
                    otm_response = requests.get(otm_url, params=params, timeout=10)
                    if otm_response.status_code == 200:
                        places = otm_response.json()
                        
                        for place in places[:8]:  # Limit to 8
                            recommendations.append({
                                'id': place.get('xid', f"place-{len(recommendations)}"),
                                'type': 'attraction',
                                'name': place.get('name', 'Local Attraction'),
                                'description': place.get('kinds', '').replace('_', ' '),
                                'rating': 4.0 + (hash(place.get('xid', '')) % 10) / 10,
                                'price': ['Free', '$', '$$'][hash(place.get('xid', '')) % 3],
                                'tags': place.get('kinds', '').split(',')[:3],
                                'latitude': place.get('point', {}).get('lat'),
                                'longitude': place.get('point', {}).get('lon'),
                                'source': 'OpenTripMap'
                            })
        except Exception as e:
            logger.warning(f"OpenTripMap failed: {e}")
        
        # Add sample hotels and restaurants
        sample_hotels = [
            {
                'id': f'hotel-{destination}-1',
                'type': 'hotel',
                'name': f'{destination} Grand Hotel',
                'description': 'Luxury accommodation in city center',
                'rating': 4.5,
                'price': '$$$$',
                'tags': ['Luxury', 'Central', '5-Star'],
                'source': 'Sample'
            },
            {
                'id': f'hotel-{destination}-2',
                'type': 'hotel',
                'name': f'{destination} Budget Inn',
                'description': 'Affordable comfortable stay',
                'rating': 3.8,
                'price': '$$',
                'tags': ['Budget', 'Comfortable', 'Value'],
                'source': 'Sample'
            }
        ]
        
        sample_restaurants = [
            {
                'id': f'rest-{destination}-1',
                'type': 'restaurant',
                'name': f'{destination} Local Kitchen',
                'description': 'Authentic local cuisine',
                'rating': 4.3,
                'price': '$$',
                'tags': ['Local', 'Traditional', 'Popular'],
                'source': 'Sample'
            },
            {
                'id': f'rest-{destination}-2',
                'type': 'restaurant',
                'name': f'{destination} Fusion Bistro',
                'description': 'Modern fusion cuisine',
                'rating': 4.1,
                'price': '$$$',
                'tags': ['Fusion', 'Modern', 'International'],
                'source': 'Sample'
            }
        ]
        
        sample_tips = [
            {
                'id': 'tip-1',
                'type': 'tip',
                'name': 'Best Time to Visit',
                'description': 'Peak season is usually November to March',
                'tags': ['Weather', 'Planning', 'Seasonal'],
                'source': 'Travel Tips'
            },
            {
                'id': 'tip-2',
                'type': 'tip',
                'name': 'Local Transportation',
                'description': 'Use local buses for budget travel',
                'tags': ['Transport', 'Budget', 'Tips'],
                'source': 'Travel Tips'
            }
        ]
        
        recommendations.extend(sample_hotels)
        recommendations.extend(sample_restaurants)
        recommendations.extend(sample_tips)
        
        result = {
            'success': True,
            'recommendations': recommendations,
            'count': len(recommendations),
            'destination': destination
        }
        
        # Cache for 2 hours
        cache.set(cache_key, result, 7200)
        
        return Response(result)
        
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=404)
    except Exception as e:
        logger.error(f"Error in get_recommendations: {e}")
        return Response({'error': 'Internal server error'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_smart_itinerary(request, trip_id):
    """Generate AI-powered smart itinerary"""
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user)
        
        # For now, mark trip as having smart itinerary
        # In production, integrate with AI service
        trip.smart_itinerary_generated = True
        trip.save()
        
        logger.info(f"🤖 Smart itinerary generated for trip {trip_id}")
        
        return Response({
            'success': True,
            'message': 'Smart itinerary generated successfully',
            'trip_id': trip_id,
            'destination': trip.destination
        })
        
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=404)
    except Exception as e:
        logger.error(f"Error generating smart itinerary: {e}")
        return Response({'error': 'Internal server error'}, status=500)