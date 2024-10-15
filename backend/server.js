import express from 'express';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import cors from 'cors';  // Add this import
import dotenv from 'dotenv'; 

const app = express();
const port = 3001; // Choose a port for your server

// Enable CORS for all routes
app.use(cors());  // Add this line

dotenv.config();

const uri = process.env.VITE_MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsAllowInvalidCertificates: true
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();

app.get('/api/channel-settings', async (req, res) => {
  try {
    const database = client.db('YouTube-Dashboard');
    const collection = database.collection('everything');
    const channelSettings = await collection.find({}).toArray();
    
    
    res.json(channelSettings);
  } catch (error) {
    console.error('Error fetching channel settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/channel-settings/:userId', async (req, res) => {
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
    console.error('Error in /api/channel-settings/:userId:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
