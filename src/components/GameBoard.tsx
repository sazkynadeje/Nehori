import React, { useState } from 'react';
import { CategoryId, DailyWordData, GuessRecord } from '../types';
import { CATEGORIES, getDailyWord, getTodayDateString } from '../data/words';
import { useAuth } from '../context/AuthContext';
import { HangmanModal } from './HangmanModal';
import { MillionaireModal } from './MillionaireModal';
import { 
  Flame, 
  ArrowLeft, 
  HelpCircle, 
  Trophy, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Lock, 
  Unlock,
  ThermometerSnowflake,
  ThermometerSun,
  AlertCircle
} from 'lucide-react';
import { INITIAL_TEAM_COLLEAGUES } from '../data/team';

interface GameBoardProps {
  categoryId: CategoryId;
  onBackToCategories: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ categoryId, onBackToCategories }) => {
  const { user, recordGuess, unlockHangman, completeHangman, completeMillionaire } = useAuth();
  const [guessInput, setGuessInput] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHangman, setShowHangman] = useState(false);
  const [showMillionaire, setShowMillionaire] = useState(false);
  const [, setWordVersion] = useState(0);

  React.useEffect(() => {
    const handleWordsUpdate = () => setWordVersion(v => v + 1);
    window.addEventListener('korpo_words_updated', handleWordsUpdate);
    return () => window.removeEventListener('korpo_words_updated', handleWordsUpdate);
  }, []);

  const todayStr = getTodayDateString();
  const categoryInfo = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  const dailyWord = getDailyWord(categoryId, todayStr);

  const todayProgress = user?.dailyProgress[todayStr]?.[categoryId] || {
    guesses: [],
    solved: false,
    hangmanUnlocked: false,
    scoreEarned: 0
  };

  const guesses = todayProgress.guesses || [];
  const isSolved = todayProgress.solved;
  const hangmanUnlocked = todayProgress.hangmanUnlocked || guesses.length >= 10;
  const remainingGuessesToHangman = Math.max(0, 10 - guesses.length);

  // Highest temperature achieved
  const topTemperature = guesses.length > 0 ? guesses[0].temperature : 0;

  const handleGuessSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = guessInput.trim();
    if (!clean) return;

    // Check if already guessed
    if (guesses.some((g) => g.word.toLowerCase() === clean.toLowerCase())) {
      setErrorMsg(`Slovo "${clean}" jsi již dnes zkoušel!`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setEvaluating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/evaluate-guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guess: clean,
          secretWord: dailyWord.secretWord,
          category: categoryInfo.title,
          contextDescription: dailyWord.hintDefinition
        })
      });

      if (!response.ok) {
        throw new Error('Chyba komunikace se serverem.');
      }

      const result = await response.json();
      const isWinning = result.temperature >= 100 || result.isWinning;

      const record: GuessRecord = {
        id: 'guess_' + Date.now(),
        word: clean,
        temperature: result.temperature,
        similarityReason: result.similarityReason,
        timestamp: Date.now()
      };

      recordGuess(todayStr, categoryId, record, isWinning, dailyWord.secretWord);
      setGuessInput('');

      // If hit 100°C, prompt Millionaire modal
      if (isWinning) {
        setTimeout(() => {
          setShowMillionaire(true);
        }, 600);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Nepodařilo se vyhodnotit tip. Zkuste to prosím znovu.');
    } finally {
      setEvaluating(false);
    }
  };

  const getTemperatureBadgeStyle = (temp: number) => {
    if (temp >= 100) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/40';
    if (temp >= 85) return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    if (temp >= 60) return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    if (temp >= 30) return 'bg-amber-500/20 text-yellow-400 border-amber-500/40';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const getTemperatureProgressStyle = (temp: number) => {
    if (temp >= 100) return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    if (temp >= 85) return 'bg-gradient-to-r from-rose-500 to-red-400';
    if (temp >= 60) return 'bg-gradient-to-r from-orange-500 to-amber-400';
    if (temp >= 30) return 'bg-gradient-to-r from-yellow-500 to-amber-300';
    return 'bg-gradient-to-r from-blue-600 to-cyan-400';
  };

  return (
    <div id="game-board-view" className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Stats Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex items-center space-x-3">
          <button
            id="btn-back-to-categories"
            onClick={onBackToCategories}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">Kategorie</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {categoryInfo.badge}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                {categoryInfo.title}
              </h2>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Najdi dnešní tajné slovo měřením sémantické teploty (0.0 až 100.0 °C).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 flex items-center space-x-2.5">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Získané body</span>
            <span className="text-lg font-mono font-bold text-indigo-400">
              {todayProgress.scoreEarned}
            </span>
          </div>

          <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 flex items-center space-x-2.5">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Počet tipů</span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              {guesses.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid: Arena & Sidebar info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Guess Arena */}
        <section className="lg:col-span-2 flex flex-col bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Flame className="w-40 h-40 text-amber-500" />
          </div>

          {/* Solved Banner or Input form */}
          {isSolved ? (
            <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dnešní slovo nalezeno! (100.0 °C)</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    Tajné slovo: <span className="text-emerald-400 underline decoration-emerald-500/50">{dailyWord.secretWord}</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-md">
                    "{dailyWord.hintDefinition}"
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <button
                    id="btn-reopen-millionaire"
                    onClick={() => setShowMillionaire(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-colors"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>{todayProgress.millionaireCompleted ? 'Zobrazit Milionáře' : 'Hrát Milionáře'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Zadejte svůj tip pro kategorii {categoryInfo.title}</span>
                {topTemperature > 0 && (
                  <span className="text-orange-400 font-mono font-semibold">
                    Nejteplejší tip: {topTemperature} °C
                  </span>
                )}
              </label>

              <form onSubmit={handleGuessSubmit} className="relative">
                <input
                  id="input-word-guess"
                  type="text"
                  disabled={evaluating}
                  placeholder={
                    categoryId === 'work_terminology'
                      ? 'Např: Synergie, Konsolidace, Retrospektiva...'
                      : 'Např: Resilience, Perspective, Deliverable, Milestone...'
                  }
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-700 focus:border-indigo-500 rounded-2xl py-4 pl-5 pr-28 text-lg font-medium text-white placeholder:text-slate-600 focus:outline-none transition-all shadow-inner"
                />

                <button
                  id="btn-submit-guess"
                  type="submit"
                  disabled={evaluating || !guessInput.trim()}
                  className={`absolute right-2 top-2 bottom-2 px-6 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
                    guessInput.trim() && !evaluating
                      ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {evaluating ? (
                    <span>Měřím...</span>
                  ) : (
                    <>
                      <span>HÁDAT</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {errorMsg && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Thermo-Leaderboard of Guesses */}
          <div className="flex-1 flex flex-col min-h-[260px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <ThermometerSun className="w-4 h-4 text-orange-400" />
                <span>Termo-žebříček dnešních pokusů ({guesses.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500">Seřazeno od nejteplejších</span>
            </div>

            {guesses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/80 rounded-2xl p-8 text-center bg-slate-900/30">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                  <ThermometerSnowflake className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">Zatím žádné pokusy</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Napiš jakékoliv slovo do pole výše. Gemini AI změří jeho sémantickou teplotu (0 až 100 °C).
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {guesses.map((g, idx) => {
                  const is100 = g.temperature >= 100;

                  return (
                    <div
                      key={g.id || idx}
                      id={`guess-row-${idx}`}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        is100
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950/30'
                          : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <span className="text-xs font-mono text-slate-500 w-5 text-right flex-shrink-0">
                          {idx + 1}.
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs border flex-shrink-0 ${getTemperatureBadgeStyle(
                            g.temperature
                          )}`}
                        >
                          {g.temperature.toFixed(1)} °C
                        </span>

                        <div className="truncate">
                          <span className="text-base font-bold text-white capitalize block truncate">
                            {g.word}
                          </span>
                          {g.similarityReason && (
                            <span className="text-[11px] text-slate-400 line-clamp-1">
                              {g.similarityReason}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Visual Bar Gauge */}
                      <div className="flex items-center space-x-3 sm:w-44 flex-shrink-0 self-end sm:self-center">
                        <div className="h-2.5 flex-1 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getTemperatureProgressStyle(
                              g.temperature
                            )}`}
                            style={{ width: `${Math.min(g.temperature, 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-400 w-8 text-right">
                          {Math.round(g.temperature)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hangman Integrated Unlock Clue Box */}
          <div className="mt-6 p-4 bg-indigo-950/30 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl flex-shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-bold text-white">Nápověda Oběšenec (Hangman)</p>
                  {hangmanUnlocked ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center space-x-1">
                      <Unlock className="w-3 h-3" />
                      <span>Odemčeno</span>
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Zamčeno ({guesses.length}/10)</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {hangmanUnlocked
                    ? 'Odemčeno! Vylušti písmena definice pro klíčové vodítko k tajnému slovu.'
                    : `Po 10 pokusech (zbývá ${remainingGuessesToHangman}) se odemkne nápovědná retro hra.`}
                </p>
              </div>
            </div>

            <button
              id="btn-open-hangman"
              disabled={!hangmanUnlocked && guesses.length < 10}
              onClick={() => {
                unlockHangman(todayStr, categoryId);
                setShowHangman(true);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 ${
                hangmanUnlocked || guesses.length >= 10
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {hangmanUnlocked
                  ? 'SPUSTIT OBĚŠENCE'
                  : `ODEMKNOUT (${guesses.length}/10)`}
              </span>
            </button>
          </div>
        </section>

        {/* Right Col: Daily Team Teaser & Millionaire Promo */}
        <aside className="space-y-6 flex flex-col">
          {/* Daily team attempts preview */}
          <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Týmový denní puls ({categoryInfo.title})
              </h3>
              <span className="text-[10px] text-indigo-400 font-mono">10 kolegů</span>
            </div>

            <div className="space-y-3 flex-1">
              {/* Leader */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="text-emerald-400 font-mono font-bold text-xs">1.</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] text-emerald-400 font-bold">
                    PM
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Petr Marek</span>
                    <span className="text-[10px] text-slate-500">IT Architektura</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  100.0 °C
                </span>
              </div>

              {/* Current user */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/30">
                <div className="flex items-center space-x-3">
                  <span className="text-indigo-400 font-mono font-bold text-xs">2.</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-400 font-bold">
                    {user?.avatarSeed || 'JK'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-200 block">Vy ({user?.displayName.split(' ')[0]})</span>
                    <span className="text-[10px] text-slate-400">{user?.department}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                  {topTemperature > 0 ? `${topTemperature.toFixed(1)} °C` : '0.0 °C'}
                </span>
              </div>

              {/* Other colleagues */}
              {INITIAL_TEAM_COLLEAGUES.slice(1, 4).map((colleague, cIdx) => (
                <div key={colleague.uid} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900/50">
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-500 font-mono font-bold text-xs">{cIdx + 3}.</span>
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                      {colleague.avatarSeed}
                    </div>
                    <div>
                      <span className="text-xs text-slate-300 block">{colleague.displayName}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {(78.5 - cIdx * 12).toFixed(1)} °C
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Millionaire Promo Card */}
          <div className="bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-slate-900 rounded-3xl p-6 border border-indigo-500/30 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  Bonusový Milionář
                </span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                Uhodni slovo na <strong>100 °C</strong> a okamžitě získej možnost hrát bonusovou otázku o <strong>+500 bodů</strong> a firemní odznaky!
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Hangman Modal */}
      {showHangman && (
        <HangmanModal
          wordData={dailyWord}
          onClose={() => setShowHangman(false)}
          onComplete={(success) => completeHangman(todayStr, categoryId, success)}
        />
      )}

      {/* Millionaire Modal */}
      {showMillionaire && (
        <MillionaireModal
          question={dailyWord.millionaire}
          secretWord={dailyWord.secretWord}
          onClose={() => setShowMillionaire(false)}
          onComplete={(isCorrect, bonus) => completeMillionaire(todayStr, categoryId, isCorrect, bonus)}
        />
      )}
    </div>
  );
};
