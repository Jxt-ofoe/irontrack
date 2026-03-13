import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthPage } from './AuthPage';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { AddWorkout } from './AddWorkout';
import { WorkoutHistory } from './WorkoutHistory';
import { Progress } from './Progress';
import { PersonalRecords } from './PersonalRecords';
import { WeightTracker } from './WeightTracker';
import { Routines } from './Routines';
import { Discover } from './Discover';
import { motion, AnimatePresence } from 'motion/react';

const MainContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAddClick={() => setActiveTab('add')} />;
      case 'add':
        return <AddWorkout onSuccess={() => setActiveTab('history')} />;
      case 'routines':
        return <Routines />;
      case 'discover':
        return <Discover />;
      case 'history':
        return <WorkoutHistory />;
      case 'progress':
        return <Progress />;
      case 'records':
        return <PersonalRecords />;
      case 'weight':
        return <WeightTracker />;
      default:
        return <Dashboard onAddClick={() => setActiveTab('add')} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
