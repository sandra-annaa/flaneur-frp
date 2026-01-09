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
import 'primeflex/primeflex.css';

import './App.css';

function TripDashboard() {
  const navigate = useNavigate();

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [userTrips, setUserTrips] = useState<TripData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Chocolate/Ivory color constants - DARK BROWN for text
  const colors = {
    chocolate: {
      50: '#fdf8f6',
      100: '#f2e8e5',
      200: '#eaddd7',
      300: '#e0cec7',
      400: '#d2bab0',
      500: '#bfa094',
      600: '#8B7355', // Dark Brown for text
      700: '#6B4F37', // Darker Brown
      800: '#5D4037', // Even darker
      900: '#3E2723', // Darkest Brown
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

  if (!tripData) {
    return (
      <div style={containerStyle}>
        <div className="container mx-auto p-4">
          {/* Header */}
          <div className="flex justify-content-between align-items-center mb-6">
            <div className="flex-1 text-center">
              <h1 style={{ 
                fontSize: '3.5rem', 
                fontWeight: 'bold', 
                color: colors.chocolate[900],
                fontFamily: 'Playfair Display, serif',
                fontStyle: 'italic',
                letterSpacing: '0.05em'
              }}>
                Flâneur
              </h1>
              <p style={{ 
                color: colors.chocolate[800],
                fontSize: '1.125rem',
                marginTop: '0.5rem'
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
          <div className="text-center mb-6">
            <Card style={{ 
              backgroundColor: colors.ivory[50],
              border: `1px solid ${colors.chocolate[200]}`,
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem',
                fontWeight: 600,
                color: colors.chocolate[900],
                marginBottom: '0.75rem'
              }}>
                Plan Your Perfect Journey
              </h2>
              <p style={{ 
                color: colors.chocolate[700],
                fontSize: '1rem'
              }}>
                Pack less, explore more—travel smarter with us.
              </p>
            </Card>
          </div>

          {/* TRIP HISTORY SECTION */}
          {userTrips.length > 0 && (
            <Card className="mb-6" style={{
              border: `1px solid ${colors.chocolate[200]}`,
              backgroundColor: colors.ivory[50]
            }}>
              <div className="p-4">
                <div className="flex align-items-center gap-3 mb-4">
                  <i className="pi pi-history" style={{ fontSize: '1.25rem', color: colors.chocolate[800] }} />
                  <h3 style={{ 
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: colors.chocolate[900]
                  }}>
                    Your Previous Trips
                  </h3>
                </div>
                {isLoading ? (
                  <div className="flex justify-content-center py-4">
                    <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                  </div>
                ) : (
                  <div className="grid">
                    <div className="col-12 md:col-6 lg:col-4" style={{ gap: '1rem' }}>
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
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.chocolate[300];
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = colors.chocolate[100];
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          onClick={() => handleSelectTrip(trip)}
                        >
                          <div className="p-3">
                            <div className="flex align-items-start gap-3 mb-3">
                              <div style={{
                                backgroundColor: colors.chocolate[100],
                                padding: '0.5rem',
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
                                  marginBottom: '0.25rem'
                                }}>
                                  {trip.destination}
                                </h4>
                                <div className="flex align-items-center gap-2">
                                  <span style={{
                                    fontSize: '0.75rem',
                                    backgroundColor: colors.chocolate[100],
                                    color: colors.chocolate[800],
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '9999px'
                                  }}>
                                    {trip.duration} days
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div style={{
                              borderTop: `1px solid ${colors.chocolate[100]}`,
                              margin: '0.75rem 0',
                              paddingTop: '0.75rem'
                            }} />
                            
                            <div style={{ gap: '0.5rem' }}>
                              <div className="flex align-items-center gap-2 mb-2">
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
                              <div className="flex align-items-center gap-2">
                                <i className="pi pi-tag" style={{ 
                                  color: colors.chocolate[600],
                                  fontSize: '0.875rem'
                                }} />
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  backgroundColor: colors.chocolate[50],
                                  color: colors.chocolate[800],
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '9999px'
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
                )}
              </div>
            </Card>
          )}

          {/* SMALLER FEATURE CARDS (4 cards) */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <h3 style={{ 
                fontSize: '1.25rem',
                fontWeight: 600,
                color: colors.chocolate[900],
                marginBottom: '0.5rem'
              }}>
                Everything You Need For Perfect Travel
              </h3>
              <p style={{ 
                fontSize: '0.875rem',
                color: colors.chocolate[700]
              }}>
                Four essential tools to make your journey seamless
              </p>
            </div>
            <div className="grid" style={{ gap: '1rem' }}>
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
                <div key={index} className="col-12 md:col-6 lg:col-3">
                  <Card className="text-center" style={{
                    border: `1px solid ${colors.chocolate[100]}`,
                    backgroundColor: colors.ivory[50],
                    padding: '1rem',
                    height: '100%',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{
                        backgroundColor: colors.chocolate[100],
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem'
                      }}>
                        <i className={`pi ${feature.icon}`} style={{ 
                          fontSize: '1.25rem',
                          color: colors.chocolate[700]
                        }} />
                      </div>
                      <h3 style={{ 
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: colors.chocolate[900],
                        marginBottom: '0.5rem'
                      }}>
                        {feature.title}
                      </h3>
                      <p style={{ 
                        fontSize: '0.75rem',
                        color: colors.chocolate[700],
                        lineHeight: '1.4'
                      }}>
                        {feature.desc}
                      </p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Form */}
          <div className="flex justify-content-center">
            <Card style={{
              border: `1px solid ${colors.chocolate[200]}`,
              backgroundColor: colors.ivory[50],
              width: '100%',
              maxWidth: '56rem'
            }}>
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: colors.chocolate[900],
                    marginBottom: '0.5rem'
                  }}>
                    Start Planning Your Trip
                  </h2>
                  <p style={{ 
                    color: colors.chocolate[700],
                    fontSize: '0.875rem'
                  }}>
                    Fill in your travel details to generate a personalized travel plan
                  </p>
                </div>
                <TripForm onSubmit={handleTripSubmit} />
              </div>
            </Card>
          </div>

          {/* Footer Info */}
          <div style={{
            textAlign: 'center',
            marginTop: '3rem',
            paddingTop: '1.5rem',
            borderTop: `1px solid ${colors.chocolate[200]}`,
            color: colors.chocolate[600],
            fontSize: '0.75rem'
          }}>
            <p>
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

  return (
    <div style={containerStyle}>
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-content-between align-items-center mb-6">
          <Button
            icon="pi pi-arrow-left"
            label="Plan New Trip"
            onClick={handleReset}
            className="p-button-text"
            style={{ 
              color: colors.chocolate[800],
              fontSize: '0.875rem'
            }}
          />

          <div className="flex align-items-center gap-4">
            <div className="text-right">
              <p style={{ 
                fontSize: '0.75rem',
                color: colors.chocolate[700]
              }}>
                Start Date
              </p>
              <p style={{ 
                fontWeight: 600,
                color: colors.chocolate[900],
                fontSize: '0.875rem'
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
          <div className="p-6">
            <div className="flex justify-content-between align-items-start mb-4">
              <div>
                <h2 style={{ 
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: colors.chocolate[900],
                  marginBottom: '0.5rem'
                }}>
                  {tripData.destination} Trip Plan
                </h2>
                <p style={{ 
                  color: colors.chocolate[800],
                  fontSize: '1rem'
                }}>
                  {tripData.duration} days • {tripData.travelers} travelers • {tripData.budget} budget
                </p>
              </div>
              <div style={{
                backgroundColor: colors.chocolate[100],
                color: colors.chocolate[800],
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                <i className="pi pi-calendar mr-2" />
                {formattedDate}
              </div>
            </div>
            
            <div style={{
              borderTop: `1px solid ${colors.chocolate[100]}`,
              marginBottom: '2rem'
            }} />
            
            {/* Tabs */}
            <TabView
              activeIndex={activeTabIndex}
              onTabChange={(e) => setActiveTabIndex(e.index)}
            >
              <TabPanel header={
                <div className="flex align-items-center gap-2">
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
                <div className="p-4">
                  <ItineraryView 
                    tripData={tripData} 
                    tripId={tripData?.id}
                  />
                </div>
              </TabPanel>

              <TabPanel header={
                <div className="flex align-items-center gap-2">
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
                <div className="p-4">
                  <PackMyBag tripData={tripData} />
                </div>
              </TabPanel>

              <TabPanel header={
                <div className="flex align-items-center gap-2">
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
                <div className="p-4">
                  <Recommendations destination={tripData?.destination || ""} />
                </div>
              </TabPanel>

              <TabPanel header={
                <div className="flex align-items-center gap-2">
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
                <div className="p-4">
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
}