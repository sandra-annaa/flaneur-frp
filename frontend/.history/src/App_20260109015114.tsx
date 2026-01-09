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
import { Divider } from "primereact/divider";

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
      setUserTrips(response.data);
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
      <div className="min-h-screen bg-gradient-to-br from-ivory-50 via-white to-chocolate-50/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Logout */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex-1">
              <h1 className="text-6xl font-bold text-chocolate-900 font-['Playfair_Display'] italic tracking-wider text-center">
                Flâneur
              </h1>
              <p className="text-center text-chocolate-600 mt-2 text-lg">
                Travel Curated, Memories Secured
              </p>
            </div>
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              className="bg-chocolate-800 border-chocolate-800 hover:bg-chocolate-900"
              onClick={handleLogout}
            />
          </div>

          {/* Hero Section */}
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <div className="bg-ivory-50 border border-chocolate-100 rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-semibold text-chocolate-800 mb-4">
                Plan Your Perfect Journey
              </h2>
              <p className="text-chocolate-600 text-lg">
                Pack less, explore more—travel smarter with us. Create personalized itineraries,
                packing lists, and recommendations all in one place.
              </p>
            </div>
          </div>

          {/* TRIP HISTORY SECTION */}
          {userTrips && userTrips.length > 0 && (
            <Card className="mb-10 border border-chocolate-200 bg-ivory-50">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <i className="pi pi-history text-2xl text-chocolate-700" />
                  <h3 className="text-2xl font-semibold text-chocolate-800">Your Previous Trips</h3>
                </div>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <ProgressSpinner 
                      style={{width: '50px', height: '50px'}} 
                      strokeWidth="4"
                      className="text-chocolate-600"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userTrips.map(trip => (
                      <Card 
                        key={trip.id} 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-chocolate-100 bg-white hover:border-chocolate-300"
                        onClick={() => handleSelectTrip(trip)}
                      >
                        <div className="p-5">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="bg-chocolate-100 p-3 rounded-full">
                              <i className="pi pi-map-marker text-chocolate-700 text-xl" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xl text-chocolate-900">{trip.destination}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm bg-chocolate-100 text-chocolate-800 px-3 py-1 rounded-full">
                                  {trip.duration} days
                                </span>
                                <span className="text-sm bg-ivory-200 text-chocolate-700 px-3 py-1 rounded-full">
                                  {trip.travelers} travelers
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Divider className="my-4 border-chocolate-100" />
                          
                          <div className="space-y-2 text-chocolate-600">
                            <div className="flex items-center gap-2">
                              <i className="pi pi-calendar text-chocolate-500" />
                              <span className="text-sm">
                                {new Date(trip.startDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="pi pi-tag text-chocolate-500" />
                              <span className="text-sm font-medium bg-chocolate-50 px-3 py-1 rounded-full">
                                {trip.budget} Budget
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <button className="w-full py-2 bg-chocolate-700 text-ivory-50 rounded-lg hover:bg-chocolate-800 transition-colors duration-300 font-medium">
                              View Details
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                <div className="text-center mt-8 pt-6 border-t border-chocolate-100">
                  <p className="text-chocolate-500">
                    Select a trip to view details and continue planning
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* FEATURE CARDS */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-chocolate-800 mb-2">
                Everything You Need For Perfect Travel
              </h3>
              <p className="text-chocolate-600">
                Four essential tools to make your journey seamless
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="text-center border border-chocolate-100 bg-ivory-50 hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="bg-chocolate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="pi pi-calendar text-3xl text-chocolate-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-chocolate-800 mb-3">Smart Itinerary</h3>
                  <p className="text-chocolate-600 text-sm leading-relaxed">
                    Optimized daily plans tailored to your preferences and travel style
                  </p>
                </div>
              </Card>
              
              <Card className="text-center border border-chocolate-100 bg-ivory-50 hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="bg-chocolate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="pi pi-suitcase text-3xl text-chocolate-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-chocolate-800 mb-3">PackMyBag</h3>
                  <p className="text-chocolate-600 text-sm leading-relaxed">
                    Personalized packing checklist customized for your specific trip needs
                  </p>
                </div>
              </Card>
              
              <Card className="text-center border border-chocolate-100 bg-ivory-50 hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="bg-chocolate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="pi pi-star text-3xl text-chocolate-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-chocolate-800 mb-3">Recommendations</h3>
                  <p className="text-chocolate-600 text-sm leading-relaxed">
                    Curated selection of hotels, restaurants, and must-visit activities
                  </p>
                </div>
              </Card>
              
              <Card className="text-center border border-chocolate-100 bg-ivory-50 hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="bg-chocolate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="pi pi-shield text-3xl text-chocolate-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-chocolate-800 mb-3">Safety First</h3>
                  <p className="text-chocolate-600 text-sm leading-relaxed">
                    Essential emergency contacts and local safety information
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Trip Form */}
          <div className="max-w-4xl mx-auto">
            <Card className="border border-chocolate-200 bg-ivory-50 shadow-lg">
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-semibold text-chocolate-800 mb-3">
                    Start Planning Your Trip
                  </h2>
                  <p className="text-chocolate-600">
                    Fill in your travel details to generate a personalized travel plan
                  </p>
                </div>
                <TripForm onSubmit={handleTripSubmit} />
              </div>
            </Card>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-16 pt-8 border-t border-chocolate-200 max-w-3xl mx-auto">
            <p className="text-chocolate-500 text-sm">
              Flâneur uses intelligent algorithms to create personalized travel experiences.
              All recommendations are based on your preferences, budget, and travel style.
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
  const cardSubTitle = `${tripData.duration} days • ${tripData.travelers} travelers • ${tripData.budget} budget`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-50 via-white to-chocolate-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button
            icon="pi pi-arrow-left"
            label="Plan New Trip"
            onClick={handleReset}
            className="p-button-text text-chocolate-700 hover:text-chocolate-900 hover:bg-chocolate-50"
          />

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-chocolate-600 text-sm">Start Date</p>
              <p className="font-semibold text-chocolate-800">{formattedDate}</p>
            </div>
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              className="bg-chocolate-800 border-chocolate-800 hover:bg-chocolate-900"
              onClick={handleLogout}
            />
          </div>
        </div>

        {/* Main Trip Card */}
        <Card className="border border-chocolate-200 bg-gradient-to-r from-ivory-50 to-chocolate-50/20 shadow-lg">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-chocolate-900 mb-2">{cardTitle}</h2>
                <p className="text-chocolate-600 text-lg">{cardSubTitle}</p>
              </div>
              <div className="bg-chocolate-100 text-chocolate-800 px-4 py-2 rounded-full font-medium">
                <i className="pi pi-calendar mr-2" />
                {formattedDate}
              </div>
            </div>
            
            <Divider className="border-chocolate-100" />
            
            {/* Tabs */}
            <div className="mt-8">
              <TabView
                activeIndex={activeTabIndex}
                onTabChange={(e) => setActiveTabIndex(e.index)}
              >
                <TabPanel header={
                  <div className="flex items-center gap-2">
                    <i className="pi pi-map text-chocolate-600" />
                    <span className="text-chocolate-800 font-medium">Itinerary</span>
                  </div>
                }>
                  <div className="p-4">
                    <ItineraryView 
                      tripData={tripData} 
                      tripId={tripData?.id}
                    />
                  </div>
                </TabPanel>

                <TabPanel header={
                  <div className="flex items-center gap-2">
                    <i className="pi pi-suitcase text-chocolate-600" />
                    <span className="text-chocolate-800 font-medium">PackMyBag</span>
                  </div>
                }>
                  <div className="p-4">
                    <PackMyBag tripData={tripData} />
                  </div>
                </TabPanel>

                <TabPanel header={
                  <div className="flex items-center gap-2">
                    <i className="pi pi-star text-chocolate-600" />
                    <span className="text-chocolate-800 font-medium">Recommendations</span>
                  </div>
                }>
                  <div className="p-4">
                    <Recommendations destination={tripData?.destination || ""} />
                  </div>
                </TabPanel>

                <TabPanel header={
                  <div className="flex items-center gap-2">
                    <i className="pi pi-shield text-chocolate-600" />
                    <span className="text-chocolate-800 font-medium">Safety</span>
                  </div>
                }>
                  <div className="p-4">
                    <SafetyInfo tripData={tripData} />
                  </div>
                </TabPanel>
              </TabView>
            </div>
          </div>
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