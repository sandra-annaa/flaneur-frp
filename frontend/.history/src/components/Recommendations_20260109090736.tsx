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

  // Helper function to convert price symbols to text
  const getPriceText = (price: string) => {
    // Remove dollar signs and convert to descriptive text
    if (price.includes('Free') || price === 'Free') {
      return 'Free Entry';
    } else if (price.includes('Free-$$')) {
      return 'Free to Moderate';
    } else {
      // Count dollar signs and convert to text
      const dollarCount = (price.match(/\$/g) || []).length;
      switch(dollarCount) {
        case 1: return 'Budget Friendly';
        case 2: return 'Moderate';
        case 3: return 'Premium';
        case 4: return 'Luxury';
        default: return 'Various Prices';
      }
    }
  };

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
        price: 'Luxury',
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
        price: 'Budget Friendly',
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
        price: 'Moderate',
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
        price: 'Premium',
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
        price: 'Free Entry',
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
        price: 'Free Entry',
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
        price: 'Premium',
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
        price: 'Free Entry',
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
      case 'hotel': return 'var(--chocolate-600)';
      case 'restaurant': return 'var(--chocolate-700)';
      case 'attraction': return 'var(--chocolate-800)';
      case 'shop': return 'var(--chocolate-500)';
      case 'amenity': return 'var(--chocolate-400)';
      default: return 'var(--chocolate-600)';
    }
  };

  const getTypeBgColor = (type: string) => {
    switch(type) {
      case 'hotel': return 'var(--chocolate-100)';
      case 'restaurant': return 'var(--chocolate-50)';
      case 'attraction': return 'var(--ivory-200)';
      case 'shop': return 'var(--chocolate-100)';
      case 'amenity': return 'var(--ivory-100)';
      default: return 'var(--chocolate-100)';
    }
  };

  const refreshRecommendations = () => {
    fetchRealRecommendations();
  };

  if (loading) {
    return (
      <Card 
        title="Real Recommendations" 
        style={{
          border: '1px solid var(--chocolate-200)',
          backgroundColor: 'var(--ivory-50)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
          <ProgressSpinner />
          <p style={{ marginTop: '16px', color: 'var(--chocolate-700)' }}>
            Fetching real-time data for {destination}...
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--chocolate-500)', marginTop: '4px' }}>
            Querying OpenStreetMap database
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Card 
          title={`Real Recommendations for ${destination}`}
          style={{
            border: '1px solid var(--chocolate-200)',
            backgroundColor: 'var(--ivory-50)'
          }}
        >
          <div style={{ padding: '16px' }}>
            {/* Header with refresh button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Button 
                  label="All" 
                  icon="pi pi-filter"
                  style={{
                    backgroundColor: filter === 'all' ? 'var(--chocolate-600)' : 'transparent',
                    color: filter === 'all' ? 'var(--ivory-50)' : 'var(--chocolate-600)',
                    border: `1px solid var(--chocolate-${filter === 'all' ? '600' : '200'})`
                  }}
                  onClick={() => setFilter('all')}
                />
                <Button 
                  label="Hotels" 
                  icon="pi pi-building"
                  style={{
                    backgroundColor: filter === 'hotels' ? 'var(--chocolate-600)' : 'transparent',
                    color: filter === 'hotels' ? 'var(--ivory-50)' : 'var(--chocolate-600)',
                    border: `1px solid var(--chocolate-${filter === 'hotels' ? '600' : '200'})`
                  }}
                  onClick={() => setFilter('hotels')}
                />
                <Button 
                  label="Food & Dining" 
                  icon="pi pi-utensils"
                  style={{
                    backgroundColor: filter === 'food' ? 'var(--chocolate-600)' : 'transparent',
                    color: filter === 'food' ? 'var(--ivory-50)' : 'var(--chocolate-600)',
                    border: `1px solid var(--chocolate-${filter === 'food' ? '600' : '200'})`
                  }}
                  onClick={() => setFilter('food')}
                />
                <Button 
                  label="Attractions" 
                  icon="pi pi-map-marker"
                  style={{
                    backgroundColor: filter === 'attractions' ? 'var(--chocolate-600)' : 'transparent',
                    color: filter === 'attractions' ? 'var(--ivory-50)' : 'var(--chocolate-600)',
                    border: `1px solid var(--chocolate-${filter === 'attractions' ? '600' : '200'})`
                  }}
                  onClick={() => setFilter('attractions')}
                />
              </div>
              
              <Button 
                label="Refresh" 
                icon="pi pi-refresh" 
                style={{
                  border: '1px solid var(--chocolate-200)',
                  color: 'var(--chocolate-600)'
                }}
                onClick={refreshRecommendations}
              />
            </div>

            {/* Data source info */}
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              borderRadius: '6px',
              border: '1px solid var(--chocolate-200)',
              background: source === 'osm' 
                ? 'var(--chocolate-50)' 
                : 'var(--ivory-100)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--chocolate-900)', margin: 0 }}>
                    {source === 'osm' ? '🗺️ Live OpenStreetMap Data' : '📋 Sample Recommendations'}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--chocolate-700)', margin: '4px 0 0 0' }}>
                    {source === 'osm' 
                      ? `Real places found in ${destination} (${recommendations.length} results)` 
                      : 'Live data unavailable - showing sample recommendations'}
                  </p>
                </div>
                <Badge 
                  value={source === 'osm' ? 'LIVE DATA' : 'SAMPLE'} 
                  style={{
                    backgroundColor: source === 'osm' ? 'var(--chocolate-600)' : 'var(--chocolate-400)',
                    color: 'var(--ivory-50)'
                  }}
                />
              </div>
            </div>

            {/* Recommendations Grid */}
            {filteredRecommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <i className="pi pi-search" style={{ fontSize: '2rem', color: 'var(--chocolate-300)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--chocolate-800)', marginBottom: '8px' }}>No recommendations found</h3>
                <p style={{ color: 'var(--chocolate-600)' }}>Try a different destination or refresh</p>
              </div>
            ) : (
              <>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '16px'
                }}>
                  {filteredRecommendations.map((rec) => (
                    <Card 
                      key={rec.id}
                      style={{
                        border: '1px solid var(--chocolate-200)',
                        backgroundColor: 'white',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'box-shadow 0.3s'
                      }}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <i className={getTypeIcon(rec.type)} style={{ color: getTypeColor(rec.type) }} />
                            <span style={{ 
                              fontWeight: 500, 
                              color: 'var(--chocolate-900)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {rec.name}
                            </span>
                          </div>
                          <Badge 
                            value={rec.type.toUpperCase()} 
                            style={{ 
                              backgroundColor: getTypeBgColor(rec.type),
                              color: getTypeColor(rec.type),
                              fontSize: '0.75rem'
                            }}
                          />
                        </div>
                      }
                      subTitle={
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <i className="pi pi-star-fill" style={{ color: 'var(--chocolate-500)' }} />
                            <span style={{ fontWeight: 500, color: 'var(--chocolate-800)' }}>
                              {rec.rating?.toFixed(1)}
                            </span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--chocolate-600)' }}>/ 5.0</span>
                          </div>
                          <div style={{ 
                            display: 'inline-block',
                            padding: '2px 8px',
                            backgroundColor: 'var(--chocolate-50)',
                            color: 'var(--chocolate-700)',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}>
                            {getPriceText(rec.price ||)}
                          </div>
                        </div>
                      }
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                        <p style={{ color: 'var(--chocolate-700)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                          {rec.description}
                        </p>
                        
                        {rec.address && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--chocolate-600)', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                            <i className="pi pi-map-marker" style={{ marginTop: '2px' }} />
                            <span>{rec.address}</span>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                          {rec.tags.slice(0, 3).map((tag, idx) => (
                            <Tag 
                              key={idx}
                              value={tag}
                              style={{
                                fontSize: '0.75rem',
                                backgroundColor: 'var(--chocolate-100)',
                                color: 'var(--chocolate-800)',
                                border: 'none'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Stats footer */}
                <div style={{ 
                  marginTop: '24px', 
                  padding: '16px', 
                  backgroundColor: 'var(--chocolate-50)', 
                  borderRadius: '6px' 
                }}>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--chocolate-800)' }}>
                        {recommendations.filter(r => r.type === 'hotel').length}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--chocolate-700)' }}>Hotels</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--chocolate-800)' }}>
                        {recommendations.filter(r => r.type === 'restaurant').length}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--chocolate-700)' }}>Restaurants</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--chocolate-800)' }}>
                        {recommendations.filter(r => r.type === 'attraction').length}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--chocolate-700)' }}>Attractions</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--chocolate-800)' }}>
                        {recommendations.filter(r => r.type === 'shop').length}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--chocolate-700)' }}>Shops</div>
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