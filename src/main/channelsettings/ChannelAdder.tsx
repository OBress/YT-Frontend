import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPresets } from "./channelSettingsUtils";
import { useUserData } from "@/contexts/UserDataContext";
import { API_BASE_URL } from "@/config";

export function ChannelAdder({
  onAddChannel,
  userId,
  handleSaveSettings,
  channelsUpdated,
}: {
  onAddChannel: (newChannelData: any) => void;
  userId: string;
  handleSaveSettings: (
    channelKey: string,
    newSettings: any
  ) => Promise<string | void>;
  channelsUpdated: number;
}) {
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [defaultPresets, setDefaultPresets] = useState<Record<string, any>>({});
  const [userChannels, setUserChannels] = useState<Record<string, any>>({});
  const [combinedPresets, setCombinedPresets] = useState<Record<string, any>>(
    {}
  );

  const { refreshData } = useUserData();

  const fetchPresetsData = useCallback(() => {
    if (userId) {
      fetchPresets(userId)
        .then((data) => {
          if (!data || (!data.presets && !data.userChannels)) {
            console.error("Invalid data structure received from fetchPresets");
            return;
          }
          setDefaultPresets(data.presets || {});
          setUserChannels(data.userChannels || {});
          setCombinedPresets({
            ...(data.presets || {}),
            ...(data.userChannels || {}),
          });
        })
        .catch((error) => {
          console.error("Error fetching presets:", error);
        });
    }
  }, [userId]);

  useEffect(() => {
    fetchPresetsData();
  }, [fetchPresetsData, channelsUpdated]);

  const handleAddChannel = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/channel-settings/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            channelUrl: newChannelName,
            newSettings: combinedPresets[selectedPreset],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add channel");
      }

      onAddChannel(data.addedChannel);
      setShowAddChannelModal(false);
      setNewChannelName("");
      setSelectedPreset("");
      fetchPresetsData();
    } catch (error) {
      console.error("Error adding channel:", error);
    }
  };

  return (
    <>
      <Button onClick={() => setShowAddChannelModal(true)}>
        Add New Channel
      </Button>
      <Dialog open={showAddChannelModal} onOpenChange={setShowAddChannelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Channel</DialogTitle>
            <DialogDescription>
              Enter the YouTube channel URL to add a new channel
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Channel URL
              </Label>
              <Input
                id="name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="col-span-3"
                placeholder="url of channel"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preset" className="text-right">
                Preset
              </Label>
              <Select onValueChange={setSelectedPreset} value={selectedPreset}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a preset or channel" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(defaultPresets).length > 0 && (
                    <>
                      <SelectItem value="default_presets_header" disabled>
                        <div className="w-full text-center font-semibold text-base">
                          Default Presets
                        </div>
                      </SelectItem>
                      {Object.keys(defaultPresets).map((presetName) => (
                        <SelectItem key={presetName} value={presetName}>
                          {presetName}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {Object.keys(userChannels).length > 0 && (
                    <>
                      <SelectItem value="current_channels_header" disabled>
                        <div className="w-full text-center font-semibold text-base">
                          Current Channels
                        </div>
                      </SelectItem>
                      {Object.keys(userChannels).map((channelName) => (
                        <SelectItem key={channelName} value={channelName}>
                          {channelName}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {Object.keys(defaultPresets).length === 0 &&
                    Object.keys(userChannels).length === 0 && (
                      <SelectItem value="no_presets" disabled>
                        No presets or channels available
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddChannel}
              disabled={!newChannelName || !selectedPreset}
            >
              Add Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
