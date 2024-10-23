import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import JSONEditor from "./JsonEditor";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import {
  Channel,
  sanitizeSettings,
  fetchChannelSettings,
} from "./channelSettingsUtils";
import { ChannelAdder } from "./ChannelAdder";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ChannelSettingsPage() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [expandedJsonPaths, setExpandedJsonPaths] = useState<
    Record<string, Set<string>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(
    new Set()
  );
  const [deleteChannelKey, setDeleteChannelKey] = useState<string | null>(null);
  const [deleteChannelInput, setDeleteChannelInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [channelsUpdated, setChannelsUpdated] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  const getCachedChannelData = () => {
    try {
      const cached = localStorage.getItem("cachedChannelData");
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.error("Error parsing cached channel data:", e);
      return null;
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      // First load cached data if available
      const cachedData = getCachedChannelData();
      if (cachedData) {
        setChannel(cachedData);
        setIsLoading(false);
      }

      // Then fetch fresh data
      fetchChannelSettings(userId)
        .then((data) => {
          if (Object.keys(data.channels).length === 0) {
            setError("No channels found. Please set up your channel first.");
            return;
          }
          setChannel(data);
          // Cache the new data
          localStorage.setItem("cachedChannelData", JSON.stringify(data));
          setError(null);
        })
        .catch((error) => {
          console.error("Error fetching channel settings:", error);
          setError(error.message || "An unknown error occurred");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError("User ID not found in local storage. Please log in again.");
      setIsLoading(false);
    }
  }, [channelsUpdated]);

  const handleSaveSettings = async (channelKey: string, newSettings: any) => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (!userId || !token) {
        throw new Error("User ID or token not found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/channel-settings/${userId}`,
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

      // After successful save, update the cache
      setChannel((prevChannel) => {
        if (!prevChannel) return null;
        const updatedChannel = {
          ...prevChannel,
          channels: {
            ...prevChannel.channels,
            [channelKey]: newSettings,
          },
        };
        localStorage.setItem(
          "cachedChannelData",
          JSON.stringify(updatedChannel)
        );
        return updatedChannel;
      });

      console.log("Channel settings updated successfully");
      setChannelsUpdated((prev) => prev + 1); // Increment channelsUpdated
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

  const handleAddChannel = (newChannelData: any) => {
    setChannel((prevChannel) => {
      if (!prevChannel) return null;
      return {
        ...prevChannel,
        channels: {
          ...prevChannel.channels,
          [newChannelData.id]: newChannelData,
        },
      };
    });
    setChannelsUpdated((prev) => prev + 1); // This triggers a refresh
  };

  const handleDeleteChannel = async () => {
    if (!deleteChannelKey || deleteChannelInput !== deleteChannelKey) {
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (!userId || !token) {
        throw new Error("User ID or token not found");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/channel-settings/${userId}/${deleteChannelKey}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete channel: ${response.status} ${response.statusText}`
        );
      }

      setChannel((prevChannel) => {
        if (!prevChannel) return null;
        const { [deleteChannelKey]: _, ...remainingChannels } =
          prevChannel.channels;
        const updatedChannel = { ...prevChannel, channels: remainingChannels };
        localStorage.setItem(
          "cachedChannelData",
          JSON.stringify(updatedChannel)
        );
        return updatedChannel;
      });

      setDeleteChannelKey(null);
      setDeleteChannelInput("");
      setChannelsUpdated((prev) => prev + 1); // Increment channelsUpdated
    } catch (error) {
      console.error("Error deleting channel:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the channel"
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-3xl">Settings</CardTitle>
          <CardDescription className="text-lg">
            Manage channel settings
          </CardDescription>
        </div>
        {userId && (
          <ChannelAdder
            onAddChannel={handleAddChannel}
            userId={userId}
            handleSaveSettings={handleSaveSettings}
            channelsUpdated={channelsUpdated}
          />
        )}
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
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => toggleChannelExpanded(channelKey)}
                      >
                        {expandedChannels.has(channelKey) ? (
                          <ChevronDown className="h-5 w-5 mr-2" />
                        ) : (
                          <ChevronRight className="h-5 w-5 mr-2" />
                        )}
                        <h3 className="text-2xl font-semibold">{channelKey}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteChannelKey(channelKey)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
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
      <Dialog
        open={deleteChannelKey !== null}
        onOpenChange={() => setDeleteChannelKey(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the channel "{deleteChannelKey}"?
              This action cannot be undone. To confirm, please enter the channel
              name below.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteChannelInput}
            onChange={(e) => setDeleteChannelInput(e.target.value)}
            placeholder="Enter channel name to confirm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteChannelKey(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChannel}
              disabled={deleteChannelInput !== deleteChannelKey}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
