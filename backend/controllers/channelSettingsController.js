import { client } from '../config/database.js';
import { google } from 'googleapis';



export async function getChannelSettings(req, res) {
  try {
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');
    const channelSettings = await collection.find({}).toArray();
    
    res.json(channelSettings);
  } catch (error) {
    console.error('Error fetching channel settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getChannelSettingsByUserId(req, res) {
  try {
    const userId = req.params.userId;
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');

    const allChannelSettings = await collection.find({}).toArray();

    let channelSettings = allChannelSettings.find(doc => 
      doc[userId] || doc[parseInt(userId)] || 
      doc.channelId === userId || doc.channelId === parseInt(userId)
    );

    if (!channelSettings) {
      return res.status(404).json({ error: 'User not found' });
    }

    let userData;
    if (channelSettings[userId]) {
      userData = channelSettings[userId];
    } else if (channelSettings[parseInt(userId)]) {
      userData = channelSettings[parseInt(userId)];
    } else {
      userData = channelSettings;
    }
    
    res.json(userData);
  } catch (error) {
    console.error('Error in getChannelSettingsByUserId:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateChannelSettings(req, res) {
  try {
    const userId = req.params.userId;
    const { channelKey, newSettings } = req.body;
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');

    const result = await collection.updateOne(
      { [userId]: { $exists: true } },
      { $set: { [`${userId}.channels.${channelKey}`]: newSettings } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User or channel not found' });
    }

    if (result.modifiedCount === 0) {
      return res.status(304).json({ message: 'not_modified' });
    }

    // Optionally, return the updated channel settings
    const updatedDoc = await collection.findOne({ [userId]: { $exists: true } });
    const updatedSettings = updatedDoc[userId].channels[channelKey];

    res.json({ message: 'Channel settings updated successfully', updatedSettings });
  } catch (error) {
    console.error('Error in updateChannelSettings:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getPresets(req, res) {
  try {
    const userId = req.params.userId;
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');

    // Fetch presets
    const presetsDoc = await collection.findOne({ presets: { $exists: true } });
    
    // Fetch user's channels
    const userDoc = await collection.findOne({ [userId]: { $exists: true } });

    let result = { presets: {}, userChannels: {} };

    if (presetsDoc) {
      result.presets = presetsDoc.presets;
    }

    if (userDoc) {
      result.userChannels = userDoc[userId]?.channels || {};
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching presets and user channels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteChannel(req, res) {
  try {
    const userId = req.params.userId;
    const channelKey = req.params.channelKey;
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');

    const result = await collection.updateOne(
      { [userId]: { $exists: true } },
      { $unset: { [`${userId}.channels.${channelKey}`]: "" } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User or channel not found' });
    }

    if (result.modifiedCount === 0) {
      return res.status(304).json({ message: 'Channel not found or already deleted' });
    }

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Error in deleteChannel:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function extractChannelId(url, youtube) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Handle @username format
    if (pathname.startsWith('/@')) {
      const username = pathname.slice(2); // Remove the '/@' prefix
      // console.log('Searching for username:', username);
      
      // Search for the channel using the YouTube API
      const searchResponse = await youtube.search.list({
        part: 'id,snippet',
        q: username,
        type: 'channel',
        maxResults: 1
      });

      // console.log('Search response:', searchResponse.data);

      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        const channelId = searchResponse.data.items[0].id.channelId;
        // console.log('Found channel ID:', channelId);
        return channelId;
      }
    }
    
    // Handle different YouTube URL formats
    if (pathname.startsWith('/channel/')) {
      return pathname.split('/channel/')[1];
    } else if (pathname.startsWith('/@') || pathname.startsWith('/c/') || pathname.startsWith('/user/')) {
      // Handle custom URLs by searching for the channel
      const customUsername = pathname.split('/')[1].replace('@', '');
      
      // Search for the channel using the YouTube API
      const searchResponse = await youtube.search.list({
        part: 'snippet',
        q: customUsername,
        type: 'channel',
        maxResults: 1
      });

      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        return searchResponse.data.items[0].snippet.channelId;
      }
    } else if (searchParams.has('channel_id')) {
      return searchParams.get('channel_id');
    }
    
    console.log('No matching URL format found');
    return null;
  } catch (error) {
    console.error('Error extracting channel ID:', error);
    return null;
  }
}

export async function addChannel(req, res) {
  try {
    const userId = req.params.userId;
    const { channelUrl, newSettings } = req.body;
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');

    // First, fetch user settings to get their API key
    const userDocument = await collection.findOne({ [userId]: { $exists: true } });
    if (!userDocument || !userDocument[userId]['user-settings']) {
      return res.status(404).json({ error: 'User settings not found' });
    }

    const apiKey = userDocument[userId]['user-settings']['youtube']['youtube-api-key'];
    if (!apiKey) {
      return res.status(400).json({ error: 'YouTube API key not found in user settings' });
    }

    // Initialize YouTube API with user's API key
    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });
    
    // Extract channel ID from URL
    const channelId = await extractChannelId(channelUrl, youtube);
    if (!channelId) {
      return res.status(400).json({ error: 'Invalid YouTube channel URL or channel not found' });
    }

    // Fetch channel details from YouTube API
    const response = await youtube.channels.list({
      part: 'snippet',
      id: channelId
    });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ error: 'YouTube channel not found' });
    }

    const channelName = response.data.items[0].snippet.title;
    const channelKey = channelName;

    // Check if channel already exists
    const existingChannel = await collection.findOne({
      [userId]: { $exists: true },
      [`${userId}.channels.${channelKey}`]: { $exists: true }
    });

    if (existingChannel) {
      return res.status(400).json({ error: 'Channel already exists' });
    }

    const result = await collection.updateOne(
      { [userId]: { $exists: true } },
      { 
        $set: { 
          [`${userId}.channels.${channelKey}`]: {
            url: channelUrl,
            ...newSettings,
          }
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Channel added successfully', 
      addedChannel: {
        url: channelUrl,
        ...newSettings,
        channelId,
        channelName
      }
    });
  } catch (error) {
    console.error('Error in addChannel:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getChannelNamesAndUploadDates(req, res) {
  try {
    const userId = req.params.userId;
    // console.log('Fetching data for userId:', userId);
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');

    const userDocument = await collection.findOne({ [userId]: { $exists: true } });
    // console.log('User document:', userDocument);

    if (!userDocument) {
      return res.status(404).json({ error: 'User not found' });
    }

    const channels = userDocument[userId].channels;
    // console.log('Channels:', channels);

    const channelData = Object.entries(channels).map(([channelName, channelInfo]) => ({
      name: channelName,
      nextUploadDate: channelInfo?.youtube_upload?.next_upload_date || 'Not set'
    }));

    // console.log('Channel data:', channelData);
    res.json(channelData);
  } catch (error) {
    console.error('Error in getChannelNamesAndUploadDates:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
  }
}
