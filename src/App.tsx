import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CuratorProvider } from './context/CuratorContext';
import { AuthView } from './components/AuthView';
import { Sidebar, MainTabType } from './components/Sidebar';
import { MobileNavbar } from './components/MobileNavbar';
import { CategorySelection } from './components/CategorySelection';
import { GameBoard } from './components/GameBoard';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { CuratorView } from './components/CuratorView';
import { HistoryView } from './components/HistoryView';
import { CategoryId } from './types';
import { CATEGORIES } from './data/words';
import { Flame, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading, emailVerificationPending } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTabType>('game');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f1a]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Načítání hry NE! Naopak!...</p>
        </div>
      </div>
    );
  }

  // If not logged in or email not yet verified
  if (!user || emailVerificationPending || !user.emailVerified) {
    return <AuthView />;
  }

  const selectedCategoryInfo = selectedCategory
    ? CATEGORIES.find((c) => c.id === selectedCategory)
    : undefined;

  return (
    <div className="flex h-screen w-full bg-[#0a0f1a] text-slate-200 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'game') {
            setSelectedCategory(null);
          }
        }}
        selectedCategoryTitle={selectedCategoryInfo?.title}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 md:p-8 pb-24 lg:pb-8">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-base shadow-md">
              !
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white leading-tight">NE! Naopak!</h1>
              <span className="text-[10px] text-slate-400 font-medium">1 slovo denně pro tým</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{user.stats.currentStreak} d.</span>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        {activeTab === 'game' && (
          selectedCategory ? (
            <GameBoard
              categoryId={selectedCategory}
              onBackToCategories={() => setSelectedCategory(null)}
            />
          ) : (
            <CategorySelection
              onSelectCategory={(catId) => setSelectedCategory(catId)}
              onNavigateToCurator={() => setActiveTab('curator')}
              onNavigateToHistory={() => setActiveTab('history')}
            />
          )
        )}

        {activeTab === 'curator' && (
          <CuratorView onBackToGame={() => setActiveTab('game')} />
        )}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'game') {
            setSelectedCategory(null);
          }
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CuratorProvider>
        <MainAppContent />
      </CuratorProvider>
    </AuthProvider>
  );
}
