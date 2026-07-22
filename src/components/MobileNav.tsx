import React from 'react';
import { User } from '../types';
import { Home, Gamepad2, Trophy, User as UserIcon, Shield } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-16 px-4 bg-[#0c0e16]/95 backdrop-blur-xl border-t border-[#3b494b]/30 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeTab === 'home'
            ? 'text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,219,233,0.5)] scale-105'
            : 'text-[#b9cacb]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="font-display text-[10px] uppercase font-bold mt-0.5">Home</span>
      </button>

      <button
        onClick={() => setActiveTab('tournaments')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeTab === 'tournaments'
            ? 'text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,219,233,0.5)] scale-105'
            : 'text-[#b9cacb]'
        }`}
      >
        <Gamepad2 className="w-5 h-5" />
        <span className="font-display text-[10px] uppercase font-bold mt-0.5">Compete</span>
      </button>

      <button
        onClick={() => setActiveTab('rankings')}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
          activeTab === 'rankings'
            ? 'text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,219,233,0.5)] scale-105'
            : 'text-[#b9cacb]'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="font-display text-[10px] uppercase font-bold mt-0.5">Rankings</span>
      </button>

      {currentUser?.role === 'admin' ? (
        <button
          onClick={() => setActiveTab('admin-dashboard')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeTab === 'admin-dashboard'
              ? 'text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,219,233,0.5)] scale-105'
              : 'text-[#b9cacb]'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="font-display text-[10px] uppercase font-bold mt-0.5">Admin</span>
        </button>
      ) : (
        <button
          onClick={() => setActiveTab('user-dashboard')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeTab === 'user-dashboard'
              ? 'text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,219,233,0.5)] scale-105'
              : 'text-[#b9cacb]'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="font-display text-[10px] uppercase font-bold mt-0.5">Profile</span>
        </button>
      )}
    </nav>
  );
};
