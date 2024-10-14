import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsPopupProps {
  onClose: () => void;
  onSave: (tokens: typeof initialTokens) => void;
}

const initialTokens = {
  openai: "",
  claude: "",
  google: "",
  elevenLabs: "",
  youtube: "",
  reddit: "",
};

const SettingsPopup: React.FC<SettingsPopupProps> = ({ onClose, onSave }) => {
  const [tokens, setTokens] = useState(initialTokens);

  const handleTokenChange =
    (key: keyof typeof tokens) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setTokens((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSave = () => {
    console.log("Save button clicked");
    console.log("onSave type:", typeof onSave);

    if (typeof onSave === "function") {
      onSave(tokens);
      console.log("onSave called");
    } else {
      console.error("onSave is not a function");
      // Optionally, you can save the tokens to localStorage here
      // localStorage.setItem('tokens', JSON.stringify(tokens));
    }

    if (typeof onClose === "function") {
      onClose();
      console.log("onClose called");
    } else {
      console.error("onClose is not a function");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <div className="space-y-4">
          {Object.entries(tokens).map(([key, value]) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)} Token
              </label>
              <Input
                id={key}
                type="password"
                value={value}
                onChange={handleTokenChange(key as keyof typeof tokens)}
                placeholder={`Enter ${key} token`}
              />
            </div>
          ))}
        </div>
        <div className="flex space-x-4 mt-6">
          <Button onClick={handleSave} className="flex-1">
            Save
          </Button>
          <Button
            onClick={() => {
              console.log("Close button clicked");
              if (typeof onClose === "function") {
                onClose();
                console.log("onClose called from Close button");
              } else {
                console.error("onClose is not a function");
              }
            }}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup;
