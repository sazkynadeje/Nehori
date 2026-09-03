import React, { useState } from 'react';
import { DailyWordData } from '../types';
import { X, HelpCircle, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface HangmanModalProps {
  wordData: DailyWordData;
  onClose: () => void;
  onComplete: (success: boolean) => void;
}

export const HangmanModal: React.FC<HangmanModalProps> = ({ wordData, onClose, onComplete }) => {
  // Target secret phrase for hangman (normalized uppercase letters only)
  const targetPhrase = (wordData.hangmanWord || 'SYNERGIE').toUpperCase();
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const maxMistakes = 6;

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Calculate mistake count
  const mistakes = Array.from(guessedLetters).filter(
    (l) => !targetPhrase.includes(l)
  ).length;

  const isWon = targetPhrase
    .split('')
    .filter((char) => char !== ' ')
    .every((char) => guessedLetters.has(char));

  const isLost = mistakes >= maxMistakes;

  const handleGuessLetter = (letter: string) => {
    if (isWon || isLost || guessedLetters.has(letter)) return;
    const next = new Set(guessedLetters);
    next.add(letter);
    setGuessedLetters(next);

    // Check if newly won
    const willBeWon = targetPhrase
      .split('')
      .filter((c) => c !== ' ')
      .every((c) => next.has(c));

    if (willBeWon) {
      onComplete(true);
    }
  };

  const renderGallowsSvg = () => {
    return (
      <svg className="w-36 h-36 mx-auto stroke-indigo-400 stroke-2 fill-none" viewBox="0 0 100 100">
        {/* Base */}
        <line x1="10" y1="90" x2="50" y2="90" className="stroke-slate-600" />
        {/* Pole */}
        <line x1="30" y1="90" x2="30" y2="10" className="stroke-slate-600" />
        {/* Top beam */}
        <line x1="30" y1="10" x2="70" y2="10" className="stroke-slate-600" />
        {/* Rope */}
        <line x1="70" y1="10" x2="70" y2="25" className="stroke-amber-400" />

        {/* Head */}
        {mistakes >= 1 && <circle cx="70" cy="32" r="7" className="stroke-amber-400" />}
        {/* Body */}
        {mistakes >= 2 && <line x1="70" y1="39" x2="70" y2="60" className="stroke-amber-400" />}
        {/* Left Arm */}
        {mistakes >= 3 && <line x1="70" y1="45" x2="58" y2="55" className="stroke-amber-400" />}
        {/* Right Arm */}
        {mistakes >= 4 && <line x1="70" y1="45" x2="82" y2="55" className="stroke-amber-400" />}
        {/* Left Leg */}
        {mistakes >= 5 && <line x1="70" y1="60" x2="60" y2="78" className="stroke-amber-400" />}
        {/* Right Leg */}
        {mistakes >= 6 && <line x1="70" y1="60" x2="80" y2="78" className="stroke-rose-500" />}
      </svg>
    );
  };

  return (
    <div id="hangman-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#11192e] border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              🪢
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Nápověda Oběšenec (Hangman)</h3>
              <p className="text-xs text-slate-400">Vylušti klíčové slovo definice a odhal význam!</p>
            </div>
          </div>

          <button
            id="btn-close-hangman"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clue Context Box */}
        <div className="my-4 p-4 bg-slate-900/90 rounded-2xl border border-indigo-500/20">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Anglická / odborná definice tajného slova:</span>
          </div>
          <p className="text-sm text-slate-200 italic font-medium leading-relaxed">
            "{wordData.hintDefinition}"
          </p>
        </div>

        {/* Visual Gallows & Lives */}
        <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800 mb-6">
          <div className="flex-1 text-center">
            {renderGallowsSvg()}
          </div>
          <div className="text-right px-4">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Zbývá životů</div>
            <div className="text-2xl font-mono font-extrabold text-amber-400 mt-1">
              {maxMistakes - mistakes} / {maxMistakes}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Chybných: {mistakes}</div>
          </div>
        </div>

        {/* Word Display with letter placeholders */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {targetPhrase.split('').map((char, index) => {
            if (char === ' ') {
              return <div key={index} className="w-4" />;
            }
            const revealed = guessedLetters.has(char) || isLost;
            return (
              <div
                key={index}
                className={`w-9 h-11 md:w-11 md:h-13 rounded-xl border-2 flex items-center justify-center font-mono text-xl font-bold transition-all ${
                  revealed
                    ? isLost && !guessedLetters.has(char)
                      ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                      : 'border-indigo-500 text-white bg-indigo-500/20 shadow-md shadow-indigo-950/40'
                    : 'border-slate-700 bg-slate-900 text-transparent'
                }`}
              >
                {revealed ? char : '_'}
              </div>
            );
          })}
        </div>

        {/* Win/Loss Status */}
        {isWon && (
          <div className="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center">
            <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-sm">
              <Check className="w-5 h-5" />
              <span>Skvěle! Vyluštil jsi klíčové vodítko: "{targetPhrase}"!</span>
            </div>
            <p className="text-xs text-emerald-200 mt-1">
              Nyní se vrať do hádacího pole a zadej přesný tvar tajného slova!
            </p>
          </div>
        )}

        {isLost && (
          <div className="mb-4 p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-center">
            <div className="flex items-center justify-center space-x-2 text-rose-400 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Bohužel ti došly pokusy! Hledaný pojem byl: "{targetPhrase}"</span>
            </div>
            <p className="text-xs text-rose-200 mt-1">
              I tak tě toto vodítko navede na správný český/anglický význam.
            </p>
          </div>
        )}

        {/* Alphabet Keyboard */}
        <div className="grid grid-cols-7 md:grid-cols-9 gap-1.5">
          {alphabet.map((letter) => {
            const isGuessed = guessedLetters.has(letter);
            const isCorrect = isGuessed && targetPhrase.includes(letter);
            const isWrong = isGuessed && !targetPhrase.includes(letter);

            return (
              <button
                key={letter}
                disabled={isGuessed || isWon || isLost}
                onClick={() => handleGuessLetter(letter)}
                className={`h-9 md:h-10 rounded-lg font-mono font-bold text-sm transition-all flex items-center justify-center ${
                  isCorrect
                    ? 'bg-emerald-600 text-white border border-emerald-400 opacity-90'
                    : isWrong
                    ? 'bg-slate-900 text-slate-600 border border-slate-800 line-through opacity-40'
                    : 'bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            id="btn-dismiss-hangman"
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            Zpět do herního pole
          </button>
        </div>
      </div>
    </div>
  );
};
