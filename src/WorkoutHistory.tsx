import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Workout } from './types';
import { Search, Filter, Trash2, Edit2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export const WorkoutHistory: React.FC = () => {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchWorkouts = async () => {
    try {
      const res = await fetch('/api/workouts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setWorkouts(data);
      setFilteredWorkouts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [token]);

  useEffect(() => {
    let result = workouts;
    if (search) {
      result = result.filter(w => w.exercise.toLowerCase().includes(search.toLowerCase()));
    }
    if (dateFilter) {
      result = result.filter(w => w.date === dateFilter);
    }
    setFilteredWorkouts(result);
  }, [search, dateFilter, workouts]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    try {
      await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWorkouts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading history...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Workout History</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exercise..."
              className="pl-10 pr-4 py-2 bg-[#1a1a1a] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <CalendarIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              className="pl-10 pr-4 py-2 bg-[#1a1a1a] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none w-full sm:w-48"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#252525] border-b border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Exercise</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Sets x Reps</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWorkouts.map((workout) => (
                <tr key={workout.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {format(new Date(workout.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-white">{workout.exercise}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {workout.sets} x {workout.reps}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gold-500">{workout.weight}kg</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {workout.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(workout.id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredWorkouts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No workouts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
