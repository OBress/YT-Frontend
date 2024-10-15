import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { client } from '../config/database.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const database = client.db('YouTube-Dashboard');
    const usersCollection = database.collection('users');

    // Find the document containing the user
    const userDocument = await usersCollection.findOne({ [username]: { $exists: true } });

    if (!userDocument) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = userDocument[username];

    // Compare the provided password with the stored passcode
    if (password !== user.passcode) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userId: user.id });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
