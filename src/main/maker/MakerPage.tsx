import React, { useState } from "react";
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

interface Channel {
  id: number;
  name: string;
  genre: string;
  isChecked: boolean;
}

export default function MakerPage() {
  const [channels, setChannels] = useState<Channel[]>([
    { id: 1, name: "Channel 1", genre: "Horror", isChecked: false },
    { id: 2, name: "Channel 2", genre: "Horror", isChecked: false },
    { id: 3, name: "Channel 3", genre: "Relationship", isChecked: false },
  ]);

  const [videoCount, setVideoCount] = useState<number>(0);

  const handleCheckboxChange = (id: number) => {
    setChannels(
      channels.map((channel) =>
        channel.id === id
          ? { ...channel, isChecked: !channel.isChecked }
          : channel
      )
    );
  };

  const handleCreate = () => {
    const selectedChannels = channels.filter((channel) => channel.isChecked);
    console.log("Selected channels:", selectedChannels);
    console.log("Number of videos:", videoCount);
    // Add your create logic here
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl">Maker Page</CardTitle>
        <CardDescription className="text-lg">
          Select the channels you wish to make videos for
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full max-w-6xl mx-auto">
        {channels.map((channel) => (
          <Channel
            key={channel.id}
            {...channel}
            onCheckboxChange={handleCheckboxChange}
          />
        ))}
        <div className="flex items-center mt-4 space-x-2">
          <Button onClick={handleCreate}>Generate Videos</Button>
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
  );
}
