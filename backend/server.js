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

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://localhost:5173',
  'https://obress.github.io/YT-Frontend/'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

connectToDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/channel-settings', channelSettingsRouter);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/maker', makerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Conditional HTTPS server creation
let useHttps = true;
try {
  const httpsOptions = {
    key: fs.readFileSync('./certificates/private.key'),
    cert: fs.readFileSync('./certificates/certificate.crt')
  };
  
  https.createServer(httpsOptions, app).listen(httpsPort, () => {
    console.log(`HTTPS Server running on port ${httpsPort}`);
  });
} catch (error) {
  console.error('SSL certificates not found:', error);
  console.log('Running in HTTP-only mode');
  useHttps = false;
}

// Redirect HTTP to HTTPS if HTTPS is enabled
if (useHttps) {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
  });
}

// Start HTTP server if HTTPS is not used
app.listen(port, () => {
  console.log(`HTTP Server running on port ${port}`);
  if (!useHttps) {
    console.log('Running in HTTP-only mode');
  }
});
