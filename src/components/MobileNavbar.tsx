import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, Trophy, User, Database, Flame, BookOpenCheck } from 'lucide-react';

interface MobileNavbarProps {
  activeTab: 'game' | 'leaderboard' | 'profile' | 'terminology' | 'schema';
  setActiveTab: (tab: 'game' | 'leaderboard' | 'profile' | 'terminology' | 'schema') => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  return (
    <div id="mobile-nav-bar" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1424]/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around">
      <button
        id="mobile-nav-game"
        onClick={() => setActiveTab('game')}
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
          activeTab === 'game' ? 'text-indigo-400' : 'text-slate-400'
        }`}
      >
        <Gamepad2 className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-1">Hra</span>
      </button>

      <button
        id="mobile-nav-terminology"
        onClick={() => setActiveTab('terminology')}
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
          activeTab === 'terminology' ? 'text-emerald-400' : 'text-slate-400'
        }`}
      >
        <BookOpenCheck className="w-5 h-5 text-emerald-400" />
        <span className="text-[10px] font-semibold mt-1">Slovník</span>
      </button>

      <button
        id="mobile-nav-leaderboard"
        onClick={() => setActiveTab('leaderboard')}
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
          activeTab === 'leaderboard' ? 'text-indigo-400' : 'text-slate-400'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-1">Žebříček</span>
      </button>

      <button
        id="mobile-nav-profile"
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
          activeTab === 'profile' ? 'text-indigo-400' : 'text-slate-400'
        }`}
      >
        <div className="relative">
          <User className="w-5 h-5" />
          {user && (
            <span className="absolute -top-1 -right-2 text-[9px] bg-amber-500 text-slate-950 font-bold px-1 rounded-full">
              {user.stats.currentStreak}🔥
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold mt-1">Profil</span>
      </button>

      <button
        id="mobile-nav-schema"
        onClick={() => setActiveTab('schema')}
        className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
          activeTab === 'schema' ? 'text-indigo-400' : 'text-slate-400'
        }`}
      >
        <Database className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-1">Schéma</span>
      </button>
    </div>
  );
};
