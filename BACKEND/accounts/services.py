# backend/accounts/services.py
import requests
import json
from datetime import datetime, timedelta
from django.core.cache import cache
import time
import random
import hashlib

# ========== LOCATION SERVICES ==========

class FreeLocationService:
    
    @staticmethod
    def get_locations(destination: str, max_results: int = 10):
        print(f"📍 Getting attractions for: {destination}")
        
        city = destination.split(',')[0].strip().title()
        
        # WAIT 3 SECONDS to avoid rate limit
        print(f"  ⏳ Waiting 3 seconds to avoid rate limit...")
        time.sleep(3)
        
        # SIMPLE search that works
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": f"museum in {city}",
            "format": "json",
            "limit": max_results,
            "addressdetails": 1,
            "accept-language": "en"
        }
        
        # Rotating User-Agent
        import random
        user_agents = [
            "TravelApp/1.0",
            "MyTravelGuide/1.0",
            "TripPlanner/1.0",
            "CityExplorer/1.0"
        ]
        headers = {"User-Agent": random.choice(user_agents)}
        
        try:
            print(f"  🔍 Calling API...")
            response = requests.get(url, params=params, headers=headers, timeout=15)
            
            print(f"  📡 Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  📊 Got {len(data)} items")
                
                if data:
                    locations = []
                    for item in data[:max_results]:
                        try:
                            name = item.get('display_name', '').split(',')[0].strip()
                            locations.append({
                                'id': f"osm_{item.get('osm_id', '')}",
                                'name': name,
                                'lat': float(item['lat']),
                                'lon': float(item['lon']),
                                'type': 'attraction',
                                'description': item.get('display_name', '')[:60],
                                'address': city,
                                'importance': 0.5,
                                'icon': 'museum',
                                'source': 'OpenStreetMap'
                            })
                        except:
                            continue
                    
                    if locations:
                        print(f"  ✅ Returning {len(locations)} locations")
                        return locations
            
            elif response.status_code == 429:
                print(f"  ⚠️ RATE LIMITED! Wait 30 seconds")
                return []
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
        
        print(f"  ❌ No data returned")
        return []  # Empty, not dummy

# ========== WEATHER SERVICE ==========

