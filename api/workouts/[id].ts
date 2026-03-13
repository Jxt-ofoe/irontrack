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
    const { id } = req.query;

    if (req.method === 'PUT') {
      const { exercise, sets, reps, weight, notes, date } = req.body;

      if (!exercise || !sets || !reps || !weight || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await db.execute({
        sql: 'UPDATE workouts SET exercise = ?, sets = ?, reps = ?, weight = ?, notes = ?, date = ? WHERE id = ? AND user_id = ?',
        args: [exercise, sets, reps, weight, notes || null, date, id, user.id]
      });

      return res.json({ message: 'Workout updated successfully' });
    } else if (req.method === 'DELETE') {
      await db.execute({
        sql: 'DELETE FROM workouts WHERE id = ? AND user_id = ?',
        args: [id, user.id]
      });

      return res.json({ message: 'Workout deleted successfully' });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    if (error.message.includes('token')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Workout operation error:', error);
    res.status(500).json({ error: error.message || 'Failed to process workout' });
  }
}
