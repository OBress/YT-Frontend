import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectToDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import channelSettingsRouter from './routes/channelSettingsRoutes.js';
import userSettingsRoutes from './routes/userSettingsRoutes.js';
import makerRoutes from './routes/makerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/../.env` });

const app = express();
const port = process.env.PORT || 3001;
const httpsPort = process.env.HTTPS_PORT || 3443;

app.use(cors());
app.use(express.json());

connectToDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/channel-settings', channelSettingsRouter);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/maker', makerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Modify the HTTPS server creation to be conditional
let useHttps = false;
try {
  if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
    const httpsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };
    
    https.createServer(httpsOptions, app).listen(httpsPort, () => {
      console.log(`HTTPS Server running on port ${httpsPort}`);
    });
    useHttps = true;
  }
} catch (error) {
  console.log('SSL certificates not found, running in HTTP-only mode');
}

// Only use HTTPS redirect middleware if HTTPS is enabled
if (useHttps) {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
  });
}

// HTTP server (now primary if HTTPS is not available)
app.listen(port, () => {
  console.log(`HTTP Server running on port ${port}`);
  if (!useHttps) {
    console.log('Running in HTTP-only mode');
  }
});
