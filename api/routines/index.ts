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

    if (req.method === 'GET') {
      const routinesResult = await db.execute({
        sql: 'SELECT * FROM routines WHERE user_id = ? ORDER BY created_at DESC',
        args: [user.id]
      });
      
      const routines = [];
      for (const routine of routinesResult.rows) {
        const exercisesResult = await db.execute({
          sql: 'SELECT * FROM routine_exercises WHERE routine_id = ? ORDER BY order_index ASC',
          args: [routine.id]
        });
        routines.push({
          ...routine,
          exercises: exercisesResult.rows
        });
      }
      return res.json(routines);
    } else if (req.method === 'POST') {
      const { name, exercises } = req.body;

      if (!name || !exercises || !Array.isArray(exercises)) {
        return res.status(400).json({ error: 'Name and exercises array are required' });
      }

      const routineResult = await db.execute({
        sql: 'INSERT INTO routines (user_id, name) VALUES (?, ?) RETURNING id',
        args: [user.id, name]
      });

      const routineId = routineResult.rows[0].id;

      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        await db.execute({
          sql: 'INSERT INTO routine_exercises (routine_id, exercise_name, sets, reps, order_index) VALUES (?, ?, ?, ?, ?)',
          args: [routineId, ex.exercise_name, ex.sets, ex.reps, i]
        });
      }

      return res.status(201).json({ id: routineId, name, exercises });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    if (error.message.includes('token')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Routines error:', error);
    res.status(500).json({ error: error.message || 'Failed to process routines' });
  }
}
