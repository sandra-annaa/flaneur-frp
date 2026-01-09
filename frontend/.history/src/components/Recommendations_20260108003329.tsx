// FRONTEND/src/components/Recommendations.tsx
import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { fetchOSMRecommendations, OSMRecommendation } from '../services/osmRecommendations';

interface RecommendationsProps {
  destination: string;
  tripId?: number;
}

export function Recommendations({ destination, tripId }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<OSMRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'hotels' | 'food' | 'attractions'>('all');
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'osm' | 'fallback'>('osm');
  const toast = useRef<Toast>(null);

  // Fetch REAL recommendations from OpenStreetMap
  const fetchRealRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🗺️ Fetching REAL OpenStreetMap data for: ${destination}`);
      
      if (!destination || destination.trim() === '') {
        throw new Error('Please enter a destination');
      }

      // Use OpenStreetMap API
      const osmData = await fetchOSMRecommendations(destination, 25);
      console.log(`✅ OSM returned ${osmData.length} recommendations`);
      
      if (osmData.length > 0) {
        setRecommendations(osmData);
        setSource('osm');
      } else {
        // OSM returned empty - use fallback
        throw new Error('No places found on OpenStreetMap for this location');
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching recommendations:', error);
      setError(error.message || 'Failed to load recommendations');
      setSource('fallback');
      
      if (toast.current) {
        toast.current.show({
          severity: 'warn',
          summary: 'Using Sample Data',
          detail: 'Could not fetch live data. Showing sample recommendations.',
          life: 3000
        });
      }
      
      // Fallback to sample data
      fetchFallbackRecommendations(destination);
    } finally {
      setLoading(false);
    }
  };

  // Fallback function (if OSM API fails)
  const fetchFallbackRecommendations = async (city: string) => {
    console.log('🔄 Using fallback recommendations for:', city);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const fallbackData: OSMRecommendation[] = [
      {
        id: '1',
        type: 'hotel',
        name: `${city} Grand Hotel`,
        description: 'Luxury accommodation with modern amenities and city views',
        rating: 4.5,
        price: '$$$$',
        address: `123 Main Street, ${city}`,
        tags: ['Luxury', '5-Star', 'Pool', 'Spa', 'City View'],
        latitude: 0,
        longitude: 0,
      },
      {
        id: '2',
        type: 'hotel',
        name: `${city} Budget Inn`,
        description: 'Affordable and comfortable stay for budget travelers',
        rating: 3.8,
        price: '$$',
        address: `456 Side Street, ${city}`,
        tags: ['Budget', 'Comfortable', 'Value', 'Free WiFi'],
        latitude: 0,
        longitude: 0,
      },
      {
        id: '3',
        type: 'restaurant',
        name: `${city} Local Kitchen`,
        description: 'Authentic local cuisine and traditional dishes',
        rating: 4.3,
        price: '$$',
        address: `789 Food Street, ${city}`,
        tags: ['Local Cuisine', 'Traditional', 'Popular', 'Vegetarian Options'],
        latitude: 0,
        longitude: 0,
      },
      {
        id: '4',
        type: 'restaurant',
        name: `${city} Fusion Bistro`,
        description: 'Modern fusion cuisine with international flavors',
        rating: 4.1,
        price: '$$$',
        address: `101 Fusion Avenue, ${city}`,
        tags: ['Fusion', 'Modern', 'International', 'Fine Dining'],
        latitude: 0,
        longitude: 0,
      },
      {
        id: '5',
        type: 'attraction',
        name: `${city} Historical Museum`,
        description: 'Learn about local history, culture, and heritage',
        rating: 4.7,
        price: 'Free-$$',
        address: `202 History Lane, ${city}`,
        tags: ['Museum', 'History', 'Cultural', 'Educational'],
        latitude: 0,
        longitude: 0,
      },
      {
        id: '6',
        type: 'attraction',
        name: `${city} Central Park`,
        description: 'Beautiful public park perfect for relaxation and walks',
        rating: 4.6,
        price: 'Free',
        address: `303 Green Avenue, ${city}`,
        tags: ['Park', 'Nature', 'Relaxation', 'Family Friendly'],
        latitude: 0,
        longitude: 0,
      },
      {
        id: '7',
        type: 'shop',
        name: `${city} Central Mall`,
        description: 'Large shopping mall with international brands',
        rating: 4.2,
        price: '$$$',
        address: `404 Shopping District, ${city}`,
        tags: ['Shopping', 'Mall', 'Brands', 'Entertainment'],
        latitude: 0,
        longitude: 0,
      },
      {
        id: '8',
        type: 'amenity',
        name: `${city} Tourist Information Center`,
        description: 'Get maps, guides, and local information',
        rating: 4.4,
        price: 'Free',
        address: `505 Help Street, ${city}`,
        tags: ['Information', 'Tourist Help', 'Maps', 'Guides'],
        latitude: 0,
        longitude: 0,
      },
    ];
    
    setRecommendations(fallbackData);
  };

  useEffect(() => {
    if (destination) {
      fetchRealRecommendations();
    }
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
      case 'shop': return 'pi pi-shopping-cart';
      case 'amenity': return 'pi pi-info-circle';
      default: return 'pi pi-star';
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'hotel': return 'bg-blue-100 text-blue-800';
      case 'restaurant': return 'bg-green-100 text-green-800';
      case 'attraction': return 'bg-purple-100 text-purple-800';
      case 'shop': return 'bg-orange-100 text-orange-800';
      case 'amenity': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshRecommendations = () => {
    fetchRealRecommendations();
  };

  if (loading) {
    return (
      <Card title="Real Recommendations" className="shadow-md">
        <div className="flex flex-col items-center justify-center py-8">
          <ProgressSpinner />
          <p className="mt-4 text-gray-600">Fetching real-time data for {destination}...</p>
          <p className="text-sm text-gray-500">Querying OpenStreetMap database</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="space-y-6">
        <Card title={`Real Recommendations for ${destination}`} className="shadow-md">
          <div className="p-4">
            {/* Header with refresh button */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-wrap gap-2">
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
              
              <Button 
                label="Refresh" 
                icon="pi pi-refresh" 
                className="p-button-outlined"
                onClick={refreshRecommendations}
              />
            </div>

            {/* Data source info */}
            <div className={`mb-6 p-4 rounded border ${
              source === 'osm' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {source === 'osm' ? '🗺️ Live OpenStreetMap Data' : '📋 Sample Recommendations'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {source === 'osm' 
                      ? `Real places found in ${destination} (${recommendations.length} results)` 
                      : 'Live data unavailable - showing sample recommendations'}
                  </p>
                </div>
                <Badge 
                  value={source === 'osm' ? 'LIVE DATA' : 'SAMPLE'} 
                  severity={source === 'osm' ? 'success' : 'warning'} 
                />
              </div>
            </div>

            {/* Recommendations Grid */}
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-8">
                <i className="pi pi-search text-gray-400 text-4xl mb-4" />
                <h3 className="text-gray-700 mb-2">No recommendations found</h3>
                <p className="text-gray-500">Try a different destination or refresh</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecommendations.map((rec) => (
                    <Card 
                      key={rec.id}
                      className="h-full hover:shadow-lg transition-shadow duration-300 border hover:border-blue-300"
                      title={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <i className={getTypeIcon(rec.type)} />
                            <span className="truncate font-medium">{rec.name}</span>
                          </div>
                          <Badge 
                            value={rec.type.toUpperCase()} 
                            className={getTypeColor(rec.type).replace('text-', '')}
                          />
                        </div>
                      }
                      subTitle={
                        <div className="mt-2">
                          <div className="flex items-center gap-1 mb-1">
                            <i className="pi pi-star-fill text-yellow-500" />
                            <span className="font-medium">{rec.rating?.toFixed(1)}</span>
                            <span className="text-gray-500 text-sm">/ 5.0</span>
                          </div>
                          <span className="text-gray-600 font-medium">{rec.price}</span>
                        </div>
                      }
                    >
                      <div className="space-y-3">
                        <p className="text-gray-700 text-sm">{rec.description}</p>
                        
                        {rec.address && (
                          <div className="text-xs text-gray-500 flex items-start gap-1">
                            <i className="pi pi-map-marker mt-0.5" />
                            <span>{rec.address}</span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {rec.tags.slice(0, 3).map((tag, idx) => (
                            <Tag 
                              key={idx}
                              value={tag}
                              className="text-xs"
                              severity="info"
                            />
                          ))}
                        </div>
                        
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                          <Button 
                            label="Save" 
                            icon="pi pi-bookmark" 
                            className="p-button-sm p-button-outlined flex-1"
                          />
                          <Button 
                            label="Directions" 
                            icon="pi pi-directions" 
                            className="p-button-sm p-button-outlined flex-1"
                            disabled={rec.latitude === 0}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Stats footer */}
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
                      <div className="text-2xl font-bold text-orange-600">
                        {recommendations.filter(r => r.type === 'shop').length}
                      </div>
                      <div className="text-sm text-gray-600">Shops</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

export default Recommendations;