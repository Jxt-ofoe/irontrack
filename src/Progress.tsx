import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Workout } from './types';
import { TrendingUp, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const Progress: React.FC = () => {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await fetch('/api/workouts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setWorkouts(data);
        const uniqueExercises = Array.from(new Set(data.map((w: Workout) => w.exercise))) as string[];
        setExercises(uniqueExercises);
        if (uniqueExercises.length > 0) setSelectedExercise(uniqueExercises[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, [token]);

  const chartData = workouts
    .filter(w => w.exercise === selectedExercise)
    .slice()
    .reverse()
    .map(w => ({
      date: format(new Date(w.date), 'MMM d'),
      weight: w.weight,
      volume: w.weight * w.sets * w.reps
    }));

  if (loading) return <div className="p-8 text-gray-400">Loading progress...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Strength Progress</h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Visualize your gains over time</p>
        </div>
        
        <div className="w-full md:w-64">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Exercise</label>
          <select
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none appearance-none cursor-pointer"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            {exercises.map(ex => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedExercise ? (
        <div className="bg-[#1a1a1a] p-12 rounded-2xl border border-white/5 text-center">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">Log some workouts to see your progress charts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Weight Progress */}
          <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gold-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="text-xl font-bold text-white">{selectedExercise} Weight Progress</h3>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e6b400" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#e6b400" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value}kg`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#e6b400' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#e6b400" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                    dot={{ fill: '#e6b400', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Volume Progress */}
          <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Total Volume (Weight × Sets × Reps)</h3>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value}kg`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
