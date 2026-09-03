import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Building, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, register, verifyEmailManually, user, emailVerificationPending } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('Vývoj & IT Architektura');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSentAlert, setEmailSentAlert] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await register(email, password, displayName, department);
        if (!res.success) {
          setError(res.error || 'Registrace se nezdařila.');
        } else {
          setEmailSentAlert(true);
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Přihlášení se nezdařilo.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Nastala neočekávaná chyba.');
    } finally {
      setLoading(false);
    }
  };

  // If user is registered but needs email verification
  if (emailVerificationPending && user) {
    return (
      <div id="email-verification-screen" className="flex items-center justify-center min-h-screen bg-[#0a0f1a] p-4">
        <div className="w-full max-w-md bg-[#11192e] border border-indigo-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl mx-auto flex items-center justify-center mb-6 ring-1 ring-amber-500/40">
            <Mail className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Ověření e-mailové adresy</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Podle firemních bezpečnostních pravidel vyžaduje Firebase Auth povinné ověření e-mailu před vstupem do herní zóny.
          </p>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-left mb-6">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Registrovaný e-mail</div>
            <div className="text-sm font-semibold text-indigo-300 flex items-center justify-between">
              <span>{user.email}</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">Čeká na ověření</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              id="btn-verify-email-demo"
              onClick={verifyEmailManually}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Potvrdit ověření e-mailu a vstoupit</span>
            </button>

            <button
              onClick={() => {
                setEmailSentAlert(true);
                setTimeout(() => setEmailSentAlert(false), 3000);
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2.5 px-4 rounded-xl border border-slate-700 transition-colors"
            >
              Znovu odeslat ověřovací e-mail
            </button>
          </div>

          {emailSentAlert && (
            <div className="mt-4 p-3 bg-indigo-900/40 border border-indigo-500/40 rounded-xl text-xs text-indigo-200">
              Ověřovací odkaz byl virtuálně odeslán do vaší schránky.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="auth-screen" className="flex items-center justify-center min-h-screen bg-[#0a0f1a] p-4">
      <div className="w-full max-w-lg bg-[#11192e] border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-11 h-11 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
            <span className="text-white font-black text-2xl">!</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              NE! <span className="text-amber-400">Naopak!</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Týmová denní slovní výzva – 1 společné slovo denně</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isRegister ? 'Registrace nového kolegy' : 'Přihlášení do týmové hry'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isRegister
              ? 'Vytvoř si firemní profil a soutěž s 10 kolegy v denním žebříčku.'
              : 'Zadej svůj e-mail a heslo pro přístup k dnešním hádankám.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Jméno a příjmení
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    id="input-reg-name"
                    type="text"
                    required
                    placeholder="Např. Jan Kovář"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Firemní oddělení
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
                  <select
                    id="select-reg-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept} className="bg-slate-900 text-white">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Firemní e-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
              <input
                id="input-auth-email"
                type="email"
                required
                placeholder="Zbynek.Kasnar@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Heslo
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
              <input
                id="input-auth-password"
                type="password"
                required
                placeholder="Minimálně 6 znaků"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
          >
            <span>{isRegister ? 'Vytvořit účet a odeslat ověření' : 'Přihlásit se do hry'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{isRegister ? 'Již máš účet?' : 'Ještě nemáš účet?'}</span>
          <button
            id="btn-toggle-auth-mode"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-indigo-400 font-semibold hover:underline"
          >
            {isRegister ? 'Přihlásit se' : 'Zaregistrovat kolegu'}
          </button>
        </div>

        {/* Quick Admin Login Option */}
        <div className="mt-6 p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>Rychlý vstup: Zbyněk Kašnar</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.2 rounded border border-amber-500/30">ADMIN</span>
              </div>
              <div className="text-[11px] text-slate-400">Přihlášení od nuly s plnými právy správce a kurátora</div>
            </div>
          </div>
          <button
            id="btn-admin-quick-login"
            onClick={() => {
              setEmail('Zbynek.Kasnar@gmail.com');
              setPassword('admin123');
              login('Zbynek.Kasnar@gmail.com', 'admin123');
            }}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-900/30 flex items-center justify-center space-x-1.5 whitespace-nowrap"
          >
            <span>Vstoupit od nuly</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
