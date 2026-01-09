// FRONTEND/src/components/Recommendations.tsx
import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { api } from '../services/api';

interface Recommendation {
  type: 'hotel' | 'restaurant' | 'attraction' | 'tip';
  name: string;
  description: string;
  rating?: number;
  price?: string;
  address?: string;
  tags: string[];
}

interface RecommendationsProps {
  destination: string;
  tripId?: number;
}

export function Recommendations({ destination, tripId }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'hotels' | 'food' | 'attractions'>('all');

  // Destination-based recommendations database
  const destinationData: Record<string, Recommendation[]> = {
    'cochin': [
      {
        type: 'hotel',
        name: 'Grand Hyatt Kochi Bolgatty',
        description: 'Luxury hotel on Bolgatty Island with pool, spa, and waterfront views.',
        rating: 4.5,
        price: '$$$$',
        address: 'Bolgatty Island, Kochi, Kerala',
        tags: ['Luxury', 'Pool', 'Spa', 'Waterfront']
      },
      {
        type: 'hotel',
        name: 'Fort House Hotel',
        description: 'Heritage hotel with traditional Kerala architecture.',
        rating: 4.2,
        price: '$$',
        address: 'Fort Kochi',
        tags: ['Heritage', 'Budget-friendly', 'Traditional']
      },
      {
        type: 'restaurant',
        name: 'Kashi Art Cafe',
        description: 'Art cafe with fusion cuisine and gallery space.',
        rating: 4.4,
        price: '$$',
        address: 'Fort Kochi',
        tags: ['Cafe', 'Art', 'Vegetarian Options']
      },
      {
        type: 'restaurant',
        name: 'Dal Roti',
        description: 'North Indian cuisine in traditional setting.',
        rating: 4.3,
        price: '$$',
        address: 'Fort Kochi',
        tags: ['North Indian', 'Traditional', 'Fine Dining']
      },
      {
        type: 'attraction',
        name: 'Chinese Fishing Nets',
        description: 'Iconic cantilevered fishing nets - symbol of Kochi.',
        rating: 4.6,
        price: 'Free',
        address: 'Fort Kochi Beach',
        tags: ['Landmark', 'Photography', 'Free', 'Historic']
      },
      {
        type: 'attraction',
        name: 'Mattancherry Palace',
        description: '16th-century Portuguese palace with Kerala murals.',
        rating: 4.2,
        price: '₹10 entry',
        address: 'Mattancherry',
        tags: ['Historic', 'Museum', 'Architecture']
      },
      {
        type: 'tip',
        name: 'Best Time to Visit',
        description: 'November to February for pleasant weather',
        tags: ['Weather', 'Planning']
      },
      {
        type: 'tip',
        name: 'Must-Try Food',
        description: 'Kerala seafood, appam with stew, and banana chips',
        tags: ['Food', 'Local']
      }
    ],
    'kerala': [
      {
        type: 'hotel',
        name: 'Kumarakom Lake Resort',
        description: 'Luxury backwater resort with private pools.',
        rating: 4.7,
        price: '$$$$',
        address: 'Kumarakom',
        tags: ['Luxury', 'Backwaters', 'Resort', 'Private Pool']
      },
      {
        type: 'attraction',
        name: 'Alleppey Backwaters',
        description: 'Famous houseboat cruises through palm-lined canals.',
        rating: 4.8,
        price: 'Houseboat from ₹5000',
        tags: ['Backwaters', 'Houseboat', 'Scenic', 'Must-Do']
      },
      {
        type: 'attraction',
        name: 'Munnar Tea Gardens',
        description: 'Vast tea plantations in Western Ghats.',
        rating: 4.5,
        price: 'Free to view',
        tags: ['Tea', 'Mountains', 'Scenic', 'Photography']
      },
      {
        type: 'tip',
        name: 'Houseboat Booking',
        description: 'Book houseboats in advance, especially in peak season',
        tags: ['Planning', 'Backwaters', 'Accommodation']
      }
    ]
  };

  const fetchRecommendations = () => {
    setLoading(true);
    
    setTimeout(() => {
      let allRecommendations: Recommendation[] = [];
      const lowerDest = destination.toLowerCase();
      
      if (lowerDest.includes('cochin') || lowerDest.includes('kochi')) {
        allRecommendations = [...allRecommendations, ...destinationData['cochin']];
      }
      if (lowerDest.includes('kerala')) {
        allRecommendations = [...allRecommendations, ...destinationData['kerala']];
      }
      
      if (allRecommendations.length === 0) {
        allRecommendations = destinationData['cochin'];
      }
      
      setRecommendations(allRecommendations);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [destination]);

  const filteredRecommendations = filter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => {
        if (filter === 'hotels') return rec.type === 'hotel';
        if (filter === 'food') return rec.type === 'restaurant';
        if (filter === 'attractions') return rec.type === 'attraction';
        return true;
      });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'hotel': return 'pi pi-building';
      case 'restaurant': return 'pi pi-utensils';
      case 'attraction': return 'pi pi-map-marker';
      case 'tip': return 'pi pi-lightbulb';
      default: return 'pi pi-star';
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'hotel': return 'bg-blue-100 text-blue-800';
      case 'restaurant': return 'bg-green-100 text-green-800';
      case 'attraction': return 'bg-purple-100 text-purple-800';
      case 'tip': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card title="Recommendations" className="shadow-md">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Loading recommendations for {destination}...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title={`Recommendations for ${destination}`} className="shadow-md">
        <div className="p-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              label="All" 
              icon="pi pi-filter"
              className={`p-button-outlined ${filter === 'all' ? 'p-button-primary' : ''}`}
              onClick={() => setFilter('all')}
            />
            <Button 
              label="Hotels" 
              icon="pi pi-building"
              className={`p-button-outlined ${filter === 'hotels' ? 'p-button-primary' : ''}`}
              onClick={() => setFilter('hotels')}
            />
            <Button 
              label="Food & Dining" 
              icon="pi pi-utensils"
              className={`p-button-outlined ${filter === 'food' ? 'p-button-primary' : ''}`}
              onClick={() => setFilter('food')}
            />
            <Button 
              label="Attractions" 
              icon="pi pi-map-marker"
              className={`p-button-outlined ${filter === 'attractions' ? 'p-button-primary' : ''}`}
              onClick={() => setFilter('attractions')}
            />
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecommendations.map((rec, index) => (
              <Card 
                key={index}
                className="h-full hover:shadow-lg transition-shadow duration-300"
                title={
                  <div className="flex items-center gap-2">
                    <i className={getTypeIcon(rec.type)} />
                    <span className="truncate">{rec.name}</span>
                  </div>
                }
                subTitle={
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(rec.type)}`}>
                      {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                    </span>
                    {rec.rating && (
                      <span className="ml-2">
                        ⭐ {rec.rating}
                      </span>
                    )}
                    {rec.price && (
                      <span className="ml-2 text-gray-600">
                        • {rec.price}
                      </span>
                    )}
                  </div>
                }
              >
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">{rec.description}</p>
                  
                  {rec.address && (
                    <div className="text-xs text-gray-500">
                      <i className="pi pi-map-marker mr-1" />
                      {rec.address}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {rec.tags.map((tag, idx) => (
                      <Tag 
                        key={idx}
                        value={tag}
                        className="text-xs"
                        severity="info"
                      />
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      label="Save" 
                      icon="pi pi-bookmark" 
                      className="p-button-sm p-button-outlined"
                    />
                    <Button 
                      label="View Details" 
                      icon="pi pi-info-circle" 
                      className="p-button-sm p-button-outlined"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {recommendations.filter(r => r.type === 'hotel').length}
                </div>
                <div className="text-sm text-gray-600">Hotels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {recommendations.filter(r => r.type === 'restaurant').length}
                </div>
                <div className="text-sm text-gray-600">Restaurants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {recommendations.filter(r => r.type === 'attraction').length}
                </div>
                <div className="text-sm text-gray-600">Attractions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {recommendations.filter(r => r.type === 'tip').length}
                </div>
                <div className="text-sm text-gray-600">Tips</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Recommendations;