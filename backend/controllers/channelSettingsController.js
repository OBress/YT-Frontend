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
