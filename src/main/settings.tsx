import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Save } from "lucide-react";
import { DialogFooter, DialogContent } from "@/components/ui/dialog";
import {
  sanitizeSettings,
  fetchUserSettings,
} from "./channelsettings/channelSettingsUtils";

interface SettingsPopupProps {
  onClose: () => void;
  onUpdateSettings: (updatedTokens: Record<string, string>) => Promise<void>;
}

const SettingsPopup: React.FC<SettingsPopupProps> = () => {
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [visibleTokens, setVisibleTokens] = useState<Record<string, boolean>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "neutral";
  } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      // console.log("UserId:", userId, "Token:", token);
      if (!userId || !token) {
        console.error("User ID or token not found");
        return;
      }

      try {
        const userSettings = await fetchUserSettings(userId);
        // console.log("Fetched user settings:", userSettings);
        if (Object.keys(userSettings).length === 0) {
          setNotification({
            message: "No user settings found. Using default settings.",
            type: "neutral",
          });
        } else {
          const sanitizedSettings = sanitizeSettings(userSettings);
          // console.log("Sanitized settings:", sanitizedSettings);
          setTokens(sanitizedSettings);
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
        setNotification({
          message: "Failed to fetch user settings. Using default settings.",
          type: "error",
        });
      }
    };

    fetchSettings();
  }, []);

  const handleTokenChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setTokens((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSave = async () => {
    setIsLoading(true);
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) {
      setNotification({
        message: "User ID or token not found. Please log in again.",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/user-settings/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ settings: tokens }),
        }
      );

      if (response.status === 304) {
        setNotification({
          message: "No changes to save",
          type: "neutral",
        });
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update user settings: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      setNotification({
        message: "User settings updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating user settings:", error);
      let errorMessage = "An error occurred while updating user settings";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      setNotification({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTokenVisibility = (key: string) => {
    setVisibleTokens((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <>
      <DialogContent>
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <div className="space-y-4">
          {Object.entries(tokens).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-4">
              <label htmlFor={key} className="text-sm font-medium w-1/3">
                {key.charAt(0).toUpperCase() + key.slice(1)} Token:
              </label>
              <div className="relative w-2/3">
                <Input
                  id={key}
                  type="text"
                  value={value}
                  onChange={handleTokenChange(key)}
                  placeholder={`Enter ${key} token`}
                  className={`pr-10 ${
                    visibleTokens[key] ? "" : "text-security-disc"
                  }`}
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => toggleTokenVisibility(key)}
                >
                  {visibleTokens[key] ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="w-full" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
      {notification &&
        ReactDOM.createPortal(
          <div
            className={`fixed left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md bg-background border shadow-lg animate-fade-in-out ${
              notification.type === "success"
                ? "text-green-500"
                : notification.type === "error"
                ? "text-red-500"
                : "text-gray-500"
            }`}
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999999, // Very high z-index
            }}
          >
            {notification.message}
          </div>,
          document.body
        )}
    </>
  );
};

export default SettingsPopup;
