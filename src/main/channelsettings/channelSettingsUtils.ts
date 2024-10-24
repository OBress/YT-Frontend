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
    `${import.meta.env.VITE_API_BASE_URL}/api/channel-settings/${userId}`,
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

export async function fetchPresets(userId: string) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/channel-settings/presets/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.warn(`Failed to fetch presets: ${response.status} ${response.statusText}`);
      return { presets: {}, userChannels: {} };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching presets:', error);
    return { presets: {}, userChannels: {} };
  }
}

export async function fetchUserSettings(userId: string) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user-settings/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.warn(`Failed to fetch user settings: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    // Only store and return if settings actually contains data
    if (data.settings && Object.keys(data.settings).length > 0) {
      localStorage.setItem('userData', JSON.stringify(data.settings));
      return data.settings;
    }
    
    // Return null if settings is empty or undefined
    return null;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
}
