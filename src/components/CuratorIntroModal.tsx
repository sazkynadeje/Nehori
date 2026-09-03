import React from 'react';
import { Crown, Sparkles, X, ArrowRight, UserCheck, Flame, Shield } from 'lucide-react';

interface CuratorIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  curatorName: string;
  curatorDepartment: string;
  curatorNote?: string;
  categoryTitle?: string;
}

export const CuratorIntroModal: React.FC<CuratorIntroModalProps> = ({
  isOpen,
  onClose,
  curatorName,
  curatorDepartment,
  curatorNote,
  categoryTitle
}) => {
  if (!isOpen) return null;

  const initials = curatorName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      id="curator-intro-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="curator-intro-modal"
        className="relative w-full max-w-lg bg-[#0f172a] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-amber-950/40 overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Zavřít okno"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Curator Header Badge */}
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Crown className="w-4 h-4 fill-amber-400" />
          <span>Výběr dnešního kurátora</span>
        </div>

        {/* Curator Profile Info */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-950/50">
              {initials || 'KN'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Dnešní slova pro vás vybral(a)</div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {curatorName}
            </h3>
            <div className="inline-flex items-center space-x-1.5 text-xs text-amber-300/90 font-medium mt-0.5">
              <Shield className="w-3 h-3" />
              <span>{curatorDepartment}</span>
            </div>
          </div>
        </div>

        {/* Message from Curator */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 relative">
          <p className="text-slate-300 text-sm leading-relaxed italic">
            "{curatorNote || 'Pro dnešní den jsem vybral(a) slova z firemní praxe i mezinárodní spolupráce. Otestujte svou slovní zásobu a odhalte dnešní tajenku na co nejméně pokusů!'}"
          </p>
          {categoryTitle && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Aktuální kategorie:</span>
              <span className="font-semibold text-indigo-300">{categoryTitle}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          id="btn-close-curator-intro"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-600/30 flex items-center justify-center space-x-2 transition-all"
        >
          <span>Pustit se do hádání</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
