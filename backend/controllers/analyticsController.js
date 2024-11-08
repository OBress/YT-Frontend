import { client } from '../config/database.js';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

async function getYouTubeAnalytics(channelId, apiKey) {
  try {
    const response = await youtube.channels.list({
      part: ['statistics', 'snippet'],
      id: [channelId],
      key: apiKey
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channelStats = response.data.items[0].statistics;
    const channelName = response.data.items[0].snippet.title;

    return {
      name: channelName,
      views: parseInt(channelStats.viewCount) || 0,
      likes: parseInt(channelStats.likeCount) || 0,
      comments: parseInt(channelStats.commentCount) || 0,
      subscribers: parseInt(channelStats.subscriberCount) || 0,
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`Error fetching YouTube analytics for channel ${channelId}:`, error);
    throw error;
  }
}

export async function updateChannelAnalytics(req, res) {
  try {
    const userId = req.params.userId;
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');

    // Get user document
    const userDoc = await collection.findOne({ [userId]: { $exists: true } });
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get YouTube API key from user settings
    const apiKey = userDoc[userId]['user-settings']?.youtube;
    if (!apiKey) {
      return res.status(400).json({ error: 'YouTube API key not found in user settings' });
    }

    // Get all channels for the user
    const channels = userDoc[userId].channels;
    if (!channels) {
      return res.status(404).json({ error: 'No channels found for user' });
    }

    // Gather analytics for each channel
    const analyticsPromises = Object.entries(channels).map(async ([channelKey, channelData]) => {
      try {
        const channelId = channelData.youtube_channel_id;
        if (!channelId) {
          return {
            name: channelKey,
            error: 'No YouTube channel ID found'
          };
        }

        const analytics = await getYouTubeAnalytics(channelId, apiKey);
        
        // Update analytics in database
        await collection.updateOne(
          { [userId]: { $exists: true } },
          { 
            $set: { 
              [`${userId}.channels.${channelKey}.analytics`]: analytics 
            } 
          }
        );

        return analytics;
      } catch (error) {
        return {
          name: channelKey,
          error: error.message
        };
      }
    });

    const analyticsResults = await Promise.all(analyticsPromises);

    // Filter out errors and format response
    const successfulAnalytics = analyticsResults.filter(result => !result.error);
    const failedAnalytics = analyticsResults.filter(result => result.error);

    res.json({
      analytics: successfulAnalytics,
      errors: failedAnalytics
    });

  } catch (error) {
    console.error('Error in updateChannelAnalytics:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
