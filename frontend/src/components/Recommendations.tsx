// PrimeReact imports
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Rating } from 'primereact/rating';
import { Image } from 'primereact/image';
import type { TripData } from "./TripForm";

interface RecommendationsProps {
  tripData: TripData;
}

export function Recommendations({ tripData }: RecommendationsProps) {
  const getHotels = () => {
    const budgetMultiplier: Record<string, number> = {
      budget: 1,
      moderate: 2,
      luxury: 3,
      premium: 4
    };
    
    const multiplier = budgetMultiplier[tripData.budget] || 2;
    const basePrice = 50;
    
    return [
      {
        name: "Sunset Paradise Hotel",
        price: Math.round(basePrice * multiplier * 1.2),
        rating: 4.8,
        reviews: 1234,
        amenities: ["Free WiFi", "Pool", "Breakfast", "Gym"],
        distance: "2.3 km from center",
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MXx8fHwxNzY2MzI4NjQyfDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        name: "Downtown Comfort Inn",
        price: Math.round(basePrice * multiplier * 0.8),
        rating: 4.5,
        reviews: 892,
        amenities: ["Free WiFi", "Restaurant", "24/7 Service"],
        distance: "0.8 km from center",
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MXx8fHwxNzY2MzI4NjQyfDA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        name: "Seaside Boutique Resort",
        price: Math.round(basePrice * multiplier * 1.5),
        rating: 4.9,
        reviews: 2156,
        amenities: ["Spa", "Beach Access", "Pool", "Fine Dining"],
        distance: "5.1 km from center",
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MXx8fHwxNzY2MzI4NjQyfDA&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ];
  };

  const getRestaurants = () => {
    return [
      {
        name: "Local Flavors Bistro",
        cuisine: "Traditional Cuisine",
        price: "$$",
        rating: 4.7,
        reviews: 543,
        specialty: "Famous for authentic local dishes"
      },
      {
        name: "Ocean View Restaurant",
        cuisine: "Seafood",
        price: "$$$",
        rating: 4.8,
        reviews: 891,
        specialty: "Fresh catch of the day with sunset views"
      },
      {
        name: "Street Food Market",
        cuisine: "Various",
        price: "$",
        rating: 4.6,
        reviews: 1243,
        specialty: "Best spot for local street food experience"
      },
      {
        name: "Garden Terrace Cafe",
        cuisine: "International",
        price: "$$",
        rating: 4.5,
        reviews: 432,
        specialty: "Great for breakfast and brunch"
      }
    ];
  };

  const getActivities = () => {
    const activityMap: Record<string, Array<{name: string, duration: string, price: string, description: string}>> = {
      sightseeing: [
        { name: "Historical City Tour", duration: "3 hours", price: "$30", description: "Guided tour of main landmarks" },
        { name: "Museum Pass", duration: "Full day", price: "$45", description: "Access to all major museums" },
        { name: "Night Markets Visit", duration: "2 hours", price: "$15", description: "Explore vibrant local markets" }
      ],
      adventure: [
        { name: "Mountain Trekking", duration: "Full day", price: "$80", description: "Guided trek with equipment" },
        { name: "Water Rafting", duration: "4 hours", price: "$65", description: "Thrilling river adventure" },
        { name: "Rock Climbing", duration: "3 hours", price: "$50", description: "Beginner to advanced routes" }
      ],
      relaxation: [
        { name: "Spa & Wellness", duration: "2 hours", price: "$90", description: "Full body massage and treatment" },
        { name: "Sunset Cruise", duration: "3 hours", price: "$75", description: "Romantic evening on the water" },
        { name: "Yoga & Meditation", duration: "1.5 hours", price: "$25", description: "Beach yoga session" }
      ],
      foodie: [
        { name: "Cooking Class", duration: "3 hours", price: "$60", description: "Learn to cook local dishes" },
        { name: "Food Tour", duration: "4 hours", price: "$70", description: "Taste the best local cuisine" },
        { name: "Wine Tasting", duration: "2 hours", price: "$55", description: "Sample regional wines" }
      ],
      shopping: [
        { name: "Shopping District Tour", duration: "3 hours", price: "$25", description: "Best shopping spots guide" },
        { name: "Artisan Workshop", duration: "2 hours", price: "$40", description: "Visit local craftsmen" },
        { name: "Night Market Tour", duration: "3 hours", price: "$30", description: "Bargain hunting adventure" }
      ],
      nature: [
        { name: "Wildlife Safari", duration: "5 hours", price: "$95", description: "Guided wildlife experience" },
        { name: "Botanical Gardens", duration: "2 hours", price: "$20", description: "Explore exotic plants" },
        { name: "Bird Watching Tour", duration: "3 hours", price: "$45", description: "Early morning nature walk" }
      ]
    };

    return activityMap[tripData.activities] || activityMap.sightseeing;
  };

  const hotels = getHotels();
  const restaurants = getRestaurants();
  const activities = getActivities();

  const hotelsTitle = "Recommended Hotels";
  const hotelsSubTitle = "Best " + tripData.accommodation + " options for your budget";
  
  const restaurantsTitle = "Top Restaurants";
  const restaurantsSubTitle = "Must-try dining experiences in " + tripData.destination;
  
  const activitiesTitle = "Recommended Activities";
  const activitiesSubTitle = "Popular " + tripData.activities + " experiences";

  return (
    <div className="space-y-6">
      {/* Hotels Section */}
      <Card
        title={hotelsTitle}
        subTitle={hotelsSubTitle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotels.map((hotel, idx) => (
            <Card key={idx} className="overflow-hidden">
              <Image 
                src={hotel.image}
                alt={hotel.name}
                width="100%"
                preview
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="flex-1 font-bold text-lg">{hotel.name}</h4>
                  <Badge value={"$" + hotel.price + "/night"} severity="info" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Rating value={hotel.rating} readOnly cancel={false} stars={5} />
                  <span className="text-sm text-gray-600">(" + hotel.reviews + " reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <i className="pi pi-map-marker" />
                  <span className="text-sm">{hotel.distance}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {hotel.amenities.map((amenity, i) => (
                    <Badge key={i} value={amenity} severity="success" className="mr-1 mb-1" />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Restaurants Section */}
      <Card
        title={restaurantsTitle}
        subTitle={restaurantsSubTitle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurants.map((restaurant, idx) => (
            <Card key={idx}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="mb-1 font-bold">{restaurant.name}</h4>
                    <p className="text-gray-600">{restaurant.cuisine}</p>
                  </div>
                  <Badge value={restaurant.price} severity="warning" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Rating value={restaurant.rating} readOnly cancel={false} stars={5} />
                  <span className="text-sm text-gray-600">(" + restaurant.reviews + ")</span>
                </div>
                <p className="text-sm text-gray-600">{restaurant.specialty}</p>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Activities Section */}
      <Card
        title={activitiesTitle}
        subTitle={activitiesSubTitle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity, idx) => (
            <Card key={idx}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="flex-1 font-bold">{activity.name}</h4>
                  <Badge value={activity.price} severity="success" />
                </div>
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                  <i className="pi pi-dollar" />
                  <span className="text-sm">{activity.duration}</span>
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}