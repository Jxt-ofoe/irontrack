import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Plus, Trash2, Dumbbell, Save, X, ChevronRight, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

export const Routines: React.FC = () => {
  const { token } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newExercises, setNewExercises] = useState<RoutineExercise[]>([{ exercise_name: '', sets: 3, reps: 10 }]);
  const [loading, setLoading] = useState(true);

  const fetchRoutines = async () => {
    try {
      const res = await fetch('/api/routines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRoutines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [token]);

  const handleAddExercise = () => {
    setNewExercises([...newExercises, { exercise_name: '', sets: 3, reps: 10 }]);
  };

  const handleRemoveExercise = (index: number) => {
    setNewExercises(newExercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: keyof RoutineExercise, value: string | number) => {
    const updated = [...newExercises];
    updated[index] = { ...updated[index], [field]: value };
    setNewExercises(updated);
  };

  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName || newExercises.some(ex => !ex.exercise_name)) return;

    try {
      const res = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newRoutineName,
          exercises: newExercises
        })
      });

      if (res.ok) {
        setIsAdding(false);
        setNewRoutineName('');
        setNewExercises([{ exercise_name: '', sets: 3, reps: 10 }]);
        fetchRoutines();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRoutine = async (id: number) => {
    if (!confirm('Are you sure you want to delete this routine?')) return;
    try {
      await fetch(`/api/routines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRoutines();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading routines...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Workout Routines</h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Create templates for your favorite workouts</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20"
          >
            <Plus className="w-5 h-5" />
            New Routine
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white">Create New Routine</h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Routine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Push Day, Full Body, Leg Power"
                  className="w-full px-4 py-4 bg-[#252525] border border-white/5 rounded-2xl text-white text-lg focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Exercises</label>
                {newExercises.map((ex, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-[#252525] p-4 rounded-2xl border border-white/5">
                    <div className="md:col-span-6">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Exercise Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Bench Press"
                        className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                        value={ex.exercise_name}
                        onChange={(e) => handleExerciseChange(i, 'exercise_name', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Sets</label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(i, 'sets', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Reps</label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(i, 'reps', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(i)}
                        disabled={newExercises.length === 1}
                        className="p-2 text-gray-500 hover:text-red-500 disabled:opacity-0 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-gray-500 hover:text-gold-500 hover:border-gold-500/30 transition-all flex items-center justify-center gap-2 font-bold"
                >
                  <Plus className="w-5 h-5" />
                  Add Exercise
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gold-500 text-black font-bold rounded-2xl hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20"
                >
                  <Save className="w-5 h-5" />
                  Save Routine
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routines.map((routine) => (
          <motion.div
            key={routine.id}
            layout
            className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden group hover:border-gold-500/30 transition-all shadow-xl"
          >
            <div className="p-6 bg-gradient-to-br from-white/5 to-transparent border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-500/10 rounded-xl">
                  <List className="w-5 h-5 text-gold-500" />
                </div>
                <h3 className="text-xl font-bold text-white">{routine.name}</h3>
              </div>
              <button
                onClick={() => handleDeleteRoutine(routine.id)}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {routine.exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300 font-medium">{ex.exercise_name}</span>
                  <span className="text-gray-500 font-bold">{ex.sets} × {ex.reps}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
        {routines.length === 0 && !isAdding && (
          <div className="md:col-span-2 py-20 text-center space-y-4 bg-[#1a1a1a] rounded-3xl border border-dashed border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Dumbbell className="w-8 h-8 text-gray-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No routines yet</h3>
              <p className="text-gray-500">Create templates to log your workouts faster.</p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="px-6 py-2 bg-gold-500/10 text-gold-500 font-bold rounded-xl hover:bg-gold-500 hover:text-black transition-all"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
