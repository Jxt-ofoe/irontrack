import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Dumbbell, LogIn, UserPlus } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || 'Server error occurred');
      }

      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      
      if (isLogin) {
        login(data.token, data.user);
      } else {
        setIsLogin(true);
        setError('Account created! Please login.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="max-w-md w-full space-y-8 bg-[#1a1a1a] p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-gold-500 rounded-xl shadow-lg shadow-gold-500/20">
              <Dumbbell className="w-8 h-8 text-black" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            {isLogin ? 'Welcome Back' : 'Join IronTrack'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin ? 'Enter your credentials to access your dashboard' : 'Start tracking your fitness journey today'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`p-3 rounded-lg text-sm ${error.includes('created') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {error}
            </div>
          )}
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-[#2a2a2a] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all outline-none"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-white/5 rounded-xl text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-gold-500 hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all transform hover:scale-[1.02]"
          >
            {isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gold-500 hover:text-gold-400 font-medium transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
