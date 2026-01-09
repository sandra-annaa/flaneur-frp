// FRONTEND/src/components/ItineraryView.tsx
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { TabView, TabPanel } from 'primereact/tabview';
import type { TripData } from "./TripForm";
import RealMapComponent from '../components/MapComponent';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Button } from 'primereact/button';
import { PackMyBag } from './PackMyBag';
import { Recommendations } from './Recommendations';
import { ProgressSpinner } from 'primereact/progressspinner';

interface ItineraryViewProps {
  tripData: TripData | null;
  tripId?: number;
}

interface Activity {
  time: string;
  icon: string;
  title: string;
  description: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
}

interface DayItinerary {
  day: number;
  date: string;
  activities: Activity[];
}

export function ItineraryView({ tripData, tripId }: ItineraryViewProps) {
  const [realLocations, setRealLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [itineraryGenerated, setItineraryGenerated] = useState(false);

  // Fetch real data when tripId is available
  useEffect(() => {
    if (tripId && tripData) {
      loadAllData();
    }
  }, [tripId, tripData]);

  const loadAllData = async () => {
    if (!tripId) return;
    
    setLoading(true);
    try {
      // Load locations
      const locationsResponse = await api.getFreeLocations(tripId);
      if (locationsResponse.data.success) {
        setRealLocations(locationsResponse.data.locations);
      }
      
      // Load weather
      const weatherResponse = await api.getFreeWeather(tripId);
      if (weatherResponse.data) {
        setWeather(weatherResponse.data);
      }
      
      // Check if smart itinerary exists
      const tripResponse = await api.getTrip(tripId);
      if (tripResponse.data.smart_itinerary_generated) {
        setItineraryGenerated(true);
      }
      
    } catch (error) {
      console.error('Failed to load itinerary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartItinerary = async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      const response = await api.generateSmartItinerary(tripId);
      
      if (response.data.success) {
        setItineraryGenerated(true);
        
        // Reload data
        await loadAllData();
        
        // Show success message
        alert('Smart itinerary generated successfully!');
      }
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get coordinates from destination
  const getCoordinates = async (destination: string) => {
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'cochin': { lat: 9.9312, lng: 76.2673 },
      'kerala': { lat: 10.8505, lng: 76.2711 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      'london': { lat: 51.5074, lng: -0.1278 },
      'delhi': { lat: 28.6139, lng: 77.2090 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
    };
    
    const lowerDest = destination.toLowerCase();
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (lowerDest.includes(city)) {
        return coords;
      }
    }
    
    return { lat: 9.9312, lng: 76.2673 }; // Default
  };

  // Handle case when no trip data is provided
  if (!tripData) {
    return (
      <Card 
        title="No Itinerary Available"
        subTitle="Please fill out the trip form first"
        className="text-center p-6"
      >
        <div className="flex flex-col items-center justify-center py-8">
          <i className="pi pi-map text-gray-400" style={{ fontSize: '3rem' }} />
          <p className="mt-4 text-gray-600">Submit your trip details to generate an itinerary</p>
        </div>
      </Card>
    );
  }

  // Generate dynamic itinerary
  const generateItinerary = (): DayItinerary[] => {
    const days: DayItinerary[] = [];
    let startDate: Date;
    
    try {
      startDate = new Date(tripData.startDate);
      if (isNaN(startDate.getTime())) startDate = new Date();
    } catch {
      startDate = new Date();
    }
    
    for (let i = 1; i <= tripData.duration; i++) {
      const activities: Activity[] = [];
      const dayLocations = realLocations.slice((i-1)*2, i*2);

      // Add real locations
      if (dayLocations.length > 0) {
        dayLocations.forEach((location, index) => {
          if (location.lat && location.lng) {
            activities.push({
              time: `${2 + index * 2}:00 PM`,
              icon: "pi pi-camera",
              title: location.name || "Local Attraction",
              description: location.description || "Explore this location",
              location: location.type,
              coordinates: { lat: location.lat, lng: location.lng }
            });
          }
        });
      }

      // Day-specific activities
      if (i === 1) {
        activities.unshift(
          { 
            time: "09:00 AM", 
            icon: "pi pi-map-marker", 
            title: "Arrival & Check-in", 
            description: `Arrive at ${tripData.destination} and check into your ${tripData.accommodation}` 
          },
          { 
            time: "12:00 PM", 
            icon: "pi pi-utensils", 
            title: "Welcome Lunch", 
            description: "Try local cuisine at a recommended restaurant"
          }
        );
        
        activities.push(
          { 
            time: "07:00 PM", 
            icon: "pi pi-moon", 
            title: "Dinner & Rest", 
            description: "Enjoy dinner and rest after your journey" 
          }
        );
      } else if (i === tripData.duration) {
        activities.unshift(
          { time: "08:00 AM", icon: "pi pi-coffee", title: "Breakfast & Check-out", description: "Final breakfast and hotel check-out" }
        );
        
        activities.push(
          { time: "10:00 AM", icon: "pi pi-camera", title: "Last-minute Exploration", description: "Visit nearby attractions" },
          { time: "12:00 PM", icon: "pi pi-utensils", title: "Farewell Lunch", description: "One last meal at your favorite spot" },
          { time: "03:00 PM", icon: "pi pi-map-marker", title: "Departure", description: `Head to the airport/station for your ${tripData.travelMode} back home` }
        );
      } else {
        activities.unshift(
          { time: "08:00 AM", icon: "pi pi-coffee", title: "Breakfast", description: "Start your day with a hearty breakfast" }
        );
        
        activities.push(
          { time: "01:00 PM", icon: "pi pi-utensils", title: "Lunch Break", description: "Traditional local cuisine experience" },
          { time: "07:00 PM", icon: "pi pi-moon", title: "Dinner & Evening", description: "Enjoy dinner and local entertainment" }
        );
      }
      
      const date = new Date(startDate.getTime() + (i - 1) * 24 * 60 * 60 * 1000);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      days.push({ day: i, date: formattedDate, activities });
    }
    
    return days;
  };

  const itinerary = generateItinerary();
  const cardSubTitle = `${tripData.duration}-day trip to ${tripData.destination} • ${tripData.budget} budget • ${tripData.activities}`;

  return (
    <div className="space-y-6">
      <TabView>
        <TabPanel header="Itinerary">
          {!itineraryGenerated && (
            <Card className="mb-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-yellow-800 font-semibold">Generate Smart Itinerary</h3>
                  <p className="text-yellow-600 text-sm">Click below to create an optimized itinerary using AI</p>
                </div>
                <Button 
                  label="Generate Smart Itinerary" 
                  icon="pi pi-magic" 
                  className="p-button-warning"
                  onClick={generateSmartItinerary}
                  loading={loading}
                />
              </div>
            </Card>
          )}
          
          <Card 
            title="Your Personalized Itinerary"
            subTitle={cardSubTitle}
            className="shadow-md"
          />

          <div className="space-y-6 mt-4">
            {itinerary.map((day) => (
              <Card 
                key={day.day} 
                className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                header={
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">Day {day.day}</h2>
                        <p className="text-gray-600">{day.date}</p>
                      </div>
                      <Badge value={`${day.activities.length} Activities`} severity="info" />
                    </div>
                  </div>
                }
              >
                <div className="p-6">
                  <div className="space-y-6">
                    {day.activities.map((activity, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`${activity.location ? 'bg-green-100' : 'bg-blue-100'} rounded-full p-3 shadow-sm`}>
                            <i className={activity.icon + (activity.location ? " text-green-600" : " text-blue-600")} style={{ fontSize: '1.25rem' }} />
                          </div>
                          {idx < day.activities.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <i className="pi pi-clock text-gray-500" />
                            <span className="text-gray-600 font-medium">{activity.time}</span>
                            {activity.location && (
                              <Badge value={activity.location} severity="success" className="ml-2" />
                            )}
                          </div>
                          <h4 className="mb-1 font-bold text-lg text-gray-800">{activity.title}</h4>
                          <p className="text-gray-600">{activity.description}</p>
                          {activity.coordinates?.lat && activity.coordinates?.lng && (
                            <div className="text-xs text-gray-500 mt-1">
                              📍 Coordinates: {activity.coordinates.lat.toFixed(4)}, {activity.coordinates.lng.toFixed(4)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabPanel>

        <TabPanel header="Interactive Map">
          {tripId ? (
            <RealMapComponent 
              tripId={tripId || 0}
              destination={tripData.destination}
            />
          ) : (
            <Card className="text-center p-6">
              <div className="flex flex-col items-center justify-center py-8">
                <i className="pi pi-map text-gray-400" style={{ fontSize: '3rem' }} />
                <p className="mt-4 text-gray-600">Map data will appear here when you save a trip</p>
              </div>
            </Card>
          )}
        </TabPanel>

        <TabPanel header="Real-Time Data">
          <Card title="Real Destination Information" className="shadow-md">
            <div className="p-4">
              <div className="grid">
                <div className="col-12 md:col-6">
                  <Card title="Location Data" className="shadow-1">
                    {loading ? (
                      <div className="flex justify-center p-4">
                        <ProgressSpinner />
                      </div>
                    ) : realLocations.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold">
                          Top Attractions in {tripData.destination}
                        </h4>
                        <ul className="list-disc pl-4 space-y-2">
                          {realLocations.slice(0, 5).map((loc, idx) => (
                            <li key={idx} className="text-gray-700">
                              <span className="font-medium">{loc.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({loc.type})</span>
                            </li>
                          ))}
                        </ul>
                        <Badge 
                          value={`${realLocations.length} real locations found`} 
                          severity="success" 
                          className="mt-3"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600">No location data available</p>
                        <Button
                          label="Load Real Data" 
                          icon="pi pi-refresh" 
                          onClick={loadAllData}
                          className="mt-3"
                        />
                      </div>
                    )}
                  </Card>
                </div>
                <div className="col-12 md:col-6">
                  <Card title="Weather Forecast" className="shadow-1">
                    {weather ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold">7-Day Forecast</h5>
                          <Badge value="Live" severity="info" />
                        </div>
                        
                        <div className="space-y-2">
                          {weather.daily?.time?.slice(0, 3).map((date: string, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">
                                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                              </div>
                              <div className="flex gap-3">
                                <span className="text-red-600 font-bold">
                                  {Math.round(weather.daily.temperature_2m_max[idx])}°C
                                </span>
                                <span className="text-blue-600 font-bold">
                                  {Math.round(weather.daily.temperature_2m_min[idx])}°C
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {weather.daily?.precipitation_sum && (
                          <div className="mt-3 p-3 bg-blue-50 rounded">
                            <div className="flex justify-between">
                              <span className="font-medium">Weekly Rain:</span>
                              <span className="font-bold text-blue-700">
                                {weather.daily.precipitation_sum.reduce((a: number, b: number) => a + b, 0).toFixed(1)}mm
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <ProgressSpinner />
                        <p className="mt-3 text-gray-600">Loading weather data...</p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel header="Pack My Bag">
          {tripData && tripId ? (
            <PackMyBag
              tripData={tripData}
              tripId={tripId} 
            />
          ) : (
            <Card className="text-center p-6">
              <div className="flex flex-col items-center justify-center py-8">
                <i className="pi pi-suitcase text-gray-400" style={{ fontSize: '3rem' }} />
                <p className="mt-4 text-gray-600">Trip data required to generate packing list</p>
              </div>
            </Card>
          )}
        </TabPanel>

        <TabPanel header="Recommendations">
          {tripData ? (
            <Recommendations 
              destination={tripData.destination}
              tripId={tripId}
            />
          ) : (
            <Card className="text-center p-6">
              <div className="flex flex-col items-center justify-center py-8">
                <i className="pi pi-star text-gray-400" style={{ fontSize: '3rem' }} />
                <p className="mt-4 text-gray-600">Select a destination to see recommendations</p>
              </div>
            </Card>
          )}
        </TabPanel>
      </TabView>
    </div>
  );
}