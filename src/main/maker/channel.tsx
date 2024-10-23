import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ChannelProps {
  name: string;
  nextUploadDate: string;
  isChecked: boolean;
  onCheckboxChange: () => void;
}

export function Channel({
  name,
  nextUploadDate,
  isChecked,
  onCheckboxChange,
}: ChannelProps) {
  return (
    <div className="flex items-center space-x-2 mb-5">
      <Checkbox
        id={`channel-${name}`}
        checked={isChecked}
        onCheckedChange={onCheckboxChange}
        className="w-6 h-6 flex-shrink-0"
      />
      <Label
        htmlFor={`channel-${name}`}
        className="flex items-center pl-2 cursor-pointer"
      >
        <span className="text-2xl font-medium">{name}</span>
        <span className="text-gray-500 italic text-base ml-4">
          Next upload: {nextUploadDate}
        </span>
      </Label>
    </div>
  );
}
