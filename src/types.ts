export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Workout {
  id: number;
  user_id: number;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
  date: string;
  created_at: string;
}

export interface Stats {
  totalWorkouts: number;
  recentWorkout: Workout | null;
  personalRecords: { exercise: string; max_weight: number }[];
}
