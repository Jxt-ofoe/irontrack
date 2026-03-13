import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, initDb } from "./src/db.ts";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/signup", async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute({
        sql: "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
        args: [email, hashedPassword, name]
      });
      res.status(201).json({ message: "User created" });
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed: users.email")) {
        return res.status(400).json({ error: "An account with this email already exists." });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await db.execute({
        sql: "SELECT * FROM users WHERE email = ?",
        args: [email]
      });
      const user = result.rows[0] as any;

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Workout Routes
  app.get("/api/workouts", authenticateToken, async (req: any, res) => {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC, created_at DESC",
        args: [req.user.id]
      });
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workouts", authenticateToken, async (req: any, res) => {
    const { exercise, sets, reps, weight, notes, date } = req.body;
    try {
      await db.execute({
        sql: "INSERT INTO workouts (user_id, exercise, sets, reps, weight, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [req.user.id, exercise, sets, reps, weight, notes, date]
      });
      res.status(201).json({ message: "Workout added" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/workouts/:id", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const { exercise, sets, reps, weight, notes, date } = req.body;
    try {
      await db.execute({
        sql: "UPDATE workouts SET exercise = ?, sets = ?, reps = ?, weight = ?, notes = ?, date = ? WHERE id = ? AND user_id = ?",
        args: [exercise, sets, reps, weight, notes, date, id, req.user.id]
      });
      res.json({ message: "Workout updated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/workouts/:id", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    try {
      await db.execute({
        sql: "DELETE FROM workouts WHERE id = ? AND user_id = ?",
        args: [id, req.user.id]
      });
      res.json({ message: "Workout deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stats Routes
  app.get("/api/stats", authenticateToken, async (req: any, res) => {
    try {
      const totalWorkouts = await db.execute({
        sql: "SELECT COUNT(*) as count FROM workouts WHERE user_id = ?",
        args: [req.user.id]
      });
      
      const recentWorkout = await db.execute({
        sql: "SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 1",
        args: [req.user.id]
      });

      const personalRecords = await db.execute({
        sql: "SELECT exercise, MAX(weight) as max_weight FROM workouts WHERE user_id = ? GROUP BY exercise",
        args: [req.user.id]
      });

      res.json({
        totalWorkouts: totalWorkouts.rows[0].count,
        recentWorkout: recentWorkout.rows[0] || null,
        personalRecords: personalRecords.rows
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Body Weight Routes
  app.get("/api/weight", authenticateToken, async (req: any, res) => {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM body_weight WHERE user_id = ? ORDER BY date DESC, created_at DESC",
        args: [req.user.id]
      });
      res.json(result.rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/weight", authenticateToken, async (req: any, res) => {
    const { weight, date } = req.body;
    try {
      await db.execute({
        sql: "INSERT INTO body_weight (user_id, weight, date) VALUES (?, ?, ?)",
        args: [req.user.id, weight, date]
      });
      res.status(201).json({ message: "Weight logged" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/weight/:id", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    try {
      await db.execute({
        sql: "DELETE FROM body_weight WHERE id = ? AND user_id = ?",
        args: [id, req.user.id]
      });
      res.json({ message: "Weight entry deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Routine Routes
  app.get("/api/routines", authenticateToken, async (req: any, res) => {
    try {
      const routinesResult = await db.execute({
        sql: "SELECT * FROM routines WHERE user_id = ? ORDER BY created_at DESC",
        args: [req.user.id]
      });
      
      const routines = [];
      for (const routine of routinesResult.rows) {
        const exercisesResult = await db.execute({
          sql: "SELECT * FROM routine_exercises WHERE routine_id = ? ORDER BY order_index ASC",
          args: [routine.id]
        });
        routines.push({
          ...routine,
          exercises: exercisesResult.rows
        });
      }
      res.json(routines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/routines", authenticateToken, async (req: any, res) => {
    const { name, exercises } = req.body;
    try {
      const routineResult = await db.execute({
        sql: "INSERT INTO routines (user_id, name) VALUES (?, ?) RETURNING id",
        args: [req.user.id, name]
      });
      const routineId = routineResult.rows[0].id;

      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        await db.execute({
          sql: "INSERT INTO routine_exercises (routine_id, exercise_name, sets, reps, order_index) VALUES (?, ?, ?, ?, ?)",
          args: [routineId, ex.exercise_name, ex.sets, ex.reps, i]
        });
      }
      res.status(201).json({ id: routineId, name, exercises });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/routines/:id", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    try {
      await db.execute({
        sql: "DELETE FROM routines WHERE id = ? AND user_id = ?",
        args: [id, req.user.id]
      });
      res.json({ message: "Routine deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
