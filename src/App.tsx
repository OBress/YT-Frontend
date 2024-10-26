"use client";

import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginPage from "./auth/login";
import ChannelNavigator from "./main/navigator";
import { UserDataProvider } from "./contexts/UserDataContext";
import { ProgressProvider } from "./contexts/ProgressContext";

function App() {
  return (
    <ProgressProvider>
      <Router>
        <AppContent />
      </Router>
    </ProgressProvider>
  );
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");
    const storedUserId = localStorage.getItem("userId");
    setIsLoggedIn(loginStatus === "true");
    setUserId(storedUserId);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("channelData");
    localStorage.removeItem("userData");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <UserDataProvider>
              <Navigate to="/channel-navigator" />
            </UserDataProvider>
          ) : (
            <LoginPage setIsLoggedIn={setIsLoggedIn} />
          )
        }
      />
      <Route
        path="/channel-navigator"
        element={
          isLoggedIn ? (
            <UserDataProvider>
              <ChannelNavigator
                onLogout={handleLogout}
                userId={userId}
                onUpdateSettings={async () => {}}
              />
            </UserDataProvider>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/channel-navigator" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
