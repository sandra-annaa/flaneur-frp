import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { tripAPI } from '../services/api';

// Fix for Leaflet marker icons
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  timeNeeded: number;
}

export default function MapComponent() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  // Kochi center coordinates
  const center: [number, number] = [9.9312, 76.2673];

  // Sample Kochi locations (will be fetched from API later)
  const kochiLocations: MapLocation[] = [
    { id: '1', name: 'Fort Kochi', lat: 9.9616, lng: 76.2391, type: 'historical', description: 'Historic European settlement', timeNeeded: 120 },
    { id: '2', name: 'Marine Drive', lat: 9.9700, lng: 76.2800, type: 'scenic', description: 'Beautiful waterfront promenade', timeNeeded: 60 },
    { id: '3', name: 'Hill Palace', lat: 9.9647, lng: 76.3544, type: 'museum', description: 'Largest archaeological museum', timeNeeded: 90 },
    { id: '4', name: 'Chinese Fishing Nets', lat: 9.9679, lng: 76.2437, type: 'landmark', description: 'Iconic fishing nets', timeNeeded: 45 },
    { id: '5', name: 'Mattancherry Palace', lat: 9.9572, lng: 76.2597, type: 'historical', description: 'Portuguese palace with murals', timeNeeded: 60 },
    { id: '6', name: 'Lulu Mall', lat: 10.0168, lng: 76.3618, type: 'shopping', description: 'Largest shopping mall in India', timeNeeded: 120 },
    { id: '7', name: 'Kerala Folklore Museum', lat: 9.9667, lng: 76.2833, type: 'museum', description: 'Traditional Kerala artifacts', timeNeeded: 60 },
    { id: '8', name: 'Cherai Beach', lat: 10.1418, lng: 76.1790, type: 'beach', description: 'Beautiful golden beach', timeNeeded: 90 },
  ];

  useEffect(() => {
    setLocations(kochiLocations);
  }, []);

  const getMarkerColor = (type: string) => {
    const colors: Record<string, string> = {
      historical: 'bg-blue-500',
      scenic: 'bg-green-500',
      museum: 'bg-purple-500',
      landmark: 'bg-yellow-500',
      shopping: 'bg-pink-500',
      beach: 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <Card className="map-card">
      <div className="flex align-items-center justify-content-between mb-4">
        <div className="flex align-items-center gap-2">
          <MapPin className="text-primary" />
          <h2 className="m-0">Interactive Kochi Map</h2>
        </div>
        <Badge value={`${locations.length} Locations`} severity="info" />
      </div>

      <div className="grid">
        <div className="col-12 lg:col-8">
          <div style={{ height: '500px', width: '100%' }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={[location.lat, location.lng]}
                  eventHandlers={{
                    click: () => setSelectedLocation(location),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="m-0 mb-2">{location.name}</h4>
                      <Badge value={location.type} severity="success" className="mb-2" />
                      <p className="text-sm mb-2">{location.description}</p>
                      <div className="flex align-items-center gap-1 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{location.timeNeeded} minutes</span>
                      </div>
                      <Button 
                        icon={<Navigation size={16} />}
                        label="Add to Itinerary"
                        size="small"
                        className="w-full mt-2"
                      />
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="col-12 lg:col-4">
          <Card className="h-full">
            <h3 className="mt-0">Selected Location</h3>
            {selectedLocation ? (
              <div className="space-y-3">
                <div>
                  <h4 className="mb-2">{selectedLocation.name}</h4>
                  <Badge value={selectedLocation.type} severity="success" />
                </div>
                <p>{selectedLocation.description}</p>
                <div className="flex align-items-center gap-2">
                  <Clock size={18} className="text-gray-600" />
                  <span>Time needed: {selectedLocation.timeNeeded} minutes</span>
                </div>
                <Button 
                  icon={<Navigation size={18} />}
                  label="Add to Day 1"
                  className="w-full"
                />
                <Button 
                  label="View Details"
                  className="w-full p-button-outlined"
                />
              </div>
            ) : (
              <div className="text-center py-6">
                <MapPin size={48} className="text-gray-300 mb-3" />
                <p className="text-gray-600">Click on any marker to see details</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Badge value="Historical" severity="info" />
        <Badge value="Scenic" severity="success" />
        <Badge value="Museum" severity="warning" />
        <Badge value="Shopping" severity="secondary" />
        <Badge value="Beach" severity="danger" />
      </div>
    </Card>
  );
}