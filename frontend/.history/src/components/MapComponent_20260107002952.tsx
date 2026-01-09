import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { MapPin, Cloud, Thermometer } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import L from 'leaflet';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface RealLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  address: string;
  importance: number;
  icon: string;
  source: string;
}

interface WeatherData {
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
    precipitation_probability_max: number[];
  };
  current_weather?: {
    temperature: number;
    weathercode: number;
  };
}

interface MapComponentProps {
  tripId: number;
  destination: string;
}

export default function RealMapComponent({ tripId, destination }: MapComponentProps) {
  console.log('🗺️ MapComponent loaded with:', { tripId, destination });
  
  const [locations, setLocations] = useState<RealLocation[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (tripId && tripId > 0) {
      console.log('🗺️ useEffect: Loading data for trip', tripId);
      loadRealData();
    } else {
      console.error('🗺️ ERROR: Invalid tripId for MapComponent:', tripId);
      setError('Invalid trip ID. Please create a trip first.');
      setLoading(false);
    }
  }, [tripId]);

  const loadRealData = async () => {
    console.log('🗺️ loadRealData: Starting for trip', tripId);
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Load real locations
      console.log('📍 Calling getFreeLocations for trip', tripId);
      const locationsResponse = await api.getFreeLocations(tripId);
      console.log('📍 API Response:', locationsResponse);
      
      if (locationsResponse.success && locationsResponse.locations?.length > 0) {
        const realLocations = locationsResponse.locations.map((loc: any) => ({
          ...loc,
          lng: loc.lon || loc.lng  // Handle both lon/lng naming
        }));
        
        console.log('📍 Processed locations:', realLocations.length);
        console.log('📍 First location:', realLocations[0]);
        
        setLocations(realLocations);
        
        // Set map center to first location
        const firstLoc = realLocations[0];
        const centerPos: [number, number] = [firstLoc.lat, firstLoc.lng];
        setCenter(centerPos);
        console.log('📍 Map center set to:', centerPos);
        
        // 2. Load weather
        console.log('🌤️ Calling getFreeWeather for trip', tripId);
        try {
          const weatherData = await api.getFreeWeather(tripId);
          console.log('🌤️ Weather data:', weatherData);
          
          if (weatherData && weatherData.latitude) {
            setWeather(weatherData);
          }
        } catch (weatherErr) {
          console.warn('🌤️ Weather API error (non-critical):', weatherErr);
        }
        
      } else {
        console.warn('📍 No locations found for', destination);
        setError(`No attractions found for ${destination}. Try a different city.`);
      }
      
    } catch (err: any) {
      console.error('❌ Error in MapComponent:', err);
      setError(err.message || 'Failed to load map data. Please try again.');
      
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to load data',
          life: 5000
        });
      }
    } finally {
      setLoading(false);
      console.log('🗺️ loadRealData: Finished');
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '☁️';
    if (code <= 67 || code <= 77) return '🌧️';
    if (code <= 99) return '⛈️';
    return '🌈';
  };

  const getMarkerColor = (type: string) => {
    const colors: Record<string, string> = {
      attraction: 'bg-blue-500',
      tourism: 'bg-purple-500',
      amenity: 'bg-green-500',
      historic: 'bg-yellow-500',
      leisure: 'bg-pink-500',
      shop: 'bg-indigo-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Card className="shadow-2 border-round-xl">
        <div className="flex flex-column justify-content-center align-items-center py-6">
          <ProgressSpinner />
          <span className="mt-3 text-lg">Loading real destination data...</span>
          <p className="text-sm text-gray-500 mt-2">
            Fetching attractions from OpenStreetMap
          </p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-2 border-round-xl">
        <div className="text-center py-6">
          <MapPin size={48} className="text-gray-400 mb-3" />
          <h3 className="text-gray-700">Could not load map data</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button 
            label="Try Again" 
            icon="pi pi-refresh" 
            onClick={loadRealData}
            className="p-button-outlined"
          />
        </div>
      </Card>
    );
  }

  if (locations.length === 0) {
    return (
      <Card className="shadow-2 border-round-xl">
        <div className="text-center py-6">
          <MapPin size={48} className="text-gray-400 mb-3" />
          <h3 className="text-gray-700">No attractions found</h3>
          <p className="text-gray-500 mb-4">
            No tourist attractions found for {destination}. Try searching for a major city.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <Card className="shadow-2 border-round-xl">
        <div className="flex align-items-center justify-content-between mb-4">
          <div className="flex align-items-center gap-3">
            <div className="p-2 bg-primary-100 border-round">
              <MapPin className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="m-0">Interactive Map</h2>
              <p className="text-gray-600 m-0">{destination}</p>
            </div>
          </div>
          <Badge value={`${locations.length} Attractions`} severity="success" />
        </div>

        <div className="grid">
          {/* Map Column */}
          <div className="col-12 lg:col-8">
            <div style={{ height: '500px', width: '100%' }} className="border-round-lg overflow-hidden">
              <MapContainer 
                center={center} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                className="border-round-lg"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {locations.map((location, index) => (
                  <Marker
                    key={`${location.id}-${index}`}
                    position={[location.lat, location.lng]}
                  >
                    <Popup>
                      <div className="p-2" style={{ minWidth: '220px' }}>
                        <h4 className="m-0 mb-2">{location.name}</h4>
                        <div className="flex gap-2 mb-3">
                          <Badge 
                            value={location.type} 
                            className={getMarkerColor(location.type)}
                          />
                          {location.importance > 0.5 && (
                            <Badge value="Popular" severity="warning" />
                          )}
                        </div>
                        <p className="text-sm mb-3">
                          {location.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Source: {location.source}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            
            {/* Locations List */}
            <div className="mt-4">
              <h3>Top Attractions in {destination}</h3>
              <div className="grid">
                {locations.slice(0, 4).map((location, index) => (
                  <div key={index} className="col-12 md:col-6">
                    <Card className="mb-3 shadow-1">
                      <div className="flex align-items-start gap-3">
                        <div className={`p-2 border-round ${getMarkerColor(location.type)}`}>
                          <MapPin size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="m-0 mb-1">{location.name}</h4>
                          <p className="text-sm text-gray-600 m-0">
                            {location.description.substring(0, 80)}...
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weather & Info Column */}
          <div className="col-12 lg:col-4">
            <div className="space-y-4">
              {/* Weather Card */}
              {weather && (
                <Card className="shadow-1">
                  <div className="flex align-items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 border-round">
                      <Cloud className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="m-0">Weather Forecast</h3>
                      <p className="text-sm text-gray-600 m-0">Real-time data</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {weather.daily.time.slice(0, 5).map((date, index) => (
                      <div 
                        key={date} 
                        className="flex justify-content-between align-items-center p-3 border-round border-1 hover:shadow-1 transition-all"
                      >
                        <div className="flex align-items-center gap-3">
                          <span className="text-2xl">
                            {getWeatherIcon(weather.daily.weathercode[index])}
                          </span>
                          <div>
                            <div className="font-medium">
                              {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex align-items-center gap-2">
                            <Thermometer size={14} className="text-red-500" />
                            <span className="font-bold">
                              {Math.round(weather.daily.temperature_2m_max[index])}°
                            </span>
                            <span className="text-gray-500">/</span>
                            <span className="text-gray-600">
                              {Math.round(weather.daily.temperature_2m_min[index])}°
                            </span>
                          </div>
                          {weather.daily.precipitation_probability_max[index] > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              💧 {weather.daily.precipitation_probability_max[index]}% rain
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Stats Card */}
              <Card className="shadow-1">
                <h3 className="mt-0">Map Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-content-between">
                    <span className="text-gray-600">Attractions Found</span>
                    <Badge value={locations.length} severity="info" />
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-gray-600">Data Source</span>
                    <span className="font-medium">OpenStreetMap</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-gray-600">Weather Source</span>
                    <span className="font-medium">Open-Meteo</span>
                  </div>
                  <div className="flex justify-content-between">
                    <span className="text-gray-600">Coordinates</span>
                    <span className="font-medium">{center[0].toFixed(4)}, {center[1].toFixed(4)}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-top-1">
                  <Button 
                    label="Refresh Data" 
                    icon="pi pi-refresh" 
                    onClick={loadRealData}
                    className="w-full p-button-outlined"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}