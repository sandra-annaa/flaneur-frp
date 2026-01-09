from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    signup, 
    login, 
    TripViewSet, 
    debug_create_trip, 
    generate_smart_itinerary,  # Updated from generate_itinerary
    get_free_locations,
    get_free_weather,
    get_place_details,
    get_trip_transport_info,
    get_trip_events,
    debug_free_apis,
    my_trips
)

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    # ========== AUTHENTICATION ==========
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ========== USER TRIPS ==========
    path('my-trips/', my_trips, name='my-trips'),
    
    # ========== FREE API ENDPOINTS ==========
    # Location & Weather Data
    path('trips/<int:trip_id>/locations/', get_trip_locations, name='trip-locations'),
    path('trips/<int:trip_id>/weather/', get_trip_weather, name='trip-weather'),
    
    # Additional Free Services
    path('trips/<int:trip_id>/transport/', get_trip_transport_info, name='trip-transport'),
    path('trips/<int:trip_id>/events/', get_trip_events, name='trip-events'),
    path('places/details/', get_place_details, name='place-details'),
    
    # ========== ITINERARY GENERATION ==========
    path('trips/<int:trip_id>/generate-itinerary/', generate_smart_itinerary, name='generate-smart-itinerary'),
    
    # ========== DEBUG & TESTING ==========
    path('debug/create-trip/', debug_create_trip, name='debug-create-trip'),
    path('debug/free-apis/', debug_free_apis, name='debug-free-apis'),
    
    # ========== DEFAULT ROUTER (keep last) ==========
    path('', include(router.urls)),
]

# Optional: API Documentation URLs
urlpatterns += [
    # You can add API documentation endpoints here
    # path('schema/', get_schema_view(title="Travel Planner API"), name='api-schema'),
    # path('docs/', include_docs_urls(title='Travel Planner API')),
]