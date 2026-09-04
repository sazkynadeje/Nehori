import React, { useState, useEffect } from 'react';
import { CategoryId, WordCandidate, CuratorAssignment } from '../types';
import { CATEGORIES, getFormattedCzechDate, getTodayDateString } from '../data/words';
import { useAuth } from '../context/AuthContext';
import { useCurator } from '../context/CuratorContext';
import { fetchAllUsersFromFirestore } from '../services/firebase';
import { 
  Sparkles, 
  CheckCircle2, 
  Crown, 
  Users, 
  Calendar, 
  ArrowRight, 
  HelpCircle, 
  Flame, 
  RotateCcw, 
  Dice5, 
  ShieldCheck, 
  Loader2, 
  ChevronRight,
  Info
} from 'lucide-react';

interface CuratorViewProps {
  onBackToGame?: () => void;
}

export const CuratorView: React.FC<CuratorViewProps> = ({ onBackToGame }) => {
  const { user } = useAuth();
  const { refreshStatus: refreshGlobalCuratorStatus, claimCuratorRole } = useCurator();
  const todayStr = getTodayDateString();

  // Calculate tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [assignment, setAssignment] = useState<CuratorAssignment | null>(null);
  const [activeUsersCount, setActiveUsersCount] = useState<number>(4);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Candidates for each category: Record<CategoryId, WordCandidate[]>
  const [candidates, setCandidates] = useState<Record<CategoryId, WordCandidate[]>>({
    work_terminology: [],
    work_en: [],
    general_en: []
  });
  const [loadingCandidates, setLoadingCandidates] = useState<Record<CategoryId, boolean>>({
    work_terminology: false,
    work_en: false,
    general_en: false
  });

  // Selected words by curator: Record<CategoryId, WordCandidate | null>
  const [selectedWords, setSelectedWords] = useState<Record<CategoryId, WordCandidate | null>>({
    work_terminology: null,
    work_en: null,
    general_en: null
  });

  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryId>('work_terminology');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch curator status
  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch(`/api/curator/status?dateKey=${todayStr}&targetDateKey=${tomorrowStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAssignment(json.assignment);
          setActiveUsersCount(json.activeUsersCount || 4);
          setActiveUsers(json.activeUsers || []);
          if (json.assignment?.isCompleted && json.assignment.chosenWords) {
            setSelectedWords(json.assignment.chosenWords);
            setSubmissionSuccess(true);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching curator status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Fetch 4 AI candidates for a category
  const fetchCandidatesForCategory = async (catId: CategoryId) => {
    try {
      setLoadingCandidates((prev) => ({ ...prev, [catId]: true }));
      const res = await fetch(`/api/curator/candidates?categoryId=${catId}&targetDateKey=${tomorrowStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.candidates) {
          setCandidates((prev) => ({ ...prev, [catId]: json.candidates }));
        }
      }
    } catch (e) {
      console.error('Error loading candidates:', e);
    } finally {
      setLoadingCandidates((prev) => ({ ...prev, [catId]: false }));
    }
  };

  useEffect(() => {
    fetchStatus();
    // Register current user as active today
    if (user) {
      fetch('/api/curator/register-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          displayName: user.displayName,
          department: user.department,
          dateKey: todayStr
        })
      }).catch(() => {});
    }
  }, [user]);

  // Load candidates when category tab changes or on start
  useEffect(() => {
    if (candidates[activeCategoryTab].length === 0) {
      fetchCandidatesForCategory(activeCategoryTab);
    }
  }, [activeCategoryTab]);

  // Handle claiming curator role for current user (for effortless testing/acting)
  const handleClaimCuratorRole = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/curator/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDateKey: tomorrowStr,
          curatorUid: user.uid,
          curatorDisplayName: user.displayName,
          curatorDepartment: user.department
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAssignment(json.assignment);
          setSubmissionSuccess(false);
          refreshGlobalCuratorStatus();
        }
      }
    } catch (e) {
      console.error('Error claiming role:', e);
    }
  };

  // Handle handing off / randomizing curator to another colleague
  const handleRandomizeCurator = async () => {
    try {
      const allUsers = await fetchAllUsersFromFirestore();
      const colleagues = allUsers.filter((c) => !user || c.uid !== user.uid);
      if (colleagues.length === 0) {
        alert('V aplikaci zatím nejsou zaregistrovaní další hráči, kterým by bylo možné roli kurátora předat.');
        return;
      }
      const picked = colleagues[Math.floor(Math.random() * colleagues.length)];
      const res = await fetch('/api/curator/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDateKey: tomorrowStr,
          curatorUid: picked.uid,
          curatorDisplayName: picked.displayName,
          curatorDepartment: picked.department || 'Tým'
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAssignment(json.assignment);
          setSubmissionSuccess(false);
          refreshGlobalCuratorStatus();
        }
      }
    } catch (e) {
      console.error('Error transferring role:', e);
    }
  };

  const isUserCurator = Boolean(
    user && (
      user.isAdmin ||
      user.role?.toLowerCase().includes('kurátor') ||
      user.role?.toLowerCase().includes('admin') ||
      user.role?.toLowerCase().includes('správce') ||
      (assignment && assignment.curatorUid === user.uid)
    )
  );

  // Handle submitting all 3 words
  const handleSubmitCuratedWords = async () => {
    if (!selectedWords.work_terminology || !selectedWords.work_en || !selectedWords.general_en) {
      setErrorMsg('Vyberte prosím přesně 1 slovo pro každou ze 3 kategorií.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      const res = await fetch('/api/curator/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDateKey: tomorrowStr,
          curatorUid: user?.uid || assignment?.curatorUid,
          curatorDisplayName: user?.displayName || assignment?.curatorDisplayName,
          curatorDepartment: user?.department || assignment?.curatorDepartment,
          chosenWords: selectedWords
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSubmissionSuccess(true);
          fetchStatus();
        } else {
          setErrorMsg(json.error || 'Uložení se nezdařilo.');
        }
      } else {
        setErrorMsg('Server vrátil chybu při ukládání.');
      }
    } catch (e) {
      console.error('Error submitting:', e);
      setErrorMsg('Chyba při komunikaci se serverem.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategoryInfo = CATEGORIES.find((c) => c.id === activeCategoryTab) || CATEGORIES[0];
  const currentCandidates = candidates[activeCategoryTab] || [];
  const selectedForCurrent = selectedWords[activeCategoryTab];

  const allSelected = selectedWords.work_terminology && selectedWords.work_en && selectedWords.general_en;

  if (!isUserCurator && !loadingStatus) {
    return (
      <div id="curator-restricted-view" className="max-w-2xl mx-auto space-y-6 pt-6">
        <div className="bg-[#11192e] border border-amber-500/30 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-5 shadow-lg">
            <Crown className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Vyhrazeno pro dnešního kurátora</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Výběr zítřejších slov má na starosti kurátor
          </h2>

          <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto text-left flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {assignment?.curatorDisplayName?.slice(0, 2).toUpperCase() || (user?.avatarSeed || 'TY')}
            </div>
            <div>
              <div className="text-xs text-slate-400">Dnešní vylosovaný kurátor:</div>
              <div className="text-base font-bold text-white">
                {assignment?.curatorDisplayName || user?.displayName || 'Tým'}
              </div>
            </div>
          </div>

          <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed mb-6">
            Tato záložka se zobrazuje pouze vybranému kurátorovi na schválení 4 AI slov pro celý tým. Vy můžete dnes v klidu hrát a hádat dnešní slova v hlavní hře!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-claim-curator-takeover"
              onClick={async () => {
                await claimCuratorRole();
                await fetchStatus();
                await refreshGlobalCuratorStatus();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <Crown className="w-4 h-4" />
              <span>Převzít roli kurátora {user?.isAdmin ? '(Admin)' : ''}</span>
            </button>
            {onBackToGame && (
              <button
                onClick={onBackToGame}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>Přejít do dnešní hry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="curator-view-container" className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner explaining the curation mechanic */}
      <div className="bg-gradient-to-r from-amber-950/40 via-indigo-950/30 to-purple-950/30 border border-amber-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Crown className="w-48 h-48 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
              <Crown className="w-3.5 h-3.5" />
              <span>Denní kurátorství – Výběr slov na zítřejší den</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Kdo z aktivních hráčů vybere zítřejší slova?
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
              Každý den systém náhodně vybere <strong className="text-amber-300">jednoho z aktivních kolegů</strong>, který dnes hrál. AI připraví <strong className="text-indigo-300">4 chytré kandidáty</strong> z každé kategorie a kurátor zvolí ta nejlepší slova, která zítra potrápí a pobaví celý firemní tým!
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 min-w-[260px]">
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Zítřejší datum:</span>
              <span className="font-bold text-white">{getFormattedCzechDate(tomorrowStr).split(',')[0]}</span>
            </div>

            <div className="border-t border-slate-800/80 pt-3">
              <div className="text-[11px] text-amber-400/90 font-bold uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Vylosovaný kurátor</span>
              </div>
              <div className="text-base font-bold text-white truncate">
                {assignment?.curatorDisplayName || user?.displayName || 'Tým'}
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Stav výběru:</span>
              {assignment?.isCompleted || submissionSuccess ? (
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Schváleno</span>
                </span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Čeká na výběr</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons for testing/curating */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Dnes aktivních kolegů v poolu: <strong className="text-slate-200">{activeUsersCount}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {assignment?.curatorUid !== user?.uid && (
              <button
                id="btn-curator-set-me"
                onClick={async () => {
                  await claimCuratorRole();
                  await fetchStatus();
                  await refreshGlobalCuratorStatus();
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white border border-amber-400/30 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-amber-900/20"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Nastavit mě ({user?.displayName?.split(' ')[0] || 'Zbyněk'}) jako kurátora</span>
              </button>
            )}
            <button
              id="btn-randomize-curator"
              onClick={handleRandomizeCurator}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
            >
              <Dice5 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Předat roli kurátora jinému kolegovi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submission Success Alert */}
      {submissionSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 flex items-start space-x-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-300">Zítřejší slova jsou úspěšně uložena a připravena pro celý tým!</h4>
            <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
              Vybraná slova pro <strong>{getFormattedCzechDate(tomorrowStr).split(',')[0]}</strong> byla zapsána. Všichni kolegové v aplikaci zítra uvidí tato slova jako oficiální denní výzvu a v záhlaví bude uvedeno, že jste je vybrali právě vy. Můžete výběr ještě upravit níže.
            </p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Krok 1: Vyberte 1 ze 4 AI kandidátů pro každou kategorii</span>
          </h3>
          <span className="text-xs text-slate-400">
            Vybráno: <strong className="text-indigo-400 font-mono">{[selectedWords.work_terminology, selectedWords.work_en, selectedWords.general_en].filter(Boolean).length} / 3</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedWords[cat.id] !== null;
            const isActive = activeCategoryTab === cat.id;
            return (
              <button
                key={cat.id}
                id={`tab-curator-cat-${cat.id}`}
                onClick={() => setActiveCategoryTab(cat.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-indigo-300">{cat.title}</span>
                  {isSelected ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Zvoleno</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-semibold">Nevybráno</span>
                  )}
                </div>

                <div className="text-sm font-extrabold text-white truncate">
                  {selectedWords[cat.id] ? selectedWords[cat.id]?.secretWord : 'Klikněte pro výběr ze 4'}
                </div>

                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {cat.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Candidate Cards for the active category */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <span>Kategorie: {currentCategoryInfo.title}</span>
            </div>
            <h4 className="text-lg font-bold text-white">
              AI připravila tyto 4 kandidáty – vyberte to nejlepší slovo na zítra:
            </h4>
          </div>

          <button
            id="btn-refresh-candidates"
            onClick={() => fetchCandidatesForCategory(activeCategoryTab)}
            disabled={loadingCandidates[activeCategoryTab]}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium rounded-xl flex items-center space-x-1.5 transition-all self-start sm:self-auto disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loadingCandidates[activeCategoryTab] ? 'animate-spin' : ''}`} />
            <span>Přegenerovat 4 kandidáty přes AI</span>
          </button>
        </div>

        {loadingCandidates[activeCategoryTab] ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Gemini AI sestavuje 4 originální kandidátní slova a kvízové otázky...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCandidates.map((cand, idx) => {
              const isChosen = selectedForCurrent?.secretWord === cand.secretWord;
              return (
                <div
                  key={cand.id || idx}
                  id={`candidate-card-${idx}`}
                  onClick={() => setSelectedWords((prev) => ({ ...prev, [activeCategoryTab]: cand }))}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isChosen
                      ? 'bg-gradient-to-b from-indigo-950/40 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/60 ring-2 ring-indigo-500/40'
                      : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  {/* Top info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-[11px] font-semibold rounded-md border border-slate-700">
                          {cand.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] text-slate-400 font-mono">Šibenice:</span>
                        <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
                          {cand.hangmanWord}
                        </span>
                      </div>
                    </div>

                    <h5 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">
                      {cand.secretWord}
                    </h5>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
                      {cand.hintDefinition}
                    </p>

                    {cand.reasonWhyGreat && (
                      <div className="mt-3 p-2.5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-200/90 flex items-start space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Doporučení AI:</strong> {cand.reasonWhyGreat}</span>
                      </div>
                    )}

                    {cand.millionaire?.question && (
                      <div className="mt-2.5 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                        <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Náhled otázky v Milionáři:</span>
                        <span className="italic text-slate-300">"{cand.millionaire.question}"</span>
                      </div>
                    )}
                  </div>

                  {/* Button selection */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {isChosen ? 'Aktuálně vybráno pro zítřek' : 'Klikněte pro výběr tohoto slova'}
                    </span>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        isChosen
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                          : 'bg-slate-800 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white'
                      }`}
                    >
                      {isChosen ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Zvoleno na zítra</span>
                        </>
                      ) : (
                        <>
                          <span>Zvolit toto slovo</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary and Submit Bar */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
            Krok 2: Schválení zítřejšího balíčku
          </div>
          <div className="text-base font-bold text-white flex items-center space-x-2">
            <span>Vybraná slova pro {getFormattedCzechDate(tomorrowStr).split(',')[0]}:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${selectedWords.work_terminology ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'}`}>
              Terminologie: {selectedWords.work_terminology?.secretWord || 'Nevybráno'}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${selectedWords.work_en ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'}`}>
              Business EN: {selectedWords.work_en?.secretWord || 'Nevybráno'}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${selectedWords.general_en ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'}`}>
              Obecná EN: {selectedWords.general_en?.secretWord || 'Nevybráno'}
            </span>
          </div>
          {errorMsg && <p className="text-xs text-rose-400 font-semibold mt-2">{errorMsg}</p>}
        </div>

        <button
          id="btn-submit-curator-words"
          onClick={handleSubmitCuratedWords}
          disabled={!allSelected || submitting}
          className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-950/60 flex items-center justify-center space-x-2 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Ukládám zítřejší slova...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Potvrdit a schválit slova pro celý tým</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
