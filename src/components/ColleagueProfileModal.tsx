import React from 'react';
import { ColleagueRank } from '../types';
import { ALL_BADGES } from '../data/badges';
import { X, Trophy, Flame, Target, Award, Building, Briefcase, Calendar, CheckCircle } from 'lucide-react';

interface ColleagueProfileModalProps {
  colleague: ColleagueRank;
  onClose: () => void;
}

export const ColleagueProfileModal: React.FC<ColleagueProfileModalProps> = ({ colleague, onClose }) => {
  const colleagueBadges = ALL_BADGES.slice(0, Math.min(colleague.badgesCount, ALL_BADGES.length));

  return (
    <div id="colleague-profile-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#11192e] border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
            Profil kolegy v týmu
          </span>
          <button
            id="btn-close-colleague-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity card */}
        <div className="my-6 flex items-center space-x-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl ring-4 ring-slate-800 shadow-lg">
            {colleague.avatarSeed}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">{colleague.displayName}</h3>
            <div className="flex items-center space-x-1.5 text-xs text-indigo-300 font-medium mt-0.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{colleague.role}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
              <Building className="w-3.5 h-3.5" />
              <span>{colleague.department}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Skóre</div>
            <div className="text-lg font-mono font-extrabold text-indigo-400 mt-0.5">
              {colleague.totalScore.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Série</div>
            <div className="text-lg font-mono font-extrabold text-amber-400 mt-0.5 flex items-center justify-center space-x-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{colleague.currentStreak} d.</span>
            </div>
          </div>

          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Výher</div>
            <div className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5">
              {colleague.gamesWon}
            </div>
          </div>

          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Úspěšnost</div>
            <div className="text-lg font-mono font-extrabold text-cyan-400 mt-0.5">
              {colleague.successRate}%
            </div>
          </div>
        </div>

        {/* Badges Earned */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Získané odznaky ({colleagueBadges.length})</span>
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            {colleagueBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center space-x-2.5 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80"
              >
                <span className="text-xl">{badge.icon}</span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">{badge.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{badge.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity pill */}
        <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
          <span>Poslední aktivita ve hře:</span>
          <span className="font-semibold text-slate-200">{colleague.lastActive}</span>
        </div>

        {/* Close button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            id="btn-dismiss-colleague-modal"
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            Zavřít profil
          </button>
        </div>
      </div>
    </div>
  );
};
