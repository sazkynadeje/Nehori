import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, getFormattedCzechDate, getTodayDateString } from '../data/words';
import { 
  History, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Crown, 
  UserCheck, 
  ShieldCheck, 
  Database, 
  Lock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Award,
  ThermometerSun,
  Loader2,
  BookOpen
} from 'lucide-react';

interface HistoryDayData {
  dateKey: string;
  formattedDate: string;
  curatorName: string;
  curatorDepartment: string;
  isToday?: boolean;
  words: Record<string, {
    secretWord: string;
    hintDefinition: string;
    difficulty: string;
  }>;
}

export const HistoryView: React.FC = () => {
  const { user } = useAuth();
  const [historyList, setHistoryList] = useState<HistoryDayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<string | null>(getTodayDateString());
  const [activeInfoTab, setActiveInfoTab] = useState<'auth' | 'history' | 'curator'>('history');

  const todayStr = getTodayDateString();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/history');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.history) {
            setHistoryList(json.history);
          }
        }
      } catch (e) {
        console.error('Error fetching history:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div id="history-view-container" className="max-w-5xl mx-auto space-y-8">
      {/* System Explanation Banner answering the user's question */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Systémová architektura</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Jak funguje přihlašování, historie a kurátorství?
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Transparentní přehled o tom, jak jsou ukládána data uživatelů, jak se zaznamenávají pokusy a jak se vybírají slova.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex-shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveInfoTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeInfoTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Historie hraní
            </button>
            <button
              onClick={() => setActiveInfoTab('auth')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeInfoTab === 'auth'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Přihlášení lidí
            </button>
            <button
              onClick={() => setActiveInfoTab('curator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeInfoTab === 'curator'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kurátor dne (AI)
            </button>
          </div>
        </div>

        {/* Tab 1: Historie */}
        {activeInfoTab === 'history' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <ThermometerSun className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Sledování každého tipu</h4>
              <p className="text-slate-400 leading-relaxed">
                Každý zadaný pokus se ukládá s dosaženou teplotou (0 až 100 °C) a sémantickým zdůvodněním podobnosti.
              </p>
            </div>

            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Kalendářní klíč (dateKey)</h4>
              <p className="text-slate-400 leading-relaxed">
                Postup je organizován podle data (např. <code>2026-09-03</code>) a kategorií. Uživatel se může kdykoliv podívat na své dřívější dny.
              </p>
            </div>

            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Denní série (Streak)</h4>
              <p className="text-slate-400 leading-relaxed">
                Pravidelná účast zvyšuje denní sérii a odemyká speciální odznaky (např. 3 dny v řadě, 7 dní v řadě, Parní válec).
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Přihlášení */}
        {activeInfoTab === 'auth' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Firemní identita</h4>
              <p className="text-slate-400 leading-relaxed">
                Každý zaměstnanec má svůj profil: jméno, e-mail, oddělení (např. Vývoj, Produkt, UX) a konkrétní pracovní roli.
              </p>
            </div>

            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Ověření e-mailu</h4>
              <p className="text-slate-400 leading-relaxed">
                Systém obsahuje bezpečný ověřovací tok s možností odeslat potvrzovací odkaz nebo aktivovat účet ihned.
              </p>
            </div>

            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Týmový žebříček</h4>
              <p className="text-slate-400 leading-relaxed">
                Výsledky se synchronizují do celofiremní tabulky, kde se porovnávají úspěšnost, počet bodů a aktivita kolegů.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Kurátor */}
        {activeInfoTab === 'curator' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Crown className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Výběr z aktivních lidí</h4>
              <p className="text-slate-400 leading-relaxed">
                Pouze kolegové, kteří v daný den aktivně hráli, mohou být vylosováni jako Kurátor pro zítřejší den.
              </p>
            </div>

            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">4 AI návrhy na kategorii</h4>
              <p className="text-slate-400 leading-relaxed">
                Gemini AI připraví 4 chytré kandidáty pro každou kategorii včetně otázky do Milionáře a doporučení.
              </p>
            </div>

            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Zápis do historie</h4>
              <p className="text-slate-400 leading-relaxed">
                Kurátor zvolí 3 slova, která se zítra stanou oficiální výzvou pro celý tým, a jeho jméno se zapíše do archivu.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Days Archive & Words Played */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Archiv odehraných dnů a slov</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Celkem v archivu: <strong className="text-white">{historyList.length} dní</strong>
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 bg-[#11192e] rounded-3xl border border-slate-800">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Načítání historie odehraných slov...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historyList.map((day) => {
              const isExpanded = expandedDay === day.dateKey;
              const userDayProgress = user?.dailyProgress[day.dateKey] || {};

              return (
                <div
                  key={day.dateKey}
                  className={`bg-[#11192e] rounded-2xl border transition-all overflow-hidden ${
                    day.isToday ? 'border-indigo-500/50 shadow-lg shadow-indigo-950/30' : 'border-slate-800'
                  }`}
                >
                  {/* Day Header Row */}
                  <div
                    onClick={() => setExpandedDay(isExpanded ? null : day.dateKey)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        day.isToday ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        <Calendar className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-white">
                            {day.formattedDate}
                          </h4>
                          {day.isToday && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-extrabold uppercase">
                              Dnešek
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>Kurátor dne: <strong className="text-slate-200">{day.curatorName}</strong> ({day.curatorDepartment})</span>
                        </div>
                      </div>
                    </div>

                    {/* Words chips preview */}
                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <div className="hidden md:flex items-center space-x-2 text-xs">
                        {CATEGORIES.map((cat) => {
                          const w = day.words[cat.id];
                          const solved = userDayProgress[cat.id]?.solved;
                          return (
                            <span
                              key={cat.id}
                              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1 ${
                                solved
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
                              }`}
                            >
                              <span>{w?.secretWord || '–'}</span>
                              {solved && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                            </span>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Day Details */}
                  {isExpanded && (
                    <div className="p-5 pt-2 border-t border-slate-800/80 bg-slate-900/40 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {CATEGORIES.map((cat) => {
                          const wordInfo = day.words[cat.id];
                          const prog = userDayProgress[cat.id];

                          return (
                            <div
                              key={cat.id}
                              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3"
                            >
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="font-bold text-indigo-400">{cat.title}</span>
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-medium">
                                    {wordInfo?.difficulty || 'Střední'}
                                  </span>
                                </div>

                                <div className="text-lg font-black text-white">
                                  {wordInfo?.secretWord || 'Nezadáno'}
                                </div>

                                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                                  {wordInfo?.hintDefinition || 'Bez definice.'}
                                </p>
                              </div>

                              {/* User's performance on that day */}
                              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                <span className="text-slate-400">Váš výsledek:</span>
                                {prog?.solved ? (
                                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Uhodnuto ({prog.guesses.length} tipů, +{prog.scoreEarned} b.)</span>
                                  </span>
                                ) : prog && prog.guesses.length > 0 ? (
                                  <span className="text-amber-400 font-medium">
                                    Rozehráno ({prog.guesses.length} tipů)
                                  </span>
                                ) : (
                                  <span className="text-slate-500 italic">Nehráno</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
