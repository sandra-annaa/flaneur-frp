import { useState } from "react";
import { api } from '../services/api'; // Import API service

// PrimeReact imports
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

interface TripFormProps {
  onSubmit: (tripData: TripData) => void;
  //isAuthenticated: boolean;
}

export interface TripData {
  id?: number;
  destination: string;
  duration: number;
  budget: string;
  travelMode: string;
  accommodation: string;
  activities: string;
  travelers: string;
  startDate: string;
  interests?: string;
  created_at?: string;
}

export function TripForm({ onSubmit }: TripFormProps) {
  const [formData, setFormData] = useState<TripData>({
    destination: "",
    duration: 3,
    budget: "",
    travelMode: "",
    accommodation: "",
    activities: "",
    travelers: "",
    startDate: "",
    interests: "", // Combine activities into interests for backend
  });

  const [isLoading, setIsLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("=== DEBUG START ===");
  console.log("Start date value:", formData.startDate);
  console.log("Formatted date:", new Date(formData.startDate).toISOString().split('T')[0]);
  console.log("Full form data:", formData);
  console.log("=== DEBUG END ===");
    try {
      // Prepare data for backend
      const tripPayload = {
        destination: formData.destination,
        start_date: new Date(formData.startDate).toISOString().split('T')[0], // Fix date
        duration: formData.duration,
        budget: formData.budget,
        travel_mode: formData.travelMode, // Match backend field name
        travelers: formData.travelers,
        interests: formData.activities, 
        accommodation: formData.accommodation,// Map activities to interests
        // Note: accommodation is not in backend model, we'll skip or add later
      };
      console.log("Payload being sent:", tripPayload);
      // Call backend API to save trip
      const savedTrip = await api.createTrip(tripPayload);
      
      // Show success message
       // Map backend response to TripData interface
  const tripDataForParent: TripData = {
    id: savedTrip.id, // ✅ Get ID from backend
    destination: savedTrip.destination,
    duration: savedTrip.duration,
    budget: savedTrip.budget,
    travelMode: savedTrip.travel_mode || savedTrip.travelMode,
    accommodation: savedTrip.accommodation,
    activities: savedTrip.interests || savedTrip.activities,
    travelers: savedTrip.travelers,
    startDate: savedTrip.start_date || savedTrip.startDate,
    interests: savedTrip.interests,
    created_at: savedTrip.created_at
  };
  
  console.log('✅ Mapped trip data:', tripDataForParent); // Add this


      // Pass saved trip (with ID from database) to parent
      onSubmit(savedTrip);
      
    } catch (error: any) {
      console.error('Failed to save trip:', error);
      
      // Show error message
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to save trip. Please try again.',
          life: 5000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof TripData, value: string | number | Date | null) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value instanceof Date ? value.toISOString().split('T')[0] : value 
    }));
  };

  // Dropdown options - Map frontend values to backend values
  const budgetOptions = [
    { label: 'Budget-Friendly ($)', value: 'budget' },
    { label: 'Moderate ($$)', value: 'midrange' }, // Changed to match backend
    { label: 'Luxury ($$$)', value: 'luxury' }
  ];

  const travelModeOptions = [
    { label: 'Flight', value: 'flight' },
    { label: 'Train', value: 'train' },
    { label: 'Car', value: 'car' },
    { label: 'Bus', value: 'bus' }
  ];

  const accommodationOptions = [
    { label: 'Hotel', value: 'hotel' },
    { label: 'Resort', value: 'resort' },
    { label: 'Hostel', value: 'hostel' },
    { label: 'Airbnb', value: 'airbnb' },
    { label: 'Guesthouse', value: 'guesthouse' }
  ];

  const travelerOptions = [
    { label: 'Solo Traveler', value: 'solo' },
    { label: 'Couple', value: 'couple' },
    { label: 'Family with Kids', value: 'family' },
    { label: 'Group of Friends', value: 'friends' }
  ];

  const activityOptions = [
    { label: 'Sightseeing & Culture', value: 'sightseeing' },
    { label: 'Adventure & Trekking', value: 'adventure' },
    { label: 'Beach & Relaxation', value: 'relaxation' },
    { label: 'Food & Culinary', value: 'foodie' },
    { label: 'Shopping & Nightlife', value: 'shopping' },
    { label: 'Nature & Wildlife', value: 'nature' }
  ];

  const cardTitle = "Plan Your Perfect Trip";
  const cardSubTitle = "Tell us about your travel preferences and we'll create a personalized itinerary for you";

  return (
    <>
      <Toast ref={toast} />
      <Card 
        title={cardTitle}
        subTitle={cardSubTitle}
        className="w-full max-w-3xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Destination */}
            <div className="field">
              <label htmlFor="destination" className="block mb-2 font-medium">
                Destination
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-map-marker" />
                </span>
                <InputText
                  id="destination"
                  placeholder="e.g., Paris, Bali, Tokyo"
                  value={formData.destination}
                  onChange={(e) => updateField("destination", e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="field">
              <label htmlFor="startDate" className="block mb-2 font-medium">
                Start Date
              </label>
              <Calendar
                id="startDate"
                value={formData.startDate ? new Date(formData.startDate) : null}
                onChange={(e) => {
                  if (e.value instanceof Date) {
                    updateField("startDate", e.value);
                  } else if (e.value === null) {
                    updateField("startDate", "");
                  }
                }}
                dateFormat="yy-mm-dd"
                showIcon
                required
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* Duration */}
            <div className="field">
              <label htmlFor="duration" className="block mb-2 font-medium">
                Duration (days)
              </label>
              <InputText
                id="duration"
                type="number"
                min="1"
                max="30"
                value={formData.duration.toString()}
                onChange={(e) => updateField("duration", parseInt(e.target.value) || 3)}
                required
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* Budget */}
            <div className="field">
              <label htmlFor="budget" className="block mb-2 font-medium">
                Budget Range
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-dollar" />
                </span>
                <Dropdown
                  id="budget"
                  value={formData.budget}
                  options={budgetOptions}
                  onChange={(e) => updateField("budget", e.value)}
                  placeholder="Select budget"
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Travel Mode */}
            <div className="field">
              <label htmlFor="travelMode" className="block mb-2 font-medium">
                Travel Mode
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-plane" />
                </span>
                <Dropdown
                  id="travelMode"
                  value={formData.travelMode}
                  options={travelModeOptions}
                  onChange={(e) => updateField("travelMode", e.value)}
                  placeholder="Select travel mode"
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Accommodation */}
            <div className="field">
              <label htmlFor="accommodation" className="block mb-2 font-medium">
                Accommodation Type
              </label>
              <Dropdown
                id="accommodation"
                value={formData.accommodation}
                options={accommodationOptions}
                onChange={(e) => updateField("accommodation", e.value)}
                placeholder="Select accommodation"
                required
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* Travelers */}
            <div className="field">
              <label htmlFor="travelers" className="block mb-2 font-medium">
                Travel Party
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-users" />
                </span>
                <Dropdown
                  id="travelers"
                  value={formData.travelers}
                  options={travelerOptions}
                  onChange={(e) => updateField("travelers", e.value)}
                  placeholder="Who's traveling?"
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Activities */}
            <div className="field">
              <label htmlFor="activities" className="block mb-2 font-medium">
                Activity Preferences
              </label>
              <Dropdown
                id="activities"
                value={formData.activities}
                options={activityOptions}
                onChange={(e) => updateField("activities", e.value)}
                placeholder="What interests you?"
                required
                className="w-full"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-6" />

          <div className="field mt-6">
            <Button 
              type="submit" 
              label={isLoading ? "Saving Trip..." : "Save & Generate Itinerary"}
              icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-check"}
              className="w-full p-button-lg"
              disabled={isLoading}
            />
          </div>
          
          <div className="text-center mt-4 text-sm text-gray-600">
            <p>Your trip will be saved to your account and accessible anytime.</p>
          </div>
        </form>
      </Card>
    </>
  );
}