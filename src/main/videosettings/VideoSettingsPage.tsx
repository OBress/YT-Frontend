import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import JSONEditor from "./JsonEditor";
import { ChevronRight, ChevronDown } from "lucide-react";

// Update the Channel type to match the structure
type Channel = {
  channels: {
    [key: string]: {
      "channel-settings": {
        "upload-time": string;
      };
      "video-settings": {
        text: { length: number };
        audio: { voiceid: string };
        video: { subtitles: boolean };
        thumbnail: { create: boolean };
      };
    };
  };
};

export default function ChannelSettingsPage() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [expandedJsonPaths, setExpandedJsonPaths] = useState<Set<string>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchChannelSettings(userId);
    } else {
      setError("User ID not found in local storage. Please log in again.");
    }
  }, []);

  const fetchChannelSettings = async (userId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/channel-settings/${userId}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          setError(
            "Channel settings not found. Please set up your channel first."
          );
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Channel = await response.json();
      if (Object.keys(data.channels).length === 0) {
        setError("No channels found. Please set up your channel first.");
        return;
      }
      setChannel(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching channel settings:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  const handleSaveSettings = async (channelKey: string, newSettings: any) => {
    // Implement the logic to save updated settings to MongoDB
    // This is just a placeholder for now
    setChannel((prevChannel) => {
      if (!prevChannel) return null;
      return {
        ...prevChannel,
        channels: {
          ...prevChannel.channels,
          [channelKey]: {
            "channel-settings": newSettings["channel-settings"],
            "video-settings": newSettings["video-settings"],
          },
        },
      };
    });
  };

  // Add this function to sanitize the settings
  const sanitizeSettings = (
    settings: Record<string, any>
  ): Record<string, any> => {
    return Object.entries(settings).reduce((acc, [key, value]) => {
      acc[key] = value === null ? "" : value;
      return acc;
    }, {} as Record<string, any>);
  };

  const toggleJsonExpanded = (path: (string | number)[]) => {
    const pathString = path.join(".");
    setExpandedJsonPaths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pathString)) {
        newSet.delete(pathString);
      } else {
        newSet.add(pathString);
      }
      return newSet;
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl">Video Settings</CardTitle>
        <CardDescription className="text-lg">
          Manage video settings for the channel
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full max-w-6xl mx-auto">
        {error && (
          <div className="text-red-500 mb-4 p-4 bg-red-100 rounded">
            {error}
            {error.includes("set up your channel") && (
              <p className="mt-2">
                Please go to the channel setup page to create your channel.
              </p>
            )}
          </div>
        )}
        {channel && Object.keys(channel.channels).length > 0
          ? Object.entries(channel.channels).map(
              ([channelKey, channelData]) => (
                <div key={channelKey} className="mb-12">
                  <h3 className="text-2xl font-semibold mb-4">{channelKey}</h3>
                  <JSONEditor
                    data={sanitizeSettings({
                      "channel-settings": channelData["channel-settings"],
                      "video-settings": channelData["video-settings"],
                    })}
                    onSave={(newSettings) =>
                      handleSaveSettings(channelKey, newSettings)
                    }
                    expandedPaths={expandedJsonPaths}
                    toggleExpanded={toggleJsonExpanded}
                  />
                </div>
              )
            )
          : !error && (
              <p>No channel data available. Please set up your channel.</p>
            )}
      </CardContent>
    </Card>
  );
}
