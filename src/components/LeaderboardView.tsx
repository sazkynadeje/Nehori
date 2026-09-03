import React, { useState, useEffect } from 'react';
import { ColleagueRank, UserProfile } from '../types';
import { INITIAL_TEAM_COLLEAGUES } from '../data/team';
import { ColleagueProfileModal } from './ColleagueProfileModal';
import { useAuth } from '../context/AuthContext';
import { fetchAllUsersFromFirestore } from '../services/firebase';
import { Trophy, Medal, Flame, Search, ArrowUpDown, Filter, Award, ChevronRight, User, Database, RefreshCw } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedColleague, setSelectedColleague] = useState<ColleagueRank | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'streak' | 'rate'>('score');
  const [firestoreUsers, setFirestoreUsers] = useState<UserProfile[]>([]);
  const [loadingFirestore, setLoadingFirestore] = useState<boolean>(false);

  const loadFirestoreUsers = async () => {
    try {
      setLoadingFirestore(true);
      const list = await fetchAllUsersFromFirestore();
      setFirestoreUsers(list);
    } catch (e) {
      console.warn('Could not fetch firestore users for leaderboard:', e);
    } finally {
      setLoadingFirestore(false);
    }
  };

  useEffect(() => {
    loadFirestoreUsers();
  }, []);

  // Combine initial team colleagues + real Firestore users + currently logged in user
  let combinedRoster: ColleagueRank[] = [...INITIAL_TEAM_COLLEAGUES];

  // Merge Firestore users
  firestoreUsers.forEach((fu) => {
    const asRank: ColleagueRank = {
      uid: fu.uid,
      displayName: fu.displayName,
      department: fu.department,
      role: fu.role,
      avatarSeed: fu.avatarSeed,
      totalScore: fu.stats.totalScore,
      currentStreak: fu.stats.currentStreak,
      gamesWon: fu.stats.gamesWon,
      successRate: fu.stats.gamesPlayed > 0 ? Math.round((fu.stats.gamesWon / fu.stats.gamesPlayed) * 100) : 100,
      badgesCount: fu.badges.length,
      lastActive: 'Firebase hráč'
    };
    const idx = combinedRoster.findIndex(c => c.uid === fu.uid || c.displayName === fu.displayName);
    if (idx >= 0) {
      combinedRoster[idx] = asRank;
    } else {
      combinedRoster.push(asRank);
    }
  });

  if (user) {
    const userAsRank: ColleagueRank = {
      uid: user.uid,
      displayName: user.displayName,
      department: user.department,
      role: user.role,
      avatarSeed: user.avatarSeed,
      totalScore: user.stats.totalScore,
      currentStreak: user.stats.currentStreak,
      gamesWon: user.stats.gamesWon,
      successRate: user.stats.gamesPlayed > 0 ? Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100) : 100,
      badgesCount: user.badges.length,
      lastActive: 'Právě aktivní'
    };

    const existingIdx = combinedRoster.findIndex(c => c.uid === user.uid || c.displayName === user.displayName);
    if (existingIdx >= 0) {
      combinedRoster[existingIdx] = userAsRank;
    } else {
      combinedRoster.push(userAsRank);
    }
  }

  // Filter & Search
  let filtered = combinedRoster.filter((colleague) => {
    const matchesSearch = colleague.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          colleague.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          colleague.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || colleague.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'streak') return b.currentStreak - a.currentStreak;
    if (sortBy === 'rate') return b.successRate - a.successRate;
    return b.totalScore - a.totalScore;
  });

  const departments = ['all', ...Array.from(new Set(combinedRoster.map(c => c.department)))];

  const getRankMedal = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold font-mono text-xs">
          🥇 1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-lg bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center font-bold font-mono text-xs">
          🥈 2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-lg bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center font-bold font-mono text-xs">
          🥉 3
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-lg bg-slate-900 text-slate-500 flex items-center justify-center font-bold font-mono text-xs">
        {rank}.
      </div>
    );
  };

  return (
    <div id="leaderboard-view" className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Trophy className="w-3.5 h-3.5" />
                <span>Firemní Žebříček Kolegů</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Database className="w-3.5 h-3.5" />
                <span>Firebase: nenaopak</span>
              </div>
              <button
                onClick={loadFirestoreUsers}
                disabled={loadingFirestore}
                title="Aktualizovat z Firebase databáze"
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors text-xs flex items-center space-x-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFirestore ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Kdo je největším mistrem firemní terminologie?
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Sleduj pořadí 10 kolegů v týmu podle bodů, denní série (streak) a úspěšnosti v hádání. Kliknutím na kolegu zobrazíš jeho detailní profil.
            </p>
          </div>

          {/* Quick Filter Sort Toggle */}
          <div className="flex flex-wrap gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
            <button
              onClick={() => setSortBy('score')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === 'score'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Podle bodů
            </button>
            <button
              onClick={() => setSortBy('streak')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === 'streak'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Podle série 🔥
            </button>
            <button
              onClick={() => setSortBy('rate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === 'rate'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Podle úspěšnosti %
            </button>
          </div>
        </div>

        {/* Search and Dept Filter Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              id="input-search-leaderboard"
              type="text"
              placeholder="Hledat kolegu podle jména, role nebo oddělení..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <select
            id="select-filter-department"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-semibold text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Všechna oddělení ({combinedRoster.length})</option>
            {departments.filter(d => d !== 'all').map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Table List */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="w-10 text-center">Pořadí</span>
          <span className="flex-1 ml-4">Kolega & Oddělení</span>
          <span className="hidden sm:inline-block w-24 text-center">Série</span>
          <span className="hidden md:inline-block w-24 text-center">Úspěšnost</span>
          <span className="w-28 text-right mr-2">Skóre</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {filtered.map((colleague, index) => {
            const isCurrentUser = user && (user.uid === colleague.uid || user.displayName === colleague.displayName);

            return (
              <div
                key={colleague.uid}
                id={`colleague-row-${colleague.uid}`}
                onClick={() => setSelectedColleague(colleague)}
                className={`p-4 flex items-center justify-between transition-all cursor-pointer ${
                  isCurrentUser
                    ? 'bg-indigo-950/30 hover:bg-indigo-950/50'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Rank Medal */}
                <div className="w-10 flex justify-center flex-shrink-0">
                  {getRankMedal(index + 1)}
                </div>

                {/* Colleague Info */}
                <div className="flex items-center space-x-3.5 flex-1 ml-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isCurrentUser
                      ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white ring-2 ring-indigo-400 shadow-md'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {colleague.avatarSeed}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-sm truncate ${isCurrentUser ? 'text-indigo-300' : 'text-white'}`}>
                        {colleague.displayName}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          Vy
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block truncate">
                      {colleague.role} • {colleague.department}
                    </span>
                  </div>
                </div>

                {/* Streak */}
                <div className="hidden sm:flex items-center justify-center w-24 text-center font-mono font-bold text-amber-400 text-xs">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                  <span>{colleague.currentStreak} dní</span>
                </div>

                {/* Success Rate */}
                <div className="hidden md:flex items-center justify-center w-24 text-center font-mono font-bold text-slate-300 text-xs">
                  <span>{colleague.successRate}%</span>
                </div>

                {/* Total Score */}
                <div className="w-28 text-right flex items-center justify-end space-x-2">
                  <span className="font-mono font-extrabold text-sm md:text-base text-indigo-400">
                    {colleague.totalScore.toLocaleString()} b.
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Colleague Modal */}
      {selectedColleague && (
        <ColleagueProfileModal
          colleague={selectedColleague}
          onClose={() => setSelectedColleague(null)}
        />
      )}
    </div>
  );
};
