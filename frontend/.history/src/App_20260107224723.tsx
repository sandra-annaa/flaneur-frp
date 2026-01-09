import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import { TripForm, type TripData } from "./components/TripForm";
import { ItineraryView } from "./components/ItineraryView";
import { PackMyBag } from "./components/PackMyBag";
import { Recommendations } from "./components/Recommendations";
import { SafetyInfo } from "./components/SafetyInfo";

import AuthHome from "./pages/AuthHome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./routes/ProtectedRoute";

// Import API service
import { api } from "./services/api";

// PrimeReact imports
import { TabView, TabPanel } from "primereact/tabview";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

function TripDashboard() {
  const navigate = useNavigate();

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [userTrips, setUserTrips] = useState<TripData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
 
    useEffect(() => {
    console.log('🔍 TripDashboard DEBUG:');
    console.log('tripData:', tripData);
    console.log('tripData?.id:', tripData?.id);
    console.log('tripData?.destination:', tripData?.destination);
    if (tripData) {
      console.log('All tripData keys:', Object.keys(tripData));
    }
  }, [tripData]);
  // Load user's trips when component mounts
  useEffect(() => {
    loadUserTrips();
  }, []);

  const loadUserTrips = async () => {
    try {
      setIsLoading(true);
      const trips = await api.getTrips();
      setUserTrips(trips);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setIsLoading(false);
    }
  };
const handleTripSubmit = (data: TripData) => {
  console.log('🔍 handleTripSubmit received:', data);
  console.log('🔍 Trip ID:', data.id);
  console.log('🔍 Trip data type:', typeof data.id);
  
  if (!data.id) {
    console.error('❌ ERROR: Trip data has no ID!');
    console.error('Full data:', data);
  }
  
  setTripData(data);
  setActiveTabIndex(0);
  loadUserTrips();
};

  const handleReset = () => {
    setTripData(null);
    setActiveTabIndex(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const handleSelectTrip = (trip: TripData) => {
    setTripData(trip);
  };

  if (!tripData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Logout */}
          <div className="flex justify-content-between align-items-center mb-6">
            <h1 className="text-blue-600 text-3xl font-bold">Flâneur</h1>
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              severity="danger"
              onClick={handleLogout}
            />
          </div>

          {/* Hero */}
          <div className="text-center mb-12 pt-4">
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Pack less, explore more—travel smarter with us.
            </p>
          </div>

          {/* TRIP HISTORY SECTION (ADDED) */}
          {userTrips.length > 0 && (
            <Card className="mb-8">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-4">Your Previous Trips</h3>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <ProgressSpinner style={{width: '40px', height: '40px'}} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userTrips.map(trip => (
                      <Card 
                        key={trip.id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                        onClick={() => handleSelectTrip(trip)}
                      >
                        <div className="p-3">
                          <div className="flex items-center gap-3 mb-2">
                            <i className="pi pi-map-marker text-blue-500" />
                            <h4 className="font-semibold text-lg">{trip.destination}</h4>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            <i className="pi pi-calendar mr-2" />
                            {new Date(trip.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            <i className="pi pi-clock mr-2" />
                            {trip.duration} days
                          </div>
                          <div className="text-sm text-gray-600">
                            <i className="pi pi-users mr-2" />
                            {trip.travelers}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                              {trip.budget}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    Click on a trip to view details and continue planning
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* 🟢 4 FEATURE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-6xl mx-auto">
            <Card className="text-center">
              <div className="p-4">
                <i className="pi pi-calendar text-4xl text-blue-500 mb-3" />
                <h3 className="text-xl font-semibold mb-2">Smart Itinerary</h3>
                <p className="text-sm text-gray-600">
                  Optimized daily plans based on your preferences
                </p>
              </div>
            </Card>
            <Card className="text-center">
              <div className="p-4">
                <i className="pi pi-suitcase text-4xl text-blue-500 mb-3" />
                <h3 className="text-xl font-semibold mb-2">PackMyBag</h3>
                <p className="text-sm text-gray-600">
                  Personalized packing checklist for your trip
                </p>
              </div>
            </Card>
            <Card className="text-center">
              <div className="p-4">
                <i className="pi pi-star text-4xl text-blue-500 mb-3" />
                <h3 className="text-xl font-semibold mb-2">Recommendations</h3>
                <p className="text-sm text-gray-600">
                  Best hotels, restaurants, and activities
                </p>
              </div>
            </Card>
            <Card className="text-center">
              <div className="p-4">
                <i className="pi pi-shield text-4xl text-blue-500 mb-3" />
                <h3 className="text-xl font-semibold mb-2">Safety First</h3>
                <p className="text-sm text-gray-600">
                  Emergency contacts and local guide info
                </p>
              </div>
            </Card>
          </div>
          {/* 🟢 END OF 4 FEATURE CARDS */}

          {/* Trip Form */}
          <TripForm onSubmit={handleTripSubmit} />

          {/* Footer Info */}
          <div className="text-center mt-12 text-sm text-gray-500 max-w-2xl mx-auto">
            <p>
              Flâneur uses intelligent algorithms to create personalized travel
              experiences. All recommendations are based on your preferences,
              budget, and travel style.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(tripData.startDate).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const cardTitle = `${tripData.destination} Trip Plan`;
  const cardSubTitle = `${tripData.duration} days • ${tripData.travelers} • ${tripData.budget} budget`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-content-between align-items-center mb-4">
          <Button
            icon="pi pi-arrow-left"
            label="Plan New Trip"
            onClick={handleReset}
            className="p-button-text"
          />

          {/* 🔴 LOGOUT BUTTON HERE */}
          <Button
            label="Logout"
            icon="pi pi-sign-out"
            severity="danger"
            onClick={handleLogout}
          />
        </div>

        <Card
          title={cardTitle}
          subTitle={cardSubTitle}
          footer={
            <div className="text-right">
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-semibold">{formattedDate}</p>
            </div>
          }
        />

        {/* Tabs */}
        <Card className="mt-4">
          <TabView
            activeIndex={activeTabIndex}
            onTabChange={(e) => setActiveTabIndex(e.index)}
          >
            <TabPanel header="Itinerary">
  <ItineraryView 
    tripData={tripData} 
    tripId={tripData?.id}  // ✅ Pass the trip ID
  />
</TabPanel>

            <TabPanel header="PackMyBag">
              <PackMyBag tripData={tripData} />
            </TabPanel>

            <TabPanel header="Recommendations">
              <Recommendations destination={tripData?.destination || ""} />
            </TabPanel>

            <TabPanel header="Safety">
              <SafetyInfo tripData={tripData} />
            </TabPanel>
          </TabView>
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <TripDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}