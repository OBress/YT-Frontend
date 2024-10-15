// Types
export type Channel = {
  channels: {
    [key: string]: {
      "channel-settings": {
        "upload-time": string;
      };
      "video-settings": {
        text: { length: number };
        audio: { voiceid: string };
        video: { subtitles: boolean };
        thumbnail: { create: boolean };
      };
    };
  };
};

// Utility functions
export const sanitizeSettings = (
  settings: Record<string, any>
): Record<string, any> => {
  return Object.entries(settings).reduce((acc, [key, value]) => {
    acc[key] = value === null ? "" : value;
    return acc;
  }, {} as Record<string, any>);
};

export const fetchChannelSettings = async (userId: string): Promise<Channel> => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `http://localhost:3001/api/channel-settings/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Channel settings not found. Please set up your channel first.");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};
