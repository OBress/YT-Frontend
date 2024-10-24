import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Eye, EyeOff, ChevronDown, ChevronRight } from "lucide-react";
import { DialogFooter, DialogContent } from "@/components/ui/dialog";
import { sanitizeSettings } from "./channelsettings/channelSettingsUtils";
import { useUserData } from "@/contexts/UserDataContext";
import { Label } from "@/components/ui/label";
import { fetchUserSettings } from "./channelsettings/channelSettingsUtils";

interface SettingsPopupProps {
  onClose: () => void;
  onUpdateSettings: (updatedTokens: Record<string, string>) => Promise<void>;
}

const SettingsPopup: React.FC<SettingsPopupProps> = () => {
  const { userData } = useUserData(); // Only destructure what's used
  const [tokens, setTokens] = useState<Record<string, Record<string, string>>>(
    {}
  );
  const [visibleTokens, setVisibleTokens] = useState<Record<string, boolean>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "neutral";
  } | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const fetchSettings = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        console.error("User ID or token not found");
        return;
      }

      // Use userData from context if available
      if (userData) {
        setTokens(sanitizeSettings(userData));
        return;
      }

      try {
        const userSettings = await fetchUserSettings(userId);
        const sanitizedSettings = sanitizeSettings(userSettings);
        setTokens(sanitizedSettings);
      } catch (error) {
        console.error("Error fetching user settings:", error);
        setNotification({
          message: "Failed to fetch user settings.",
          type: "error",
        });
      }
    };

    fetchSettings();
  }, [userData]); // Add userData as dependency

  const handleTokenChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setTokens((prev) => {
        const [section, setting] = key.split(".");
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [setting]: e.target.value,
          },
        };
      });
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
        `${import.meta.env.VITE_API_BASE_URL}/api/user-settings/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ settings: tokens }),
        }
      );

      if (response.ok) {
        localStorage.setItem("userData", JSON.stringify({ settings: tokens }));
        setNotification({
          message: "User settings updated successfully",
          type: "success",
        });
      } else if (response.status === 304) {
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

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]); // Removed onClose from dependencies

  const toggleTokenVisibility = (key: string) => {
    setVisibleTokens((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <div className="mb-2">
          <h2 className="text-2xl font-bold">Settings</h2>
          <div className="h-0.5 bg-border mt-2"></div>
        </div>
        <div className="space-y-2 overflow-y-auto flex-1 pr-4">
          {Object.entries(tokens).map(([sectionName, sectionSettings]) => (
            <div key={sectionName} className="border rounded-lg p-4">
              <button
                onClick={() => toggleSection(sectionName)}
                className="flex items-center w-full text-left font-semibold mb-2"
              >
                {expandedSections[sectionName] ? (
                  <ChevronDown className="mr-2 h-4 w-4" />
                ) : (
                  <ChevronRight className="mr-2 h-4 w-4" />
                )}
                {sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}
              </button>

              {expandedSections[sectionName] && (
                <div className="space-y-4 mt-2">
                  {Object.entries(sectionSettings).map(
                    ([settingKey, settingValue]) => (
                      <div
                        key={settingKey}
                        className="flex items-center space-x-4 ml-6"
                      >
                        <label
                          htmlFor={settingKey}
                          className="text-sm font-medium w-1/3"
                        >
                          {settingKey.split("-").join(" ")}:
                        </label>
                        <div className="relative w-2/3">
                          <Input
                            id={settingKey}
                            type="text"
                            value={settingValue as string}
                            onChange={handleTokenChange(
                              `${sectionName}.${settingKey}`
                            )}
                            placeholder={`Enter ${settingKey}`}
                            className={`pr-10 ${
                              visibleTokens[settingKey]
                                ? ""
                                : "text-security-disc"
                            }`}
                            autoComplete="off"
                            data-lpignore="true"
                            data-form-type="other"
                            readOnly={false} // Explicitly set to false
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => toggleTokenVisibility(settingKey)}
                          >
                            {visibleTokens[settingKey] ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="mt-4">
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
              zIndex: 9999999,
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
