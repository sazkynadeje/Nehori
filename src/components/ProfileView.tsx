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
  Crown
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateUserBio } = useAuth();
  const { isUserCurator, assignment, randomizeCurator } = useCurator();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [department, setDepartment] = useState(user?.department || 'Vývoj & IT Architektura');
  const [role, setRole] = useState(user?.role || 'Senior Frontend Engineer');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) return null;

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserBio(name, department, role);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const gamesPlayed = user.stats.gamesPlayed || 1;
  const winRate = Math.round((user.stats.gamesWon / Math.max(gamesPlayed, 1)) * 100);

  const departments = [
    'Vývoj & IT Architektura',
    'Projektový Management',
    'Produkt & UX Design',
    'Lidské Zdroje (HR)',
    'Obchod & Partnerství',
    'Marketing & Brand',
    'Finance & Controlling',
    'Zákaznická Podpora',
    'Provoz & Logistika',
    'Právní & Compliance'
  ];

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
                <span>{user.department}</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Oddělení
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
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
                  : `Záložka kurátora je skrytá. Zítřejší slova dnes vybírá: ${assignment?.curatorDisplayName || 'Tereza Novotná'}.`}
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
    </div>
  );
};
