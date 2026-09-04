import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurator } from '../context/CuratorContext';
import { Gamepad2, Trophy, User, Crown, History } from 'lucide-react';
import { MainTabType } from './Sidebar';

interface MobileNavbarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const { isUserCurator } = useCurator();

  return (
    <div id="mobile-nav-bar" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1424]/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around">
      <button
        id="mobile-nav-game"
        onClick={() => setActiveTab('game')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
          activeTab === 'game' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <Gamepad2 className="w-5 h-5" />
        <span className="text-[10px] mt-1">Hra</span>
      </button>

      <button
        id="mobile-nav-curator"
        onClick={() => setActiveTab('curator')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
          activeTab === 'curator' ? 'text-amber-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <Crown className="w-5 h-5" />
        <span className="text-[10px] mt-1">Kurátor</span>
      </button>

      <button
        id="mobile-nav-history"
        onClick={() => setActiveTab('history')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
          activeTab === 'history' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <History className="w-5 h-5" />
        <span className="text-[10px] mt-1">Archiv</span>
      </button>

      <button
        id="mobile-nav-leaderboard"
        onClick={() => setActiveTab('leaderboard')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
          activeTab === 'leaderboard' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="text-[10px] mt-1">Žebříček</span>
      </button>

      <button
        id="mobile-nav-profile"
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
          activeTab === 'profile' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <div className="relative">
          <User className="w-5 h-5" />
          {user && (
            <span className="absolute -top-1 -right-2 text-[8px] bg-amber-500 text-slate-950 font-bold px-1 rounded-full">
              {user.stats.currentStreak}🔥
            </span>
          )}
        </div>
        <span className="text-[10px] mt-1">Profil</span>
      </button>
    </div>
  );
};
