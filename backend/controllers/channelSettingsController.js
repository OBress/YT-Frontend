import { client } from '../config/database.js';

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

export async function addChannel(req, res) {
  try {
    const userId = req.params.userId;
    const { channelKey, newSettings } = req.body;
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');

    const result = await collection.updateOne(
      { [userId]: { $exists: true } },
      { $set: { [`${userId}.channels.${channelKey}`]: newSettings } },
      { upsert: true }
    );

    if (result.upsertedCount === 0 && result.modifiedCount === 0) {
      return res.status(304).json({ message: 'Channel not added or already exists' });
    }

    res.json({ message: 'Channel added successfully', addedChannel: newSettings });
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
