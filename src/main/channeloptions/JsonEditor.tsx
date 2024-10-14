"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];

export interface JSONEditorProps {
  data: JSONValue;
  onSave: (data: JSONValue) => void;
}

export default function JSONEditor({
  data: initialData,
  onSave,
}: JSONEditorProps) {
  const [data, setData] = useState<JSONValue>(initialData);

  const handleSave = () => {
    onSave(data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <JSONEditorNode
        data={data}
        onChange={(newData) => setData(newData)}
        path={[]}
      />
      <Button onClick={handleSave} className="w-full">
        <Save className="mr-2 h-4 w-4" /> Save Changes
      </Button>
    </div>
  );
}

interface JSONEditorNodeProps {
  data: JSONValue;
  onChange: (newData: JSONValue) => void;
  path: (string | number)[];
}

function JSONEditorNode({ data, onChange, path }: JSONEditorNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (typeof data === "object" && data !== null) {
    const isArray = Array.isArray(data);
    const entries = isArray
      ? Object.entries(data)
      : Object.entries(data as JSONObject);

    return (
      <div className="border rounded-md p-2 my-2">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mr-2 transition-transform duration-200 ease-in-out" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2 transition-transform duration-200 ease-in-out" />
          )}
          <span className="font-medium">
            {isArray ? "Array" : "Object"} ({entries.length})
          </span>
        </div>
        <div
          className={`ml-4 mt-2 overflow-hidden transition-all duration-200 ease-in-out ${
            isExpanded ? "max-h-[1000px]" : "max-h-0"
          }`}
        >
          {entries.map(([key, value], _) => (
            <div key={key} className="my-1">
              <span className="font-medium mr-2">{key}:</span>
              <JSONEditorNode
                data={value}
                onChange={(newValue) => {
                  const newData = isArray
                    ? [...(data as JSONArray)]
                    : { ...(data as JSONObject) };
                  if (isArray) {
                    (newData as JSONArray)[Number(key)] = newValue;
                  } else {
                    (newData as JSONObject)[key] = newValue;
                  }
                  onChange(newData);
                }}
                path={[...path, key]}
              />
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <Input
        value={data as string}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
    );
  }
}
