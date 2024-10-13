"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsPage from "./AnalyticsPage";
import ChannelSettingsPage from "./ChannelSettingsPage";

export default function ChannelNavigator() {
  return (
    <div className="flex flex-col min-h-screen">
      <Tabs
        defaultValue="analytics"
        className="w-full max-w-6xl mx-auto flex-grow"
      >
        <div className="sticky top-0 z-10 bg-background shadow-md">
          <div className="flex justify-between items-center px-4">
            <TabsList className="w-full h-16 grid grid-cols-2">
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
          </div>
        </div>
        <TabsContent value="analytics">
          <AnalyticsPage />
        </TabsContent>
        <TabsContent value="settings">
          <ChannelSettingsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
