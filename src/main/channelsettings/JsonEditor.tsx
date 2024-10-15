"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronRight, ChevronDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];

export interface JSONEditorProps {
  data: JSONValue;
  onSave: (data: JSONValue) => Promise<string | void>;
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
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "neutral";
  } | null>(null);

  const handleSave = async () => {
    try {
      const result = await onSave(data);
      if (result === "not_modified") {
        setNotification({
          message: "No changes to save",
          type: "neutral",
        });
      } else {
        setNotification({
          message: "Changes saved successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Save error:", error); // Add this line for debugging
      setNotification({
        message: `Failed to save changes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <>
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
      {notification && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md bg-background border shadow-lg animate-fade-in-out ${
            notification.type === "success"
              ? "text-green-500"
              : notification.type === "error"
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {notification.message}
        </div>
      )}
    </>
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
                    // Update the entire channel data
                    (newData as JSONObject)[key] = newValue;
                    onChange(newData);
                  }}
                  path={[...path, key]}
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
