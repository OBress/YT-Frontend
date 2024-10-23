import { client } from '../config/database.js';

export async function createVideos(req, res) {
  try {
    const { userId, channelNames, videoCount } = req.body;
    console.log('Received request:', req.body);
    if (!userId || !Array.isArray(channelNames) || !videoCount) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');

    const userDocument = await collection.findOne({ [userId]: { $exists: true } });

    if (!userDocument) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userChannels = userDocument[userId].channels;
    const selectedChannels = channelNames.reduce((acc, name) => {
      if (userChannels[name]) {
        acc[name] = userChannels[name];
      }
      return acc;
    }, {});

    // Here you would implement the logic to create videos
    // For now, we'll just return a success message
    res.json({
      message: `Queued ${videoCount} videos for channels: ${channelNames.join(', ')}`,
      selectedChannels,
    });

  } catch (error) {
    console.error('Error in createVideos:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
