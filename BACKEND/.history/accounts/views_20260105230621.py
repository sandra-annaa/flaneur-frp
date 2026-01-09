import json
from .services import (
    FreeLocationService, 
    FreeWeatherService, 
    FreePlacesService,
    FreeTransportService,
    FreeEventsService,
    FreeAPICache
)
from django.core.cache import cache
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Trip
from .serializers import TripSerializer
import logging

# Setup logger
logger = logging.getLogger(__name__)

# ================ AUTH VIEWS ================
@api_view(['POST'])
def signup(request):
    """User registration endpoint"""
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password required'}, status=400)

    if User.objects.filter(username=email).exists():
        return Response({'error': 'User already exists'}, status=400)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password
    )

    return Response({
        'success': True,
        'message': 'User created successfully',
        'user_id': user.id,
        'email': user.email
    }, status=201)


@api_view(['POST'])
def login(request):
    """User login with JWT tokens"""
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(username=email, password=password)

    if not user:
        return Response({'error': 'Invalid credentials'}, status=401)

    refresh = RefreshToken.for_user(user)

    return Response({
        'success': True,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username
        }
    })


# ================ TRIP VIEWS ================
class TripViewSet(viewsets.ModelViewSet):
    """
    API endpoint for trips.
    Users can only see and modify their own trips.
    """
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_trips(request):
    """Get all trips for the current user"""
    trips = Trip.objects.filter(user=request.user)
    serializer = TripSerializer(trips, many=True)
    return Response({
        'success': True,
        'count': len(serializer.data),
        'trips': serializer.data
    })


