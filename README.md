# 🏢 Korpo-Lingvo (Firemní Slovníková & Znalostní Hra)

Interaktivní týmová vzdělávací webová aplikace pro hádání a procvičování firemní terminologie, angličtiny v práci a obecné angličtiny pomocí sémantické umělé inteligence (**Google Gemini 2.5 Flash**).

---

## 🚀 Hlavní funkce

- 🎯 **Sémantické hádání slov (Semantle princip)**: Hráči zadávají libovolné tipy, které Gemini AI vyhodnocuje a vrací sémantickou teplotu (0–100 °C) a věcné vysvětlení příbuznosti.
- 🔤 **Šibenice (Hangman)**: Odemknutelná nápověda pro odhalování písmen klíčového slova.
- 💰 **Bonusový Milionář**: Interaktivní kvíz se 4 možnostmi (A, B, C, D) založený na reálných firemních situacích s vysvětlením a praktickým kontextem.
- 📚 **Správce slovníku & kontrola terminologie**:
  - Fulltextové vyhledávání a filtrování podle kategorií i obtížnosti.
  - Generování nových firemních termínů a kvízů jedním kliknutím pomocí Gemini AI.
  - Nastavení libovolného slova jako dnešní aktivní výzvy pro tým.
  - AI simulátor pro testování sémantických teplot tipů.
  - Export a import celého slovníku v JSON formátu.
- 🏆 **Firemní žebříček & profily**: Přehled skóre, úspěšnosti a statistik všech kolegů.
- 🔐 **Autentizace & Firestore podpora**: Připraveno pro Firebase Auth i lokální týmový režim.

---

## 🛠️ Použité technologie

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons, Canvas Confetti
- **Backend / API**: Express.js, TypeScript (`tsx` / `esbuild`), `@google/genai` SDK
- **Build nástroj**: Vite 6

---

## 📦 Rychlé spuštění lokálně

### 1. Klonování repozitáře
```bash
git clone https://github.com/VASE-JMENO/korpo-lingvo.git
cd korpo-lingvo
```

### 2. Instalace závislostí
```bash
npm install
```

### 3. Nastavení proměnných prostředí
Vytvořte soubor `.env` v kořenovém adresáři:
```env
GEMINI_API_KEY=vase_gemini_api_klic
```
*(Klíč k API získáte zdarma na [Google AI Studio](https://aistudio.google.com/app/apikey))*

### 4. Spuštění vývojového serveru
```bash
npm run dev
```
Aplikace poběží na `http://localhost:3000`.

---

## 🏗️ Produkční sestavení & Spuštění

```bash
# Sestavení frontendu i backendu
npm run build

# Spuštění produkčního serveru
npm run start
```

---

## 📁 Struktura projektu

```text
├── src/
│   ├── components/       # UI komponenty (GameBoard, TerminologyManagerView, LeaderboardView, ...)
│   ├── context/          # React Context (AuthContext)
│   ├── data/             # Slovník slov, mock data a funkce pro správu katalogu
│   ├── types.ts          # TypeScript rozhraní a typy
│   ├── App.tsx           # Hlavní komponenta aplikace
│   └── main.tsx          # Vstupní bod Reactu
├── server.ts             # Express server s Gemini AI API endpointy
├── metadata.json         # Konfigurace aplikace
├── .env.example          # Vzor konfigurace proměnných prostředí
└── package.json          # Závislosti a skripty
```

---

## 📄 Licence
MIT
