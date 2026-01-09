// PrimeReact imports
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { TabView, TabPanel } from 'primereact/tabview';
import type { TripData } from "./TripForm";
import RealMapComponent from '../components/MapComponent';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Button } from 'primereact/button';


interface ItineraryViewProps {
  tripData: TripData | null; // Allow null to handle no data
  tripId?: number; // Add tripId to fetch real data
}

interface Activity {
  time: string;
  icon: string;
  title: string;
  description: string;
  location?: string; // Add location for real data
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

  // Fetch real locations when tripId is available
  useEffect(() => {
    if (tripId && tripData) {
      loadRealLocations();
    }
  }, [tripId, tripData]);

  const loadRealLocations = async () => {
    if (!tripId) return;
    
    setLoading(true);
    try {
      const response = await api.getFreeLocations(tripId);
      if (response.data.success) {
        setRealLocations(response.data.locations);
      }
    } catch (error) {
      console.error('Failed to load real locations:', error);
    } finally {
      setLoading(false);
    }
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

  // Generate dynamic itinerary based on trip data WITH REAL LOCATIONS
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
      
      // Get real locations for this day (distribute across days)
      const dayLocations = realLocations.slice((i-1)*2, i*2);
      console.log(`Day ${i} locations:`, dayLocations); // Add this debug

if (dayLocations.length > 0) {
  dayLocations.forEach((location, index) => {
    // Check if location has lat/lng
    if (location.lat && location.lng) {
      activities.push({
        time: `${2 + index * 2}:00 PM`,
        icon: "pi pi-camera",
        title: location.name || "Local Attraction",
        description: location.description || "Explore this interesting location",
        location: location.type,
        coordinates: { lat: location.lat, lng: location.lng } // ✅ Has coordinates
      });
    }
  });
}
      if (i === 1) {
        // Day 1 - Arrival with real locations
        activities.push(
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
        
        // Add real locations for Day 1 afternoon
        if (dayLocations.length > 0) {
          dayLocations.forEach((location, index) => {
            activities.push({
              time: `${2 + index * 2}:00 PM`,
              icon: "pi pi-camera",
              title: location.name || "Local Attraction",
              description: location.description || "Explore this interesting location",
              location: location.type,
              coordinates: { lat: location.lat, lng: location.lng }
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
      } else if (i === tripData.duration) {
        // Last day
        activities.push(
          { time: "08:00 AM", icon: "pi pi-coffee", title: "Breakfast & Check-out", description: "Final breakfast and hotel check-out" },
          { time: "10:00 AM", icon: "pi pi-camera", title: "Last-minute Exploration", description: "Visit nearby attractions" },
          { time: "12:00 PM", icon: "pi pi-utensils", title: "Farewell Lunch", description: "One last meal at your favorite spot" },
          { time: "03:00 PM", icon: "pi pi-map-marker", title: "Departure", description: `Head to the airport/station for your ${tripData.travelMode} back home` }
        );
      } else {
        // Middle days with real data integration
        activities.push(
          { time: "08:00 AM", icon: "pi pi-coffee", title: "Breakfast", description: "Start your day with a hearty breakfast" }
        );
        
        // Add morning activity from real locations
        if (dayLocations[0]) {
          activities.push({
            time: "09:30 AM",
            icon: "pi pi-camera",
            title: dayLocations[0].name || "Morning Attraction",
            description: dayLocations[0].description || "Visit this interesting location",
            location: dayLocations[0].type,
            coordinates: { lat: dayLocations[0].lat, lng: dayLocations[0].lng }
          });
        }
        
        activities.push(
          { time: "01:00 PM", icon: "pi pi-utensils", title: "Lunch Break", description: "Traditional local cuisine experience" }
        );
        
        // Add afternoon activity from real locations
        if (dayLocations[1]) {
          activities.push({
            time: "03:00 PM",
            icon: "pi pi-sun",
            title: dayLocations[1].name || "Afternoon Exploration",
            description: dayLocations[1].description || "Continue exploring the area",
            location: dayLocations[1].type,
            coordinates: { lat: dayLocations[1].lat, lng: dayLocations[1].lng }
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
        <TabPanel header="Itinerary">
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
                          {activity.coordinates?.lat && activity.coordinates?.lng ? (
  <div className="text-xs text-gray-500 mt-1">
    📍 Coordinates: {activity.coordinates.lat.toFixed(4)}, {activity.coordinates.lng.toFixed(4)}
  </div>
) : activity.coordinates ? (
  <div className="text-xs text-gray-500 mt-1">
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
        </TabPanel>

        <TabPanel header="Interactive Map">
          {tripId ? (
            <RealMapComponent 
  tripId={tripId || 0}  // ✅ Pass actual trip ID
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
                        <i className="pi pi-spin pi-spinner text-blue-500" style={{ fontSize: '2rem' }} />
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
                          onClick={loadRealLocations}
                          className="mt-3"
                        />
                      </div>
                    )}
                  </Card>
                </div>
                <div className="col-12 md:col-6">
                  <Card title="Data Sources" className="shadow-1">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <i className="pi pi-map text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-bold m-0">OpenStreetMap</h5>
                          <p className="text-sm text-gray-600 m-0">Free, open-source location data</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <i className="pi pi-cloud text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-bold m-0">Open-Meteo</h5>
                          <p className="text-sm text-gray-600 m-0">Free weather API service</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-4">
                        <p>All data is fetched in real-time and cached for performance.</p>
                        <p>No API keys required for these free services.</p>
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