# ================ FREE API ENDPOINTS ================
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_trip_locations(request, trip_id):
    """Get real locations for a trip using OpenStreetMap"""
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user)
        
        # Use caching wrapper
        cache_key = f"free_locations_{trip.destination}_{trip_id}"
        locations = FreeAPICache.get_cached_or_fetch(
            cache_key,
            FreeLocationService.get_locations,
            trip.destination,
            ttl_hours=24  # Cache for 24 hours
        )
        
        return Response({
            'success': True,
            'trip_id': trip_id,
            'destination': trip.destination,
            'locations': locations or [],
            'count': len(locations) if locations else 0,
            'cache_info': {
                'cached': cache.get(cache_key) is not None,
                'ttl_hours': 24
            }
        })
        
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching locations: {e}")
        return Response({
            'error': 'Failed to fetch locations',
            'details': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_trip_weather(request, trip_id):
    """Get weather forecast for a trip using Open-Meteo"""
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user)
        
        # Get locations first (cached)
        cache_key_locations = f"free_locations_{trip.destination}_{trip_id}"
        locations = FreeAPICache.get_cached_or_fetch(
            cache_key_locations,
            FreeLocationService.get_locations,
            trip.destination,
            ttl_hours=24
        )
        
        if not locations:
            return Response({
                'success': False,
                'message': 'Could not find location coordinates for weather'
            }, status=400)
        
        # Use first location's coordinates
        lat = locations[0]['lat']
        lon = locations[0]['lon']
        
        # Get weather with caching
        cache_key_weather = f"free_weather_{lat}_{lon}_{trip.duration}"
        weather_data = FreeAPICache.get_cached_or_fetch(
            cache_key_weather,
            FreeWeatherService.get_forecast,
            lat, lon, trip.duration,
            ttl_hours=6  # Weather cache for 6 hours
        )
        
        if weather_data:
            return Response({
                'success': True,
                'trip_id': trip_id,
                'destination': trip.destination,
                'coordinates': {'lat': lat, 'lon': lon},
                'weather': weather_data,
                'forecast_days': trip.duration,
                'cache_info': {
                    'locations_cached': cache.get(cache_key_locations) is not None,
                    'weather_cached': cache.get(cache_key_weather) is not None
                }
            })
        
        return Response({
            'success': False,
            'message': 'Weather data unavailable'
        }, status=503)  # Service unavailable
        
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching weather: {e}")
        return Response({
            'error': 'Failed to fetch weather',
            'details': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_place_details(request):
    """Get detailed information about a place using Wikipedia"""
    place_name = request.GET.get('place', '')
    location = request.GET.get('location', '')
    
    if not place_name:
        return Response({'error': 'Place name is required'}, status=400)
    
    try:
        # Use caching for Wikipedia data
        cache_key = f"place_details_{place_name}_{location}"
        place_info = FreeAPICache.get_cached_or_fetch(
            cache_key,
            FreePlacesService.get_place_info,
            place_name, location,
            ttl_hours=168  # Cache for 1 week (168 hours)
        )
        
        if place_info:
            return Response({
                'success': True,
                'place': place_name,
                'location': location,
                'details': place_info,
                'source': 'Wikipedia API'
            })
        
        return Response({
            'success': False,
            'message': 'No information found for this place',
            'place': place_name
        })
        
    except Exception as e:
        logger.error(f"Error fetching place details: {e}")
        return Response({
            'error': 'Failed to fetch place details',
            'details': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_trip_transport_info(request, trip_id):
    """Get transportation information for a trip"""
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user)
        
        # Get locations for coordinates
        locations = FreeLocationService.get_locations(trip.destination)
        
        if locations:
            lat = locations[0]['lat']
            lon = locations[0]['lon']
            
            # Get transport information
            transport_info = FreeTransportService.get_transport_options(lat, lon)
            
            return Response({
                'success': True,
                'trip_id': trip_id,
                'destination': trip.destination,
                'transport': transport_info,
                'travel_mode': trip.travel_mode
            })
        
        return Response({
            'success': False,
            'message': 'Could not get location for transport info'
        })
        
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching transport info: {e}")
        return Response({
            'error': 'Failed to fetch transport information',
            'details': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_trip_events(request, trip_id):
    """Get local events for a trip destination"""
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user)
        
        events_info = FreeEventsService.get_local_events(
            trip.destination,
            str(trip.start_date)
        )
        
        return Response({
            'success': True,
            'trip_id': trip_id,
            'destination': trip.destination,
            'events': events_info,
            'trip_dates': {
                'start': trip.start_date,
                'end': trip.start_date + timezone.timedelta(days=trip.duration)
            }
        })
        
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching events: {e}")
        return Response({
            'error': 'Failed to fetch events information',
            'details': str(e)
        }, status=500)


# ================ ITINERARY GENERATION WITH FREE DATA ================
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_smart_itinerary(request, trip_id):
    """
    Generate itinerary using free APIs instead of OpenAI
    Combines real locations, weather, and intelligent scheduling
    """
    try:
        trip = Trip.objects.get(id=trip_id, user=request.user)
        
        # Get all real data
        locations = FreeLocationService.get_locations(trip.destination)
        weather = None
        if locations:
            weather = FreeWeatherService.get_forecast(
                locations[0]['lat'], 
                locations[0]['lon'], 
                trip.duration
            )
        
        # Generate itinerary based on real data
        itinerary = generate_free_itinerary(trip, locations, weather)
        
        # Save to trip
        trip.itinerary = itinerary
        trip.generated_at = timezone.now()
        trip.itinerary_source = 'free_apis'
        trip.save()
        
        return Response({
            'success': True,
            'itinerary': itinerary,
            'data_sources': {
                'locations': 'OpenStreetMap',
                'weather': 'Open-Meteo',
                'places': 'Wikipedia'
            },
            'message': 'Itinerary generated using free real-world data'
        })
        
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=404)
    except Exception as e:
        logger.error(f"Error generating itinerary: {e}")
        return Response({
            'error': 'Failed to generate itinerary',
            'details': str(e)
        }, status=500)


def generate_free_itinerary(trip, locations, weather_data):
    """Generate itinerary using free API data"""
    
    # Categorize locations
    attractions = [loc for loc in locations if loc['type'] in ['attraction', 'historical']]
    restaurants = [loc for loc in locations if loc['type'] == 'restaurant']
    leisure = [loc for loc in locations if loc['type'] == 'leisure']
    
    # Create daily itinerary
    daily_itinerary = []
    
    for day in range(1, trip.duration + 1):
        day_plan = {
            'day': day,
            'date': str(trip.start_date + timezone.timedelta(days=day-1)),
            'themes': get_day_theme(day, trip.duration, trip.interests),
            'activities': []
        }
        
        # Morning activity
        if day == 1:
            day_plan['activities'].append({
                'time': '09:00-12:00',
                'type': 'arrival_settle',
                'title': 'Arrival & Check-in',
                'description': f'Arrive at {trip.destination} and check into your {trip.accommodation}',
                'location': trip.accommodation,
                'budget_tip': 'Consider public transport from airport'
            })
        elif attractions:
            morning_attraction = attractions[day % len(attractions)] if attractions else None
            day_plan['activities'].append({
                'time': '09:00-12:00',
                'type': 'sightseeing',
                'title': morning_attraction['name'] if morning_attraction else 'Morning Exploration',
                'description': morning_attraction['description'] if morning_attraction else f'Explore {trip.destination}',
                'location': morning_attraction['address'] if morning_attraction else 'Various locations',
                'coordinates': {'lat': morning_attraction['lat'], 'lon': morning_attraction['lon']} if morning_attraction else None,
                'budget_tip': 'Many attractions offer student/senior discounts'
            })
        
        # Lunch
        if restaurants:
            lunch_spot = restaurants[day % len(restaurants)]
            day_plan['activities'].append({
                'time': '12:30-14:00',
                'type': 'meal',
                'title': 'Lunch',
                'description': f'Try local cuisine at {lunch_spot["name"]}',
                'location': lunch_spot['address'],
                'budget_tip': 'Lunch specials are often cheaper than dinner'
            })
        
        # Afternoon activity
        if leisure or attractions:
            afternoon_activity = leisure[day % len(leisure)] if leisure else attractions[(day + 1) % len(attractions)]
            day_plan['activities'].append({
                'time': '14:30-17:00',
                'type': 'exploration',
                'title': afternoon_activity['name'],
                'description': afternoon_activity['description'],
                'location': afternoon_activity['address'],
                'coordinates': {'lat': afternoon_activity['lat'], 'lon': afternoon_activity['lon']},
                'budget_tip': 'Walking tours are often free or low-cost'
            })
        
        # Evening
        day_plan['activities'].append({
            'time': '19:00-21:00',
            'type': 'meal',
            'title': 'Dinner',
            'description': 'Enjoy local specialties',
            'location': 'Recommended local restaurants',
            'budget_tip': 'Restaurants away from tourist areas are often cheaper'
        })
        
        # Add weather info if available
        if weather_data and 'daily' in weather_data and day <= len(weather_data['daily']['time']):
            day_plan['weather'] = {
                'temperature_max': weather_data['daily']['temperature_2m_max'][day-1],
                'temperature_min': weather_data['daily']['temperature_2m_min'][day-1],
                'conditions': FreeWeatherService._decode_weather_code(
                    weather_data['daily']['weathercode'][day-1]
                )
            }
        
        daily_itinerary.append(day_plan)
    
    # Create complete itinerary
    itinerary = {
        'trip_info': {
            'destination': trip.destination,
            'duration': trip.duration,
            'budget': trip.budget,
            'interests': trip.interests,
            'travelers': trip.travelers
        },
        'daily_itinerary': daily_itinerary,
        'recommended_places': [
            {'name': loc['name'], 'type': loc['type'], 'description': loc['description']}
            for loc in locations[:10]
        ],
        'packing_suggestions': get_packing_suggestions(trip, weather_data),
        'budget_tips': get_budget_tips(trip.budget),
        'transport_tips': FreeTransportService.get_transport_options(0, 0),
        'data_sources': ['OpenStreetMap', 'Open-Meteo', 'Wikipedia']
    }
    
    return itinerary


def get_day_theme(day, total_days, interests):
    """Get theme for the day based on interests"""
    themes = {
        'sightseeing': ['Cultural Immersion', 'Historical Exploration', 'Architectural Tour'],
        'adventure': ['Outdoor Adventure', 'Nature Exploration', 'Active Day'],
        'relaxation': ['Leisure Day', 'Wellness & Relaxation', 'Slow Travel'],
        'food': ['Culinary Exploration', 'Foodie Adventure', 'Local Tastes']
    }
    
    base_themes = themes.get(interests, ['Exploration', 'Discovery', 'Experience'])
    return base_themes[day % len(base_themes)]


def get_packing_suggestions(trip, weather_data):
    """Generate packing suggestions based on trip details and weather"""
    suggestions = []
    
    # Basic essentials
    suggestions.extend([
        'Travel documents (passport, ID, tickets)',
        'Wallet with local currency',
        'Phone and charger',
        'Medications and first aid kit'
    ])
    
    # Weather-based clothing
    if weather_data:
        avg_temp = sum(weather_data['daily']['temperature_2m_max']) / len(weather_data['daily']['temperature_2m_max'])
        if avg_temp > 25:
            suggestions.append('Light clothing, sunscreen, hat')
        elif avg_temp < 10:
            suggestions.append('Warm clothing, jacket, gloves')
        else:
            suggestions.append('Layered clothing for variable weather')
    
    # Activity-based items
    if trip.interests == 'adventure':
        suggestions.extend(['Comfortable hiking shoes', 'Backpack', 'Water bottle'])
    elif trip.interests == 'relaxation':
        suggestions.extend(['Swimwear', 'Beach towel', 'Sunglasses'])
    
    # Travel-specific
    suggestions.extend([
        f'{trip.duration} days worth of clothing',
        'Toiletries',
        'Travel adapter if needed',
        'Camera or smartphone for photos'
    ])
    
    return suggestions


def get_budget_tips(budget_level):
    """Get budget-specific tips"""
    tips = {
        'budget': [
            'Use public transportation instead of taxis',
            'Eat at local markets and street food stalls',
            'Look for free walking tours',
            'Book accommodation in advance for better rates',
            'Visit free attractions like parks and museums'
        ],
        'midrange': [
            'Mix budget and premium experiences',
            'Book tours directly with local operators',
            'Try both street food and mid-range restaurants',
            'Consider boutique hotels for better value',
            'Use ride-sharing for convenience'
        ],
        'luxury': [
            'Book premium experiences in advance',
            'Consider private tours for personalized experiences',
            'Try fine dining restaurants with local cuisine',
            'Stay at centrally located premium hotels',
            'Use concierge services for recommendations'
        ]
    }
    return tips.get(budget_level, tips['midrange'])


# ================ DEBUG VIEWS ================
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_free_apis(request):
    """Debug endpoint to test all free APIs"""
    test_destination = request.GET.get('destination', 'Paris')
    
    results = {
        'destination': test_destination,
        'services': {}
    }
    
    # Test location service
    try:
        locations = FreeLocationService.get_locations(test_destination)
        results['services']['locations'] = {
            'success': bool(locations),
            'count': len(locations) if locations else 0,
            'sample': locations[0] if locations else None
        }
    except Exception as e:
        results['services']['locations'] = {'error': str(e)}
    
    # Test weather service if we have locations
    if locations:
        try:
            weather = FreeWeatherService.get_forecast(locations[0]['lat'], locations[0]['lon'])
            results['services']['weather'] = {
                'success': bool(weather),
                'has_daily_data': 'daily' in weather if weather else False
            }
        except Exception as e:
            results['services']['weather'] = {'error': str(e)}
    
    # Test places service
    try:
        place_info = FreePlacesService.get_place_info(test_destination, test_destination)
        results['services']['places'] = {
            'success': bool(place_info),
            'has_summary': 'summary' in place_info if place_info else False
        }
    except Exception as e:
        results['services']['places'] = {'error': str(e)}
    
    return Response(results)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def debug_create_trip(request):
    """Debug endpoint to test trip creation"""
    logger.info("Debug trip creation request received")
    logger.info(f"User: {request.user.username} (ID: {request.user.id})")
    logger.info(f"Data: {request.data}")
    
    try:
        trip = Trip.objects.create(
            user=request.user,
            destination=request.data.get('destination', 'Test Destination'),
            start_date=request.data.get('start_date', '2024-01-01'),
            duration=request.data.get('duration', 3),
            travelers=request.data.get('travelers', 'solo'),
            budget=request.data.get('budget', 'midrange'),
            interests=request.data.get('interests', 'sightseeing'),
            travel_mode=request.data.get('travel_mode', 'flight'),
            accommodation=request.data.get('accommodation', 'hotel')
        )
        serializer = TripSerializer(trip)
        logger.info(f"Trip created successfully with ID: {trip.id}")
        return Response({
            'success': True,
            'trip': serializer.data
        }, status=201)
    except Exception as e:
        logger.error(f"Debug trip creation error: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=400)