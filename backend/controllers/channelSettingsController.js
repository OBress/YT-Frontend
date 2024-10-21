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

    // Log the update operation for debugging
    // console.log('Update operation:', {
    //   userId,
    //   channelKey,
    //   newSettings
    // });

    const result = await collection.updateOne(
      { [userId]: { $exists: true } },
      { $set: { [`${userId}.channels.${channelKey}`]: newSettings } }
    );

    // Log the result of the update operation
    // console.log('Update result:', result);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User or channel not found' });
    }

    if (result.modifiedCount === 0) {
      return res.status(304).json({ message: 'not_modified' });
    }

    // Fetch the updated document to confirm changes
    const updatedDoc = await collection.findOne({ [userId]: { $exists: true } });
    // console.log('Updated document:', updatedDoc);

    res.json({ message: 'Channel settings updated successfully', updatedSettings: updatedDoc });
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
