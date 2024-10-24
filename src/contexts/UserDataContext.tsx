import React, { createContext, useContext, useState, useEffect } from "react";
import {
  fetchChannelSettings,
  fetchUserSettings,
} from "@/main/channelsettings/channelSettingsUtils";

interface UserDataContextType {
  channelData: any;
  userData: any;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [channelData, setChannelData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    const userId = localStorage.getItem("userId");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    // Set loading to false if user is not logged in
    if (!userId || !isLoggedIn) {
      setIsLoading(false);
      return;
    }

    try {
      // Try to load from localStorage first
      const cachedChannelData = localStorage.getItem(`channelData`);
      const cachedUserData = localStorage.getItem(`userData`);

      // Only set cached data if we don't already have data in state
      if (cachedChannelData && cachedUserData && !channelData && !userData) {
        setChannelData(JSON.parse(cachedChannelData));
        setUserData(JSON.parse(cachedUserData));
      }

      // Fetch fresh data from the server
      const [newChannelData, newUserData] = await Promise.all([
        fetchChannelSettings(userId),
        fetchUserSettings(userId),
      ]);

      // Update state and cache
      setChannelData(newChannelData);
      setUserData(newUserData);
      localStorage.setItem(`channelData`, JSON.stringify(newChannelData));
      localStorage.setItem(`userData`, JSON.stringify(newUserData));
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [localStorage.getItem("userId"), localStorage.getItem("isLoggedIn")]);

  const refreshData = async () => {
    setIsLoading(true);
    await fetchAllData();
  };

  return (
    <UserDataContext.Provider
      value={{ channelData, userData, refreshData, isLoading }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}
