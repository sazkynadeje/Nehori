import React, { useState, useEffect } from 'react';
import { MillionaireQuestion } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle2, XCircle, Sparkles, HelpCircle, ArrowRight, Award } from 'lucide-react';

interface MillionaireModalProps {
  question: MillionaireQuestion;
  secretWord: string;
  onClose: () => void;
  onComplete: (isCorrect: boolean, bonusScore: number) => void;
}

export const MillionaireModal: React.FC<MillionaireModalProps> = ({
  question,
  secretWord,
  onClose,
  onComplete
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);

  const optionLabels = ['A', 'B', 'C', 'D'];
  const bonusReward = 500;

  useEffect(() => {
    // Mini initial celebratory burst for reaching 100°C
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  }, []);

  const handleFiftyFifty = () => {
    if (fiftyFiftyUsed || isRevealed) return;
    setFiftyFiftyUsed(true);

    const wrongIndexes = [0, 1, 2, 3].filter((idx) => idx !== question.correctAnswerIndex);
    // Shuffle and pick 2 wrong options to disable
    const shuffled = wrongIndexes.sort(() => 0.5 - Math.random());
    setDisabledOptions([shuffled[0], shuffled[1]]);
  };

  const handleSelect = (index: number) => {
    if (isRevealed || disabledOptions.includes(index)) return;
    setSelectedOption(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isRevealed) return;
    setIsRevealed(true);

    const isCorrect = selectedOption === question.correctAnswerIndex;
    if (isCorrect) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
    onComplete(isCorrect, isCorrect ? bonusReward : 50);
  };

  const isCorrectAnswer = selectedOption === question.correctAnswerIndex;

  return (
    <div id="millionaire-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0f172a] border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Millionaire styling */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Bonusová minihra Milionář
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  100 °C Uhodnuto!
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
                Praktické použití slova: <span className="text-amber-300">"{secretWord}"</span>
              </h3>
            </div>
          </div>

          {!fiftyFiftyUsed && !isRevealed && (
            <button
              id="btn-millionaire-50-50"
              onClick={handleFiftyFifty}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nápověda 50:50</span>
            </button>
          )}
        </div>

        {/* Question card */}
        <div className="my-6 p-5 bg-gradient-to-r from-slate-900 to-[#1e293b] rounded-2xl border border-amber-500/30 text-center relative z-10 shadow-inner">
          <div className="text-xs text-amber-400 uppercase tracking-widest font-bold mb-2">Otázka za +500 bodů</div>
          <p className="text-base md:text-lg font-bold text-slate-100 leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* 4 Options A, B, C, D in Millionaire Diamond Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
          {question.options.map((optionText, idx) => {
            const isSelected = selectedOption === idx;
            const isDisabled = disabledOptions.includes(idx);
            const isRightAnswer = isRevealed && idx === question.correctAnswerIndex;
            const isWrongAnswer = isRevealed && isSelected && !isRightAnswer;

            let btnStyle = 'bg-slate-900/90 border-slate-700 hover:border-amber-400/60 text-slate-200';
            if (isDisabled) {
              btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-700 opacity-25 cursor-not-allowed';
            } else if (isRightAnswer) {
              btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 animate-pulse';
            } else if (isWrongAnswer) {
              btnStyle = 'bg-rose-600/30 border-rose-400 text-rose-200 ring-2 ring-rose-400';
            } else if (isSelected) {
              btnStyle = 'bg-amber-500/20 border-amber-400 text-amber-100 ring-1 ring-amber-400 shadow-lg shadow-amber-500/20';
            }

            return (
              <button
                key={idx}
                id={`millionaire-option-${optionLabels[idx]}`}
                disabled={isDisabled || isRevealed}
                onClick={() => handleSelect(idx)}
                className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all duration-200 relative ${btnStyle}`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                  isRightAnswer
                    ? 'bg-emerald-500 text-slate-950'
                    : isWrongAnswer
                    ? 'bg-rose-500 text-white'
                    : isSelected
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-amber-400'
                }`}>
                  {optionLabels[idx]}
                </span>
                <span className="text-xs md:text-sm font-medium leading-snug flex-1">
                  {optionText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Revealed feedback & explanation */}
        {isRevealed && (
          <div className={`mt-6 p-4 rounded-2xl border relative z-10 transition-all ${
            isCorrectAnswer
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center space-x-2 font-bold text-sm mb-1">
              {isCorrectAnswer ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300">Správně! Získáváš plný bonus +{bonusReward} bodů!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span className="text-rose-300">Bohužel vedle! Správná odpověď byla: {optionLabels[question.correctAnswerIndex]}</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              <strong>Vysvětlení: </strong>{question.explanation}
            </p>
            {question.practicalContext && (
              <p className="text-xs text-slate-400 mt-1">
                <strong>Využití v praxi: </strong>{question.practicalContext}
              </p>
            )}
          </div>
        )}

        {/* Footer buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between relative z-10">
          <div className="text-xs text-slate-500">
            {isRevealed ? 'Výsledek byl zaznamenán do tvého profilu.' : 'Vyber jednu odpověď a potvrď volbu.'}
          </div>

          {!isRevealed ? (
            <button
              id="btn-confirm-millionaire-answer"
              disabled={selectedOption === null}
              onClick={handleConfirmAnswer}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 ${
                selectedOption !== null
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Zamknout odpověď</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-finish-millionaire"
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
            >
              <span>Dokončit a pokračovat</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
