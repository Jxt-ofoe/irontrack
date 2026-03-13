import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Dumbbell, Save, Plus, Trash2, List, ChevronDown } from 'lucide-react';

interface ExerciseEntry {
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
  notes: string;
}

interface RoutineExercise {
  exercise_name: string;
  sets: number;
  reps: number;
}

interface Routine {
  id: number;
  name: string;
  exercises: RoutineExercise[];
}

export const AddWorkout: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { token } = useAuth();
  const [exercises, setExercises] = useState<ExerciseEntry[]>([
    { exercise: '', sets: '', reps: '', weight: '', notes: '' }
  ]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showRoutines, setShowRoutines] = useState(false);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const res = await fetch('/api/routines', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setRoutines(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoutines();
  }, [token]);

  const handleAddExercise = () => {
    setExercises([...exercises, { exercise: '', sets: '', reps: '', weight: '', notes: '' }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof ExerciseEntry, value: string) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleLoadRoutine = (routine: Routine) => {
    const routineExercises = routine.exercises.map(ex => ({
      exercise: ex.exercise_name,
      sets: ex.sets.toString(),
      reps: ex.reps.toString(),
      weight: '',
      notes: ''
    }));
    setExercises(routineExercises);
    setShowRoutines(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (exercises.some(ex => !ex.exercise || !ex.sets || !ex.reps || !ex.weight)) {
      setError('Please fill in all required fields for all exercises');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Log each exercise
      for (const ex of exercises) {
        const res = await fetch('/api/workouts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            exercise: ex.exercise,
            sets: parseInt(ex.sets),
            reps: parseInt(ex.reps),
            weight: parseFloat(ex.weight),
            notes: ex.notes,
            date,
          }),
        });
        if (!res.ok) throw new Error('Failed to save one or more exercises');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold-500 rounded-lg">
            <Dumbbell className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Log Workout</h2>
        </div>

        <div className="relative w-full md:w-auto">
          <button
            onClick={() => setShowRoutines(!showRoutines)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-white/5 rounded-xl text-gray-300 hover:text-white hover:border-gold-500/30 transition-all text-sm font-bold"
          >
            <List className="w-4 h-4 text-gold-500" />
            Load Routine
            <ChevronDown className={`w-4 h-4 transition-transform ${showRoutines ? 'rotate-180' : ''}`} />
          </button>
          
          {showRoutines && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-2 space-y-1">
                {routines.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleLoadRoutine(r)}
                    className="w-full text-left px-4 py-3 hover:bg-gold-500 hover:text-black text-gray-300 rounded-xl transition-all text-sm font-medium"
                  >
                    {r.name}
                  </button>
                ))}
                {routines.length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-xs text-center italic">
                    No routines saved yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm border border-red-500/20">
            {error}
          </div>
        )}

        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Workout Date</label>
          <input
            type="date"
            required
            className="w-full px-4 py-3 bg-[#252525] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {exercises.map((ex, i) => (
            <div key={i} className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 relative group">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-12 flex justify-between items-center border-b border-white/5 pb-4 mb-2">
                  <span className="text-xs font-bold text-gold-500 uppercase tracking-widest">Exercise {i + 1}</span>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(i)}
                      className="text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Exercise Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bench Press"
                    className="w-full px-4 py-3 bg-[#252525] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    value={ex.exercise}
                    onChange={(e) => handleChange(i, 'exercise', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sets</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="w-full px-4 py-3 bg-[#252525] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    value={ex.sets}
                    onChange={(e) => handleChange(i, 'sets', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reps</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="w-full px-4 py-3 bg-[#252525] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    value={ex.reps}
                    onChange={(e) => handleChange(i, 'reps', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-[#252525] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    value={ex.weight}
                    onChange={(e) => handleChange(i, 'weight', e.target.value)}
                  />
                </div>

                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="How did it feel?"
                    className="w-full px-4 py-3 bg-[#252525] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all resize-none"
                    value={ex.notes}
                    onChange={(e) => handleChange(i, 'notes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={handleAddExercise}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#1a1a1a] border border-white/5 text-gray-400 font-bold rounded-xl hover:text-white hover:border-gold-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Another Exercise
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50 shadow-lg shadow-gold-500/20"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save All Exercises'}
          </button>
        </div>
      </form>
    </div>
  );
};

