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
import {
  Channel,
  sanitizeSettings,
  fetchChannelSettings,
} from "./channelSettingsUtils";

export default function ChannelSettingsPage() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [expandedJsonPaths, setExpandedJsonPaths] = useState<
    Record<string, Set<string>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchChannelSettings(userId)
        .then((data) => {
          if (Object.keys(data.channels).length === 0) {
            setError("No channels found. Please set up your channel first.");
            return;
          }
          setChannel(data);
          setError(null);
        })
        .catch((error) => {
          console.error("Error fetching channel settings:", error);
          setError(error.message || "An unknown error occurred");
        });
    } else {
      setError("User ID not found in local storage. Please log in again.");
    }
  }, []);

  const handleSaveSettings = async (channelKey: string, newSettings: any) => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (!userId || !token) {
        throw new Error("User ID or token not found");
      }

      const response = await fetch(
        `http://localhost:3001/api/channel-settings/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            channelKey,
            newSettings,
          }),
        }
      );

      if (response.status === 304) {
        console.log("No changes to save");
        return "not_modified";
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update channel settings: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      setChannel((prevChannel) => {
        if (!prevChannel) return null;
        return {
          ...prevChannel,
          channels: {
            ...prevChannel.channels,
            [channelKey]: newSettings,
          },
        };
      });

      console.log("Channel settings updated successfully");
      return "modified";
    } catch (error) {
      console.error("Error updating channel settings:", error);
      let errorMessage = "An error occurred while updating channel settings";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      setError(errorMessage);
      throw error;
    }
  };

  const toggleJsonExpanded = (
    channelKey: string,
    path: (string | number)[]
  ) => {
    const pathString = path.join(".");
    setExpandedJsonPaths((prev) => {
      const channelPaths = prev[channelKey] || new Set();
      const newChannelPaths = new Set(channelPaths);
      if (newChannelPaths.has(pathString)) {
        newChannelPaths.delete(pathString);
      } else {
        newChannelPaths.add(pathString);
      }
      return { ...prev, [channelKey]: newChannelPaths };
    });
  };

  const toggleChannelExpanded = (channelKey: string) => {
    setExpandedChannels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(channelKey)) {
        newSet.delete(channelKey);
      } else {
        newSet.add(channelKey);
      }
      return newSet;
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl">Settings</CardTitle>
        <CardDescription className="text-lg">
          Manage channel settings
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full max-w-7xl mx-auto">
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
              ([channelKey, channelData], index, array) => (
                <React.Fragment key={channelKey}>
                  <div className="mb-6">
                    <div
                      className="flex items-center cursor-pointer mb-2"
                      onClick={() => toggleChannelExpanded(channelKey)}
                    >
                      {expandedChannels.has(channelKey) ? (
                        <ChevronDown className="h-5 w-5 mr-2" />
                      ) : (
                        <ChevronRight className="h-5 w-5 mr-2" />
                      )}
                      <h3 className="text-2xl font-semibold">{channelKey}</h3>
                    </div>
                    {expandedChannels.has(channelKey) && (
                      <div className="border rounded-xl p-4">
                        <JSONEditor
                          data={sanitizeSettings(channelData)}
                          onSave={(newSettings) =>
                            handleSaveSettings(channelKey, newSettings)
                          }
                          expandedPaths={
                            expandedJsonPaths[channelKey] || new Set()
                          }
                          toggleExpanded={(path) =>
                            toggleJsonExpanded(channelKey, path)
                          }
                          channelKey={channelKey}
                        />
                      </div>
                    )}
                  </div>
                  {index < array.length - 1 && (
                    <hr className="my-6 border-t border-gray-300" />
                  )}
                </React.Fragment>
              )
            )
          : !error && (
              <p>No channel data available. Please set up your channel.</p>
            )}
      </CardContent>
    </Card>
  );
}
