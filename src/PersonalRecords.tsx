import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Trophy, Medal, Star } from 'lucide-react';

export const PersonalRecords: React.FC = () => {
  const { token } = useAuth();
  const [records, setRecords] = useState<{ exercise: string; max_weight: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setRecords(data.personalRecords);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="p-8 text-gray-400">Loading records...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex p-3 md:p-4 bg-gold-500/10 rounded-2xl mb-4">
          <Trophy className="w-10 h-10 md:w-12 md:h-12 text-gold-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">Hall of Fame</h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">Your all-time personal bests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {records.map((record, i) => (
          <div 
            key={i} 
            className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 flex items-center justify-between hover:border-gold-500/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl group-hover:bg-gold-500/10 transition-colors">
                {i === 0 ? <Star className="w-6 h-6 text-gold-500" /> : <Medal className="w-6 h-6 text-gray-400" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{record.exercise}</h3>
                <p className="text-sm text-gray-500">Personal Record</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-gold-500">{record.max_weight}</span>
              <span className="text-sm font-bold text-gold-500/60 ml-1">kg</span>
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <div className="col-span-full py-20 text-center bg-[#1a1a1a] rounded-2xl border border-dashed border-white/10">
            <p className="text-gray-500">No records found. Start lifting to set some PRs!</p>
          </div>
        )}
      </div>
    </div>
  );
};
