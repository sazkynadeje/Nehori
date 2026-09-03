import React, { useState } from 'react';
import { Database, Code2, ShieldCheck, Cloud, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

export const FirestoreGuideView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const schemaJson = `{
  // Kolekce: 'users' -> Dokumenty identifikované UID uživatele z Firebase Auth
  "users": {
    "{uid}": {
      "uid": "string (Firebase Auth UID)",
      "email": "jan.kovar@firma.cz",
      "displayName": "Jan Kovář",
      "department": "Vývoj & IT Architektura",
      "role": "Senior Frontend Engineer",
      "avatarSeed": "JK",
      "emailVerified": true,
      "createdAt": 1756738900000,
      "badges": ["first_word", "hot_streak_3", "millionaire_boss"],
      "stats": {
        "gamesPlayed": 24,
        "gamesWon": 21,
        "currentStreak": 14,
        "maxStreak": 14,
        "totalGuesses": 88,
        "millionaireCorrect": 6,
        "hangmanUsed": 2,
        "totalScore": 4250
      }
    }
  },

  // Kolekce: 'daily_words' -> Denní tajná slova dle data a kategorie
  "daily_words": {
    "2026-09-01_work_terminology": {
      "dateKey": "2026-09-01",
      "categoryId": "work_terminology", // 'general_en' | 'work_en' | 'work_terminology'
      "secretWord": "Synergie",
      "secretWordNormalized": "synergie",
      "hintDefinition": "Vzájemné působení prvků, kdy celkový efekt je větší než součet částí.",
      "hangmanWord": "SOUCINNOST",
      "difficulty": "Střední",
      "millionaire": {
        "question": "Vedení představuje fúzi dvou oddělení se slovy: Hledáme synergický efekt. Co je cílem?",
        "options": [
          "Využít sdílené know-how a nástroje tak, aby společný výkon překonal samostatné fungování.",
          "Zvýšit administrativní zátěž a zavést dvojité schvalování faktur.",
          "Zrušit veškeré pravidelné týmové schůzky bez náhrady.",
          "Oddělit IT infrastrukturu obou týmů do izolovaných sítí."
        ],
        "correctAnswerIndex": 0,
        "explanation": "Synergie znamená, že propojením dvou zdrojů vzniká přidaná hodnota (1 + 1 = 3)."
      }
    }
  },

  // Kolekce: 'user_guesses' -> Auditní záznam každého pokusu s naměřenou teplotou
  "user_guesses": {
    "{guessId}": {
      "userId": "{uid}",
      "dateKey": "2026-09-01",
      "categoryId": "work_terminology",
      "guessWord": "Konsolidace",
      "temperature": 88.4,
      "similarityReason": "Velmi blízký koncept týkající se sjednocování struktur.",
      "timestamp": 1756739200000
    }
  }
}`;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Pomocné funkce
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Kolekce uživatelů: Každý přihlášený kolega může číst profily ostatních pro žebříček,
    // ale upravovat smí pouze svůj vlastní profil.
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isOwner(userId);
      allow delete: if false; // Mazání zakázáno
    }

    // Denní slova: Hráči mohou číst pouze nápovědy a otázku, tajné slovo se vyhodnocuje přes Cloud Function
    match /daily_words/{wordId} {
      allow read: if isAuthenticated();
      allow write: if false; // Pouze admin nebo Cloud Function
    }

    // Pokusy uživatelů: Uživatel může zapisovat své vlastní tipy
    match /user_guesses/{guessId} {
      allow read, create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}`;

  const cloudFunctionCode = `// functions/index.js (Firebase Cloud Functions v2)
