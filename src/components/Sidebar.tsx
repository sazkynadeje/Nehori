import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Gamepad2, 
  Trophy, 
  User as UserIcon, 
  Flame, 
  LogOut, 
  Database, 
  Sparkles,
  Calendar,
  BookOpenCheck
} from 'lucide-react';
import { getFormattedCzechDate, getTodayDateString } from '../data/words';

interface SidebarProps {
  activeTab: 'game' | 'leaderboard' | 'profile' | 'terminology' | 'schema';
  setActiveTab: (tab: 'game' | 'leaderboard' | 'profile' | 'terminology' | 'schema') => void;
  selectedCategoryTitle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const todayStr = getTodayDateString();

  return (
    <aside id="app-sidebar" className="hidden lg:flex w-64 bg-[#0d1424] border-r border-slate-800 flex-col p-6 select-none">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <span className="text-white font-extrabold text-xl">K</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">KORPO-LINGVO</h1>
          <span className="text-[10px] text-indigo-400 font-mono font-semibold uppercase tracking-wider block">
            Team 10 Edition
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
          id="nav-tab-terminology"
          onClick={() => setActiveTab('terminology')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'terminology'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-950/40'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <BookOpenCheck className="w-5 h-5 text-emerald-400" />
          <div className="flex items-center justify-between w-full">
            <span>Kontrola slov</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Správa
            </span>
          </div>
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

        <button
          id="nav-tab-schema"
          onClick={() => setActiveTab('schema')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'schema'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-950/40'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <Database className="w-5 h-5" />
          <span>Firestore Schéma</span>
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
                <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
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
