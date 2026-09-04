import React, { useState } from 'react';
import { CategoryId } from '../types';
import { CATEGORIES, getDailyWord, getFormattedCzechDate, getTodayDateString } from '../data/words';
import { useAuth } from '../context/AuthContext';
import { useCurator } from '../context/CuratorContext';
import { CuratorIntroModal } from './CuratorIntroModal';
import { Globe, Briefcase, Cpu, CheckCircle2, ChevronRight, Flame, Sparkles, Award, Crown, History, Info } from 'lucide-react';

interface CategorySelectionProps {
  onSelectCategory: (categoryId: CategoryId) => void;
  onNavigateToCurator?: () => void;
  onNavigateToHistory?: () => void;
}

export const CategorySelection: React.FC<CategorySelectionProps> = ({ 
  onSelectCategory,
  onNavigateToCurator,
  onNavigateToHistory
}) => {
  const { user } = useAuth();
  const { todayCurator, isUserCurator } = useCurator();
  const [showCuratorModal, setShowCuratorModal] = useState(false);
  const todayStr = getTodayDateString();
  const todayProgress = user?.dailyProgress[todayStr] || {};

  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'general_en':
        return <Globe className="w-6 h-6" />;
      case 'work_en':
        return <Briefcase className="w-6 h-6" />;
      case 'work_terminology':
        return <Cpu className="w-6 h-6" />;
    }
  };

  const getSolvedCount = () => {
    let count = 0;
    CATEGORIES.forEach((cat) => {
      if (todayProgress[cat.id]?.solved) count++;
    });
    return count;
  };

  const solvedCount = getSolvedCount();

  return (
    <div id="category-selection-view" className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome & Daily Status Header */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Denní slovníková výzva: {getFormattedCzechDate(todayStr)}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Ahoj, {user?.displayName.split(' ')[0] || 'kolego'}! Připraven na dnešní hádání?
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
              Každý den v 00:00 se odemyká jedno tajné slovo v každé ze 3 kategorií. Zadávej své tipy, sleduj sémantickou teplotu (0 až 100 °C), využij v krizi Oběšence a na závěr vyhraj bonus v Milionáři!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex-shrink-0">
            <div className="text-center px-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Dnes splněno</div>
              <div className="text-2xl font-mono font-extrabold text-white mt-0.5">
                <span className={solvedCount === 3 ? 'text-emerald-400' : 'text-indigo-400'}>
                  {solvedCount}
                </span>
                <span className="text-slate-600"> / 3</span>
              </div>
            </div>
            <div className="w-[1px] h-10 bg-slate-800" />
            <div className="text-center px-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Denní streak</div>
              <div className="text-2xl font-mono font-extrabold text-amber-400 flex items-center justify-center space-x-1 mt-0.5">
                <Flame className="w-5 h-5 fill-amber-400" />
                <span>{user?.stats.currentStreak || 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curator & History Quick Spotlight Banner */}
      <div className="bg-gradient-to-r from-amber-950/20 via-slate-900 to-indigo-950/30 rounded-2xl border border-amber-500/20 p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300 flex items-center space-x-2">
              <span>Dnešní slova vybíral(a): {todayCurator.displayName}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Každý den náhodně vybraný aktivní kolega vybírá ze 4 AI návrhů slova pro celý tým.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto flex-shrink-0 justify-end">
          <button
            id="btn-show-curator-details"
            onClick={() => setShowCuratorModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-medium transition-all flex items-center space-x-1.5"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Kdo vybíral slova?</span>
          </button>

          {isUserCurator && onNavigateToCurator && (
            <button
              id="btn-quick-curator"
              onClick={onNavigateToCurator}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Výběr na zítra (Kurátor)</span>
            </button>
          )}

          {onNavigateToHistory && (
            <button
              id="btn-quick-history"
              onClick={onNavigateToHistory}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center space-x-1.5"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Historie a archiv</span>
            </button>
          )}
        </div>
      </div>

      <CuratorIntroModal
        isOpen={showCuratorModal}
        onClose={() => setShowCuratorModal(false)}
        curatorName={todayCurator.displayName}
        curatorDepartment={todayCurator.department}
        curatorNote={todayCurator.note}
      />

      {/* 3 Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">Vyberte kategorii pro dnešní hru</h3>
          <span className="text-xs text-slate-400">1 tajné slovo / den / sekce</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const catProgress = todayProgress[cat.id];
            const isSolved = catProgress?.solved;
            const guessesCount = catProgress?.guesses?.length || 0;
            const topGuess = catProgress?.guesses && catProgress.guesses.length > 0
              ? catProgress.guesses[0]
              : null;
            const dailyWord = getDailyWord(cat.id);

            return (
              <div
                key={cat.id}
                id={`category-card-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`group cursor-pointer rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden bg-[#11192e] hover:bg-[#15203b] ${
                  isSolved
                    ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-950/30'
                }`}
              >
                {/* Status ribbon */}
                {isSolved && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-bl-xl flex items-center space-x-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Uhodnuto 100 °C</span>
                  </div>
                )}

                <div>
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.color} shadow-md`}>
                      {getCategoryIcon(cat.id)}
                    </div>
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300">
                      {cat.badge}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {cat.subtitle}
                  </p>
                  <p className="text-xs text-slate-400/90 mt-3 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Bottom stats / action */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    {isSolved ? (
                      <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
                        <Award className="w-4 h-4" />
                        <span>+{catProgress?.scoreEarned || 0} bodů</span>
                      </div>
                    ) : guessesCount > 0 ? (
                      <div className="text-xs">
                        <span className="text-slate-400 font-medium">Nejvyšší teplota: </span>
                        <span className="font-mono font-bold text-orange-400">
                          {topGuess ? `${topGuess.temperature} °C` : '-'}
                        </span>
                        <span className="text-slate-500 ml-1">({guessesCount} tipů)</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Zatím nehráno dnes</span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-900 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
