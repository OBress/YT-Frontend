import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ChannelProps {
  id: number;
  name: string;
  genre: string;
  isChecked: boolean;
  onCheckboxChange: (id: number) => void;
}

export function Channel({
  id,
  name,
  genre,
  isChecked,
  onCheckboxChange,
}: ChannelProps) {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <Checkbox
        id={`channel-${id}`}
        checked={isChecked}
        onCheckedChange={() => onCheckboxChange(id)}
      />
      <Label
        htmlFor={`channel-${id}`}
        className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {name} - {genre}
      </Label>
    </div>
  );
}
