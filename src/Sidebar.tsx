import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, History, TrendingUp, Trophy, LogOut, Dumbbell, Scale, List, Search, Menu, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Log Workout', icon: PlusCircle },
    { id: 'routines', label: 'Routines', icon: List },
    { id: 'discover', label: 'Discover', icon: Search },
    { id: 'history', label: 'History', icon: History },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'records', label: 'Records', icon: Trophy },
    { id: 'weight', label: 'Weight Tracker', icon: Scale },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#111111] border-b border-white/5 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gold-500 rounded-lg">
            <Dumbbell className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-white">IronTrack</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-gray-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-64 bg-[#111111] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-500 rounded-lg">
                <Dumbbell className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">IronTrack</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-1 overflow-y-auto flex-1 pr-2 -mr-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  activeTab === item.id
                    ? "bg-gold-500 text-black shadow-lg shadow-gold-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 font-bold">
                {user?.name?.[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white truncate w-32">{user?.name}</span>
                <span className="text-xs text-gray-500 truncate w-32">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
