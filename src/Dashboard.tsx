import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Stats, Workout } from './types';
import { Trophy, Calendar, Dumbbell, ArrowUpRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC<{ onAddClick: () => void }> = ({ onAddClick }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, workoutsRes] = await Promise.all([
          fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/workouts', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const statsData = await statsRes.json();
        const workoutsData = await workoutsRes.json();
        setStats(statsData);
        setRecentWorkouts(workoutsData.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="p-8 text-gray-400">Loading dashboard...</div>;

  const chartData = recentWorkouts
    .slice()
    .reverse()
    .map(w => ({
      date: format(new Date(w.date), 'MMM d'),
      weight: w.weight
    }));

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
        <button
          onClick={onAddClick}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-gold-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Workout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gold-500/10 rounded-lg">
              <Dumbbell className="w-6 h-6 text-gold-500" />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium">Total Workouts</p>
          <h3 className="text-3xl font-bold text-white mt-1">{stats?.totalWorkouts || 0}</h3>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Trophy className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium">Personal Records</p>
          <h3 className="text-3xl font-bold text-white mt-1">{stats?.personalRecords.length || 0}</h3>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium">Recent Activity</p>
          <h3 className="text-xl font-bold text-white mt-1 truncate">
            {stats?.recentWorkout ? `${stats.recentWorkout.exercise} - ${stats.recentWorkout.weight}kg` : 'No recent workouts'}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Strength Progress</h3>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Last 5 Sessions</span>
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
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#e6b400' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#e6b400" 
                  strokeWidth={3} 
                  dot={{ fill: '#e6b400', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PRs Sidebar */}
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Top Records</h3>
            <Trophy className="w-5 h-5 text-gold-500" />
          </div>
          <div className="space-y-4">
            {stats?.personalRecords.slice(0, 5).map((pr, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#252525] rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">{pr.exercise}</p>
                  <p className="text-xs text-gray-500">Max Weight</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gold-500">{pr.max_weight}kg</p>
                </div>
              </div>
            ))}
            {(!stats?.personalRecords || stats.personalRecords.length === 0) && (
              <p className="text-center text-gray-500 py-8">No records yet. Keep lifting!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
