import { client } from '../config/database.js';

export async function getUserSettings(req, res) {
  try {
    const userId = req.params.userId;
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');

    const userDocument = await collection.findOne({ [userId]: { $exists: true } });

    if (!userDocument) {
      console.log('No user document found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fix: Access the nested structure correctly
    const userSettings = userDocument[userId]['user-settings'];  // Changed from String(userId) to userId

    if (!userSettings) {
      return res.status(404).json({ error: 'User settings not found' });
    }

    res.json({ settings: userSettings });
  } catch (error) {
    console.error('Error in getUserSettings:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateUserSettings(req, res) {
  try {
    const userId = req.params.userId;
    const newSettings = req.body.settings;
    console.log('Updating settings for userId:', userId);
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');

    const result = await collection.updateOne(
      { [userId]: { $exists: true } },
      { $set: { [`${userId}.user-settings`]: newSettings } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (result.modifiedCount === 0) {
      return res.status(304).json({ message: 'Settings not modified' });
    }

    res.json({ message: 'User settings updated successfully' });
  } catch (error) {
    console.error('Error in updateUserSettings:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
