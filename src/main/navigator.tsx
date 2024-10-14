"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsPage from "./analytics/AnalyticsPage";
import ChannelSettingsPage from "./channeloptions/ChannelSettingsPage";
import MakerPage from "./maker/MakerPage";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ChannelNavigatorProps {
  onLogout: () => void;
}

const ChannelNavigator: React.FC<ChannelNavigatorProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-20 bg-background shadow-md">
        <div className="flex justify-between items-center px-4 h-16">
          <h1 className="text-xl font-bold">Channel Dashboard</h1>
          <Button onClick={handleLogout} className="ml-4">
            Logout
          </Button>
        </div>
      </div>
      <Tabs
        defaultValue="maker"
        className="w-full max-w-6xl mx-auto flex-grow flex flex-col"
      >
        <TabsList className="w-full h-16 grid grid-cols-3 bg-background z-10 border-b">
          <TabsTrigger
            value="maker"
            className="text-lg py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Maker
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="text-lg py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-lg py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Channel Settings
          </TabsTrigger>
        </TabsList>
        <div className="flex-grow overflow-auto">
          <TabsContent value="maker" className="h-full">
            <MakerPage />
          </TabsContent>
          <TabsContent value="analytics" className="h-full">
            <AnalyticsPage />
          </TabsContent>
          <TabsContent value="settings" className="h-full">
            <ChannelSettingsPage />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ChannelNavigator;
