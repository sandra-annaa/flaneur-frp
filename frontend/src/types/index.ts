export interface TripData {
  destination: string;
  duration: number;
  budget: 'budget' | 'moderate' | 'luxury' | 'premium';
  travelMode: 'flight' | 'train' | 'car' | 'bus';
  accommodation: 'hotel' | 'resort' | 'hostel' | 'airbnb' | 'guesthouse';
  activities: 'sightseeing' | 'adventure' | 'relaxation' | 'foodie' | 'shopping' | 'nature';
  travelers: 'solo' | 'couple' | 'family' | 'friends';
  startDate: string;
  latitude?: number;
  longitude?: number;
}

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  isPacked: boolean;
}

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  timeNeeded: number;
}