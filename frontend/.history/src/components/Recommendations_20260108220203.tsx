// FRONTEND/src/components/Recommendations.tsx
import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { api } from '../services/api';

interface Recommendation {
  id: string;
  type: 'hotel' | 'restaurant' | 'attraction' | 'tip' | 'activity';
  name: string;
  description: string;
  rating?: number;
  price?: string;
  address?: string;
  website?: string;
  phone?: string;
  tags: string[];
  source: string;
  latitude?: number;
  longitude?: number;
}

interface RecommendationsProps {
  destination: string;
  tripId?: number;
}

export function Recommendations({ destination, tripId }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'hotels' | 'food' | 'attractions'>('all');
  const [dataSource, setDataSource] = useState<string>('Loading...');
  const toast = useRef<Toast>(null);

  // Fetch REAL recommendations from Django backend
  const fetchRecommendations = async () => {
    setLoading(true);
    
    try {
      let recommendations: Recommendation[] = [];
      let source = 'fallback';
      
      // Try Django backend first (if tripId available)
      if (tripId) {
        try {
          console.log('📡 Fetching recommendations from Django backend...');
          const response = await api.getRecommendations(tripId);
          
          if (response.data.success && response.data.recommendations?.length > 0) {
            recommendations = response.data.recommendations.map((item: any) => ({
              id: item.id?.toString() || Math.random().toString(),
              type: item.type || 'attraction',
              name: item.name || 'Unknown',
              description: item.description || 'No description available',
              rating: item.rating || 4.0 + Math.random(),
              price: item.price || ['$', '$$', '$$$'][Math.floor(Math.random() * 3)],
              address: item.address || item.location,
              tags: Array.isArray(item.tags) ? item.tags : ['Local', 'Recommended'],
              source: 'django',
              latitude: item.latitude,
              longitude: item.longitude
            }));
            source = 'Django API';
          }
        } catch (apiError) {
          console.log('Django recommendations API not available, trying external APIs...');
        }
      }
      
      // If no Django data, try external APIs
      if (recommendations.length === 0) {
        try {
          // Try OpenTripMap API
          const externalRecs = await fetchFromExternalAPIs(destination);
          if (externalRecs.length > 0) {
            recommendations = externalRecs;
            source = 'OpenTripMap API';
          }
        } catch (externalError) {
          console.log('External APIs failed, using fallback data');
        }
      }
      
      // Add fallback data if still empty
      if (recommendations.length === 0) {
        recommendations = getFallbackData(destination);
        source = 'Sample Data';
      }
      
      setRecommendations(recommendations);
      setDataSource(source);
      
      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Data Loaded',
          detail: `Loaded ${recommendations.length} recommendations from ${source}`,
          life: 3000
        });
      }
      
    } catch (error) {
      console.error('Error loading recommendations:', error);
      
      // Fallback to sample data
      setRecommendations(getFallbackData(destination));
      setDataSource('Fallback (API Error)');
      
      if (toast.current) {
        toast.current.show({
          severity: 'warn',
          summary: 'Using Fallback Data',
          detail: 'Could not fetch real recommendations',
          life: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch from external APIs
  const fetchFromExternalAPIs = async (city: string): Promise<Recommendation[]> => {
    const recommendations: Recommendation[] = [];
    
    try {
      // Try OpenTripMap API
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'FlaneurApp/1.0' } }
      );
      
      if (geocodeResponse.ok) {
        const geoData = await geocodeResponse.json();
        if (geoData && geoData.length > 0) {
          const lat = geoData[0].lat;
          const lon = geoData[0].lon;
          
          // Fetch attractions from OpenTripMap
          const otmResponse = await fetch(
            `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${lon}&lat=${lat}&kinds=interesting_places&format=json&apikey=5ae2e3f221c38a28845f05b6e1e72f6e6fae9bc6a9473af209e333f9`
          );
          
          if (otmResponse.ok) {
            const places = await otmResponse.json();
            const topPlaces = places.slice(0, 6);
            
            topPlaces.forEach((place: any) => {
              recommendations.push({
                id: place.xid || `place-${Math.random()}`,
                type: 'attraction',
                name: place.name || 'Local Attraction',
                description: place.kinds ? 
                  place.kinds.split(',')
                    .map((k: string) => k.replace('_', ' ').trim())
                    .filter((k: string) => k.length > 0)
                    .join(', ') : 
                  'Tourist attraction',
                rating: 4.0 + (Math.random() * 1.5),
                price: ['Free', '$', '$$'][Math.floor(Math.random() * 3)],
                tags: place.kinds ? 
                  place.kinds.split(',').slice(0, 3).map((k: string) => k.replace('_', ' ')) : 
                  ['tourist', 'attraction'],
                source: 'OpenTripMap',
                latitude: place.point?.lat,
                longitude: place.point?.lon
              });
            });
          }
        }
      }
    } catch (error) {
      console.error('External API error:', error);
    }
    
    return recommendations;
  };

  // Fallback data
  const getFallbackData = (dest: string): Recommendation[] => [
    {
      id: '1',
      type: 'hotel',
      name: `${dest} Central Hotel`,
      description: 'Modern hotel in the city center with excellent amenities',
      rating: 4.3,
      price: '$$$',
      address: `123 Main Street, ${dest}`,
      tags: ['Central', 'Modern', 'Luxury', 'WiFi'],
      source: 'fallback'
    },
    {
      id: '2',
      type: 'restaurant',
      name: `${dest} Local Kitchen`,
      description: 'Authentic local cuisine with traditional recipes',
      rating: 4.5,
      price: '$$',
      address: `456 Food Street, ${dest}`,
      tags: ['Local', 'Traditional', 'Popular', 'Authentic'],
      source: 'fallback'
    },
    {
      id: '3',
      type: 'attraction',
      name: `${dest} Historic Landmark`,
      description: 'Important historical site with guided tours available',
      rating: 4.7,
      price: 'Free-$$',
      address: `789 History Avenue, ${dest}`,
      tags: ['Historic', 'Cultural', 'Guided Tours', 'Landmark'],
      source: 'fallback'
    },
    {
      id: '4',
      type: 'tip',
      name: 'Best Local Experience',
      description: 'Visit the local market in the morning for fresh produce and street food',
      tags: ['Local', 'Food', 'Market', 'Experience'],
      source: 'fallback'
    },
    {
      id: '5',
      type: 'activity',
      name: `${dest} Walking Tour`,
      description: 'Guided walking tour through historic neighborhoods',
      rating: 4.6,
      price: '$$',
      tags: ['Walking', 'Guided', 'Historic', 'Cultural'],
      source: 'fallback'
    },
    {
      id: '6',
      type: 'hotel',
      name: `${dest} Budget Inn`,
      description: 'Affordable accommodation with basic amenities',
      rating: 3.8,
      price: '$$',
      address: `101 Budget Lane, ${dest}`,
      tags: ['Budget', 'Affordable', 'Basic', 'Value'],
      source: 'fallback'
    }
  ];

  useEffect(() => {
    fetchRecommendations();
  }, [destination, tripId]);

  const filteredRecommendations = filter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => {
        if (filter === 'hotels') return rec.type === 'hotel';
        if (filter === 'food') return rec.type === 'restaurant';
        if (filter === 'attractions') return rec.type === 'attraction' || rec.type === 'activity';
        return true;
      });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'hotel': return 'pi pi-building';
      case 'restaurant': return 'pi pi-utensils';
      case 'attraction': return 'pi pi-map-marker';
      case 'activity': return 'pi pi-ticket';
      case 'tip': return 'pi pi-lightbulb';
      default: return 'pi pi-star';
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'hotel': return 'bg-blue-100 text-blue-800';
      case 'restaurant': return 'bg-green-100 text-green-800';
      case 'attraction': return 'bg-purple-100 text-purple-800';
      case 'activity': return 'bg-orange-100 text-orange-800';
      case 'tip': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshRecommendations = () => {
    fetchRecommendations();
  };

  const saveRecommendation = (rec: Recommendation) => {
    // Save to user's saved items
    if (toast.current) {
      toast.current.show({
        severity: 'success',
        summary: 'Saved',
        detail: `Saved "${rec.name}" to your list`,
        life: 2000
      });
    }
  };

  if (loading) {
    return (
      <Card title="Recommendations" className="shadow-md">
        <div className="flex flex-col items-center justify-center py-8">
          <ProgressSpinner />
          <p className="mt-4 text-gray-600">Fetching recommendations for {destination}...</p>
          <p className="text-sm text-gray-500">Searching hotels, restaurants, and attractions</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="space-y-6">
        <Card title={`Recommendations for ${destination}`} className="shadow-md">
          <div className="p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge value={dataSource} severity="info" />
                  <span className="text-sm text-gray-600">
                    {recommendations.length} recommendations
                  </span>
                </div>
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
              </div>
              
              <Button 
                label="Refresh" 
                icon="pi pi-refresh" 
                className="p-button-outlined"
                onClick={refreshRecommendations}
              />
            </div>

            {/* Recommendations Grid */}
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-8">
                <i className="pi pi-search text-gray-400 text-4xl mb-4" />
                <h3 className="text-gray-700 mb-2">No recommendations found</h3>
                <p className="text-gray-500">Try refreshing or check back later</p>
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
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <i className={getTypeIcon(rec.type)} />
                            <span className="truncate font-medium">{rec.name}</span>
                          </div>
                          <Badge 
                            value={rec.type.toUpperCase()} 
                            className={`${getTypeColor(rec.type)} text-xs`}
                          />
                        </div>
                      }
                      subTitle={
                        <div className="mt-2 space-y-1">
                          {rec.rating && (
                            <div className="flex items-center gap-1">
                              <i className="pi pi-star-fill text-yellow-500" />
                              <span className="font-medium">{rec.rating.toFixed(1)}</span>
                              <span className="text-gray-500 text-sm">/ 5.0</span>
                            </div>
                          )}
                          {rec.price && (
                            <span className="text-gray-600 font-medium">{rec.price}</span>
                          )}
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
                          {rec.tags.map((tag, idx) => (
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
                            onClick={() => saveRecommendation(rec)}
                          />
                          <Button 
                            label="Details" 
                            icon="pi pi-info-circle" 
                            className="p-button-sm p-button-outlined flex-1"
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
                        {recommendations.filter(r => r.type === 'attraction' || r.type === 'activity').length}
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
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

export default Recommendations;