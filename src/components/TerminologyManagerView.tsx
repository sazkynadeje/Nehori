import React, { useState, useEffect } from 'react';
import { CategoryId, DailyWordData } from '../types';
import { 
  CATEGORIES, 
  getWordsCatalogue, 
  saveWordToCatalogue, 
  deleteWordFromCatalogue, 
  setWordAsActiveToday, 
  resetWordsCatalogueToDefault, 
  exportWordsCatalogueJson, 
  importWordsCatalogueJson,
  getTodayDateString,
  getFormattedCzechDate
} from '../data/words';
import { 
  BookOpenCheck, 
  Plus, 
  Search, 
  Sparkles, 
  Calendar, 
  Edit3, 
  Trash2, 
  Play, 
  FlaskConical, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  X, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  ThermometerSun,
  Layers,
  Award,
  ArrowUpDown,
  Send,
  Loader2
} from 'lucide-react';

export const TerminologyManagerView: React.FC = () => {
  const [catalogue, setCatalogue] = useState<Record<CategoryId, DailyWordData[]>>(getWordsCatalogue());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryId | 'all'>('work_terminology');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<DailyWordData | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testTargetWord, setTestTargetWord] = useState<DailyWordData | null>(null);
  const [testGuessInput, setTestGuessInput] = useState('');
  const [testResult, setTestResult] = useState<{ temperature: number; similarityReason: string; isWinning?: boolean } | null>(null);
  const [testEvaluating, setTestEvaluating] = useState(false);

  // Import/Export modal state
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonFeedback, setJsonFeedback] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Word Editor Form State
  const [formCategory, setFormCategory] = useState<CategoryId>('work_terminology');
  const [formSecretWord, setFormSecretWord] = useState('');
  const [formDateKey, setFormDateKey] = useState(getTodayDateString());
  const [formHintDefinition, setFormHintDefinition] = useState('');
  const [formHangmanWord, setFormHangmanWord] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'Snadná' | 'Střední' | 'Pokročilá'>('Střední');
  
  // Millionaire Form State
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptionA, setFormOptionA] = useState('');
  const [formOptionB, setFormOptionB] = useState('');
  const [formOptionC, setFormOptionC] = useState('');
  const [formOptionD, setFormOptionD] = useState('');
  const [formCorrectIdx, setFormCorrectIdx] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formPracticalContext, setFormPracticalContext] = useState('');
  
  // AI Assist State in Modal
  const [aiGenerating, setAiGenerating] = useState(false);

  const todayStr = getTodayDateString();

  // Reload catalogue when changed
  const refreshCatalogue = () => {
    setCatalogue({ ...getWordsCatalogue() });
  };

  useEffect(() => {
    const handleUpdate = () => refreshCatalogue();
    window.addEventListener('korpo_words_updated', handleUpdate);
    return () => window.removeEventListener('korpo_words_updated', handleUpdate);
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filter words
  let allWordsList: DailyWordData[] = [];
  if (selectedCategoryFilter === 'all') {
    allWordsList = [
      ...(catalogue.work_terminology || []),
      ...(catalogue.work_en || []),
      ...(catalogue.general_en || [])
    ];
  } else {
    allWordsList = catalogue[selectedCategoryFilter] || [];
  }

  const filteredWords = allWordsList.filter((w) => {
    const matchesSearch = 
      w.secretWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.hintDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.hangmanWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.millionaire.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = selectedDifficulty === 'all' || w.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  // Open Create Modal
  const handleOpenCreateModal = (defaultCategory: CategoryId = 'work_terminology') => {
    setEditingWord(null);
    setFormCategory(defaultCategory);
    setFormSecretWord('');
    setFormDateKey(todayStr);
    setFormHintDefinition('');
    setFormHangmanWord('');
    setFormDifficulty('Střední');
    setFormQuestion('');
    setFormOptionA('');
    setFormOptionB('');
    setFormOptionC('');
    setFormOptionD('');
    setFormCorrectIdx(0);
    setFormExplanation('');
    setFormPracticalContext('');
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (word: DailyWordData) => {
    setEditingWord(word);
    setFormCategory(word.categoryId);
    setFormSecretWord(word.secretWord);
    setFormDateKey(word.dateKey);
    setFormHintDefinition(word.hintDefinition);
    setFormHangmanWord(word.hangmanWord);
    setFormDifficulty(word.difficulty);
    setFormQuestion(word.millionaire.question);
    setFormOptionA(word.millionaire.options[0] || '');
    setFormOptionB(word.millionaire.options[1] || '');
    setFormOptionC(word.millionaire.options[2] || '');
    setFormOptionD(word.millionaire.options[3] || '');
    setFormCorrectIdx(word.millionaire.correctAnswerIndex ?? 0);
    setFormExplanation(word.millionaire.explanation || '');
    setFormPracticalContext(word.millionaire.practicalContext || '');
    setIsEditModalOpen(true);
  };

  // Trigger Gemini AI Generation for word
  const handleGenerateAiMetadata = async () => {
    if (!formSecretWord.trim()) {
      showNotification('Nejprve zadejte název slova nebo termínu.');
      return;
    }

    setAiGenerating(true);
    try {
      const catInfo = CATEGORIES.find(c => c.id === formCategory);
      const res = await fetch('/api/generate-word-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: formSecretWord.trim(),
          categoryId: formCategory,
          categoryTitle: catInfo?.title
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.hintDefinition) setFormHintDefinition(d.hintDefinition);
        if (d.hangmanWord) setFormHangmanWord(d.hangmanWord.toUpperCase());
        if (d.difficulty) setFormDifficulty(d.difficulty);
        if (d.millionaire) {
          setFormQuestion(d.millionaire.question || '');
          if (Array.isArray(d.millionaire.options)) {
            setFormOptionA(d.millionaire.options[0] || '');
            setFormOptionB(d.millionaire.options[1] || '');
            setFormOptionC(d.millionaire.options[2] || '');
            setFormOptionD(d.millionaire.options[3] || '');
          }
          setFormCorrectIdx(d.millionaire.correctAnswerIndex ?? 0);
          setFormExplanation(d.millionaire.explanation || '');
          setFormPracticalContext(d.millionaire.practicalContext || '');
        }
        showNotification(`Podklady pro "${formSecretWord}" byly úspěšně vygenerovány pomocí Gemini AI!`);
      } else {
        showNotification('Generování se nezdařilo, zkuste to znovu.');
      }
    } catch (err) {
      console.error(err);
      showNotification('Chyba při komunikaci s AI generátorem.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Save form
  const handleSaveWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSecretWord.trim() || !formHintDefinition.trim()) {
      showNotification('Vyplňte prosím název slova a definici.');
      return;
    }

    const newWordData: DailyWordData = {
      dateKey: formDateKey || todayStr,
      categoryId: formCategory,
      secretWord: formSecretWord.trim(),
      secretWordNormalized: formSecretWord.trim().toLowerCase(),
      hintDefinition: formHintDefinition.trim(),
      hangmanWord: (formHangmanWord || formSecretWord).trim().toUpperCase(),
      difficulty: formDifficulty,
      millionaire: {
        question: formQuestion.trim() || `V jaké pracovní situaci se používá "${formSecretWord}"?`,
        options: [
          formOptionA.trim() || 'Správná odpověď v kontextu firemní praxe.',
          formOptionB.trim() || 'Alternativní nesprávná varianta.',
          formOptionC.trim() || 'Druhá nesprávná možnost.',
          formOptionD.trim() || 'Třetí nesprávná možnost.'
        ],
        correctAnswerIndex: formCorrectIdx,
        explanation: formExplanation.trim() || `Pojem ${formSecretWord} je klíčový pro koordinaci práce.`,
        practicalContext: formPracticalContext.trim() || 'Doporučuje se používat srozumitelně v týmové komunikaci.'
      }
    };

    saveWordToCatalogue(newWordData);
    refreshCatalogue();
    setIsEditModalOpen(false);
    showNotification(`Slovo "${newWordData.secretWord}" bylo úspěšně uloženo do slovníku.`);
  };

  // Set as Active Today
  const handleSetToday = (word: DailyWordData) => {
    setWordAsActiveToday(word.categoryId, word);
    refreshCatalogue();
    showNotification(`Slovo "${word.secretWord}" bylo nastaveno jako dnešní aktivní výzva pro tým!`);
  };

  // Delete word
  const handleDeleteWord = (word: DailyWordData) => {
    if (confirm(`Opravdu chcete odstranit slovo "${word.secretWord}" (${word.dateKey})?`)) {
      deleteWordFromCatalogue(word.categoryId, word.dateKey, word.secretWord);
      refreshCatalogue();
      showNotification(`Slovo "${word.secretWord}" bylo odstraněno.`);
    }
  };

  // Open Semantic Tester Modal
  const handleOpenTestModal = (word: DailyWordData) => {
    setTestTargetWord(word);
    setTestGuessInput('');
    setTestResult(null);
    setIsTestModalOpen(true);
  };

  // Run Semantic Test
  const handleRunSemanticTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTargetWord || !testGuessInput.trim()) return;

    setTestEvaluating(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/evaluate-guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guess: testGuessInput.trim(),
          secretWord: testTargetWord.secretWord,
          category: testTargetWord.categoryId,
          contextDescription: testTargetWord.hintDefinition
        })
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error(err);
      setTestResult({
        temperature: 50,
        similarityReason: 'Chyba spojení se serverem při testování.'
      });
    } finally {
      setTestEvaluating(false);
    }
  };

  // Handle JSON Import
  const handleImportJson = () => {
    if (!jsonText.trim()) return;
    const ok = importWordsCatalogueJson(jsonText);
    if (ok) {
      refreshCatalogue();
      setJsonFeedback('Slovník byl úspěšně naimportován!');
      setTimeout(() => {
        setIsJsonModalOpen(false);
        setJsonFeedback(null);
        showNotification('Nový slovník byl úspěšně aktivován.');
      }, 1500);
    } else {
      setJsonFeedback('Neplatný JSON formát. Zkontrolujte strukturu.');
    }
  };

  // Handle Reset Defaults
  const handleResetDefaults = () => {
    if (confirm('Opravdu chcete obnovit celý katalog slov do výchozího stavu? Veškeré vlastní úpravy budou přepsány.')) {
      resetWordsCatalogueToDefault();
      refreshCatalogue();
      showNotification('Slovník byl resetován do výchozího stavu.');
    }
  };

  const getCategoryBadge = (catId: CategoryId) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (catId === 'work_terminology') {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
          {cat?.title || 'Terminologie v práci'}
        </span>
      );
    }
    if (catId === 'work_en') {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
          {cat?.title || 'Angličtina v práci'}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-bold">
        {cat?.title || 'Obecná angličtina'}
      </span>
    );
  };

  return (
    <div id="terminology-manager-view" className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400 flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>Správa & Kontrola Slovníku</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Kontrola slov a firemní terminologie
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Zde máte plnou kontrolu nad všemi slovy v aplikaci. Můžete upravovat definice, přidávat nové firemní pojmy, generovat kvízy s Gemini AI, plánovat slova na konkrétní dny nebo otestovat sémantickou teplotu.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <button
              id="btn-add-word-primary"
              onClick={() => handleOpenCreateModal(selectedCategoryFilter === 'all' ? 'work_terminology' : selectedCategoryFilter)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat nový termín</span>
            </button>

            <button
              onClick={() => {
                setJsonText(exportWordsCatalogueJson());
                setJsonFeedback(null);
                setIsJsonModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>JSON Export/Import</span>
            </button>

            <button
              onClick={handleResetDefaults}
              title="Obnovit výchozí slovník"
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 text-xs font-semibold rounded-xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategoryFilter('work_terminology')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              selectedCategoryFilter === 'work_terminology'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>💼 Terminologie v práci</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
              {catalogue.work_terminology?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategoryFilter('work_en')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              selectedCategoryFilter === 'work_en'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>🏢 Angličtina v práci</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
              {catalogue.work_en?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategoryFilter('general_en')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              selectedCategoryFilter === 'general_en'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>🌐 Obecná angličtina</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
              {catalogue.general_en?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              selectedCategoryFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>Všechny kategorie</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
              {(catalogue.work_terminology?.length || 0) + (catalogue.work_en?.length || 0) + (catalogue.general_en?.length || 0)}
            </span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filtrovat termíny podle názvu, definice, otázky v kvízu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-xs font-semibold text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Všechny obtížnosti</option>
            <option value="Snadná">Snadná</option>
            <option value="Střední">Střední</option>
            <option value="Pokročilá">Pokročilá</option>
          </select>
        </div>
      </div>

      {/* Words Grid / List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredWords.length === 0 ? (
          <div className="p-12 text-center bg-[#11192e] rounded-3xl border border-slate-800">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 font-bold text-base">Nebyly nalezeny žádné termíny odpovídající filtru.</p>
            <p className="text-slate-500 text-xs mt-1">Zkuste upravit vyhledávání nebo přidat nový termín.</p>
          </div>
        ) : (
          filteredWords.map((word) => {
            const isToday = word.dateKey === todayStr;

            return (
              <div
                key={`${word.categoryId}_${word.dateKey}_${word.secretWord}`}
                id={`term-card-${word.secretWord.toLowerCase()}`}
                className={`p-5 md:p-6 rounded-3xl border transition-all ${
                  isToday
                    ? 'bg-gradient-to-r from-indigo-950/40 via-[#11192e] to-indigo-950/20 border-indigo-500/40 shadow-xl shadow-indigo-950/20'
                    : 'bg-[#11192e] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Word and Badges */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                        {word.secretWord}
                      </h3>

                      {getCategoryBadge(word.categoryId)}

                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        word.difficulty === 'Snadná' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : word.difficulty === 'Střední'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {word.difficulty}
                      </span>

                      {isToday ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-[11px] font-bold flex items-center space-x-1 shadow-md">
                          <Check className="w-3 h-3" />
                          <span>Dnešní aktivní výzva</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[11px] font-mono border border-slate-800 flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{word.dateKey}</span>
                        </span>
                      )}
                    </div>

                    {/* Definition */}
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider block mb-0.5">
                        Definice / Nápověda:
                      </span>
                      {word.hintDefinition}
                    </p>

                    {/* Hangman clue keyword */}
                    <div className="flex items-center space-x-2 text-xs text-indigo-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 w-fit">
                      <span className="text-slate-500 font-semibold text-[11px]">Tajenka pro šibenici:</span>
                      <span className="font-mono font-bold tracking-wider text-amber-400">{word.hangmanWord}</span>
                    </div>

                    {/* Millionaire scenario preview */}
                    <div className="mt-3 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/70 text-xs">
                      <div className="flex items-center space-x-1.5 text-amber-400 font-bold mb-1.5 text-[11px] uppercase tracking-wider">
                        <Award className="w-3.5 h-3.5" />
                        <span>Bonusový Milionář – Otázka z praxe</span>
                      </div>
                      <p className="text-slate-200 font-semibold mb-2">{word.millionaire.question}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        {word.millionaire.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-1.5 px-2 rounded-lg flex items-center space-x-2 ${
                              oIdx === word.millionaire.correctAnswerIndex
                                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 font-bold'
                                : 'bg-slate-900/40 text-slate-400'
                            }`}
                          >
                            <span className="font-mono font-bold">{['A', 'B', 'C', 'D'][oIdx]}:</span>
                            <span className="truncate">{opt}</span>
                            {oIdx === word.millionaire.correctAnswerIndex && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-auto flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>

                      {word.millionaire.practicalContext && (
                        <p className="text-slate-400 text-[11px] mt-2 italic">
                          💡 <span className="text-slate-300 font-medium">Praxe:</span> {word.millionaire.practicalContext}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {!isToday && (
                      <button
                        onClick={() => handleSetToday(word)}
                        className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                        title="Nastavit toto slovo jako dnešní tajenku"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Nastavit dnes</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenTestModal(word)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                      title="Otestovat jak Gemini vyhodnocuje tipy proti tomuto slovu"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Testovat AI</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(word)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Upravit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteWord(word)}
                      className="px-3 py-2 bg-slate-900/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Smazat</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Create Word Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#11192e] border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <BookOpenCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">
                  {editingWord ? `Upravit slovo: ${editingWord.secretWord}` : 'Přidat nový termín / slovo'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWord} className="space-y-6 mt-6">
              {/* Row 1: Word + Category + AI Assist */}
              <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    1. Základní identifikace
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateAiMetadata}
                    disabled={aiGenerating || !formSecretWord.trim()}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generuji s Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Vygenerovat podklady s AI</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Kategorie *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as CategoryId)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="work_terminology">Terminologie v práci (Praxe & Metodika)</option>
                      <option value="work_en">Angličtina v práci (Business EN)</option>
                      <option value="general_en">Obecná angličtina (General EN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Hledané slovo / Termín *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="např. Standup, KPI, SLA, Roadmap"
                      value={formSecretWord}
                      onChange={(e) => setFormSecretWord(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Datum výzvy (YYYY-MM-DD) *
                    </label>
                    <div className="flex space-x-1">
                      <input
                        type="date"
                        required
                        value={formDateKey}
                        onChange={(e) => setFormDateKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setFormDateKey(todayStr)}
                        className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg hover:text-white"
                        title="Nastavit na dnešek"
                      >
                        Dnes
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Klíčové slovo pro šibenici (Hangman) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="např. PROCES, OUTPUT, VYSLEDEK"
                      value={formHangmanWord}
                      onChange={(e) => setFormHangmanWord(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-indigo-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Obtížnost
                    </label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Snadná">Snadná</option>
                      <option value="Střední">Střední</option>
                      <option value="Pokročilá">Pokročilá</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Srozumitelná definice / nápověda *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Vysvětlení pojmu a jeho významu..."
                    value={formHintDefinition}
                    onChange={(e) => setFormHintDefinition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Millionaire Scenario Dilemma */}
              <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  2. Bonusový Milionář (Otázka a možnosti)
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Kvízová otázka z firemní praxe
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="např. Vedení představuje novou strategii..."
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-400">Možnost A</label>
                      <label className="text-[11px] text-emerald-400 flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={formCorrectIdx === 0}
                          onChange={() => setFormCorrectIdx(0)}
                        />
                        <span>Správná</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={formOptionA}
                      onChange={(e) => setFormOptionA(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-400">Možnost B</label>
                      <label className="text-[11px] text-emerald-400 flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={formCorrectIdx === 1}
                          onChange={() => setFormCorrectIdx(1)}
                        />
                        <span>Správná</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={formOptionB}
                      onChange={(e) => setFormOptionB(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-400">Možnost C</label>
                      <label className="text-[11px] text-emerald-400 flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={formCorrectIdx === 2}
                          onChange={() => setFormCorrectIdx(2)}
                        />
                        <span>Správná</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={formOptionC}
                      onChange={(e) => setFormOptionC(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-400">Možnost D</label>
                      <label className="text-[11px] text-emerald-400 flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={formCorrectIdx === 3}
                          onChange={() => setFormCorrectIdx(3)}
                        />
                        <span>Správná</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={formOptionD}
                      onChange={(e) => setFormOptionD(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Vysvětlení správné odpovědi
                    </label>
                    <input
                      type="text"
                      value={formExplanation}
                      onChange={(e) => setFormExplanation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Praktická rada do firemní praxe
                    </label>
                    <input
                      type="text"
                      value={formPracticalContext}
                      onChange={(e) => setFormPracticalContext(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  Zrušit
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Uložit do slovníku</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Semantic AI Tester Modal */}
      {isTestModalOpen && testTargetWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#11192e] border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">AI Simulátor sémantické teploty</h3>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Testovaný cíl (100 °C):</div>
              <div className="text-xl font-black text-white mt-1">{testTargetWord.secretWord}</div>
              <div className="text-xs text-slate-400 mt-1">{testTargetWord.hintDefinition}</div>
            </div>

            <form onSubmit={handleRunSemanticTest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Zadejte testovací hráčský tip:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="např. blízký nebo vzdálený pojem..."
                    value={testGuessInput}
                    onChange={(e) => setTestGuessInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={testEvaluating || !testGuessInput.trim()}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/30 flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {testEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Vyhodnotit</span>
                  </button>
                </div>
              </div>

              {testResult && (
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Výsledná teplota:
                    </span>
                    <span className={`text-2xl font-mono font-black ${
                      testResult.temperature >= 85 ? 'text-red-400' :
                      testResult.temperature >= 60 ? 'text-amber-400' :
                      testResult.temperature >= 30 ? 'text-yellow-300' : 'text-blue-400'
                    }`}>
                      {testResult.temperature.toFixed(1)} °C
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden my-3 border border-slate-800">
                    <div
                      className={`h-full transition-all duration-700 ${
                        testResult.temperature >= 85 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                        testResult.temperature >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        testResult.temperature >= 30 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                        'bg-gradient-to-r from-blue-600 to-cyan-400'
                      }`}
                      style={{ width: `${Math.min(testResult.temperature, 100)}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 font-bold">Komentář Gemini AI:</span> {testResult.similarityReason}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* JSON Import/Export Modal */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#11192e] border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Export & Import Firemního Slovníku (JSON)</h3>
              </div>
              <button
                onClick={() => setIsJsonModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 my-3">
              Zde můžete zkopírovat kompletní slovník pro zálohu nebo vložit hromadný seznam nových firemních pojmů ve formátu JSON.
            </p>

            <textarea
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />

            {jsonFeedback && (
              <div className={`mt-3 p-2.5 rounded-xl text-xs font-bold ${
                jsonFeedback.includes('úspěšně') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {jsonFeedback}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonText);
                  setJsonFeedback('Zkopírováno do schránky!');
                  setTimeout(() => setJsonFeedback(null), 2000);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                Zkopírovat do schránky
              </button>

              <button
                onClick={handleImportJson}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
              >
                Uložit a načíst JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