class FreeWeatherService:
    """Get weather from public APIs"""
    
    @staticmethod
    def get_forecast(lat: float, lon: float, days: int = 7):
        """
        Get weather forecast - tries multiple public APIs
        """
        print(f"🌤️ Getting weather for: {lat}, {lon}")
        
        # Try Open-Meteo first (most reliable free API)
        weather = FreeWeatherService._try_openmeteo(lat, lon, days)
        if weather:
            return weather
        
        # Try Tomorrow.io (free tier)
        weather = FreeWeatherService._try_tomorrow_io(lat, lon, days)
        if weather:
            return weather
        
        # Generate realistic weather
        return FreeWeatherService._generate_realistic_weather(lat, lon, days)
    
    @staticmethod
    def _try_openmeteo(lat: float, lon: float, days: int):
        """Open-Meteo API (no key needed)"""
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": "temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max",
            "forecast_days": min(days, 16),
            "timezone": "auto",
            "current_weather": True,
            "temperature_unit": "celsius"
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                
                # Add descriptions
                if 'daily' in data and 'weathercode' in data['daily']:
                    data['daily']['weather_description'] = [
                        FreeWeatherService._decode_weather_code(code)
                        for code in data['daily']['weathercode']
                    ]
                
                return data
        except:
            pass
        return None
    
    @staticmethod
    def _try_tomorrow_io(lat: float, lon: float, days: int):
        """Tomorrow.io API (free tier - needs key but demo available)"""
        # Using public demo key
        api_key = "YOUR_KEY_HERE"  # Can leave empty for testing
        
        if not api_key or api_key == "YOUR_KEY_HERE":
            return None
            
        url = f"https://api.tomorrow.io/v4/weather/forecast"
        params = {
            "location": f"{lat},{lon}",
            "apikey": api_key,
            "timesteps": "1d",
            "units": "metric"
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                # Format to match our structure
                return FreeWeatherService._format_tomorrow_data(data, days)
        except:
            pass
        return None
    
    @staticmethod
    def _generate_realistic_weather(lat: float, lon: float, days: int):
        """Generate realistic weather based on location"""
        from datetime import datetime, timedelta
        
        # Climate based on latitude
        if abs(lat) > 60:  # Polar
            base_temp = random.randint(-10, 10)
            weather_codes = [random.choice([71, 73, 75, 3, 45]) for _ in range(days)]
        elif abs(lat) > 40:  # Temperate
            base_temp = random.randint(5, 25)
            weather_codes = [random.choice([0, 1, 2, 3, 61, 63]) for _ in range(days)]
        else:  # Tropical
            base_temp = random.randint(20, 35)
            weather_codes = [random.choice([0, 1, 2, 80, 81, 95]) for _ in range(days)]
        
        dates = [(datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d') 
                for i in range(days)]
        
        temp_max = [base_temp + random.randint(-3, 5) for _ in range(days)]
        temp_min = [t - random.randint(5, 10) for t in temp_max]
        
        return {
            "latitude": lat,
            "longitude": lon,
            "daily": {
                "time": dates,
                "temperature_2m_max": temp_max,
                "temperature_2m_min": temp_min,
                "weathercode": weather_codes,
                "weather_description": [
                    FreeWeatherService._decode_weather_code(code) for code in weather_codes
                ],
                "precipitation_probability_max": [random.randint(0, 70) for _ in range(days)]
            },
            "current_weather": {
                "temperature": (temp_max[0] + temp_min[0]) / 2,
                "weathercode": weather_codes[0],
                "description": FreeWeatherService._decode_weather_code(weather_codes[0])
            },
            "source": "Generated"
        }
    
    @staticmethod
    def _decode_weather_code(code: int) -> str:
        """Convert weather code to description"""
        codes = {
            0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
            45: "Foggy", 48: "Foggy",
            51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
            61: "Light rain", 63: "Moderate rain", 65: "Heavy rain",
            71: "Light snow", 73: "Moderate snow", 75: "Heavy snow",
            80: "Light showers", 81: "Moderate showers", 82: "Heavy showers",
            95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm"
        }
        return codes.get(code, "Partly cloudy")

# ========== PLACES SERVICE ==========

class FreePlacesService:
    """Get place information from Wikipedia"""
    
    @staticmethod
    def get_place_info(query: str, location_hint: str = ""):
        """
        Get Wikipedia information about a place
        """
        print(f"🔍 Getting info for: {query}")
        
        search_query = f"{query} {location_hint}".strip()
        url = "https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": f"intitle:{search_query}",
            "gsrlimit": 3,
            "prop": "extracts|pageimages|info",
            "exintro": True,
            "explaintext": True,
            "inprop": "url",
            "piprop": "thumbnail",
            "pithumbsize": 300,
            "redirects": 1,
        }
        
        headers = {"User-Agent": "TravelGuide/1.0"}
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                pages = data.get("query", {}).get("pages", {})
                
                if pages:
                    page_id = next(iter(pages))
                    page = pages[page_id]
                    
                    return {
                        'title': page.get('title', query),
                        'summary': page.get('extract', 'No information available.'),
                        'thumbnail': page.get('thumbnail', {}).get('source', ''),
                        'url': page.get('fullurl', ''),
                        'success': True,
                        'source': 'Wikipedia'
                    }
        except:
            pass
        
        return {
            'title': query,
            'summary': f"Information about {query} in {location_hint or 'the area'}.",
            'success': False,
            'source': 'Generated'
        }

# ========== TRANSPORT SERVICE ==========

class FreeTransportService:
    """Get transport information"""
    
    @staticmethod
    def get_transport_options(lat: float, lon: float, destination_lat: float = None, destination_lon: float = None):
        """
        Get transport information between locations
        """
        # Public routing API (OSRM)
        if destination_lat and destination_lon:
            try:
                route = FreeTransportService._get_osrm_route(lat, lon, destination_lat, destination_lon)
                if route:
                    return route
            except:
                pass
        
        # General transport info
        return {
            'available': True,
            'suggestions': [
                'Check local public transport websites',
                'Use ride-sharing apps like Uber or local alternatives',
                'Consider walking for short distances',
                'Look for bike rental stations',
                'Check airport/train station websites for schedules'
            ],
            'tips': [
                'Public transport is often cheapest',
                'Walking tours are great for sightseeing',
                'Download local transport apps in advance'
            ],
            'source': 'General advice'
        }
    
    @staticmethod
    def _get_osrm_route(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
        """Get route from OSRM (Open Source Routing Machine)"""
        url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}"
        params = {
            "overview": "false",
            "steps": "true"
        }
        
        try:
            response = requests.get(url, params=params, timeout=8)
            if response.status_code == 200:
                data = response.json()
                routes = data.get('routes', [])
                if routes:
                    route = routes[0]
                    distance_km = route.get('distance', 0) / 1000
                    duration_min = route.get('duration', 0) / 60
                    
                    return {
                        'available': True,
                        'distance_km': round(distance_km, 1),
                        'duration_min': round(duration_min, 1),
                        'mode': 'driving',
                        'source': 'OSRM'
                    }
        except:
            pass
        
        return None

# ========== EVENTS SERVICE ==========

class FreeEventsService:
    """Get local events information"""
    
    @staticmethod
    def get_local_events(location: str, date: str = None):
        """
        Get local events information
        """
        # Note: Most event APIs require keys, so we provide general advice
        return {
            'available': False,
            'suggestions': [
                f'Check {location} tourism board website',
                'Search for events on social media platforms',
                'Look for local event calendars online',
                'Ask hotel concierge for recommendations',
                'Check museum and cultural center schedules'
            ],
            'tips': [
                'Many cities have free walking tours',
                'Local markets often have cultural events',
                'Check university event calendars',
                'Follow local hashtags on social media'
            ],
            'source': 'General advice'
        }

# ========== CACHE WRAPPER ==========

class FreeAPICache:
    """Cache wrapper for API calls"""
    
    @staticmethod
    def get_cached_or_fetch(cache_key: str, fetch_function, *args, ttl_hours: int = 6, **kwargs):
        """
        Get from cache or fetch fresh data
        """
        # Check cache first
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            print(f"📦 Using cached: {cache_key}")
            return cached_data
        
        # Fetch fresh
        print(f"🔄 Fetching fresh: {cache_key}")
        fresh_data = fetch_function(*args, **kwargs)
        
        # Cache if valid
        if fresh_data:
            cache.set(cache_key, fresh_data, timeout=ttl_hours * 3600)
        
        return fresh_data

# ========== HELPER FUNCTIONS ==========

def get_safe_coordinates(city: str):
    """Get safe fallback coordinates for a city"""
    city_coords = {
        "Paris": (48.8566, 2.3522),
        "London": (51.5074, -0.1278),
        "New York": (40.7128, -74.0060),
        "Tokyo": (35.6762, 139.6503),
        "Dubai": (25.2048, 55.2708),
        "Singapore": (1.3521, 103.8198),
        "Sydney": (-33.8688, 151.2093),
        "Mumbai": (19.0760, 72.8777),
        "Berlin": (52.5200, 13.4050),
        "Rome": (41.9028, 12.4964),
    }
    
    return city_coords.get(city, (40.7128, -74.0060))  # Default to NYC