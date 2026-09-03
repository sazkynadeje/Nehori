import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return aiClient;
}

// Normalized string distance fallback calculation
function calculateFallbackTemperature(guess: string, target: string, category: string): { temperature: number; hint: string } {
  const g = guess.trim().toLowerCase();
  const t = target.trim().toLowerCase();

  if (g === t) {
    return { temperature: 100, hint: 'Přesná trefa! Našel jsi hledané slovo!' };
  }

  // Exact substring or vice versa
  if (t.includes(g) || g.includes(t)) {
    return { temperature: 88.5, hint: 'Přihořívá! Velmi blízký slovní základ nebo tvar.' };
  }

  // Simple character overlap & length heuristic
  let commonChars = 0;
  const uniqueG = new Set(g.split(''));
  for (const c of uniqueG) {
    if (t.includes(c)) commonChars++;
  }
  const ratio = commonChars / Math.max(t.length, 1);
  const baseTemp = Math.min(Math.round(ratio * 40 + Math.random() * 15), 75);

  let hint = 'Zima. Významově i sémanticky vzdálené slovo.';
  if (baseTemp > 50) hint = 'Vlažno. Jsi ve správné tematické oblasti.';
  else if (baseTemp > 30) hint = 'Chladno. Zkus se zamyslet nad jiným úhlem pohledu.';

  return { temperature: Math.max(1, baseTemp), hint };
}

