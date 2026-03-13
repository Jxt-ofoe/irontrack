import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Search, Dumbbell, ChevronRight, Plus, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Exercise {
  name: string;
  category: string;
  description: string;
  tips: string[];
}

interface SampleRoutine {
  name: string;
  description: string;
  exercises: { exercise_name: string; sets: number; reps: number }[];
}

const EXERCISES: Exercise[] = [
  {
    name: 'Bench Press',
    category: 'Chest',
    description: 'A classic compound movement for building chest strength and mass.',
    tips: ['Keep your feet flat on the floor', 'Retract your shoulder blades', 'Lower the bar to mid-chest']
  },
  {
    name: 'Squats',
    category: 'Legs',
    description: 'The king of all leg exercises, targeting quads, hamstrings, and glutes.',
    tips: ['Keep your back straight', 'Go down until thighs are parallel to floor', 'Drive through your heels']
  },
  {
    name: 'Deadlift',
    category: 'Back/Legs',
    description: 'A powerful full-body movement focusing on the posterior chain.',
    tips: ['Keep the bar close to your shins', 'Engage your core', 'Don\'t round your back']
  },
  {
    name: 'Overhead Press',
    category: 'Shoulders',
    description: 'Build strong, stable shoulders with this vertical push.',
    tips: ['Squeeze your glutes', 'Keep your core tight', 'Press the bar in a straight line']
  },
  {
    name: 'Pull-ups',
    category: 'Back',
    description: 'The ultimate bodyweight test for upper body pulling strength.',
    tips: ['Pull your chest to the bar', 'Control the descent', 'Engage your lats']
  },
  {
    name: 'Bent Over Rows',
    category: 'Back',
    description: 'Great for building back thickness and improving posture.',
    tips: ['Pull the bar to your lower stomach', 'Keep your torso stable', 'Squeeze your back at the top']
  },
  {
    name: 'Dumbbell Bicep Curls',
    category: 'Arms',
    description: 'Isolation movement for building the biceps.',
    tips: ['Don\'t swing your arms', 'Keep elbows at your sides', 'Squeeze at the top']
  },
  {
    name: 'Tricep Pushdowns',
    category: 'Arms',
    description: 'Effective isolation for the back of the arms.',
    tips: ['Keep elbows tucked in', 'Full extension at the bottom', 'Control the weight']
  }
];

const SAMPLE_ROUTINES: SampleRoutine[] = [
  {
    name: 'Full Body Starter',
    description: 'Perfect for beginners or those with limited time.',
    exercises: [
      { exercise_name: 'Squats', sets: 3, reps: 10 },
      { exercise_name: 'Bench Press', sets: 3, reps: 10 },
      { exercise_name: 'Bent Over Rows', sets: 3, reps: 10 },
      { exercise_name: 'Overhead Press', sets: 3, reps: 10 }
    ]
  },
  {
    name: 'Push Day (Strength)',
    description: 'Focus on chest, shoulders, and triceps.',
    exercises: [
      { exercise_name: 'Bench Press', sets: 4, reps: 6 },
      { exercise_name: 'Overhead Press', sets: 3, reps: 8 },
      { exercise_name: 'Incline DB Press', sets: 3, reps: 10 },
      { exercise_name: 'Tricep Pushdowns', sets: 3, reps: 12 }
    ]
  },
  {
    name: 'Pull Day (Hypertrophy)',
    description: 'Focus on back and biceps.',
    exercises: [
      { exercise_name: 'Deadlift', sets: 3, reps: 5 },
      { exercise_name: 'Pull-ups', sets: 3, reps: 10 },
      { exercise_name: 'Seated Cable Rows', sets: 3, reps: 12 },
      { exercise_name: 'Bicep Curls', sets: 3, reps: 12 }
    ]
  }
];

export const Discover: React.FC = () => {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [addingRoutine, setAddingRoutine] = useState<string | null>(null);

  const filteredExercises = EXERCISES.filter(ex => 
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddRoutine = async (routine: SampleRoutine) => {
    setAddingRoutine(routine.name);
    try {
      const res = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: routine.name,
          exercises: routine.exercises
        })
      });
      if (res.ok) {
        setTimeout(() => setAddingRoutine(null), 2000);
      }
    } catch (err) {
      console.error(err);
      setAddingRoutine(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Discover</h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">Explore exercises and starter routines</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search exercises or muscle groups..."
          className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Exercise Library */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-gold-500" />
            Exercise Library
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map((ex) => (
              <button
                key={ex.name}
                onClick={() => setSelectedExercise(ex)}
                className="p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl text-left hover:border-gold-500/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gold-500 uppercase tracking-widest">{ex.category}</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gold-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white">{ex.name}</h3>
              </button>
            ))}
          </div>
        </div>

        {/* Starter Routines */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-gold-500" />
            Starter Routines
          </h2>
          <div className="space-y-4">
            {SAMPLE_ROUTINES.map((routine) => (
              <div key={routine.name} className="p-6 bg-[#1a1a1a] border border-white/5 rounded-2xl space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{routine.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{routine.description}</p>
                </div>
                <div className="space-y-2">
                  {routine.exercises.slice(0, 3).map((ex, i) => (
                    <div key={i} className="text-xs text-gray-400 flex justify-between">
                      <span>{ex.exercise_name}</span>
                      <span>{ex.sets}x{ex.reps}</span>
                    </div>
                  ))}
                  {routine.exercises.length > 3 && (
                    <div className="text-[10px] text-gray-600">+{routine.exercises.length - 3} more exercises</div>
                  )}
                </div>
                <button
                  onClick={() => handleAddRoutine(routine)}
                  disabled={addingRoutine === routine.name}
                  className="w-full py-2 bg-white/5 text-white text-sm font-bold rounded-xl hover:bg-gold-500 hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  {addingRoutine === routine.name ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Routines
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add to My Routines
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1a1a1a] w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-gold-500 uppercase tracking-widest">{selectedExercise.category}</span>
                    <h2 className="text-2xl font-bold text-white mt-1">{selectedExercise.name}</h2>
                  </div>
                  <button onClick={() => setSelectedExercise(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                    <Plus className="w-6 h-6 text-gray-500 rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-gray-300 leading-relaxed">{selectedExercise.description}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Info className="w-4 h-4 text-gold-500" />
                      Pro Tips
                    </h4>
                    <ul className="space-y-2">
                      {selectedExercise.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedExercise(null)}
                  className="w-full py-4 bg-gold-500 text-black font-bold rounded-2xl hover:bg-gold-400 transition-all"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
