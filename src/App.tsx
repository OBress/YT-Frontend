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

export default function AuthWrapper() {
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
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/channel-navigator" />
            ) : (
              <LoginPage setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />
        <Route
          path="/channel-navigator"
          element={
            isLoggedIn ? (
              <ChannelNavigator onLogout={handleLogout} userId={userId} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={isLoggedIn ? "/channel-navigator" : "/login"} />
          }
        />
      </Routes>
    </Router>
  );
}
