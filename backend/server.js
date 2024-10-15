import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectToDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import channelSettingsRoutes from './routes/channelSettingsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/../.env` });

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

connectToDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/channel-settings', channelSettingsRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