// API: Semantic evaluation endpoint (calls Gemini or fallback)
app.post('/api/evaluate-guess', async (req: Request, res: Response) => {
  try {
    const { guess, secretWord, category, contextDescription } = req.body;

    if (!guess || !secretWord) {
      return res.status(400).json({ error: 'Chybí tip (guess) nebo tajné slovo (secretWord)' });
    }

    const cleanGuess = String(guess).trim();
    const cleanSecret = String(secretWord).trim();

    // Check exact case-insensitive match immediately
    if (cleanGuess.toLowerCase() === cleanSecret.toLowerCase()) {
      return res.json({
        temperature: 100,
        similarityReason: 'Zásah do černého! Přesně tohle slovo jsme hledali (100 °C).',
        isWinning: true
      });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `Jsi přísný sémantický rozhodčí ve firemní slovníkové hře "Korpo-Lingvo / Semantická teplota".
Kategorie: "${category || 'Firemní terminologie'}"
Tajné cílové slovo (100 °C): "${cleanSecret}"
Kontext/definice cílového slova: "${contextDescription || ''}"
Hráčův tip: "${cleanGuess}"

Tvým úkolem je ohodnotit sémantickou a kontextuální blízkost hráčova tipu k tajnému slovu na škále 0.0 až 99.9 °C:
- 100.0 °C je vyhrazeno POUZE pro přesné cílové slovo nebo jeho přímé synonymum.
- 85.0 až 98.0 °C: Extrémně horko (přímý příbuzný pojem, synonyma, klíčový element stejného procesu).
- 60.0 až 84.9 °C: Teplo (stejná profesní doména, logická vazba, úzce související pojem).
- 30.0 až 59.9 °C: Vlažno (obecný korporátní pojem, vzdálenější souvislost).
- 0.0 až 29.9 °C: Zima / mráz (zcela mimo téma, nesouvisející věc).

Odpověz VÝHRADNĚ ve formátu JSON s těmito klíči:
{
  "temperature": number (číslo s jedním desetinným místem od 0 do 99.9),
  "similarityReason": string (stručný a trefný komentář v češtině, max 1 věta)
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const rawText = response.text || '';
        const parsed = JSON.parse(rawText);
        const temp = Math.min(Math.max(parseFloat(parsed.temperature) || 10, 0), 99.9);

        return res.json({
          temperature: Math.round(temp * 10) / 10,
          similarityReason: parsed.similarityReason || 'Vyhodnoceno modelem Gemini.',
          isWinning: false
        });
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to heuristic:', geminiErr);
      }
    }

    // Heuristic fallback
    const fallback = calculateFallbackTemperature(cleanGuess, cleanSecret, category);
    return res.json({
      temperature: fallback.temperature,
      similarityReason: fallback.hint,
      isWinning: fallback.temperature >= 100
    });
  } catch (error: any) {
    console.error('Error evaluating guess:', error);
    return res.status(500).json({ error: 'Chyba při vyhodnocování tipu.' });
  }
});

// API: AI Word & Terminology Generator / Reviewer
app.post('/api/generate-word-metadata', async (req: Request, res: Response) => {
  try {
    const { word, categoryId, categoryTitle } = req.body;
    if (!word) {
      return res.status(400).json({ error: 'Chybí zadané slovo / termín' });
    }

    const cleanWord = String(word).trim();
    const isEn = categoryId === 'general_en' || categoryId === 'work_en';

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `Jsi odborný lingvista a metodik pro firemní vzdělávací hru "Korpo-Lingvo".
Uživatel zadal slovo/termín: "${cleanWord}"
Kategorie: "${categoryTitle || categoryId || 'Firemní terminologie v práci'}"

Tvým úkolem je připravit kompletní podklady pro toto slovo v JSON formátu:
1. "hintDefinition": Přesná, srozumitelná definice. Pokud je kategorie Obecná angličtina nebo Angličtina v práci, napiš definici v přirozené angličtině. Pokud je to Terminologie v práci, napiš definici v češtině.
2. "hangmanWord": Stručné klíčové slovo nebo dvousloví (POUZE velká písmena bez háčků a čárek, např. "PROCES", "OUTPUT", "PRIORITA", "TEAMWORK", "DELIVERABLE"), které slouží jako tajenka pro šibenici.
3. "difficulty": 'Snadná' | 'Střední' | 'Pokročilá'
4. "millionaire": Kvízová otázka s firemní situací:
   - "question": Otázka z firemní praxe, kde se tento pojem používá (česky).
   - "options": Pole přesně 4 možností [A, B, C, D] (česky), kde právě jedna je správná.
   - "correctAnswerIndex": Index správné možnosti (0, 1, 2 nebo 3).
   - "explanation": Vysvětlení, proč je daná možnost správná (česky).
   - "practicalContext": Stručná rada do firemní praxe, jak tento termín správně používat.

Odpověz VÝHRADNĚ ve formátu JSON:
{
  "hintDefinition": string,
  "hangmanWord": string,
  "difficulty": "Snadná" | "Střední" | "Pokročilá",
  "millionaire": {
    "question": string,
    "options": [string, string, string, string],
    "correctAnswerIndex": number,
    "explanation": string,
    "practicalContext": string
  }
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          data: parsed
        });
      } catch (geminiErr: any) {
        console.warn('Gemini metadata generation failed:', geminiErr);
      }
    }

    // Fallback default structure if Gemini is not reachable
    return res.json({
      success: true,
      data: {
        hintDefinition: isEn 
          ? `Professional term related to ${cleanWord} used in corporate workflows.` 
          : `Odborný termín "${cleanWord}" používaný v týmové spolupráci a projektovém řízení.`,
        hangmanWord: cleanWord.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 12),
        difficulty: 'Střední',
        millionaire: {
          question: `V jaké pracovní situaci se nejčastěji uplatní pojem "${cleanWord}"?`,
          options: [
            `Při standardizaci postupů a komunikaci v rámci "${cleanWord}".`,
            'Pouze při objednávání kancelářských potřeb.',
            'Výhradně při výpočtu ročních daní.',
            'Při plánování vánočního večírku.'
          ],
          correctAnswerIndex: 0,
          explanation: `Pojem "${cleanWord}" označuje klíčový postup či koncept v dané doméně.`,
          practicalContext: 'Správné pochopení a používání tohoto termínu zlepšuje srozumitelnost týmové komunikace.'
        }
      }
    });
  } catch (error: any) {
    console.error('Error generating word metadata:', error);
    return res.status(500).json({ error: 'Chyba při generování podkladů ke slovu.' });
  }
});

// API: Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
