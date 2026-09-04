import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurator } from '../context/CuratorContext';
import { ALL_BADGES } from '../data/badges';
import { 
  User, 
  Flame, 
  Trophy, 
  Target, 
  Award, 
  Building, 
  Briefcase, 
  Mail, 
  CheckCircle2, 
  Edit3, 
  Save, 
  HelpCircle,
  Clock,
  Sparkles,
  Crown,
  ShieldCheck,
  RotateCcw,
  Trash2,
  LogOut,
  RefreshCw
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateUserBio, resetAllUserData, logout } = useAuth();
  const { isUserCurator, assignment, claimCuratorRole, refreshStatus: refreshGlobalCuratorStatus, randomizeCurator } = useCurator();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [role, setRole] = useState(user?.role || 'Administrátor & Správce');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [curatorClaimSuccess, setCuratorClaimSuccess] = useState(false);
  const [resetDataSuccess, setResetDataSuccess] = useState(false);
  const [adminResetSuccess, setAdminResetSuccess] = useState(false);

  if (!user) return null;

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserBio(name, user.department || 'Tým', role);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTakeCurator = async () => {
    await claimCuratorRole();
    await refreshGlobalCuratorStatus();
    setCuratorClaimSuccess(true);
    setTimeout(() => setCuratorClaimSuccess(false), 4000);
  };

  const handleResetMyData = () => {
    if (window.confirm('Opravdu chcete vyresetovat svůj herní postup na 0 pro čisté testování?')) {
      resetAllUserData();
      setResetDataSuccess(true);
      setTimeout(() => setResetDataSuccess(false), 4000);
    }
  };

  const handleAdminSystemReset = async () => {
    if (window.confirm('Opravdu chcete vyprázdnit systémovou mezipaměť a historii na serveru?')) {
      try {
        const res = await fetch('/api/admin/reset-data', { method: 'POST' });
        if (res.ok) {
          await refreshGlobalCuratorStatus();
          setAdminResetSuccess(true);
          setTimeout(() => setAdminResetSuccess(false), 4000);
        }
      } catch (err) {
        console.error('Error resetting system data:', err);
      }
    }
  };

  const gamesPlayed = user.stats.gamesPlayed || 1;
  const winRate = Math.round((user.stats.gamesWon / Math.max(gamesPlayed, 1)) * 100);

  return (
    <div id="profile-view" className="space-y-8 max-w-5xl mx-auto">
      {/* Header Profile Card */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center text-white font-black text-2xl ring-4 ring-slate-800 shadow-xl flex-shrink-0">
              {user.avatarSeed}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">{user.displayName}</h2>
                {user.isAdmin && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ADMIN</span>
                  </span>
                )}
                {user.emailVerified && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Ověřený e-mail</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 mt-1">
                <span className="text-indigo-300 font-semibold">{user.role}</span>
                <span>•</span>
                <span className="font-mono text-slate-500">{user.email}</span>
              </div>
            </div>
          </div>

          <button
            id="btn-toggle-edit-profile"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center space-x-2 self-start md:self-center"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Zrušit úpravy' : 'Upravit profil'}</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profil byl úspěšně aktualizován a synchronizován.</span>
          </div>
        )}

        {/* Edit Bio Form */}
        {isEditing && (
          <form onSubmit={handleSaveBio} className="mt-6 pt-6 border-t border-slate-800/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Celé jméno
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Firemní pozice / Role
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Uložit změny</span>
              </button>
            </div>
          </form>
        )}

        {/* Curator Role & Visibility Status */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isUserCurator 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md shadow-amber-950/40' 
                : 'bg-slate-800/80 text-slate-400 border border-slate-700'
            }`}>
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>Role kurátora slov:</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                  isUserCurator
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isUserCurator ? 'Vy jste dnešní kurátor' : 'Běžný hráč'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isUserCurator
                  ? 'Záložka „Kurátor dne“ je pro vás aktivní. Můžete vybírat 4 AI slova pro tým.'
                  : `Záložka kurátora je skrytá. Zítřejší slova dnes vybírá: ${assignment?.curatorDisplayName || 'Tým'}.`}
              </p>
            </div>
          </div>

          {isUserCurator && (
            <button
              id="btn-profile-transfer-curator"
              onClick={randomizeCurator}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition-all flex items-center space-x-1.5 self-start sm:self-auto flex-shrink-0"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Předat roli jinému kolegovi</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#11192e] p-5 rounded-2xl border border-slate-800 text-center shadow-xl">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Celkové skóre</div>
          <div className="text-2xl md:text-3xl font-mono font-black text-indigo-400 mt-1">
            {user.stats.totalScore.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">všech her a bonusů</div>
        </div>

        <div className="bg-[#11192e] p-5 rounded-2xl border border-slate-800 text-center shadow-xl">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Denní série (Streak)</div>
          <div className="text-2xl md:text-3xl font-mono font-black text-amber-400 flex items-center justify-center space-x-1 mt-1">
            <Flame className="w-6 h-6 fill-amber-400" />
            <span>{user.stats.currentStreak} dní</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Rekord: {user.stats.maxStreak} dní</div>
        </div>

        <div className="bg-[#11192e] p-5 rounded-2xl border border-slate-800 text-center shadow-xl">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Uhodnutých slov</div>
          <div className="text-2xl md:text-3xl font-mono font-black text-emerald-400 mt-1">
            {user.stats.gamesWon}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Úspěšnost {winRate}%</div>
        </div>

        <div className="bg-[#11192e] p-5 rounded-2xl border border-slate-800 text-center shadow-xl">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Správný Milionář</div>
          <div className="text-2xl md:text-3xl font-mono font-black text-yellow-400 mt-1">
            {user.stats.millionaireCorrect}x
          </div>
          <div className="text-[11px] text-slate-400 mt-1">+500 b. za otázku</div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Sbírka firemních odznaků</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Odemkni speciální ocenění za vytrvalost, rychlost a znalosti.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-amber-400">
            {user.badges.length} / {ALL_BADGES.length} odemčeno
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = user.badges.includes(badge.id);

            return (
              <div
                key={badge.id}
                id={`badge-card-${badge.id}`}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-slate-900/80 border-indigo-500/30 shadow-lg shadow-indigo-950/20'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-50 grayscale'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{badge.icon}</span>
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Získáno
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                        Zamčeno
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">{badge.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin & Testovací centrum */}
      <div className="bg-[#11192e] rounded-3xl border border-amber-500/30 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Správa účtu & Testovací centrum</span>
                {user.isAdmin && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Admin
                  </span>
                )}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Nástroje pro testování od nuly, převzetí kurátorství a správu herních dat.
              </p>
            </div>
          </div>

          <button
            id="btn-profile-logout"
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center space-x-2 self-start md:self-auto"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Odhlásit se</span>
          </button>
        </div>

        {/* Status Alerts */}
        {curatorClaimSuccess && (
          <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-center space-x-2">
            <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Úspěšně jste převzal(a) roli kurátora pro dnešek i zítřek! Nyní můžete vybrat slova v záložce Denní kurátor.</span>
          </div>
        )}

        {resetDataSuccess && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Všechna vaše herní data byla vymazána. Začínáte od 0 bodů a čistého štítu!</span>
          </div>
        )}

        {adminResetSuccess && (
          <div className="mb-4 p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-300 text-xs flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-indigo-400 flex-shrink-0 animate-spin" />
            <span>Systémová mezipaměť a historie byly úspěšně vyprázdněny.</span>
          </div>
        )}

        {/* Action cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: Curator Takeover */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <Crown className="w-4 h-4" />
                <span>Role kurátora</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1.5">Převzít roli kurátora</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Okamžitě přiřadí váš účet ({user.displayName}) jako kurátora, abyste mohl schválit 4 AI slova pro celý tým.
              </p>
            </div>
            <button
              id="btn-profile-take-curator"
              onClick={handleTakeCurator}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-900/20 flex items-center justify-center space-x-1.5"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Nastavit mě jako kurátora</span>
            </button>
          </div>

          {/* Action 2: Reset my game progress */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                <RotateCcw className="w-4 h-4" />
                <span>Herní profil</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1.5">Začít od nuly (Reset dat)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Vynuluje statistiky, skóre, odehraná slova i odznaky vašeho účtu pro čisté testování herní smyčky.
              </p>
            </div>
            <button
              id="btn-profile-reset-my-data"
              onClick={handleResetMyData}
              className="w-full py-2.5 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vyprázdnit má data na 0</span>
            </button>
          </div>

          {/* Action 3: System / Server Reset */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs">
                <RefreshCw className="w-4 h-4" />
                <span>Systémová data</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1.5">Vyčistit mezipaměť</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Vymaže cache generovaných slov na serveru a historii, aby se denní výzvy a kurátorstvo načítaly znova.
              </p>
            </div>
            <button
              id="btn-profile-system-reset"
              onClick={handleAdminSystemReset}
              className="w-full py-2.5 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Vyprázdnit systémovou mezipaměť</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
