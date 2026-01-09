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

import { api } from "./services/api";

// PrimeReact imports
import { TabView, TabPanel } from "primereact/tabview";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

// Add PrimeReact CSS imports
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function TripDashboard() {
  const navigate = useNavigate();

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [userTrips, setUserTrips] = useState<TripData[]>([
    // Sample trips for testing
    { 
      id: 1, 
      destination: "Paris, France", 
      startDate: "2024-12-15", 
      duration: 5, 
      travelers: "2 Adults", 
      budget: "Mid-range", 
      activities: "Sightseeing", 
      travelMode: "Flight", 
      accommodation: "Hotel" 
    },
    { 
      id: 2, 
      destination: "Tokyo, Japan", 
      startDate: "2024-11-20", 
      duration: 7, 
      travelers: "Solo", 
      budget: "Luxury", 
      activities: "Food & Culinary", 
      travelMode: "Flight", 
      accommodation: "Hotel" 
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false); // Set to false for now

  // Chocolate/Ivory colors
  const colors = {
    chocolate: {
      50: '#fdf8f6',
      100: '#f2e8e5',
      200: '#eaddd7',
      300: '#e0cec7',
      400: '#d2bab0',
      500: '#bfa094',
      600: '#8B7355',
      700: '#6B4F37',
      800: '#5D4037',
      900: '#3E2723',
    },
    ivory: {
      50: '#fefefe',
      100: '#fdfcfb',
      200: '#fbfaf8',
      300: '#f9f7f4',
      400: '#f7f5f0',
      500: '#f5f3ec',
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.ivory[50]} 0%, white 50%, ${colors.chocolate[50]}30 100%)`,
  };

  const handleTripSubmit = (data: TripData) => {
    console.log("Trip submitted:", data);
    setTripData(data);
    setActiveTabIndex(0);
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
    console.log("Trip selected:", trip);
    setTripData(trip);
    setActiveTabIndex(0);
  };

  // Show loading for auth check
  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: colors.ivory[50]
      }}>
        <ProgressSpinner />
        <div style={{ marginLeft: '1rem', color: colors.chocolate[900] }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!tripData) {
    return (
      <div style={containerStyle}>
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{ 
                fontSize: '3.5rem', 
                fontWeight: 'bold', 
                color: colors.chocolate[900],
                fontFamily: 'Playfair Display, serif',
                fontStyle: 'italic',
                letterSpacing: '0.05em',
                margin: 0
              }}>
                Flâneur
              </h1>
              <p style={{ 
                color: colors.chocolate[800],
                fontSize: '1.125rem',
                marginTop: '0.5rem',
                marginBottom: 0
              }}>
                Travel Curated, Memories Secured
              </p>
            </div>
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              style={{
                backgroundColor: colors.chocolate[700],
                borderColor: colors.chocolate[700],
                padding: '0.4rem 1rem',
                height: '36px',
                fontSize: '0.875rem',
                borderRadius: '4px'
              }}
              onClick={handleLogout}
            />
          </div>

          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Card style={{ 
              backgroundColor: colors.ivory[50],
              border: `1px solid ${colors.chocolate[200]}`,
              borderRadius: '1rem',
              padding: '1.5rem',
              display: 'inline-block'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem',
                fontWeight: 600,
                color: colors.chocolate[900],
                marginBottom: '0.75rem',
                marginTop: 0
              }}>
                Plan Your Perfect Journey
              </h2>
              <p style={{ 
                color: colors.chocolate[700],
                fontSize: '1rem',
                margin: 0
              }}>
                Pack less, explore more—travel smarter with us.
              </p>
            </Card>
          </div>

          {/* TRIP HISTORY SECTION */}
          <div style={{ marginBottom: '30px' }}>
            <Card style={{
              border: `1px solid ${colors.chocolate[200]}`,
              backgroundColor: colors.ivory[50]
            }}>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <i className="pi pi-history" style={{ fontSize: '1.25rem', color: colors.chocolate[800] }} />
                  <h3 style={{ 
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: colors.chocolate[900],
                    margin: 0
                  }}>
                    Your Previous Trips
                  </h3>
                </div>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {userTrips.map(trip => (
                    <Card 
                      key={trip.id}
                      style={{
                        cursor: 'pointer',
                        border: `1px solid ${colors.chocolate[100]}`,
                        backgroundColor: 'white',
                        transition: 'all 0.3s',
                        padding: '0'
                      }}
                      onClick={() => handleSelectTrip(trip)}
                    >
                      <div style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                          <div style={{
                            backgroundColor: colors.chocolate[100],
                            padding: '10px',
                            borderRadius: '50%',
                            minWidth: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <i className="pi pi-map-marker" style={{ 
                              color: colors.chocolate[700],
                              fontSize: '1rem'
                            }} />
                          </div>
                          <div>
                            <h4 style={{ 
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              color: colors.chocolate[900],
                              margin: '0 0 5px 0'
                            }}>
                              {trip.destination}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{
                                fontSize: '0.75rem',
                                backgroundColor: colors.chocolate[100],
                                color: colors.chocolate[800],
                                padding: '2px 8px',
                                borderRadius: '12px'
                              }}>
                                {trip.duration} days
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{
                          borderTop: `1px solid ${colors.chocolate[100]}`,
                          margin: '12px 0',
                          paddingTop: '12px'
                        }} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="pi pi-calendar" style={{ 
                              color: colors.chocolate[600],
                              fontSize: '0.875rem'
                            }} />
                            <span style={{ 
                              fontSize: '0.875rem',
                              color: colors.chocolate[700]
                            }}>
                              {new Date(trip.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="pi pi-tag" style={{ 
                              color: colors.chocolate[600],
                              fontSize: '0.875rem'
                            }} />
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              backgroundColor: colors.chocolate[50],
                              color: colors.chocolate[800],
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              {trip.budget}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* FEATURE CARDS */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: '1.25rem',
                fontWeight: 600,
                color: colors.chocolate[900],
                marginBottom: '5px',
                marginTop: 0
              }}>
                Everything You Need For Perfect Travel
              </h3>
              <p style={{ 
                fontSize: '0.875rem',
                color: colors.chocolate[700],
                margin: 0
              }}>
                Four essential tools to make your journey seamless
              </p>
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {[
                { 
                  icon: 'pi-calendar', 
                  title: 'Smart Itinerary',
                  desc: 'Optimized daily plans based on your preferences'
                },
                { 
                  icon: 'pi-suitcase', 
                  title: 'PackMyBag',
                  desc: 'Personalized packing checklist for your trip'
                },
                { 
                  icon: 'pi-star', 
                  title: 'Recommendations',
                  desc: 'Best hotels, restaurants, and activities'
                },
                { 
                  icon: 'pi-shield', 
                  title: 'Safety First',
                  desc: 'Emergency contacts and local guide info'
                }
              ].map((feature, index) => (
                <Card key={index} style={{
                  border: `1px solid ${colors.chocolate[100]}`,
                  backgroundColor: colors.ivory[50],
                  padding: '20px',
                  height: '100%',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{
                      backgroundColor: colors.chocolate[100],
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 15px'
                    }}>
                      <i className={`pi ${feature.icon}`} style={{ 
                        fontSize: '1.5rem',
                        color: colors.chocolate[700]
                      }} />
                    </div>
                    <h3 style={{ 
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: colors.chocolate[900],
                      marginBottom: '10px',
                      textAlign: 'center'
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{ 
                      fontSize: '0.75rem',
                      color: colors.chocolate[700],
                      lineHeight: '1.4',
                      textAlign: 'center',
                      margin: 0
                    }}>
                      {feature.desc}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Trip Form */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '40px'
          }}>
            <Card style={{
              border: `1px solid ${colors.chocolate[200]}`,
              backgroundColor: colors.ivory[50],
              width: '100%',
              maxWidth: '800px'
            }}>
              <div style={{ padding: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h2 style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: colors.chocolate[900],
                    marginBottom: '8px',
                    marginTop: 0
                  }}>
                    Start Planning Your Trip
                  </h2>
                  <p style={{ 
                    color: colors.chocolate[700],
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    Fill in your travel details to generate a personalized travel plan
                  </p>
                </div>
                <TripForm onSubmit={handleTripSubmit} />
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: `1px solid ${colors.chocolate[200]}`,
            color: colors.chocolate[600],
            fontSize: '0.75rem'
          }}>
            <p style={{ margin: 0 }}>
              Flâneur uses intelligent algorithms to create personalized travel experiences.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If tripData exists, show trip dashboard
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
    <div style={containerStyle}>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <Button
            icon="pi pi-arrow-left"
            label="Plan New Trip"
            onClick={handleReset}
            style={{ 
              color: colors.chocolate[800],
              fontSize: '0.875rem'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ 
                fontSize: '0.75rem',
                color: colors.chocolate[700],
                margin: 0
              }}>
                Start Date
              </p>
              <p style={{ 
                fontWeight: 600,
                color: colors.chocolate[900],
                fontSize: '0.875rem',
                margin: 0
              }}>
                {formattedDate}
              </p>
            </div>
            <Button
              label="Logout"
              icon="pi pi-sign-out"
              style={{
                backgroundColor: colors.chocolate[700],
                borderColor: colors.chocolate[700],
                padding: '0.4rem 1rem',
                height: '36px',
                fontSize: '0.875rem',
                borderRadius: '4px'
              }}
              onClick={handleLogout}
            />
          </div>
        </div>

        {/* Main Trip Card */}
        <Card style={{
          border: `1px solid ${colors.chocolate[200]}`,
          backgroundColor: colors.ivory[50]
        }}>
          <div style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: colors.chocolate[900],
                  marginBottom: '8px',
                  marginTop: 0
                }}>
                  {tripData.destination} Trip Plan
                </h2>
                <p style={{ 
                  color: colors.chocolate[800],
                  fontSize: '1rem',
                  margin: 0
                }}>
                  {tripData.duration} days • {tripData.travelers} travelers • {tripData.budget} budget
                </p>
              </div>
              <div style={{
                backgroundColor: colors.chocolate[100],
                color: colors.chocolate[800],
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                <i className="pi pi-calendar" style={{ marginRight: '8px' }} />
                {formattedDate}
              </div>
            </div>
            
            <div style={{
              borderTop: `1px solid ${colors.chocolate[100]}`,
              marginBottom: '30px'
            }} />
            
            {/* Tabs */}
            <TabView
              activeIndex={activeTabIndex}
              onTabChange={(e) => setActiveTabIndex(e.index)}
            >
              <TabPanel header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="pi pi-map" style={{ color: colors.chocolate[700] }} />
                  <span style={{ 
                    color: colors.chocolate[900],
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}>
                    Itinerary
                  </span>
                </div>
              }>
                <div style={{ padding: '16px' }}>
                  <ItineraryView 
                    tripData={tripData} 
                    tripId={tripData?.id}
                  />
                </div>
              </TabPanel>

              <TabPanel header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="pi pi-suitcase" style={{ color: colors.chocolate[700] }} />
                  <span style={{ 
                    color: colors.chocolate[900],
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}>
                    PackMyBag
                  </span>
                </div>
              }>
                <div style={{ padding: '16px' }}>
                  <PackMyBag tripData={tripData} />
                </div>
              </TabPanel>

              <TabPanel header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="pi pi-star" style={{ color: colors.chocolate[700] }} />
                  <span style={{ 
                    color: colors.chocolate[900],
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}>
                    Recommendations
                  </span>
                </div>
              }>
                <div style={{ padding: '16px' }}>
                  <Recommendations destination={tripData?.destination || ""} />
                </div>
              </TabPanel>

              <TabPanel header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="pi pi-shield" style={{ color: colors.chocolate[700] }} />
                  <span style={{ 
                    color: colors.chocolate[900],
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}>
                    Safety
                  </span>
                </div>
              }>
                <div style={{ padding: '16px' }}>
                  <SafetyInfo tripData={tripData} />
                </div>
              </TabPanel>
            </TabView>
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
}" " 
