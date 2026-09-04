import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurator } from '../context/CuratorContext';
import { 
  Gamepad2, 
  Trophy, 
  User as UserIcon, 
  Flame, 
  LogOut, 
  Sparkles,
  Calendar,
  Crown,
  History
} from 'lucide-react';
import { getFormattedCzechDate, getTodayDateString } from '../data/words';

export type MainTabType = 'game' | 'curator' | 'history' | 'leaderboard' | 'profile';

interface SidebarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  selectedCategoryTitle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { isUserCurator } = useCurator();
  const todayStr = getTodayDateString();

  return (
    <aside id="app-sidebar" className="hidden lg:flex w-64 bg-[#0d1424] border-r border-slate-800 flex-col p-6 select-none">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/30">
          <span className="text-white font-black text-xl tracking-tighter">!</span>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            NE! <span className="text-amber-400">Naopak!</span>
          </h1>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            1 slovo denně pro tým
          </span>
        </div>
      </div>

      {/* Date Indicator */}
      <div className="mb-6 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center space-x-2.5">
        <Calendar className="w-4 h-4 text-indigo-400" />
        <div className="text-xs">
          <div className="text-slate-500 font-medium text-[10px] uppercase tracking-wider">Dnešní výzva</div>
          <div className="text-slate-200 font-semibold truncate capitalize">
            {getFormattedCzechDate(todayStr).split(',')[0]}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 space-y-2">
        <button
          id="nav-tab-game"
          onClick={() => setActiveTab('game')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'game'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-950/40'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span>Hlavní hra</span>
        </button>

        <button
          id="nav-tab-curator"
          onClick={() => setActiveTab('curator')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'curator'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-950/40'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <Crown className="w-5 h-5 text-amber-400" />
          <div className="text-left flex-1">
            <div className="flex items-center justify-between">
              <span>Kurátor dne</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                4 slova AI
              </span>
            </div>
          </div>
        </button>

        <button
          id="nav-tab-history"
          onClick={() => setActiveTab('history')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-950/40'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5 text-cyan-400" />
          <span>Historie & Archiv</span>
        </button>

        <button
          id="nav-tab-leaderboard"
          onClick={() => setActiveTab('leaderboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-950/40'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>Celkový žebříček</span>
        </button>

        <button
          id="nav-tab-profile"
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'profile'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-950/40'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span>Můj profil</span>
        </button>
      </nav>

      {/* User Capsule */}
      {user && (
        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-800 flex-shrink-0 shadow-md">
                {user.avatarSeed}
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1.5 truncate">
                  <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                  {user.isAdmin && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-xs text-amber-400 font-medium">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Série: {user.stats.currentStreak} dní</span>
                </div>
              </div>
            </div>

            <button
              id="btn-logout"
              onClick={logout}
              title="Odhlásit se"
              className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Celkové skóre</span>
            <span className="font-mono font-bold text-indigo-400">{user.stats.totalScore.toLocaleString()} b.</span>
          </div>
        </div>
      )}
    </aside>
  );
};
