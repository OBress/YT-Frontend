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
    const token = localStorage.getItem("token");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!userId || !token || !isLoggedIn) {
      setChannelData(null);
      setUserData(null);
      setIsLoading(false);
      return;
    }

    try {
      // Always fetch fresh data from the server
      const [newChannelData, newUserData] = await Promise.all([
        fetchChannelSettings(userId),
        fetchUserSettings(userId),
      ]);
      // console.log("newChannelData", newChannelData);
      // Update state and cache
      if (newChannelData) {
        setChannelData(newChannelData);
        localStorage.setItem("channelData", JSON.stringify(newChannelData));
      }
      if (newUserData) {
        setUserData(newUserData);
        localStorage.setItem("userData", JSON.stringify(newUserData));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Don't clear cached data on error, just use what we have
      const cachedChannelData = localStorage.getItem("channelData");
      const cachedUserData = localStorage.getItem("userData");

      if (cachedChannelData) setChannelData(JSON.parse(cachedChannelData));
      if (cachedUserData) setUserData(JSON.parse(cachedUserData));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    console.log("fetched all data");
  }, []);

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
