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
      const response = await api.getTrips();
      setUserTrips(response);
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
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
        }}
      >
        {/* Overlay for better readability */}
        <div className="min-h-screen bg-gradient-to-b from-ivory/90 via-ivory/80 to-ivory/70">
          <div className="container mx-auto px-4 py-8">
            {/* Header with Logout */}
            <div className="flex justify-between items-center mb-8">
              {/* Empty div for balance */}
              <div className="w-24"></div>
              
              {/* Centered Title */}
              <div className="text-center flex-1">
                <h1 className="text-5xl font-bold text-chocolate font-['Playfair_Display'] italic tracking-wider">
                  Flâneur
                </h1>
                <p className="text-lg text-gray-700 mt-2 font-medium">
                  Pack less, explore more—travel smarter with us.
                </p>
              </div>
              
              {/* Logout Button */}
              <div className="w-24 flex justify-end">
                <Button
                  label="Logout"
                  icon="pi pi-sign-out"
                  onClick={handleLogout}
                  className="p-button-rounded p-button-outlined border-chocolate text-chocolate hover:bg-chocolate hover:text-ivory transition-colors duration-300"
                />
              </div>
            </div>

            {/* TRIP HISTORY SECTION */}
            {userTrips && userTrips.length > 0 && (
              <Card className="mb-8 bg-ivory/80 backdrop-blur-sm border border-chocolate/20">
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-6 text-chocolate border-b border-chocolate/20 pb-3">
                    Your Previous Trips
                  </h3>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <ProgressSpinner style={{width: '50px', height: '50px'}} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userTrips.map(trip => (
                        <Card 
                          key={trip.id} 
                          className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/90 border border-chocolate/10 hover:border-chocolate/30"
                          onClick={() => handleSelectTrip(trip)}
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <i className="pi pi-map-marker text-chocolate text-xl" />
                              <h4 className="font-bold text-lg text-gray-800">{trip.destination}</h4>
                            </div>
                            <div className="space-y-2 mb-4">
                              <div className="text-sm text-gray-600 flex items-center">
                                <i className="pi pi-calendar mr-2" />
                                {new Date(trip.startDate).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <i className="pi pi-clock mr-2" />
                                {trip.duration} days
                              </div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <i className="pi pi-users mr-2" />
                                {trip.travelers}
                              </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                              <span className="text-xs px-3 py-1.5 rounded-full bg-chocolate/10 text-chocolate font-medium">
                                {trip.budget}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                  <div className="text-center mt-8">
                    <p className="text-sm text-gray-600">
                      Click on a trip to view details and continue planning
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* 4 FEATURE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center bg-white/80 backdrop-blur-sm border border-chocolate/10 hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="w-16 h-16 bg-chocolate/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="pi pi-calendar text-3xl text-chocolate" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">Smart Itinerary</h3>
                  <p className="text-gray-600">
                    Optimized daily plans based on your preferences
                  </p>
                </div>
              </Card>
              
              <Card className="text-center bg-white/80 backdrop-blur-sm border border-chocolate/10 hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="w-16 h-16 bg-chocolate/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="pi pi-suitcase text-3xl text-chocolate" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">PackMyBag</h3>
                  <p className="text-gray-600">
                    Personalized packing checklist for your trip
                  </p>
                </div>
              </Card>
              
              <Card className="text-center bg-white/80 backdrop-blur-sm border border-chocolate/10 hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="w-16 h-16 bg-chocolate/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="pi pi-star text-3xl text-chocolate" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">Recommendations</h3>
                  <p className="text-gray-600">
                    Best hotels, restaurants, and activities
                  </p>
                </div>
              </Card>
              
              <Card className="text-center bg-white/80 backdrop-blur-sm border border-chocolate/10 hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="w-16 h-16 bg-chocolate/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="pi pi-shield text-3xl text-chocolate" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">Safety First</h3>
                  <p className="text-gray-600">
                    Emergency contacts and local guide info
                  </p>
                </div>
              </Card>
            </div>

            {/* Trip Form */}
            <div className="mb-12">
              <TripForm onSubmit={handleTripSubmit} />
            </div>

            {/* Footer Info */}
            <div className="text-center py-8">
              <p className="text-gray-600 max-w-2xl mx-auto">
                Flâneur uses intelligent algorithms to create personalized travel
                experiences. All recommendations are based on your preferences,
                budget, and travel style.
              </p>
            </div>
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

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
      }}
    >
      {/* Overlay */}
      <div className="min-h-screen bg-gradient-to-b from-ivory/90 via-ivory/80 to-ivory/70">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Button
              icon="pi pi-arrow-left"
              label="Plan New Trip"
              onClick={handleReset}
              className="p-button-rounded p-button-outlined border-chocolate text-chocolate hover:bg-chocolate hover:text-ivory transition-colors duration-300"
            />

            <div className="text-center">
              <h1 className="text-3xl font-bold text-chocolate font-['Playfair_Display'] italic">
                Flâneur
              </h1>
              <p className="text-sm text-gray-600">{tripData.destination} Trip</p>
            </div>

            <Button
              label="Logout"
              icon="pi pi-sign-out"
              onClick={handleLogout}
              className="p-button-rounded p-button-outlined border-chocolate text-chocolate hover:bg-chocolate hover:text-ivory transition-colors duration-300"
            />
          </div>

          {/* Trip Summary Card */}
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border border-chocolate/20">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{tripData.destination} Trip Plan</h2>
                  <p className="text-gray-600">
                    {tripData.duration} days • {tripData.travelers} • {tripData.budget} budget
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-bold text-chocolate">{formattedDate}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Card className="bg-white/80 backdrop-blur-sm border border-chocolate/20">
            <TabView
              activeIndex={activeTabIndex}
              onTabChange={(e) => setActiveTabIndex(e.index)}
            >
              <TabPanel header="Itinerary">
                <ItineraryView 
                  tripData={tripData} 
                  tripId={tripData?.id}
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