// FRONTEND/src/components/ItineraryView.tsx
import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { api } from '../services/api';
import type { TripData } from './TripForm';

interface DayPlan {
  day: number;
  date: string;
  theme: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
  meals: string[];
  accommodation: string;
  travelTips?: string[];
}

interface Itinerary {
  tripId: number;
  destination: string;
  duration: number;
  summary: string;
  days: DayPlan[];
  totalCost?: string;
  packingTips?: string[];
}

interface ItineraryViewProps {
  tripData: TripData;
  tripId?: number;
}

export function ItineraryView({ tripData, tripId }: ItineraryViewProps) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (tripId && tripData) {
      loadItinerary();
    }
  }, [tripId, tripData]);

  const loadItinerary = async () => {
    if (!tripId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📅 Loading itinerary for trip ${tripId}...`);
      
      // First, try to get existing itinerary from backend
      try {
        const response = await api.getTrip(tripId);
        if (response.itinerary) {
          console.log('✅ Found existing itinerary in trip data');
          setItinerary(response.itinerary);
          return;
        }
      } catch (err) {
        console.log('No existing itinerary found');
      }
      
      // If no existing itinerary, generate a new one
      await generateNewItinerary();
      
    } catch (error: any) {
      console.error('❌ Error loading itinerary:', error);
      setError('Failed to load itinerary. Try generating a new one.');
      // Create sample itinerary as fallback
      createSampleItinerary();
    } finally {
      setLoading(false);
    }
  };

  const generateNewItinerary = async () => {
    if (!tripId) return;
    
    setRegenerating(true);
    
    try {
      console.log(`🤖 Generating smart itinerary for trip ${tripId}...`);
      
      // Call backend to generate itinerary
      const response = await api.generateSmartItinerary(tripId);
      console.log('✅ Generation response:', response);
      
      if (response.success) {
        // Wait a moment then reload the trip data
        setTimeout(async () => {
          try {
            const tripResponse = await api.getTrip(tripId);
            if (tripResponse.itinerary) {
              setItinerary(tripResponse.itinerary);
            } else {
              createSampleItinerary();
            }
          } catch (err) {
            createSampleItinerary();
          }
        }, 1000);
      } else {
        createSampleItinerary();
      }
    } catch (error) {
      console.error('❌ Error generating itinerary:', error);
      createSampleItinerary();
    } finally {
      setRegenerating(false);
    }
  };

  const createSampleItinerary = () => {
    if (!tripData) return;
    
    console.log('🔄 Creating sample itinerary...');
    
    const days: DayPlan[] = [];
    const startDate = new Date(tripData.startDate);
    
    // Activity themes based on trip type
    const themes = {
      sightseeing: ['Historical Tour', 'Cultural Exploration', 'City Highlights', 'Local Experience'],
      adventure: ['Mountain Adventure', 'Water Activities', 'Nature Exploration', 'Thrill Seeker Day'],
      relaxation: ['Wellness Day', 'Beach Relaxation', 'Spa & Leisure', 'Slow Travel Day'],
      foodie: ['Culinary Tour', 'Food Market Day', 'Cooking Experience', 'Fine Dining'],
      nature: ['National Park Day', 'Wildlife Safari', 'Hiking Adventure', 'Eco-Tourism']
    };
    
    const selectedThemes = themes[tripData.activities as keyof typeof themes] || themes.sightseeing;
    
    for (let i = 1; i <= tripData.duration; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (i - 1));
      
      const themeIndex = (i - 1) % selectedThemes.length;
      
      days.push({
        day: i,
        date: currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        theme: selectedThemes[themeIndex],
        morning: [
          `Breakfast at ${tripData.accommodation || 'your accommodation'}`,
          `Visit ${tripData.destination}'s main attractions`,
          `Guided tour of historical sites`
        ],
        afternoon: [
          `Lunch at a local restaurant featuring ${tripData.destination} cuisine`,
          tripData.activities === 'sightseeing' ? 'Explore museums and galleries' :
          tripData.activities === 'adventure' ? 'Outdoor adventure activities' :
          tripData.activities === 'relaxation' ? 'Relaxation and wellness activities' :
          'Continue exploring local culture'
        ],
        evening: [
          `Dinner experience at a recommended restaurant`,
          tripData.activities === 'sightseeing' ? 'Evening city lights tour' :
          tripData.activities === 'adventure' ? 'Campfire or outdoor gathering' :
          tripData.activities === 'relaxation' ? 'Evening relaxation session' :
          'Local cultural performance or show'
        ],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: tripData.accommodation || 'Hotel',
        travelTips: [
          'Wear comfortable shoes',
          'Carry water and snacks',
          'Keep local emergency numbers handy'
        ]
      });
    }
    
    const sampleItinerary: Itinerary = {
      tripId: tripId || 0,
      destination: tripData.destination,
      duration: tripData.duration,
      summary: `Your personalized ${tripData.duration}-day ${tripData.activities} trip to ${tripData.destination}`,
      days: days,
      totalCost: tripData.budget === 'luxury' ? '$$$$' : 
                tripData.budget === 'midrange' ? '$$$' : '$$',
      packingTips: [
        'Comfortable walking shoes',
        'Weather-appropriate clothing',
        'Travel adapter and charger',
        'First aid kit',
        'Local currency'
      ]
    };
    
    setItinerary(sampleItinerary);
  };

  const handleRegenerate = () => {
    generateNewItinerary();
  };

  const handleSaveItinerary = () => {
    console.log('Saving itinerary...');
    alert('Itinerary saved! (This would update the trip in backend)');
  };

  const handlePrintItinerary = () => {
    window.print();
  };

  if (loading) {
    return (
      <Card title="Itinerary" className="shadow-md">
        <div className="flex flex-col items-center justify-center py-12">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          <p className="mt-4 text-gray-600">Loading your trip itinerary...</p>
          <p className="text-sm text-gray-500">Creating personalized daily plans</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Itinerary" className="shadow-md">
        <div className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <i className="pi pi-exclamation-triangle text-4xl mb-3" />
            <p className="text-lg font-medium">{error}</p>
          </div>
          <Button 
            label="Generate New Itinerary" 
            icon="pi pi-refresh"
            onClick={generateNewItinerary}
            loading={regenerating}
          />
        </div>
      </Card>
    );
  }

  if (!itinerary) {
    return (
      <Card title="Itinerary" className="shadow-md">
        <div className="p-6 text-center">
          <div className="mb-6">
            <i className="pi pi-calendar-plus text-4xl text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Itinerary Yet</h3>
            <p className="text-gray-600 mb-6">
              Generate a personalized itinerary for your {tripData.duration}-day trip to {tripData.destination}
            </p>
          </div>
          <Button 
            label="Generate Smart Itinerary" 
            icon="pi pi-magic"
            onClick={generateNewItinerary}
            loading={regenerating}
            className="p-button-lg"
          />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title={`${itinerary.destination} Trip Itinerary`} className="shadow-md">
        <div className="p-6">
          {/* Header Actions */}
          <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{itinerary.summary}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge value={`${itinerary.duration} Days`} severity="info" />
                <Badge value={tripData.budget} severity="warning" />
                <Badge value={tripData.activities} severity="success" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                label="Regenerate" 
                icon="pi pi-refresh" 
                onClick={handleRegenerate}
                loading={regenerating}
                className="p-button-outlined"
              />
              <Button 
                label="Save" 
                icon="pi pi-save" 
                onClick={handleSaveItinerary}
                className="p-button-outlined"
              />
              <Button 
                label="Print" 
                icon="pi pi-print" 
                onClick={handlePrintItinerary}
                className="p-button-outlined"
              />
            </div>
          </div>

          {/* Trip Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="text-center bg-blue-50">
              <div className="p-4">
                <i className="pi pi-calendar text-2xl text-blue-600 mb-2" />
                <h4 className="font-semibold">Duration</h4>
                <p className="text-lg">{itinerary.duration} days</p>
              </div>
            </Card>
            <Card className="text-center bg-green-50">
              <div className="p-4">
                <i className="pi pi-wallet text-2xl text-green-600 mb-2" />
                <h4 className="font-semibold">Budget Level</h4>
                <p className="text-lg">{tripData.budget}</p>
              </div>
            </Card>
            <Card className="text-center bg-purple-50">
              <div className="p-4">
                <i className="pi pi-users text-2xl text-purple-600 mb-2" />
                <h4 className="font-semibold">Travel Style</h4>
                <p className="text-lg">{tripData.activities}</p>
              </div>
            </Card>
          </div>

          {/* Daily Itinerary */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Daily Plan</h3>
            
            {itinerary.days.map((day) => (
              <Card key={day.day} className="border-l-4 border-blue-500">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge value={`Day ${day.day}`} severity="info" />
                        <h4 className="text-lg font-bold">{day.theme}</h4>
                      </div>
                      <p className="text-gray-600">
                        <i className="pi pi-calendar mr-2" />
                        {day.date}
                      </p>
                    </div>
                    <Tag value={day.accommodation} severity="success" />
                  </div>

                  <Divider />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {/* Morning */}
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <i className="pi pi-sun text-yellow-500" />
                        <span>Morning</span>
                      </h5>
                      <ul className="space-y-2">
                        {day.morning.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Afternoon */}
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <i className="pi pi-cloud text-orange-500" />
                        <span>Afternoon</span>
                      </h5>
                      <ul className="space-y-2">
                        {day.afternoon.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Evening */}
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <i className="pi pi-moon text-indigo-500" />
                        <span>Evening</span>
                      </h5>
                      <ul className="space-y-2">
                        {day.evening.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {day.travelTips && day.travelTips.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded">
                      <h6 className="font-semibold mb-2 flex items-center gap-2">
                        <i className="pi pi-info-circle text-gray-600" />
                        <span>Travel Tips</span>
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {day.travelTips.map((tip, idx) => (
                          <Tag key={idx} value={tip} className="text-xs" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Packing Tips */}
          {itinerary.packingTips && itinerary.packingTips.length > 0 && (
            <div className="mt-8">
              <Card className="bg-amber-50">
                <div className="p-5">
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="pi pi-suitcase text-amber-600" />
                    <span>Essential Packing List</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {itinerary.packingTips.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <i className="pi pi-check-circle text-green-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}