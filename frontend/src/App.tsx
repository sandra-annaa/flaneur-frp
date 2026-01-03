import { useState } from "react";
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

// PrimeReact imports
import { TabView, TabPanel } from "primereact/tabview";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

function TripDashboard() {
  const navigate = useNavigate();

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTripSubmit = (data: TripData) => {
    setTripData(data);
    setActiveTabIndex(0);
  };

  const handleReset = () => {
    setTripData(null);
    setActiveTabIndex(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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

          {/* Trip Form */}
          <TripForm onSubmit={handleTripSubmit} />
        </div>
      </div>
    );
  }

  const formattedDate = new Date(tripData.startDate).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

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
              <ItineraryView tripData={tripData} />
            </TabPanel>

            <TabPanel header="PackMyBag">
              <PackMyBag tripData={tripData} />
            </TabPanel>

            <TabPanel header="Recommendations">
              <Recommendations tripData={tripData} />
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
