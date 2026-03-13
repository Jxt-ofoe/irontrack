import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Scale, Plus, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface WeightEntry {
  id: number;
  weight: number;
  date: string;
}

export const WeightTracker: React.FC = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/weight', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    setSaving(true);
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          weight: parseFloat(newWeight),
          date: newDate
        })
      });
      if (res.ok) {
        setNewWeight('');
        fetchEntries();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await fetch(`/api/weight/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = [...entries].reverse().map(e => ({
    date: format(new Date(e.date), 'MMM d'),
    weight: e.weight
  }));

  const currentWeight = entries[0]?.weight;
  const previousWeight = entries[1]?.weight;
  const weightDiff = currentWeight && previousWeight ? currentWeight - previousWeight : 0;

  if (loading) return <div className="p-8 text-gray-400">Loading weight data...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Weight Tracker</h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Track your body composition progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Log Weight Form */}
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gold-500/10 rounded-lg">
              <Scale className="w-6 h-6 text-gold-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Log Today's Weight</h3>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="0.0"
                className="w-full px-4 py-3 bg-[#252525] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 bg-[#252525] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50 shadow-lg shadow-gold-500/20"
            >
              <Plus className="w-5 h-5" />
              {saving ? 'Saving...' : 'Log Weight'}
            </button>
          </form>

          {currentWeight && (
            <div className="mt-8 p-4 bg-[#252525] rounded-xl border border-white/5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Weight</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{currentWeight}kg</span>
                {weightDiff !== 0 && (
                  <span className={`flex items-center text-sm font-bold ${weightDiff < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {weightDiff < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                    {Math.abs(weightDiff).toFixed(1)}kg
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Weight Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Weight Progress</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeightBody" x1="0" y1="0" x2="0" y2="1">
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
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    domain={['dataMin - 2', 'dataMax + 2']}
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
                    fill="url(#colorWeightBody)" 
                    dot={{ fill: '#e6b400', strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History List */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 bg-[#252525] border-b border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Entries</h3>
            </div>
            <div className="divide-y divide-white/5">
              {entries.map((entry) => (
                <div key={entry.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-gray-300">
                      {format(new Date(entry.date), 'MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-bold text-white">{entry.weight}kg</span>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {entries.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  No weight entries yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
