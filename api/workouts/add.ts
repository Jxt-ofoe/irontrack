import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

const authenticateToken = (req: VercelRequest): any => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new Error('No token provided');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = authenticateToken(req);
    const { exercise, sets, reps, weight, notes, date } = req.body;

    if (!exercise || !sets || !reps || !weight || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.execute({
      sql: 'INSERT INTO workouts (user_id, exercise, sets, reps, weight, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [user.id, exercise, sets, reps, weight, notes || null, date]
    });

    res.status(201).json({ message: 'Workout added successfully' });
  } catch (error: any) {
    if (error.message.includes('token')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Add workout error:', error);
    res.status(500).json({ error: error.message || 'Failed to add workout' });
  }
}
