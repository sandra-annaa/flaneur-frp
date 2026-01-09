// FRONTEND/src/components/ItineraryView.tsx
import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import type { TripData } from "./TripForm";
import RealMapComponent from './MapComponent';
import { api } from '../services/api';

interface ItineraryViewProps {
  tripData: TripData;
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
  const [error, setError] = useState<string | null>(null);

  // Fetch real locations when tripId is available
  useEffect(() => {
    if (tripId && tripId > 0) {
      loadRealLocations();
    }
  }, [tripId]);

  // Helper function to safely get coordinates
  const getSafeCoordinates = (location: any) => {
    if (!location) return undefined;
    
    try {
      const lat = location.lat || location.latitude;
      const lng = location.lng || location.lon || location.longitude;
      
      if (lat !== undefined && lng !== undefined) {
        return {
          lat: typeof lat === 'string' ? parseFloat(lat) : lat,
          lng: typeof lng === 'string' ? parseFloat(lng) : lng
        };
      }
    } catch (err) {
      console.error('Error parsing coordinates:', err);
    }
    
    return undefined;
  };

  const loadRealLocations = async () => {
    if (!tripId) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching locations for trip:', tripId);
      const response = await api.getFreeLocations(tripId);
      console.log('📦 API Response:', response);
      
      if (response && response.data.success && response.data.locations) {
        console.log('📍 Locations received:', response.data.locations.length);
        setRealLocations(response.data.locations);
      } else if (response && response.data) {
        // Handle different response format
        console.log('📦 Response has data property:', response.data);
        if (response.data.success && response.data.locations) {
          setRealLocations(response.data.locations);
        }
      } else {
        console.log('⚠️ No locations found in response');
        setRealLocations([]);
      }
    } catch (error: any) {
      console.error('❌ Failed to load real locations:', error);
      setError('Could not load location data. Using sample itinerary.');
      setRealLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic itinerary based on trip data
  const generateItinerary = (): DayItinerary[] => {
    const days: DayItinerary[] = [];
    
    // Parse start date safely
    let startDate: Date;
    try {
      startDate = new Date(tripData.startDate);
      if (isNaN(startDate.getTime())) {
        startDate = new Date();
      }
    } catch {
      startDate = new Date();
    }
    
    for (let i = 1; i <= tripData.duration; i++) {
      const activities: Activity[] = [];
      
      // Get real locations for this day
      const dayLocations = realLocations.slice((i-1)*2, i*2);
      
      // Day 1 - Arrival
      if (i === 1) {
        activities.push(
          { 
            time: "09:00 AM", 
            icon: "pi pi-map-marker", 
            title: "Arrival & Check-in", 
            description: `Arrive at ${tripData.destination} and check into your ${tripData.accommodation || 'accommodation'}` 
          },
          { 
            time: "12:00 PM", 
            icon: "pi pi-utensils", 
            title: "Welcome Lunch", 
            description: "Try local cuisine at a recommended restaurant"
          }
        );
        
        // Add real locations for Day 1 afternoon
        if (dayLocations.length > 0) {
          dayLocations.forEach((location, index) => {
            const coordinates = getSafeCoordinates(location);
            activities.push({
              time: `${2 + index * 2}:00 PM`,
              icon: "pi pi-camera",
              title: location.name || "Local Attraction",
              description: location.description || "Explore this interesting location",
              location: location.type || 'attraction',
              coordinates: coordinates
            });
          });
        }
        
        activities.push(
          { 
            time: "07:00 PM", 
            icon: "pi pi-moon", 
            title: "Dinner & Rest", 
            description: "Enjoy dinner and rest after your journey" 
          }
        );
      } 
      // Last day
      else if (i === tripData.duration) {
        activities.push(
          { time: "08:00 AM", icon: "pi pi-coffee", title: "Breakfast & Check-out", description: "Final breakfast and hotel check-out" },
          { time: "10:00 AM", icon: "pi pi-camera", title: "Last-minute Exploration", description: "Visit nearby attractions" },
          { time: "12:00 PM", icon: "pi pi-utensils", title: "Farewell Lunch", description: "One last meal at your favorite spot" },
          { time: "03:00 PM", icon: "pi pi-map-marker", title: "Departure", description: `Head to the airport/station for your ${tripData.travelMode || 'journey'} back home` }
        );
      } 
      // Middle days
      else {
        activities.push(
          { time: "08:00 AM", icon: "pi pi-coffee", title: "Breakfast", description: "Start your day with a hearty breakfast" }
        );
        
        // Add morning activity from real locations
        if (dayLocations[0]) {
          const coordinates = getSafeCoordinates(dayLocations[0]);
          activities.push({
            time: "09:30 AM",
            icon: "pi pi-camera",
            title: dayLocations[0].name || "Morning Attraction",
            description: dayLocations[0].description || "Visit this interesting location",
            location: dayLocations[0].type || 'attraction',
            coordinates: coordinates
          });
        } else {
          activities.push({
            time: "09:30 AM",
            icon: "pi pi-camera",
            title: "Morning Exploration",
            description: "Explore the local area and discover hidden gems"
          });
        }
        
        activities.push(
          { time: "01:00 PM", icon: "pi pi-utensils", title: "Lunch Break", description: "Traditional local cuisine experience" }
        );
        
        // Add afternoon activity from real locations
        if (dayLocations[1]) {
          const coordinates = getSafeCoordinates(dayLocations[1]);
          activities.push({
            time: "03:00 PM",
            icon: "pi pi-sun",
            title: dayLocations[1].name || "Afternoon Exploration",
            description: dayLocations[1].description || "Continue exploring the area",
            location: dayLocations[1].type || 'attraction',
            coordinates: coordinates
          });
        } else {
          activities.push({
            time: "03:00 PM",
            icon: "pi pi-sun",
            title: "Afternoon Activities",
            description: tripData.activities === 'adventure' ? 
              "Adventure activities and outdoor fun" :
              tripData.activities === 'relaxation' ?
              "Relaxation and leisure time" :
              "Cultural and sightseeing activities"
          });
        }
        
        activities.push(
          { time: "07:00 PM", icon: "pi pi-moon", title: "Dinner & Evening", description: "Enjoy dinner and local entertainment" }
        );
      }
      
      const date = new Date(startDate.getTime() + (i - 1) * 24 * 60 * 60 * 1000);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      days.push({
        day: i,
        date: formattedDate,
        activities
      });
    }
    
    return days;
  };

  const itinerary = generateItinerary();
  const cardSubTitle = `${tripData.duration}-day trip to ${tripData.destination} • ${tripData.budget} budget • ${tripData.activities}`;

  return (
    <div className="space-y-6">
      <TabView>
        <TabPanel header="Daily Itinerary">
          <Card 
            title="Your Personalized Itinerary"
            subTitle={cardSubTitle}
            className="shadow-md"
            style={{
              border: '1px solid var(--chocolate-200)',
              backgroundColor: 'var(--ivory-50)'
            }}
            footer={
              <div className="flex justify-between items-center">
                <div className="text-sm" style={{ color: 'var(--chocolate-600)' }}>
                  {realLocations.length > 0 ? (
                    <span>✓ Using {realLocations.length} real locations</span>
                  ) : (
                    <span>Using sample itinerary</span>
                  )}
                </div>
                <Button 
                  label="Refresh Locations" 
                  icon="pi pi-refresh" 
                  onClick={loadRealLocations}
                  loading={loading}
                  className="p-button-sm"
                  style={{
                    backgroundColor: 'var(--chocolate-600)',
                    borderColor: 'var(--chocolate-600)'
                  }}
                />
              </div>
            }
          >
            {error && (
              <div className="p-3 mb-4 rounded" style={{
                backgroundColor: 'var(--chocolate-100)',
                color: 'var(--chocolate-800)',
                border: '1px solid var(--chocolate-200)'
              }}>
                <i className="pi pi-exclamation-triangle mr-2" />
                {error}
              </div>
            )}

            <div className="space-y-6 mt-4">
              {itinerary.map((day) => (
                <Card 
                  key={day.day} 
                  className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                  style={{
                    border: '1px solid var(--chocolate-200)',
                    backgroundColor: 'white'
                  }}
                  header={
                    <div className="p-4 border-b" style={{
                      background: 'linear-gradient(135deg, var(--chocolate-50) 0%, var(--ivory-200) 100%)',
                      borderBottomColor: 'var(--chocolate-200)'
                    }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold" style={{ color: 'var(--chocolate-900)' }}>
                            Day {day.day}
                          </h2>
                          <p style={{ color: 'var(--chocolate-700)' }}>{day.date}</p>
                        </div>
                        <Badge 
                          value={`${day.activities.length} Activities`} 
                          style={{ 
                            backgroundColor: 'var(--chocolate-600)',
                            color: 'var(--ivory-50)'
                          }}
                        />
                      </div>
                    </div>
                  }
                >
                  <div className="p-6">
                    <div className="space-y-6">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="rounded-full p-3 shadow-sm" style={{
                              backgroundColor: activity.coordinates ? 'var(--chocolate-100)' : 'var(--ivory-200)'
                            }}>
                              <i 
                                className={activity.icon} 
                                style={{ 
                                  fontSize: '1.25rem',
                                  color: activity.coordinates ? 'var(--chocolate-700)' : 'var(--chocolate-600)'
                                }} 
                              />
                            </div>
                            {idx < day.activities.length - 1 && (
                              <div className="w-0.5 h-full mt-2" style={{ backgroundColor: 'var(--chocolate-200)' }} />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-center gap-2 mb-1">
                              <i className="pi pi-clock" style={{ color: 'var(--chocolate-500)' }} />
                              <span className="font-medium" style={{ color: 'var(--chocolate-700)' }}>
                                {activity.time}
                              </span>
                              {activity.location && (
                                <Badge 
                                  value={activity.location} 
                                  className="ml-2"
                                  style={{ 
                                    backgroundColor: 'var(--chocolate-100)',
                                    color: 'var(--chocolate-800)',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              )}
                            </div>
                            <h4 className="mb-1 font-bold text-lg" style={{ color: 'var(--chocolate-900)' }}>
                              {activity.title}
                            </h4>
                            <p style={{ color: 'var(--chocolate-700)' }}>{activity.description}</p>
                            {activity.coordinates ? (
                              <div className="text-xs mt-1" style={{ color: 'var(--chocolate-600)' }}>
                                📍 Coordinates: {activity.coordinates.lat.toFixed(4)}, {activity.coordinates.lng.toFixed(4)}
                              </div>
                            ) : activity.location ? (
                              <div className="text-xs mt-1" style={{ color: 'var(--chocolate-400)' }}>
                                📍 Location data available
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabPanel>

        <TabPanel header="Interactive Map">
          {tripId && tripId > 0 ? (
            <RealMapComponent 
              tripId={tripId}
              destination={tripData.destination}
            />
          ) : (
            <Card className="text-center p-6" style={{ border: '1px solid var(--chocolate-200)' }}>
              <div className="flex flex-col items-center justify-center py-8">
                <i className="pi pi-map" style={{ fontSize: '3rem', color: 'var(--chocolate-300)' }} />
                <p className="mt-4" style={{ color: 'var(--chocolate-700)' }}>
                  Map data will appear here when you save a trip
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--chocolate-500)' }}>
                  Trip ID: {tripId || 'Not available'}
                </p>
              </div>
            </Card>
          )}
        </TabPanel>

        <TabPanel header="Real-Time Data">
          <Card 
            title="Real Destination Information" 
            className="shadow-md"
            style={{
              border: '1px solid var(--chocolate-200)',
              backgroundColor: 'var(--ivory-50)'
            }}
          >
            <div className="p-4">
              <div className="grid">
                <div className="col-12 md:col-6">
                  <Card 
                    title="Location Data" 
                    className="shadow-1"
                    style={{
                      border: '1px solid var(--chocolate-200)',
                      backgroundColor: 'white'
                    }}
                  >
                    {loading ? (
                      <div className="flex flex-col items-center justify-center p-6">
                        <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                        <p className="mt-3" style={{ color: 'var(--chocolate-600)' }}>
                          Loading real locations...
                        </p>
                      </div>
                    ) : realLocations.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold" style={{ color: 'var(--chocolate-900)' }}>
                          Top Attractions in {tripData.destination}
                        </h4>
                        <ul className="space-y-2">
                          {realLocations.slice(0, 5).map((loc, idx) => (
                            <li 
                              key={idx} 
                              className="p-2 rounded flex items-center gap-3"
                              style={{
                                backgroundColor: 'var(--ivory-50)',
                                border: '1px solid var(--chocolate-100)'
                              }}
                            >
                              <div className="p-2 rounded" style={{
                                backgroundColor: loc.type === 'hotel' ? 'var(--chocolate-100)' : 
                                               loc.type === 'restaurant' ? 'var(--chocolate-50)' : 
                                               'var(--ivory-200)'
                              }}>
                                <i 
                                  className={`pi ${loc.type === 'hotel' ? 'pi-building' : loc.type === 'restaurant' ? 'pi-utensils' : 'pi-map-marker'}`}
                                  style={{ color: 'var(--chocolate-700)' }}
                                />
                              </div>
                              <div>
                                <span className="font-medium" style={{ color: 'var(--chocolate-900)' }}>
                                  {loc.name}
                                </span>
                                <div className="text-xs" style={{ color: 'var(--chocolate-600)' }}>
                                  {loc.type}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <Badge 
                          value={`${realLocations.length} real locations found`} 
                          className="mt-3"
                          style={{ 
                            backgroundColor: 'var(--chocolate-600)',
                            color: 'var(--ivory-50)'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <i 
                          className="pi pi-database text-3xl mb-3" 
                          style={{ color: 'var(--chocolate-300)' }}
                        />
                        <p style={{ color: 'var(--chocolate-600)' }}>No real location data available</p>
                        <Button
                          label="Load Real Data" 
                          icon="pi pi-refresh" 
                          onClick={loadRealLocations}
                          className="mt-3"
                          style={{
                            backgroundColor: 'var(--chocolate-600)',
                            borderColor: 'var(--chocolate-600)'
                          }}
                        />
                      </div>
                    )}
                  </Card>
                </div>
                <div className="col-12 md:col-6">
                  <Card 
                    title="Trip Summary" 
                    className="shadow-1"
                    style={{
                      border: '1px solid var(--chocolate-200)',
                      backgroundColor: 'white'
                    }}
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded" style={{ backgroundColor: 'var(--chocolate-50)' }}>
                          <div className="text-sm" style={{ color: 'var(--chocolate-700)' }}>Destination</div>
                          <div className="font-semibold" style={{ color: 'var(--chocolate-900)' }}>
                            {tripData.destination}
                          </div>
                        </div>
                        <div className="p-3 rounded" style={{ backgroundColor: 'var(--ivory-100)' }}>
                          <div className="text-sm" style={{ color: 'var(--chocolate-700)' }}>Duration</div>
                          <div className="font-semibold" style={{ color: 'var(--chocolate-900)' }}>
                            {tripData.duration} days
                          </div>
                        </div>
                        <div className="p-3 rounded" style={{ backgroundColor: 'var(--chocolate-50)' }}>
                          <div className="text-sm" style={{ color: 'var(--chocolate-700)' }}>Budget</div>
                          <div className="font-semibold" style={{ color: 'var(--chocolate-900)' }}>
                            {tripData.budget}
                          </div>
                        </div>
                        <div className="p-3 rounded" style={{ backgroundColor: 'var(--ivory-100)' }}>
                          <div className="text-sm" style={{ color: 'var(--chocolate-700)' }}>Activities</div>
                          <div className="font-semibold" style={{ color: 'var(--chocolate-900)' }}>
                            {tripData.activities}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--chocolate-50)' }}>
                        <div className="text-sm" style={{ color: 'var(--chocolate-700)' }}>Travel Style</div>
                        <div className="font-semibold" style={{ color: 'var(--chocolate-900)' }}>
                          {tripData.travelers}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </TabPanel>
      </TabView>
    </div>
  );
}