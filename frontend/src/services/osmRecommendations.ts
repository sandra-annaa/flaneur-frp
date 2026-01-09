// FRONTEND/src/services/osmRecommendations.ts

export interface OSMRecommendation {
  id: string;
  type: 'hotel' | 'restaurant' | 'attraction' | 'shop' | 'amenity';
  name: string;
  description: string;
  rating?: number;
  price?: string;
  address: string;
  tags: string[];
  latitude: number;
  longitude: number;
  website?: string;
  phone?: string;
  opening_hours?: string;
}

// Multiple OSM servers for fallback
const OSM_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter'
];

// City coordinates cache
const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  'cochin': { lat: 9.9312, lon: 76.2673 },
  'kochi': { lat: 9.9312, lon: 76.2673 },
  'bali': { lat: -8.4095, lon: 115.1889 },
  'paris': { lat: 48.8566, lon: 2.3522 },
  'new york': { lat: 40.7128, lon: -74.0060 },
  'london': { lat: 51.5074, lon: -0.1278 },
  'delhi': { lat: 28.6139, lon: 77.2090 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'bangalore': { lat: 12.9716, lon: 77.5946 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  'hyderabad': { lat: 17.3850, lon: 78.4867 },
  'pune': { lat: 18.5204, lon: 73.8567 },
  'jaipur': { lat: 26.9124, lon: 75.7873 },
  'goa': { lat: 15.2993, lon: 74.1240 },
  'ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'surat': { lat: 21.1702, lon: 72.8311 },
  'lucknow': { lat: 26.8467, lon: 80.9462 },
  'kanpur': { lat: 26.4499, lon: 80.3319 },
  'nagpur': { lat: 21.1458, lon: 79.0882 },
  'indore': { lat: 22.7196, lon: 75.8577 },
  'thane': { lat: 19.2183, lon: 72.9781 },
  'bhopal': { lat: 23.2599, lon: 77.4126 },
  'visakhapatnam': { lat: 17.6868, lon: 83.2185 },
  'patna': { lat: 25.5941, lon: 85.1376 },
  'vadodara': { lat: 22.3072, lon: 73.1812 },
  'ghaziabad': { lat: 28.6692, lon: 77.4538 },
  'ludhiana': { lat: 30.9010, lon: 75.8573 },
  'agra': { lat: 27.1767, lon: 78.0081 },
  'nashik': { lat: 19.9975, lon: 73.7898 },
  'faridabad': { lat: 28.4089, lon: 77.3178 },
  'meerut': { lat: 28.9845, lon: 77.7064 },
  'rajkot': { lat: 22.3039, lon: 70.8022 },
  'kalyan': { lat: 19.2437, lon: 73.1355 },
  'vasai': { lat: 19.3919, lon: 72.8397 },
  'varanasi': { lat: 25.3176, lon: 82.9739 },
  'srinagar': { lat: 34.0837, lon: 74.7973 },
  'aurangabad': { lat: 19.8762, lon: 75.3433 },
  'dhanbad': { lat: 23.7957, lon: 86.4304 },
  'amritsar': { lat: 31.6340, lon: 74.8723 },
  'allahabad': { lat: 25.4358, lon: 81.8463 },
  'ranchi': { lat: 23.3441, lon: 85.3096 },
  'gwalior': { lat: 26.2183, lon: 78.1828 },
  'jodhpur': { lat: 26.2389, lon: 73.0243 },
  'raipur': { lat: 21.2514, lon: 81.6296 },
  'kota': { lat: 25.2138, lon: 75.8648 },
  'chandigarh': { lat: 30.7333, lon: 76.7794 }
};

// Get coordinates for a city
export const getCoordinates = (city: string): { lat: number; lon: number } => {
  const lowerCity = city.toLowerCase().trim();
  
  // Exact match
  if (cityCoordinates[lowerCity]) {
    return cityCoordinates[lowerCity];
  }
  
  // Partial match
  for (const [key, coords] of Object.entries(cityCoordinates)) {
    if (lowerCity.includes(key)) {
      return coords;
    }
  }
  
  // Default to Cochin
  console.warn(`Coordinates not found for "${city}", using Cochin`);
  return { lat: 9.9312, lon: 76.2673 };
};

// SIMPLER Overpass query to avoid timeouts
const createOverpassQuery = (lat: number, lon: number, limit: number = 15): string => {
  return `
    [out:json][timeout:20];
    (
      node["tourism"~"hotel|hostel|motel|guest_house"](around:3000, ${lat}, ${lon});
      node["amenity"~"restaurant|cafe|fast_food|bar|pub"](around:3000, ${lat}, ${lon});
      node["tourism"~"attraction|museum|gallery"](around:3000, ${lat}, ${lon});
      node["leisure"~"park"](around:3000, ${lat}, ${lon});
      node["shop"~"mall|supermarket"](around:3000, ${lat}, ${lon});
    );
    out body ${limit};
  `;
};

// Try multiple OSM servers with retry logic
const fetchFromOSM = async (query: string): Promise<any> => {
  let lastError: Error | null = null;
  
  for (const server of OSM_SERVERS) {
    try {
      console.log(`Trying OSM server: ${server}`);
      
      const response = await fetch(server, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success from ${server}: ${data.elements?.length || 0} elements`);
        return data;
      } else if (response.status === 429 || response.status === 504) {
        console.log(`⚠️ Server ${server} busy (${response.status}), trying next...`);
        continue;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ Server ${server} failed:`, error instanceof Error ? error.message : error);
      continue;
    }
  }
  
  throw lastError || new Error('All OSM servers failed');
};

// Cache results to avoid repeated API calls
const getCachedResults = (cacheKey: string): OSMRecommendation[] | null => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      // Cache valid for 2 hours
      if (Date.now() - data.timestamp < 2 * 60 * 60 * 1000) {
        console.log(`📦 Using cached data for ${cacheKey}`);
        return data.recommendations;
      }
    }
  } catch (error) {
    console.log('Cache read failed:', error);
  }
  return null;
};

