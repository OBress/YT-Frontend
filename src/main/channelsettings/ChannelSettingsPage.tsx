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
import { sanitizeSettings } from "./channelSettingsUtils";
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
import { useUserData } from "@/contexts/UserDataContext";
import { API_BASE_URL } from "@/config";
import ReactDOM from "react-dom";

export default function ChannelSettingsPage() {
  const { channelData, refreshData, isLoading } = useUserData();
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "neutral";
  } | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (!channelData && !isLoading && userId) {
      setError("No channel data available.");
    } else if (
      channelData &&
      channelData.channels &&
      Object.keys(channelData.channels).length === 0
    ) {
      setError("No channels found. Please set up your channel first.");
    } else {
      setError(null);
    }
  }, [channelData, isLoading, userId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSaveSettings = async (channelKey: string, newSettings: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!userId || !token) {
        throw new Error("User ID or token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/channel-settings/${userId}`,
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
        setNotification({
          message: "No changes to save",
          type: "neutral",
        });
        return "not_modified";
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update channel settings: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      // Update local channelData state
      if (channelData) {
        const updatedChannelData = {
          ...channelData,
          channels: {
            ...channelData.channels,
            [channelKey]: newSettings,
          },
        };
        localStorage.setItem("channelData", JSON.stringify(updatedChannelData));
      }

      setNotification({
        message: "Channel settings updated successfully",
        type: "success",
      });
      setChannelsUpdated((prev) => prev + 1);
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
      setNotification({
        message: errorMessage,
        type: "error",
      });
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

  const handleAddChannel = async () => {
    try {
      await refreshData();
      setChannelsUpdated((prev) => prev + 1);
      setError(null);
      setNotification({
        message: "Channel added successfully",
        type: "success",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add channel";
      setError(errorMessage);
      setNotification({
        message: errorMessage,
        type: "error",
      });
    }
  };

  const handleDeleteChannel = async () => {
    if (!deleteChannelKey || deleteChannelInput !== deleteChannelKey) {
      return;
    }

    try {
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

      // Refresh data from server and update localStorage
      await refreshData();

      setNotification({
        message: "Channel deleted successfully",
        type: "success",
      });
      setDeleteChannelKey(null);
      setDeleteChannelInput("");
      setChannelsUpdated((prev) => prev + 1);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting channel:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the channel"
      );
      setNotification({
        message:
          error instanceof Error ? error.message : "Failed to delete channel",
        type: "error",
      });
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
        {channelData?.channels && Object.keys(channelData.channels).length > 0
          ? Object.entries(channelData.channels).map(
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
                        onClick={() => {
                          setDeleteChannelKey(channelKey);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    {expandedChannels.has(channelKey) && (
                      <div className="border rounded-xl p-4">
                        <JSONEditor
                          data={sanitizeSettings(
                            channelData as Record<string, any>
                          )}
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
        open={isDeleteDialogOpen}
        onOpenChange={() => {
          setIsDeleteDialogOpen(false);
          setDeleteChannelKey(null);
        }}
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
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteChannelKey(null);
              }}
            >
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
      {notification &&
        ReactDOM.createPortal(
          <div
            className={`fixed left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md bg-background border shadow-lg animate-fade-in-out ${
              notification.type === "success"
                ? "text-green-500"
                : notification.type === "error"
                ? "text-red-500"
                : "text-gray-500"
            }`}
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999999,
            }}
          >
            {notification.message}
          </div>,
          document.body
        )}
    </Card>
  );
}
