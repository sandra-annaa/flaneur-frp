// FRONTEND/src/components/TripForm.tsx
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { api } from "../services/api";

export interface TripData {
  id?: number;
  destination: string;
  startDate: string;
  duration: number;
  travelers: string;
  budget: string;
  activities: string;
  travelMode: string;
  accommodation: string;
  interests?: string;
}

interface TripFormProps {
  onSubmit: (data: TripData) => void;
}

export function TripForm({ onSubmit }: TripFormProps) {
  // Form state
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(3);
  const [travelers, setTravelers] = useState("");
  const [budget, setBudget] = useState("");
  const [activities, setActivities] = useState("");
  const [travelMode, setTravelMode] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);

  // Options for dropdowns
  const budgetOptions = [
    { label: "Budget", value: "budget" },
    { label: "Mid-range", value: "midrange" },
    { label: "Luxury", value: "luxury" },
  ];

  const activityOptions = [
    { label: "Sightseeing", value: "sightseeing" },
    { label: "Adventure", value: "adventure" },
    { label: "Relaxation", value: "relaxation" },
    { label: "Food & Culinary", value: "foodie" },
    { label: "Nature & Wildlife", value: "nature" },
  ];

  const travelModeOptions = [
    { label: "Flight", value: "flight" },
    { label: "Train", value: "train" },
    { label: "Bus", value: "bus" },
    { label: "Car", value: "car" },
    { label: "Cruise", value: "cruise" },
  ];

  const accommodationOptions = [
    { label: "Hotel", value: "hotel" },
    { label: "Hostel", value: "hostel" },
    { label: "Apartment", value: "apartment" },
    { label: "Resort", value: "resort" },
    { label: "Homestay", value: "homestay" },
    { label: "Camping", value: "camping" },
  ];

  const travelerOptions = [
    { label: "Solo", value: "1 Adult" },
    { label: "Couple", value: "2 Adults" },
    { label: "Family (2+1)", value: "2 Adults, 1 Child" },
    { label: "Family (2+2)", value: "2 Adults, 2 Children" },
    { label: "Group (4)", value: "4 Adults" },
    { label: "Group (6+)", value: "6+ Adults" },
  ];

  const handleSubmit = async () => {
    // Validation
    if (!destination || !startDate || !duration || !travelers || !budget || !activities) {
      alert("Please fill in all required fields");
      return;
    }

    // Format date to YYYY-MM-DD for backend
    const formattedDate = startDate.toISOString().split("T")[0];
    
    // Prepare form data
    const formData: TripData = {
      destination,
      startDate: formattedDate,
      duration,
      travelers,
      budget,
      activities,
      travelMode,
      accommodation,
      interests,
    };

    console.log("=== DEBUG START ===");
    console.log("Start date value:", startDate);
    console.log("Formatted date:", formattedDate);
    console.log("Full form data:", formData);
    console.log("=== DEBUG END ===");

    setLoading(true);
    try {
      console.log("Payload being sent:", {
        destination,
        start_date: formattedDate, // snake_case for backend
        duration,
        travelers,
        budget,
        interests,
        travel_mode: travelMode,
        accommodation,
      });

      // Send to backend
      const response = await api.createTrip({
        destination,
        start_date: formattedDate, // snake_case
        duration,
        travelers,
        budget,
        interests,
        travel_mode: travelMode,
        accommodation,
      });

      console.log("✅ API Response:", response);

      // Extract trip data from response
      let tripData: TripData;
      if (response && response.data) {
        // If response is Axios response object
        tripData = response.data;
      } else if (response && response.data.id) {
        // If response is already the trip data
        tripData = response.data;
      } else {
        // Fallback: use form data with a dummy ID
        tripData = { ...formData, id: Date.now() };
      }

      console.log("✅ Mapped trip data:", tripData);

      // Call onSubmit with the trip data
      onSubmit(tripData);

    } catch (error: any) {
      console.error("❌ Error creating trip:", error);
      
      // Fallback: Create local trip data
      const fallbackTrip: TripData = {
        id: Date.now(), // Temporary ID
        destination,
        startDate: formattedDate,
        duration: duration || 3,
        travelers,
        budget,
        activities,
        travelMode,
        accommodation,
        interests,
      };
      
      alert("Using local trip data (backend might be unavailable)");
      onSubmit(fallbackTrip);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDestination("");
    setStartDate(null);
    setDuration(3);
    setTravelers("");
    setBudget("");
    setActivities("");
    setTravelMode("");
    setAccommodation("");
    setInterests("");
  };

  const getDestinationSuggestions = () => {
    return [
      "Paris, France",
      "London, UK",
      "New York, USA",
      "Tokyo, Japan",
      "Sydney, Australia",
      "Dubai, UAE",
      "Bali, Indonesia",
      "Rome, Italy",
      "Barcelona, Spain",
      "Cochin, India",
      "Goa, India",
      "Delhi, India",
      "Mumbai, India",
      "Bangalore, India",
      "Singapore",
      "Bangkok, Thailand",
      "Seoul, South Korea",
    ];
  };

  return (
    <Card title="Plan Your Trip" className="shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Destination */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Destination *</label>
          <InputText
            placeholder="e.g., Paris, London, Tokyo"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            Popular: {getDestinationSuggestions().slice(0, 3).join(", ")}
          </div>
        </div>

        {/* Start Date */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Start Date *</label>
          <Calendar
            value={startDate}
            onChange={(e) => setStartDate(e.value as Date)}
            dateFormat="yy-mm-dd"
            placeholder="Select date"
            className="w-full"
            showIcon
            minDate={new Date()}
          />
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Duration (days) *</label>
          <InputNumber
            value={duration}
            onValueChange={(e) => setDuration(e.value ?? 3)}
            min={1}
            max={30}
            className="w-full"
            showButtons
            buttonLayout="horizontal"
            decrementButtonClassName="p-button-danger"
            incrementButtonClassName="p-button-success"
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus"
          />
        </div>

        {/* Travelers */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Travelers *</label>
          <Dropdown
            value={travelers}
            onChange={(e) => setTravelers(e.value)}
            options={travelerOptions}
            placeholder="Select travelers"
            className="w-full"
          />
        </div>

        {/* Budget */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Budget *</label>
          <Dropdown
            value={budget}
            onChange={(e) => setBudget(e.value)}
            options={budgetOptions}
            placeholder="Select budget"
            className="w-full"
          />
        </div>

        {/* Activities */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Activities *</label>
          <Dropdown
            value={activities}
            onChange={(e) => setActivities(e.value)}
            options={activityOptions}
            placeholder="Select activities"
            className="w-full"
          />
        </div>

        {/* Travel Mode */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Travel Mode</label>
          <Dropdown
            value={travelMode}
            onChange={(e) => setTravelMode(e.value)}
            options={travelModeOptions}
            placeholder="How will you travel?"
            className="w-full"
          />
        </div>

        {/* Accommodation */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Accommodation</label>
          <Dropdown
            value={accommodation}
            onChange={(e) => setAccommodation(e.value)}
            options={accommodationOptions}
            placeholder="Where will you stay?"
            className="w-full"
          />
        </div>

        {/* Interests (Full width) */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="font-medium">Special Interests (Optional)</label>
          <InputText
            placeholder="e.g., history, art, food, adventure sports"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex gap-3 justify-end mt-4">
          <Button
            label="Reset"
            icon="pi pi-refresh"
            severity="secondary"
            onClick={handleReset}
            className="p-button-outlined"
          />
          <Button
            label={loading ? "Creating..." : "Create Trip"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-send"}
            onClick={handleSubmit}
            disabled={loading}
            className="p-button-primary"
          />
        </div>

        {/* Help text */}
        <div className="md:col-span-2 text-xs text-gray-500 mt-2">
          <p>* Required fields. Your trip will be saved to your account.</p>
        </div>
      </div>
    </Card>
  );
}