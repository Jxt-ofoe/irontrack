import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { db } from '../../src/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute({
      sql: 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      args: [email, hashedPassword, name]
    });
    res.status(201).json({ message: 'User created successfully' });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed: users.email')) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Signup failed' });
  }
}