const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.evaluateGuess = onRequest({ cors: true }, async (req, res) => {
  const { guess, secretWord, category, contextDescription } = req.body;

  if (!guess || !secretWord) {
    return res.status(400).json({ error: "Chybí parametry" });
  }

  // Přímá shoda
  if (guess.trim().toLowerCase() === secretWord.trim().toLowerCase()) {
    return res.json({
      temperature: 100.0,
      similarityReason: "Zásah do černého! Přesně tohle slovo jsme hledali (100 °C).",
      isWinning: true
    });
  }

  const prompt = \`Jsi přísný sémantický rozhodčí ve firemní slovníkové hře "Korpo-Lingvo".
Kategorie: "\${category}"
Tajné slovo (100 °C): "\${secretWord}"
Kontext: "\${contextDescription || ''}"
Hráčův tip: "\${guess}"

Ohodnoť sémantickou blízkost tipu k tajnému slovu od 0.0 do 99.9 °C ve formátu JSON:
{
  "temperature": number (0.0 až 99.9),
  "similarityReason": string (stručný komentář v češtině)
}\`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text);
    return res.json({
      temperature: parseFloat(parsed.temperature),
      similarityReason: parsed.similarityReason,
      isWinning: false
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});`;

  return (
    <div id="firestore-guide-view" className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
          <Database className="w-3.5 h-3.5" />
          <span>Architektura & Firestore Schéma</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Struktura databáze a nasazení na Firebase
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
          Zde je detailní návrh Firestore kolekcí, bezpečnostních pravidel (Security Rules) a Firebase Cloud Function integrující Google Gemini API pro vyhodnocování sémantické teploty.
        </p>
      </div>

      {/* 1. Firestore Database Schema */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">1. Firestore JSON Schéma Kolekcí</h3>
          </div>
          <button
            onClick={() => copyToClipboard(schemaJson, 'schema')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center space-x-1.5 transition-colors"
          >
            {copiedKey === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'schema' ? 'Zkopírováno' : 'Kopírovat'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed">
          {schemaJson}
        </pre>
      </div>

      {/* 2. Security Rules */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">2. Bezpečnostní pravidla (firestore.rules)</h3>
          </div>
          <button
            onClick={() => copyToClipboard(firestoreRules, 'rules')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center space-x-1.5 transition-colors"
          >
            {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'rules' ? 'Zkopírováno' : 'Kopírovat'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-200 overflow-x-auto leading-relaxed">
          {firestoreRules}
        </pre>
      </div>

      {/* 3. Firebase Cloud Function */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <Cloud className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">3. Cloud Function (Gemini Sémantická teplota)</h3>
          </div>
          <button
            onClick={() => copyToClipboard(cloudFunctionCode, 'cf')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center space-x-1.5 transition-colors"
          >
            {copiedKey === 'cf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'cf' ? 'Zkopírováno' : 'Kopírovat'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed">
          {cloudFunctionCode}
        </pre>
      </div>

      {/* 4. Deployment Steps */}
      <div className="bg-[#11192e] rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex items-center space-x-2.5">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">4. Návod k nasazení na Firebase Hosting & Firestore</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs font-mono font-bold text-indigo-400 mb-1">KROK 1</div>
            <h4 className="text-sm font-bold text-white mb-2">Inicializace projektu</h4>
            <p className="text-xs text-slate-400 mb-3">Nainstalujte Firebase CLI a přihlaste se k účtu.</p>
            <code className="block bg-slate-950 p-2.5 rounded-xl text-[11px] font-mono text-slate-300">
              npm install -g firebase-tools<br/>
              firebase login<br/>
              firebase init
            </code>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs font-mono font-bold text-indigo-400 mb-1">KROK 2</div>
            <h4 className="text-sm font-bold text-white mb-2">Nastavení Gemini API klíče</h4>
            <p className="text-xs text-slate-400 mb-3">Přidejte klíč do Firebase Functions secrets.</p>
            <code className="block bg-slate-950 p-2.5 rounded-xl text-[11px] font-mono text-slate-300">
              firebase functions:secrets:set GEMINI_API_KEY
            </code>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs font-mono font-bold text-indigo-400 mb-1">KROK 3</div>
            <h4 className="text-sm font-bold text-white mb-2">Build a Deploy</h4>
            <p className="text-xs text-slate-400 mb-3">Sestavte aplikaci a publikujte na Firebase.</p>
            <code className="block bg-slate-950 p-2.5 rounded-xl text-[11px] font-mono text-slate-300">
              npm run build<br/>
              firebase deploy
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
