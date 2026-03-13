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
  try {
    const user = authenticateToken(req);

    const totalWorkouts = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM workouts WHERE user_id = ?',
      args: [user.id]
    });
    
    const recentWorkout = await db.execute({
      sql: 'SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 1',
      args: [user.id]
    });

    const personalRecords = await db.execute({
      sql: 'SELECT exercise, MAX(weight) as max_weight FROM workouts WHERE user_id = ? GROUP BY exercise',
      args: [user.id]
    });

    res.json({
      totalWorkouts: totalWorkouts.rows[0].count,
      recentWorkout: recentWorkout.rows[0] || null,
      personalRecords: personalRecords.rows
    });
  } catch (error: any) {
    if (error.message.includes('token')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch stats' });
  }
}
