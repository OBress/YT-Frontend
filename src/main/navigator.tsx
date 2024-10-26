"use client";
import React, { useState, useEffect } from "react";
import AnalyticsPage from "./analytics/AnalyticsPage";
import ChannelSettingsPage from "./channelsettings/ChannelSettingsPage";
import MakerPage from "./maker/MakerPage";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SettingsPopup from "./settings";
import { useUserData } from "@/contexts/UserDataContext";
import { useProgress } from "@/contexts/ProgressContext";

interface ChannelNavigatorProps {
  onLogout: () => void;
  userId: string | null;
  onUpdateSettings: (tokens: Record<string, string>) => Promise<void>;
}

const ChannelNavigator: React.FC<ChannelNavigatorProps> = ({
  onLogout,
  userId,
  onUpdateSettings,
}) => {
  const navigate = useNavigate();
  const { isLoading } = useUserData();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("maker");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { progress, isActive } = useProgress();

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="sticky top-0 z-20 bg-background shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-2">
          {/* Top row - always visible */}
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center space-x-5">
              <h1 className="text-xl sm:text-2xl font-bold">
                Channel Dashboard
              </h1>
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="icon"
                className="h-9 w-9"
              >
                {isDarkMode ? (
                  <Sun className="h-[1.3rem] w-[1.3rem]" />
                ) : (
                  <Moon className="h-[1.3rem] w-[1.3rem]" />
                )}
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleSettings}
                variant="outline"
                size="icon"
                className="h-9 w-9"
              >
                <Settings className="h-[1.3rem] w-[1.3rem]" />
              </Button>
              <Button
                onClick={() => setIsLogoutDialogOpen(true)}
                className="text-base px-4 py-2 h-9"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Navigation buttons below on mobile, centered on desktop */}
          <div className="flex space-x-4 mt-2 sm:mt-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
            <Button
              onClick={() => setActiveTab("maker")}
              variant={activeTab === "maker" ? "default" : "ghost"}
              className="text-lg sm:text-xl py-2 px-6 sm:py-3 sm:px-8 flex-shrink-0"
            >
              Maker
            </Button>
            <Button
              onClick={() => setActiveTab("analytics")}
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className="text-lg sm:text-xl py-2 px-6 sm:py-3 sm:px-8 flex-shrink-0"
            >
              Analytics
            </Button>
            <Button
              onClick={() => setActiveTab("settings")}
              variant={activeTab === "settings" ? "default" : "ghost"}
              className="text-lg sm:text-xl py-2 px-6 sm:py-3 sm:px-8 flex-shrink-0"
            >
              Channel Settings
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-0 py-6">
          {activeTab === "maker" && <MakerPage />}
          {activeTab === "analytics" && <AnalyticsPage />}
          {activeTab === "settings" && <ChannelSettingsPage />}
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogContent className="sm:max-w-[425px] bg-background">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Manage your API tokens and other settings here.
                </DialogDescription>
              </DialogHeader>
              <SettingsPopup
                onClose={() => setIsSettingsOpen(false)}
                onUpdateSettings={async (
                  updatedTokens: Record<string, string>
                ) => {
                  const token = localStorage.getItem("token");
                  if (!userId || !token) {
                    console.error("User ID or token not found");
                    return;
                  }

                  try {
                    await onUpdateSettings(updatedTokens);
                    setIsSettingsOpen(false);
                  } catch (error) {
                    console.error("Error updating user settings:", error);
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to login again to
              access your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {isActive && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="w-full bg-secondary rounded-full h-2.5 dark:bg-secondary/50">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-center mt-1">
              Processing Videos: {progress}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelNavigator;
