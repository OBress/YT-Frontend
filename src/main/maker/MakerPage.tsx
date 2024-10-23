import React, { useState, useEffect, useCallback } from "react";
import { Channel } from "./channel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ChannelData {
  name: string;
  nextUploadDate: string;
  isChecked: boolean;
}

export default function MakerPage() {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [videoCount, setVideoCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(clearMessages, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, clearMessages]);

  useEffect(() => {
    // Try to load cached channels first
    const cachedChannels = localStorage.getItem("cachedChannels");
    if (cachedChannels) {
      setChannels(JSON.parse(cachedChannels));
    }

    // Then fetch fresh data
    fetchChannelData();
  }, []);

  const fetchChannelData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        throw new Error("User ID or token not found");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/channel-settings/names-and-dates/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const channelsWithChecked = data.map((channel: ChannelData) => ({
        ...channel,
        isChecked: true,
      }));

      // Cache the channels in localStorage
      localStorage.setItem(
        "cachedChannels",
        JSON.stringify(channelsWithChecked)
      );
      setChannels(channelsWithChecked);
    } catch (error) {
      console.error("Error fetching channel data:", error);
      setError("Failed to fetch channel data. Please try again later.");
    }
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    setChannels(
      channels.map((channel) => ({ ...channel, isChecked: !selectAll }))
    );
  };

  const handleCheckboxChange = (name: string) => {
    const updatedChannels = channels.map((channel) =>
      channel.name === name
        ? { ...channel, isChecked: !channel.isChecked }
        : channel
    );
    setChannels(updatedChannels);
    setSelectAll(updatedChannels.every((channel) => channel.isChecked));
  };

  const handleCreateVideos = async () => {
    const selectedChannels = channels
      .filter((channel) => channel.isChecked)
      .map((channel) => channel.name);

    if (selectedChannels.length === 0) {
      setError("Please select at least one channel.");
      return;
    }

    if (videoCount <= 0) {
      setError("Please enter a valid number of videos to create.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        throw new Error("User ID or token not found");
      }

      const response = await fetch(
        "${import.meta.env.VITE_API_BASE_URL}/api/maker/create-videos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            channelNames: selectedChannels,
            videoCount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuccessMessage(
        `Successfully queued ${videoCount} videos for ${selectedChannels.length} channel(s).`
      );
    } catch (error) {
      console.error("Error creating videos:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create videos. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl">Maker Page</CardTitle>
          <CardDescription className="text-lg">
            Select the channels you wish to make videos for
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full max-w-6xl mx-auto">
          {channels.length === 0 ? (
            <div className="text-center text-gray-500">
              Add channels to start
            </div>
          ) : (
            <>
              <div className="flex items-center mb-4 p-1 rounded-md">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAllChange}
                  className="w-4 h-4 mr-2"
                />
              </div>
              {channels.map((channel) => (
                <Channel
                  key={channel.name}
                  name={channel.name}
                  nextUploadDate={channel.nextUploadDate}
                  isChecked={channel.isChecked}
                  onCheckboxChange={() => handleCheckboxChange(channel.name)}
                />
              ))}
            </>
          )}
          <div className="flex items-center mt-4 space-x-2">
            <Button onClick={handleCreateVideos} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Videos"
              )}
            </Button>
            <Input
              type="number"
              value={videoCount}
              onChange={(e) => setVideoCount(parseInt(e.target.value) || 0)}
              className="w-20"
              min={0}
            />
          </div>
        </CardContent>
      </Card>

      {(error || successMessage) && (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert
                variant="default"
                className="border-green-500 text-green-500"
              >
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
