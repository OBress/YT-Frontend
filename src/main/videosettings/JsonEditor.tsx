"use client";

import { useState, useCallback } from "react";
import { ChevronRight, ChevronDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];

export interface JSONEditorProps {
  data: JSONValue;
  onSave: (data: JSONValue) => void;
  expandedPaths: Set<string>;
  toggleExpanded: (path: (string | number)[]) => void;
  channelKey: string;
}

const JSONEditor: React.FC<JSONEditorProps> = ({
  data: initialData,
  onSave,
  expandedPaths,
  toggleExpanded,
  channelKey,
}) => {
  const [data, setData] = useState<JSONValue>(initialData);

  const handleSave = () => {
    onSave(data);
  };

  return (
    <div className="w-full space-y-4">
      <JSONEditorNode
        data={data}
        onChange={(newData) => setData(newData)}
        path={[]}
        expandedPaths={expandedPaths}
        toggleExpanded={toggleExpanded}
        isTopLevel={true}
      />
      <div className="flex justify-center">
        <Button onClick={handleSave} className="w-auto px-6">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
};

interface JSONEditorNodeProps {
  data: JSONValue;
  onChange: (newData: JSONValue) => void;
  path: (string | number)[];
  expandedPaths: Set<string>;
  toggleExpanded: (path: (string | number)[]) => void;
  isTopLevel?: boolean;
}

function JSONEditorNode({
  data,
  onChange,
  path,
  expandedPaths,
  toggleExpanded,
  isTopLevel = false,
}: JSONEditorNodeProps) {
  const pathString = path.join(".");
  const isExpanded = expandedPaths.has(pathString);
  const isRoot = path.length === 0;
  const isChannel =
    path.length === 1 &&
    typeof path[0] === "string" &&
    path[0].startsWith("channel");

  if (typeof data === "object" && data !== null) {
    const isArray = Array.isArray(data);
    let entries = isArray
      ? Object.entries(data)
      : Object.entries(data as JSONObject);

    if (isChannel && "video-settings" in data) {
      entries = Object.entries(
        (data as JSONObject)["video-settings"] as JSONObject
      );
    }

    return (
      <div className={`my-2 ${isTopLevel ? "" : "ml-8"}`}>
        {!isRoot && (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => toggleExpanded(path)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 mr-2 transition-transform duration-200 ease-in-out" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2 transition-transform duration-200 ease-in-out" />
            )}
            <span className="font-medium">{path[path.length - 1]}</span>
          </div>
        )}
        {(isExpanded || isRoot) && (
          <div className={`${isRoot ? "" : "ml-8 mt-2"}`}>
            {entries.map(([key, value]) => (
              <div key={key} className="my-1">
                <JSONEditorNode
                  data={value}
                  onChange={(newValue) => {
                    const newData = isArray
                      ? [...(data as JSONArray)]
                      : { ...(data as JSONObject) };
                    if (isChannel) {
                      (newData as JSONObject)["video-settings"] = {
                        ...((newData as JSONObject)[
                          "video-settings"
                        ] as JSONObject),
                        [key]: newValue,
                      };
                    } else {
                      (newData as JSONObject)[key] = newValue;
                    }
                    onChange(newData);
                  }}
                  path={
                    isChannel
                      ? [...path, "video-settings", key]
                      : [...path, key]
                  }
                  expandedPaths={expandedPaths}
                  toggleExpanded={toggleExpanded}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="flex items-center mt-1 ml-8">
        <span className="font-medium mr-2 min-w-[100px]">
          {path[path.length - 1]}:
        </span>
        <Input
          value={data === null ? "" : String(data)}
          onChange={(e) => onChange(e.target.value)}
          className="flex-grow"
        />
      </div>
    );
  }
}

export default JSONEditor;
