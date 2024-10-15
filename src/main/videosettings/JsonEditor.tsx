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
}

export default function JSONEditor({
  data: initialData,
  onSave,
  expandedPaths,
  toggleExpanded,
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
        expandedPaths={expandedPaths}
        toggleExpanded={toggleExpanded}
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
  expandedPaths: Set<string>;
  toggleExpanded: (path: (string | number)[]) => void;
}

function JSONEditorNode({
  data,
  onChange,
  path,
  expandedPaths,
  toggleExpanded,
}: JSONEditorNodeProps) {
  const pathString = path.join(".");
  const isExpanded = expandedPaths.has(pathString);

  if (typeof data === "object" && data !== null) {
    const isArray = Array.isArray(data);
    const entries = isArray
      ? Object.entries(data)
      : Object.entries(data as JSONObject);

    return (
      <div className="my-2">
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
        {isExpanded && (
          <div className="ml-4 mt-2">
            {entries.map(([key, value], index) => (
              <div key={key} className="my-1">
                <JSONEditorNode
                  data={value}
                  onChange={(newValue) => {
                    const newData = isArray
                      ? [...(data as JSONArray)]
                      : { ...(data as JSONObject) };
                    if (isArray) {
                      (newData as JSONArray)[index] = newValue;
                    } else {
                      (newData as JSONObject)[key] = newValue;
                    }
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
      <Input
        value={data === null ? "" : String(data)}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
    );
  }
}
