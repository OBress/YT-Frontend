import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import JSONEditor from "./JsonEditor";

// Sample data for channels
const channelData = [
  {
    id: "channel1",
    name: "Main Channel",
    settings: {
      autoPublish: true,
      defaultCategory: "Technology",
      maxVideoDuration: 3600,
      allowComments: true,
    },
  },
  {
    id: "channel2",
    name: "Secondary Channel",
    settings: {
      autoPublish: false,
      defaultCategory: "Entertainment",
      maxVideoDuration: 1800,
      allowComments: true,
    },
  },
];

export default function ChannelSettingsPage() {
  const [channels, setChannels] = useState(channelData);

  const handleSaveSettings = (channelId: string, newSettings: any) => {
    setChannels(
      channels.map((channel) =>
        channel.id === channelId
          ? { ...channel, settings: newSettings }
          : channel
      )
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl">Channel Settings</CardTitle>
        <CardDescription className="text-lg">
          Manage settings for each channel
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full max-w-6xl mx-auto">
        {channels.map((channel) => (
          <div key={channel.id} className="mb-12">
            <h3 className="text-2xl font-semibold mb-4">{channel.name}</h3>
            <JSONEditor
              data={channel.settings}
              onSave={(newSettings) =>
                handleSaveSettings(channel.id, newSettings)
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