const setCachedResults = (cacheKey: string, recommendations: OSMRecommendation[]): void => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      recommendations
    }));
  } catch (error) {
    console.log('Cache write failed:', error);
  }
};

// Map OSM element to our recommendation format
const mapOSMElement = (element: any, city: string): OSMRecommendation => {
  const tags = element.tags || {};
  
  // Determine type
  let type: OSMRecommendation['type'] = 'attraction';
  if (tags.tourism === 'hotel' || tags.tourism === 'hostel' || tags.tourism === 'motel') {
    type = 'hotel';
  } else if (tags.amenity === 'restaurant' || tags.amenity === 'cafe' || tags.amenity === 'bar') {
    type = 'restaurant';
  } else if (tags.shop) {
    type = 'shop';
  } else if (tags.amenity) {
    type = 'amenity';
  }

  // Generate description
  let description = '';
  if (tags.tourism) description += `${tags.tourism} `;
  if (tags.amenity) description += `${tags.amenity} `;
  if (tags.cuisine) description += `serving ${tags.cuisine} cuisine `;
  if (tags.description) description += tags.description;
  
  if (!description) {
    description = `${type.charAt(0).toUpperCase() + type.slice(1)} in ${city}`;
  }

  // Generate tags
  const recommendationTags: string[] = [];
  if (tags.tourism) recommendationTags.push(tags.tourism);
  if (tags.amenity) recommendationTags.push(tags.amenity);
  if (tags.cuisine) recommendationTags.push(tags.cuisine);
  if (tags.shop) recommendationTags.push(tags.shop);

  // Generate price indicator
  let price = '$$';
  if (tags.tourism === 'hotel') price = '$$$';
  if (tags.tourism === 'hostel') price = '$';

  // Generate address
  let address = city;
  if (tags['addr:street']) {
    address = `${tags['addr:street']}, ${city}`;
  } else if (tags['addr:city']) {
    address = `${city}, ${tags['addr:city']}`;
  }

  return {
    id: `osm-${element.id}`,
    type,
    name: tags.name || `Unnamed ${type}`,
    description: description.trim(),
    rating: 3.5 + Math.random() * 1.5, // 3.5-5.0 range
    price,
    address: address.trim(),
    tags: recommendationTags.length > 0 ? recommendationTags : [type],
    latitude: element.lat,
    longitude: element.lon,
    website: tags.website,
    phone: tags.phone,
    opening_hours: tags.opening_hours,
  };
};

// Main function to fetch OSM recommendations
export const fetchOSMRecommendations = async (
  city: string, 
  limit: number = 15
): Promise<OSMRecommendation[]> => {
  try {
    console.log(`🗺️ Fetching OSM recommendations for: ${city}`);
    
    // Check cache first
    const cacheKey = `osm-recommendations-${city.toLowerCase().replace(/\s+/g, '-')}`;
    const cached = getCachedResults(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Get coordinates
    const coords = getCoordinates(city);
    console.log(`📍 Coordinates: ${coords.lat}, ${coords.lon}`);
    
    // Create simplified query
    const query = createOverpassQuery(coords.lat, coords.lon, limit);
    
    // Fetch from OSM
    const data = await fetchFromOSM(query);
    
    if (!data.elements || data.elements.length === 0) {
      console.log(`⚠️ No OSM data found for ${city}`);
      return [];
    }
    
    // Map data to our format
    const recommendations = data.elements
      .filter((element: any) => element.tags && element.tags.name)
      .map((element: any) => mapOSMElement(element, city));
    
    console.log(`✅ Mapped ${recommendations.length} recommendations from OSM`);
    
    // Cache the results
    setCachedResults(cacheKey, recommendations);
    
    return recommendations;
    
  } catch (error) {
    console.error('❌ Error fetching OSM recommendations:', error);
    throw error;
  }
};

// Test function with fallback
export const testOSMRecommendations = async (city: string = 'Cochin'): Promise<OSMRecommendation[]> => {
  console.log(`🧪 Testing OSM recommendations for ${city}...`);
  try {
    const recommendations = await fetchOSMRecommendations(city, 10);
    console.log(`✅ Test successful! Found ${recommendations.length} places:`);
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.name} (${rec.type}) - ${rec.description}`);
    });
    return recommendations;
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Return sample data for testing
    return [{
      id: 'test-1',
      type: 'hotel',
      name: `${city} Test Hotel`,
      description: `Sample hotel in ${city} for testing`,
      rating: 4.0,
      price: '$$$',
      address: `123 Test Street, ${city}`,
      tags: ['hotel', 'test'],
      latitude: 0,
      longitude: 0,
    }];
  }
};