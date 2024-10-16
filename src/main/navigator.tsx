"use client";
import React, { useState, useEffect, useRef } from "react";
import AnalyticsPage from "./analytics/AnalyticsPage";
import ChannelSettingsPage from "./channelsettings/ChannelSettingsPage";
import MakerPage from "./maker/MakerPage";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Settings } from "lucide-react";
import SettingsPopup from "./settings";

interface ChannelNavigatorProps {
  onLogout: () => void;
  userId: string | null;
}

const ChannelNavigator: React.FC<ChannelNavigatorProps> = ({
  onLogout,
  userId,
}) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("maker");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    onLogout();
    navigate("/login");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="sticky top-0 z-20 bg-background shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-2">
          <div className="flex justify-between items-center w-full sm:w-auto">
            <div className="flex items-center space-x-5">
              <h1 className="text-xl font-bold">Channel Dashboard</h1>
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="icon"
                className=""
              >
                {isDarkMode ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                )}
              </Button>
            </div>
            <div className="flex items-center space-x-4 sm:hidden">
              <Button onClick={toggleSettings} variant="outline" size="icon">
                <Settings className="h-[1.2rem] w-[1.2rem]" />
              </Button>
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          </div>
          <div className="flex justify-around sm:justify-center items-center mt-2 sm:mt-0 w-full sm:w-auto overflow-x-auto sm:overflow-x-visible">
            <Button
              onClick={() => setActiveTab("maker")}
              variant={activeTab === "maker" ? "default" : "ghost"}
              className="text-base sm:text-lg py-2 px-4 sm:py-3 sm:px-6 flex-shrink-0"
            >
              Maker
            </Button>
            <Button
              onClick={() => setActiveTab("analytics")}
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className="text-base sm:text-lg py-2 px-4 sm:py-3 sm:px-6 flex-shrink-0"
            >
              Analytics
            </Button>
            <Button
              onClick={() => setActiveTab("settings")}
              variant={activeTab === "settings" ? "default" : "ghost"}
              className="text-base sm:text-lg py-2 px-4 sm:py-3 sm:px-6 flex-shrink-0"
            >
              Channel Settings
            </Button>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <Button onClick={toggleSettings} variant="outline" size="icon">
              <Settings className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-0 py-6">
          {activeTab === "maker" && <MakerPage />}
          {activeTab === "analytics" && <AnalyticsPage />}
          {activeTab === "settings" && <ChannelSettingsPage />}
          {isSettingsOpen && (
            <div ref={settingsRef}>
              <SettingsPopup
                onClose={() => setIsSettingsOpen(false)}
                onSave={() => {
                  // Add your save logic here
                  setIsSettingsOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelNavigator;
