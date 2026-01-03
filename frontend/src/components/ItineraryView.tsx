// PrimeReact imports
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import type { TripData } from "./TripForm";

interface ItineraryViewProps {
  tripData: TripData;
}

interface Activity {
  time: string;
  icon: string;
  title: string;
  description: string;
}

interface DayItinerary {
  day: number;
  date: string;
  activities: Activity[];
}

export function ItineraryView({ tripData }: ItineraryViewProps) {
  // Generate dynamic itinerary based on trip data
  const generateItinerary = (): DayItinerary[] => {
    const days: DayItinerary[] = [];
    
    for (let i = 1; i <= tripData.duration; i++) {
      const activities: Activity[] = [];
      
      if (i === 1) {
        activities.push(
          { time: "09:00 AM", icon: "pi-map-marker", title: "Arrival & Check-in", description: "Arrive at " + tripData.destination + " and check into your " + tripData.accommodation },
          { time: "12:00 PM", icon: "pi-utensils", title: "Welcome Lunch", description: "Try local cuisine at a recommended restaurant" },
          { time: "02:00 PM", icon: "pi-camera", title: "City Orientation Tour", description: "Explore the main attractions and get oriented" },
          { time: "07:00 PM", icon: "pi-moon", title: "Dinner & Rest", description: "Enjoy dinner and rest after your journey" }
        );
      } else if (i === tripData.duration) {
        activities.push(
          { time: "08:00 AM", icon: "pi-coffee", title: "Breakfast & Check-out", description: "Final breakfast and hotel check-out" },
          { time: "10:00 AM", icon: "pi-camera", title: "Last-minute Shopping", description: "Pick up souvenirs and local crafts" },
          { time: "12:00 PM", icon: "pi-utensils", title: "Farewell Lunch", description: "One last meal at your favorite spot" },
          { time: "03:00 PM", icon: "pi-map-marker", title: "Departure", description: "Head to the airport/station for your " + tripData.travelMode + " back home" }
        );
      } else {
        // Activity-based itinerary
        if (tripData.activities === "sightseeing") {
          activities.push(
            { time: "08:00 AM", icon: "pi-coffee", title: "Breakfast", description: "Start your day with a hearty breakfast" },
            { time: "09:30 AM", icon: "pi-camera", title: "Historical Sites", description: "Visit museums, monuments, and cultural landmarks" },
            { time: "01:00 PM", icon: "pi-utensils", title: "Lunch Break", description: "Traditional local cuisine experience" },
            { time: "03:00 PM", icon: "pi-sun", title: "Walking Tour", description: "Explore old town and architectural gems" },
            { time: "07:00 PM", icon: "pi-moon", title: "Evening Entertainment", description: "Cultural show or local market visit" }
          );
        } else if (tripData.activities === "adventure") {
          activities.push(
            { time: "06:00 AM", icon: "pi-sun", title: "Early Start", description: "Quick breakfast before adventure" },
            { time: "07:00 AM", icon: "pi-camera", title: "Trekking/Hiking", description: "Guided trek through scenic trails" },
            { time: "12:30 PM", icon: "pi-utensils", title: "Picnic Lunch", description: "Packed lunch at a viewpoint" },
            { time: "03:00 PM", icon: "pi-map-marker", title: "Adventure Activity", description: "Zip-lining, rafting, or rock climbing" },
            { time: "07:00 PM", icon: "pi-moon", title: "Campfire Dinner", description: "BBQ and local stories" }
          );
        } else if (tripData.activities === "relaxation") {
          activities.push(
            { time: "09:00 AM", icon: "pi-coffee", title: "Leisurely Breakfast", description: "Breakfast by the beach/pool" },
            { time: "10:30 AM", icon: "pi-sun", title: "Beach Time", description: "Swimming, sunbathing, water sports" },
            { time: "01:00 PM", icon: "pi-utensils", title: "Beachside Lunch", description: "Fresh seafood and tropical drinks" },
            { time: "03:00 PM", icon: "pi-camera", title: "Spa & Wellness", description: "Massage or yoga session" },
            { time: "07:00 PM", icon: "pi-moon", title: "Sunset Dinner", description: "Romantic dinner with ocean view" }
          );
        } else {
          activities.push(
            { time: "09:00 AM", icon: "pi-coffee", title: "Breakfast", description: "Local breakfast experience" },
            { time: "10:30 AM", icon: "pi-camera", title: "Morning Activity", description: "Explore local attractions" },
            { time: "01:00 PM", icon: "pi-utensils", title: "Lunch", description: "Try regional specialties" },
            { time: "03:00 PM", icon: "pi-sun", title: "Afternoon Exploration", description: "Markets, cafes, and hidden gems" },
            { time: "07:00 PM", icon: "pi-moon", title: "Dinner", description: "Evening dining experience" }
          );
        }
      }
      
      const date = new Date(new Date(tripData.startDate).getTime() + (i - 1) * 24 * 60 * 60 * 1000);
      const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
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
      <Card 
        title="Your Personalized Itinerary"
        subTitle={cardSubTitle}
      />

      <div className="space-y-6">
        {itinerary.map((day) => (
          <Card 
            key={day.day} 
            className="overflow-hidden"
            header={
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Day {day.day}</h2>
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
                      <div className="bg-blue-100 rounded-full p-3">
                        <i className={activity.icon + " text-blue-600"} style={{ fontSize: '1.25rem' }} />
                      </div>
                      {idx < day.activities.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="pi pi-clock text-gray-500" />
                        <span className="text-gray-600">{activity.time}</span>
                      </div>
                      <h4 className="mb-1 font-bold text-lg">{activity.title}</h4>
                      <p className="text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}