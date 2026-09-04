import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

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

// API: Automatic Daily Word & Infinite AI Generator (No manual dictionary needed!)
const dailyWordCache = new Map<string, any>();

const FALLBACK_WORDS: Record<string, Array<any>> = {
  general_en: [
    {
      secretWord: 'Resilience',
      hintDefinition: 'The capacity to withstand or to recover quickly from difficulties; mental toughness and flexibility.',
      hangmanWord: 'TOUGHNESS',
      difficulty: 'Střední',
      millionaire: {
        question: 'Která věta v konverzaci s mezinárodním klientem správně ilustruje pojem "Resilience"?',
        options: [
          'Our team showed great resilience when adapting to unexpected market shifts.',
          'We need to buy more resilience for the company warehouse.',
          'Please forward me the resilience invoice by the end of today.',
          'The resilience will attend the sprint review meeting tomorrow.'
        ],
        correctAnswerIndex: 0,
        explanation: '"Resilience" znamená odolnost, schopnost rychle se vzpamatovat z nezdaru nebo se přizpůsobit těžkostem.',
        practicalContext: 'Při komunikaci se zahraničními partnery se výraz často používá k ocenění vytrvalosti týmu při řešení krizí.'
      }
    },
    {
      secretWord: 'Perspective',
      hintDefinition: 'A particular attitude toward or way of regarding something; a point of view.',
      hangmanWord: 'VIEWPOINT',
      difficulty: 'Snadná',
      millionaire: {
        question: 'Co znamená fráze "Let me offer another perspective on this project"?',
        options: [
          'Dovolte mi nabídnout jiný úhel pohledu na tento projekt.',
          'Chci tento projekt okamžitě zrušit z finančních důvodů.',
          'Pošlete mi prosím rozpis dovolených tohoto projektu.',
          'Projekt byl oficiálně schválen nejvyšším vedením.'
        ],
        correctAnswerIndex: 0,
        explanation: '"Perspective" představuje náhled, úhel pohledu nebo celkovou perspektivu.',
        practicalContext: 'Klíčová diplomatická fráze pro konstruktivní oponování na mezinárodních poradách.'
      }
    },
    {
      secretWord: 'Integrity',
      hintDefinition: 'The quality of being honest and having strong moral principles; moral uprightness.',
      hangmanWord: 'HONESTY',
      difficulty: 'Střední',
      millionaire: {
        question: 'Co znamená výrok: "She handled the client crisis with utmost integrity"?',
        options: [
          'Zvládla klientskou krizi s maximální poctivostí a morální zásadovostí.',
          'Vyřešila krizi s minimálními finančními náklady.',
          'Přeložila schůzku s klientem na příští měsíc.',
          'Ignorovala stížnosti klienta podle firemní šablony.'
        ],
        correctAnswerIndex: 0,
        explanation: '"Integrity" vyjadřuje morální pevnost, zásadovost a čestnost.',
        practicalContext: 'Klíčový požadavek u vedoucích pracovníků a auditních rolí.'
      }
    }
  ],
  work_en: [
    {
      secretWord: 'Deliverable',
      hintDefinition: 'A tangible or intangible good or service produced as a result of a project that is intended to be delivered to a customer.',
      hangmanWord: 'OUTPUT',
      difficulty: 'Střední',
      millionaire: {
        question: 'Co přesně znamená, když projektový manažer řekne: "What are the key deliverables for Q3?"',
        options: [
          'Jaké jsou hlavní hmatatelné výstupy a výsledky pro 3. čtvrtletí?',
          'Kolik balíků s poštou dorazilo ve 3. čtvrtletí?',
          'Kdo bude doručovat jídlo na páteční teambuilding?',
          'Které faktury nebyly ve 3. čtvrtletí uhrazeny?'
        ],
        correctAnswerIndex: 0,
        explanation: '"Deliverable" je v projektovém řízení konkrétní výstup, dodávka či produkt.',
        practicalContext: 'Pojem se používá při definici milníků v agilním i vodopádovém řízení.'
      }
    },
    {
      secretWord: 'Bottleneck',
      hintDefinition: 'A point of congestion in a production or workflow system that stops or severely slows down the process.',
      hangmanWord: 'BRZDA',
      difficulty: 'Snadná',
      millionaire: {
        question: 'Kolega v mezinárodním callu řekne: "Legal approval is currently our main bottleneck." Co to znamená?',
        options: [
          'Právní schválení je v současnosti naše hlavní úzké hrdlo (brzda procesu).',
          'Právní oddělení poslalo dárek v podobě láhve vína.',
          'Právníci odmítají pít kávu v kanceláři.',
          'Právní oddělení nemá přístup k internetu.'
        ],
        correctAnswerIndex: 0,
        explanation: '"Bottleneck" (úzké hrdlo) metaforicky označuje fázi procesu, která zpomaluje celý řetězec.',
        practicalContext: 'Zásadní termín pro optimalizaci procesů a odstraňování blokátorů.'
      }
    },
    {
      secretWord: 'Alignment',
      hintDefinition: 'Arrangement in a straight line, or in an appropriate relative position; mutual agreement between teams on goals.',
      hangmanWord: 'SOULAD',
      difficulty: 'Střední',
      millionaire: {
        question: 'V e-mailu stojí: "Let’s have a quick sync to ensure alignment before the pitch." Co odesílatel chce?',
        options: [
          'Krátce se spojit a sladit si očekávání a strategii před prezentací.',
          'Srovnat nábytek v zasedačce podle pravítka.',
          'Zrušit prezentaci kvůli neshodám.',
          'Zkontrolovat zarovnání odstavců v dokumentu.'
        ],
        correctAnswerIndex: 0,
        explanation: '"Alignment" znamená shodu, soulad a synchronizaci cílů a postojů mezi lidmi a týmy.',
        practicalContext: 'Používá se před důležitými prezentacemi nebo při změnách priorit.'
      }
    }
  ],
  work_terminology: [
    {
      secretWord: 'Synergie',
      hintDefinition: 'Efekt vzájemného působení dvou nebo více faktorů či týmů, kdy celkový výsledek je větší než pouhý součet jednotlivých částí (1+1=3).',
      hangmanWord: 'SOUČINNOST',
      difficulty: 'Snadná',
      millionaire: {
        question: 'Co v korporátní praxi nejlépe vystihuje pojem "Synergický efekt"?',
        options: [
          'Výsledek spolupráce dvou oddělení přinese větší hodnotu než součet jejich samostatné práce (1 + 1 = 3).',
          'Povinnost všech zaměstnanců mít stejný model firemního telefonu.',
          'Zvýšení nákladů na projekt přesně o inflační doložku.',
          'Náhodná shoda okolností vedoucí k odložení schůzky.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Synergie představuje fenomén, kdy propojením sil vzniká přidaná hodnota převyšující součet částí.',
        practicalContext: 'Často se zmiňuje při spojování týmů nebo zavádění integrovaných nástrojů.'
      }
    },
    {
      secretWord: 'Onboarding',
      hintDefinition: 'Strukturovaný proces začlenění, adaptace a zaškolení nového zaměstnance do firemní kultury, systémů a pracovních povinností.',
      hangmanWord: 'ADAPTACE',
      difficulty: 'Snadná',
      millionaire: {
        question: 'Co je primárním cílem kvalitního firemního "Onboardingu"?',
        options: [
          'Rychle a bezpečně adaptovat nováčka do týmu, předat know-how a firemní kulturu.',
          'Zkontrolovat, zda nový zaměstnanec přišel do práce včas.',
          'Objednat pro celou kancelář občerstvení na uvítací večírek.',
          'Vyplnit daňové přiznání a nechat zaměstnance bez pomoci.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Onboarding je ucelený proces adaptace nováčka, který výrazně snižuje fluktuaci ve zkušební době.',
        practicalContext: 'Měří se indexem spokojenosti nováčka a časem do plné samostatné produktivity.'
      }
    },
    {
      secretWord: 'Retrospektiva',
      hintDefinition: 'Pravidelné setkání týmu po dokončení sprintu nebo projektu, kde se hodnotí, co fungovalo, co se nepovedlo a jak procesy zlepšit.',
      hangmanWord: 'ZHODNOCENI',
      difficulty: 'Střední',
      millionaire: {
        question: 'Která zásada je klíčová pro úspěšnou týmovou retrospektivu?',
        options: [
          'Zaměřit se na zlepšení procesů bez hledání viníka (kultura bez obviňování - blameless).',
          'Vytipovat jednoho člověka a veřejně mu vytknout všechny chyby.',
          'Podepsat nový finanční kontrakt s dodavatelem.',
          'Schůzku ukončit bez stanovení jakýchkoliv konkrétních akčních kroků.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Retrospektiva má za cíl neustálé zlepšování a vyžaduje psychologické bezpečí bez vzájemného obviňování.',
        practicalContext: 'Z každé retrospektivy by měly vzejít 2–3 konkrétní akční kroky pro další období.'
      }
    }
  ]
};

app.get('/api/daily-word', async (req: Request, res: Response) => {
  try {
    const categoryId = (req.query.categoryId as string) || 'work_terminology';
    const dateKey = (req.query.dateKey as string) || new Date().toISOString().split('T')[0];
    const cacheKey = `${dateKey}_${categoryId}`;

    if (dailyWordCache.has(cacheKey)) {
      return res.json({ success: true, data: dailyWordCache.get(cacheKey), source: 'cache' });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        let domainGuide = '';
        if (categoryId === 'work_terminology') {
          domainGuide = 'Vyber jedno reprezentativní, zajímavé a poučné české nebo počeštěné korporátní a pracovní slovo/termín z reálné praxe (např. Synergie, Onboarding, Prioritizace, Retrospektiva, Eskalace, Delegování, Deadline, Roadmapa, Zpětná vazba, Kapacita, Benchmark, Stakeholder, Brainstorming, Outsourcing, Automatizace, Diverzita, Agilita, Konsolidace, Allokace, Pivotování, Validace, Milník, Mentor, Transparentnost...).';
        } else if (categoryId === 'work_en') {
          domainGuide = 'Vyber jedno autentické Business English slovo nebo obrat z korporátního prostředí (např. Deliverable, Bottleneck, Bandwidth, Alignment, Touchpoint, Low-hanging fruit, Scalability, Pipeline, Leverage, Buy-in, Scope creep, Deep dive, Trade-off, Milestone...).';
        } else {
          domainGuide = 'Vyber jedno zajímavé anglické slovo z obecné slovní zásoby, které rozvíjí plynulost v mezinárodní komunikaci (např. Resilience, Ambiguity, Adaptability, Perspective, Integrity, Empathy, Pragmatic, Nuance, Serendipity, Eloquent, Conundrum, Tenacity, Versatility...).';
        }

        const prompt = `Jsi metodik a tvůrce hádanek pro firemní vzdělávací hru "NE! Naopak!".
Dnes je datum ${dateKey} a kategorie "${categoryId}".
${domainGuide}

Vygeneruj kompletní herní podklady pro toto jedno vybrané denní slovo v JSON formátu:
1. "secretWord": Hledané tajné slovo (1 slovo nebo ustálené dvousloví, správná velká/malá písmena, např. "Synergie" nebo "Deliverable").
2. "hintDefinition": Stručná, srozumitelná a přesná definice pojmu (v češtině, u angličtiny v přirozené angličtině).
3. "hangmanWord": Výraz pro šibenici (POUZE VELKÁ PÍSMENA bez háčků a čárek, např. "SOUCINNOST" nebo "OUTPUT", max 14 znaků).
4. "difficulty": "Snadná" | "Střední" | "Pokročilá".
5. "millionaire": Kvízová otázka do soutěže:
   - "question": Situace z firemní praxe, kde se pojem používá (česky).
   - "options": Přesně 4 možnosti [A, B, C, D] (česky), kde právě jedna je správná.
   - "correctAnswerIndex": Číslo 0, 1, 2 nebo 3 (index správné možnosti).
   - "explanation": Vysvětlení, proč je odpověď správná.
   - "practicalContext": Rada či tip do reálné firemní praxe.

Odpověz VÝHRADNĚ ve formátu JSON bez markdownu kolem:
{
  "secretWord": string,
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
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.secretWord && parsed.millionaire && Array.isArray(parsed.millionaire.options)) {
          const wordData = {
            dateKey: dateKey,
            categoryId: categoryId,
            secretWord: parsed.secretWord.trim(),
            secretWordNormalized: parsed.secretWord.trim().toLowerCase(),
            hintDefinition: parsed.hintDefinition || '',
            hangmanWord: (parsed.hangmanWord || parsed.secretWord).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 14),
            difficulty: parsed.difficulty || 'Střední',
            selectedBy: 'Tým',
            selectedByDepartment: 'Tým',
            millionaire: {
              question: parsed.millionaire.question,
              options: parsed.millionaire.options,
              correctAnswerIndex: typeof parsed.millionaire.correctAnswerIndex === 'number' ? parsed.millionaire.correctAnswerIndex : 0,
              explanation: parsed.millionaire.explanation || '',
              practicalContext: parsed.millionaire.practicalContext || ''
            }
          };

          dailyWordCache.set(cacheKey, wordData);
          return res.json({ success: true, data: wordData, source: 'gemini_ai' });
        }
      } catch (aiErr) {
        console.warn('Gemini daily generation failed, using catalogue fallback:', aiErr);
      }
    }

    // Fallback synchronized catalogue using deterministic date hash
    const fallbacks = FALLBACK_WORDS[categoryId] || FALLBACK_WORDS.work_terminology;
    const charSum = dateKey.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const index = charSum % fallbacks.length;
    const fallbackItem = fallbacks[index] || fallbacks[0];

    const fallbackData = {
      ...fallbackItem,
      dateKey: dateKey,
      categoryId: categoryId,
      secretWordNormalized: fallbackItem.secretWord.toLowerCase(),
      selectedBy: fallbackItem.selectedBy || 'Tým',
      selectedByDepartment: fallbackItem.selectedByDepartment || 'Tým'
    };

    dailyWordCache.set(cacheKey, fallbackData);
    return res.json({ success: true, data: fallbackData, source: 'fallback_catalogue' });
  } catch (error: any) {
    console.error('Error fetching daily word:', error);
    return res.status(500).json({ error: 'Chyba při načítání slova.' });
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

// In-memory store for active users, curator assignments, and history
interface ActiveUserRecord {
  uid: string;
  displayName: string;
  department: string;
  lastActive: number;
}

const activeUsersStore = new Map<string, Map<string, ActiveUserRecord>>(); // dateKey -> (uid -> record)
const curatorAssignmentsStore = new Map<string, any>(); // targetDateKey -> Assignment

// Active colleagues store for today
function ensureActiveColleagues(dateKey: string) {
  if (!activeUsersStore.has(dateKey)) {
    activeUsersStore.set(dateKey, new Map<string, ActiveUserRecord>());
  }
  return activeUsersStore.get(dateKey)!;
}

// History of played words
let historyRecords: any[] = [];

// Helper: Calculate tomorrow date string
function getTomorrowDateString(currentDateStr?: string): string {
  const d = currentDateStr ? new Date(currentDateStr) : new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// API: Register active user today
app.post('/api/curator/register-active', (req: Request, res: Response) => {
  try {
    const { uid, displayName, department, dateKey } = req.body;
    const today = dateKey || new Date().toISOString().split('T')[0];
    const todayActive = ensureActiveColleagues(today);
    
    if (uid && displayName) {
      todayActive.set(uid, {
        uid,
        displayName,
        department: department || 'Firemní tým',
        lastActive: Date.now()
      });
    }

    return res.json({ success: true, count: todayActive.size });
  } catch (err: any) {
    return res.status(500).json({ error: 'Chyba při registraci aktivity.' });
  }
});

// API: Get Curator Assignment Status
app.get('/api/curator/status', (req: Request, res: Response) => {
  try {
    const dateKey = (req.query.dateKey as string) || new Date().toISOString().split('T')[0];
    const targetDateKey = (req.query.targetDateKey as string) || getTomorrowDateString(dateKey);
    const activeUsers = ensureActiveColleagues(dateKey);

    let assignment = curatorAssignmentsStore.get(targetDateKey);

    if (!assignment) {
      // Pick randomly or designate from active users if any exist
      const usersList = Array.from(activeUsers.values());
      if (usersList.length > 0) {
        const selected = usersList[Math.floor(Math.random() * usersList.length)];
        assignment = {
          targetDateKey,
          activeDateKey: dateKey,
          curatorUid: selected.uid,
          curatorDisplayName: selected.displayName,
          curatorDepartment: selected.department,
          isCompleted: false,
          chosenWords: null,
          submittedAt: null
        };
        curatorAssignmentsStore.set(targetDateKey, assignment);
      }
    }

    const todayAssignment = curatorAssignmentsStore.get(dateKey);
    const todayCurator = todayAssignment ? {
      displayName: todayAssignment.curatorDisplayName || 'Tým',
      department: todayAssignment.curatorDepartment || 'Tým',
      note: 'Vybral(a) jsem pro vás dnešní slova z firemní praxe i mezinárodní spolupráce. Hodně štěstí při hádání!'
    } : {
      displayName: 'Tým',
      department: 'Tým',
      note: 'Dnešní slova z firemní praxe i mezinárodní spolupráce jsou připravena k hádání!'
    };

    return res.json({
      success: true,
      assignment,
      todayCurator,
      activeUsersCount: activeUsers.size,
      activeUsers: Array.from(activeUsers.values())
    });
  } catch (err: any) {
    console.error('Error in curator status:', err);
    return res.status(500).json({ error: 'Chyba při zjišťování kurátora.' });
  }
});

// API: Manually or randomly set curator
app.post('/api/curator/assign', (req: Request, res: Response) => {
  try {
    const { targetDateKey, curatorUid, curatorDisplayName, curatorDepartment } = req.body;
    const target = targetDateKey || getTomorrowDateString();
    
    const assignment = {
      targetDateKey: target,
      activeDateKey: new Date().toISOString().split('T')[0],
      curatorUid,
      curatorDisplayName,
      curatorDepartment: curatorDepartment || 'Firemní tým',
      isCompleted: false,
      chosenWords: null,
      submittedAt: null
    };

    curatorAssignmentsStore.set(target, assignment);
    return res.json({ success: true, assignment });
  } catch (err: any) {
    return res.status(500).json({ error: 'Chyba při přiřazení kurátora.' });
  }
});

// API: Generate 4 AI Word Candidates for a category
app.get('/api/curator/candidates', async (req: Request, res: Response) => {
  try {
    const categoryId = (req.query.categoryId as string) || 'work_terminology';
    const targetDateKey = (req.query.targetDateKey as string) || getTomorrowDateString();

    const ai = getGeminiClient();
    if (ai) {
      try {
        let domainGuide = '';
        if (categoryId === 'work_terminology') {
          domainGuide = 'PŘESNĚ 4 různá zajímavá, rozmanitá a poučná česká korporátní a pracovní slova (např. Synergie, Onboarding, Eskalace, Delegování, Deadline, Roadmapa, Zpětná vazba, Benchmark, Stakeholder, Diverzita, Agilita, Konsolidace, Allokace, Pivotování, Validace, Milník...).';
        } else if (categoryId === 'work_en') {
          domainGuide = 'PŘESNĚ 4 autentická Business English slova či fráze z mezinárodního pracovního prostředí (např. Deliverable, Bottleneck, Bandwidth, Alignment, Touchpoint, Low-hanging fruit, Scalability, Pipeline, Leverage, Buy-in, Scope creep, Deep dive, Trade-off...).';
        } else {
          domainGuide = 'PŘESNĚ 4 obohacující anglická slova z obecné slovní zásoby pro mezinárodní konverzaci (např. Resilience, Perspective, Adaptability, Integrity, Empathy, Pragmatic, Nuance, Serendipity, Eloquent, Conundrum, Tenacity, Versatility...).';
        }

        const prompt = `Jsi lingvistický metodik hry "NE! Naopak!".
Generuješ 4 KANDIDÁTNÍ SLOVA pro kurátora na zítřejší den (${targetDateKey}) pro kategorii "${categoryId}".
${domainGuide}

Každé ze 4 slov musí mít:
- "id": Unikátní string (např. "cand_1", "cand_2", ...)
- "secretWord": Hledané slovo
- "hintDefinition": Přesná, srozumitelná definice (česky, nebo přirozeně anglicky u angličtiny)
- "hangmanWord": Výraz pro šibenici (VELKÁ PÍSMENA bez háčků a čárek, max 14 znaků)
- "difficulty": "Snadná" | "Střední" | "Pokročilá"
- "reasonWhyGreat": Krátká věta (10-15 slov), proč je právě toto slovo skvělou výzvou pro kolegy
- "millionaire": Kvízová otázka do soutěže se 4 možnostmi (index 0-3), vysvětlením a praktickým kontextem.

Vrať POUZE validní JSON pole se 4 položkami:
[
  {
    "id": "cand_1",
    "secretWord": string,
    "hintDefinition": string,
    "hangmanWord": string,
    "difficulty": "Snadná" | "Střední" | "Pokročilá",
    "reasonWhyGreat": string,
    "millionaire": {
      "question": string,
      "options": [string, string, string, string],
      "correctAnswerIndex": number,
      "explanation": string,
      "practicalContext": string
    }
  },
  ... (celkem přesně 4 položky)
]`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        });

        const parsed = JSON.parse(response.text || '[]');
        if (Array.isArray(parsed) && parsed.length >= 4) {
          return res.json({ success: true, candidates: parsed.slice(0, 4), source: 'gemini_ai' });
        }
      } catch (gemErr) {
        console.warn('Gemini candidate generation failed, using curated candidate pool:', gemErr);
      }
    }

    // Curated fallback candidate bank (4 candidates per category)
    const fallbackBank: Record<string, any[]> = {
      work_terminology: [
        {
          id: 'cand_wt_1',
          secretWord: 'Synergie',
          hintDefinition: 'Efekt vzájemné součinnosti a spolupráce, kdy společný výsledek převyšuje součet samostatných částí (1+1=3).',
          hangmanWord: 'SOUCINNOST',
          difficulty: 'Snadná',
          reasonWhyGreat: 'Oblíbený pojem vedení, ideální pro otestování pochopení týmové spolupráce.',
          millionaire: {
            question: 'Co v korporátní praxi nejlépe vystihuje pojem "Synergický efekt"?',
            options: [
              'Výsledek spolupráce dvou oddělení přinese větší hodnotu než součet jejich samostatné práce (1 + 1 = 3).',
              'Povinnost všech zaměstnanců mít stejný model firemního telefonu.',
              'Zvýšení nákladů na projekt přesně o inflační doložku.',
              'Náhodná shoda okolností vedoucí k odložení schůzky.'
            ],
            correctAnswerIndex: 0,
            explanation: 'Synergie představuje fenomén, kdy propojením sil vzniká přidaná hodnota převyšující součet částí.',
            practicalContext: 'Často se zmiňuje při spojování týmů nebo zavádění integrovaných nástrojů.'
          }
        },
        {
          id: 'cand_wt_2',
          secretWord: 'Onboarding',
          hintDefinition: 'Strukturovaný proces začlenění, adaptace a zaškolení nového zaměstnance do firemní kultury a systémů.',
          hangmanWord: 'ADAPTACE',
          difficulty: 'Snadná',
          reasonWhyGreat: 'Každý nováček tím prošel – skvělé téma k diskuzi o tom, jak vítat nové kolegy.',
          millionaire: {
            question: 'Co je primárním cílem kvalitního firemního "Onboardingu"?',
            options: [
              'Rychle a bezpečně adaptovat nováčka do týmu, předat know-how a firemní kulturu.',
              'Zkontrolovat, zda nový zaměstnanec přišel do práce včas.',
              'Objednat pro celou kancelář občerstvení na uvítací večírek.',
              'Vyplnit daňové přiznání a nechat zaměstnance bez pomoci.'
            ],
            correctAnswerIndex: 0,
            explanation: 'Onboarding je ucelený proces adaptace nováčka, který výrazně snižuje fluktuaci ve zkušební době.',
            practicalContext: 'Měří se indexem spokojenosti nováčka a časem do plné samostatné produktivity.'
          }
        },
        {
          id: 'cand_wt_3',
          secretWord: 'Eskalace',
          hintDefinition: 'Předání problému, rizika či rozhodnutí na vyšší úroveň řízení, pokud jej nelze vyřešit na stávající úrovni.',
          hangmanWord: 'POSTOUPENI',
          difficulty: 'Střední',
          reasonWhyGreat: 'Klíčová týmová dovednost: vědět, kdy a jak správně problém posunout výš bez paniky.',
          millionaire: {
            question: 'Kdy je v agilním projektu nejvhodnější přistoupit k formální eskalaci?',
            options: [
              'Když blokátor ohrožuje kritický termín a tým vyčerpal své interní pravomoci k jeho vyřešení.',
              'Okamžitě při jakémkoliv drobném překlepu v e-mailu.',
              'Až po skončení celého projektu s půlročním zpožděním.',
              'Pouze v případě, že selže klimatizace v kanceláři.'
            ],
            correctAnswerIndex: 0,
            explanation: 'Eskalace slouží k odblokování překážek s podporou managementu.',
            practicalContext: 'Eskalujte věcně s popisem dopadu a návrhem možných řešení.'
          }
        },
        {
          id: 'cand_wt_4',
          secretWord: 'Roadmapa',
          hintDefinition: 'Strategický plán a vizuální časová osa zobrazující hlavní milníky, cíle a výstupy projektu v čase.',
          hangmanWord: 'HARMONOGRAM',
          difficulty: 'Snadná',
          reasonWhyGreat: 'Základní kámen plánování – každý tým potřebuje vědět, kam společně směřuje.',
          millionaire: {
            question: 'Co je hlavním účelem produktové či projektové roadmapy?',
            options: [
              'Poskytnout týmu a stakeholderům jasný strategický přehled o směru a prioritách v čase.',
              'Sloužit jako tajný dokument přístupný pouze jedinému manažerovi.',
              'Nahradit veškeré osobní schůzky a rozhovory v týmu.',
              'Vytvořit seznam všech nákupů kancelářských potřeb na pět let dopředu.'
            ],
            correctAnswerIndex: 0,
            explanation: 'Roadmapa sjednocuje vizi týmu s očekáváním vedení a zákazníků.',
            practicalContext: 'Udržujte roadmapu živou a pravidelně ji revidujte podle reality.'
          }
        }
      ],
      work_en: [
        {
          id: 'cand_we_1',
          secretWord: 'Bottleneck',
          hintDefinition: 'A point of congestion in a system that stops or severely slows down the entire workflow.',
          hangmanWord: 'BRZDA',
          difficulty: 'Snadná',
          reasonWhyGreat: 'Častý pojem na mezinárodních poradách – odhalí, co brzdí firemní procesy.',
          millionaire: {
            question: 'Kolega v mezinárodním callu řekne: "Legal approval is currently our main bottleneck." Co to znamená?',
            options: [
              'Právní schválení je v současnosti naše hlavní úzké hrdlo (brzda procesu).',
              'Právní oddělení poslalo dárek v podobě láhve vína.',
              'Právníci odmítají pít kávu v kanceláři.',
              'Právní oddělení nemá přístup k internetu.'
            ],
            correctAnswerIndex: 0,
            explanation: '"Bottleneck" (úzké hrdlo) metaforicky označuje fázi procesu, která zpomaluje celý řetězec.',
            practicalContext: 'Zásadní termín pro optimalizaci procesů a odstraňování blokátorů.'
          }
        },
        {
          id: 'cand_we_2',
          secretWord: 'Deliverable',
          hintDefinition: 'Any unique, verifiable product, result, or capability to perform a service that is required to be produced to complete a project.',
          hangmanWord: 'VYSTUP',
          difficulty: 'Snadná',
          reasonWhyGreat: 'Základní slovo každého projektového manažera a zadavatele úkolů.',
          millionaire: {
            question: 'Co v projektovém řízení znamená pojem "key deliverable"?',
            options: [
              'Klíčový hmatatelný nebo ověřitelný výstup projektu odevzdaný klientovi či vedení.',
              'Kurýr, který doručuje poštu do podatelny.',
              'Seznam všech obědových objednávek týmu.',
              'Zpráva o výpadku elektrického proudu v budově.'
            ],
            correctAnswerIndex: 0,
            explanation: 'Deliverable je hmatatelný výsledek práce (dokument, aplikace, analýza, prototyp).',
            practicalContext: 'Vždy jasně definujte akceptační kritéria pro každý deliverable.'
          }
        },
        {
          id: 'cand_we_3',
          secretWord: 'Bandwidth',
          hintDefinition: 'The capacity, time, and mental energy needed to deal with a situation or take on more work.',
          hangmanWord: 'KAPACITA',
          difficulty: 'Střední',
          reasonWhyGreat: 'Gentlemanský způsob, jak v angličtině říct "nemám na to teď čas ani kapacitu".',
          millionaire: {
            question: 'Pokud v nadnárodním týmu řeknete "I do not have the bandwidth for this new initiative right now", co tím sdělujete?',
            options: [
              'Nemám v současné době dostatek času ani mentální kapacity se tomuto projektu věnovat.',
              'Mám příliš pomalé internetové připojení doma.',
              'Můj monitor má malé rozlišení pro zobrazení tabulky.',
              'Odmítám spolupracovat se zahraničními kolegy z principu.'
            ],
            correctAnswerIndex: 0,
            explanation: '"Bandwidth" metaforicky vyjadřuje lidskou časovou a pracovní kapacitu.',
            practicalContext: 'Velmi profesionální a slušné vyjádření při odmítnutí přetížení.'
          }
        },
        {
          id: 'cand_we_4',
          secretWord: 'Alignment',
          hintDefinition: 'Arrangement or state of agreement among stakeholders where everyone shares the same vision and understanding.',
          hangmanWord: 'SOUHLAS',
          difficulty: 'Střední',
          reasonWhyGreat: 'Slovo, bez kterého se neobejde žádná strategická firemní prezentace.',
          millionaire: {
            question: 'Co znamená požadavek: "We need an alignment meeting before the client presentation"?',
            options: [
              'Potřebujeme koordinační schůzku, abychom sjednotili naše postoje a mluvili jedním hlasem.',
              'Musíme srovnat stoly a židle v zasedací místnosti do přímé řady.',
              'Je nutné zarovnat texty v prezentaci doleva podle firemní šablony.',
              'Musíme se ujistit, že všichni mají stejné barevné tužky.'
            ],
            correctAnswerIndex: 0,
            explanation: 'Alignment znamená myšlenkové a strategické sjednocení týmu.',
            practicalContext: 'Před velkými milníky vždy ověřte alignment všech klíčových lidí.'
          }
        }
      ],
      general_en: [
        {
          id: 'cand_ge_1',
          secretWord: 'Resilience',
          hintDefinition: 'The capacity to withstand or to recover quickly from difficulties, stress, or setbacks.',
          hangmanWord: 'ODOLNOST',
          difficulty: 'Střední',
          reasonWhyGreat: 'Jedna z nejvíce oceňovaných lidských a profesních vlastností dnešní doby.',
          millionaire: {
            question: 'Která věta v mezinárodní komunikaci správně ilustruje pojem "Resilience"?',
            options: [
              'Our team showed great resilience when adapting to unexpected market shifts.',
              'We need to buy more resilience for the company warehouse.',
              'Please forward me the resilience invoice by the end of today.',
              'The resilience will attend the sprint review meeting tomorrow.'
            ],
            correctAnswerIndex: 0,
            explanation: '"Resilience" znamená psychickou i organizační odolnost a pružnost.',
            practicalContext: 'Často se oceňuje v hodnocení zaměstnanců a leadership dovednostech.'
          }
        },
        {
          id: 'cand_ge_2',
          secretWord: 'Perspective',
          hintDefinition: 'A particular attitude toward or way of regarding something; a comprehensive point of view.',
          hangmanWord: 'POHLED',
          difficulty: 'Snadná',
          reasonWhyGreat: 'Klíčové slovo pro diplomatickou diskuzi a hledání nových řešení.',
          millionaire: {
            question: 'Co znamená fráze "Let me offer another perspective on this project"?',
            options: [
              'Dovolte mi nabídnout jiný úhel pohledu na tento projekt.',
              'Chci tento projekt okamžitě zrušit z finančních důvodů.',
              'Pošlete mi prosím rozpis dovolených tohoto projektu.',
              'Projekt byl oficiálně schválen nejvyšším vedením.'
            ],
            correctAnswerIndex: 0,
            explanation: '"Perspective" představuje náhled, úhel pohledu nebo celkový nadhled.',
            practicalContext: 'Skvělá formulace pro konstruktivní oponování bez vyvolání konfliktu.'
          }
        },
        {
          id: 'cand_ge_3',
          secretWord: 'Adaptability',
          hintDefinition: 'The quality of being able to adjust to new conditions, environments, and requirements easily.',
          hangmanWord: 'PRUZNOST',
          difficulty: 'Snadná',
          reasonWhyGreat: 'Schopnost rychle reagovat na změny je největší konkurenční výhodou.',
          millionaire: {
            question: 'Proč zaměstnavatelé v mezinárodním prostředí tolik vyzdvihují "adaptability"?',
            options: [
              'Umožňuje zaměstnancům flexibilně reagovat na nové technologie, projekty a změny v prioritách.',
              'Znamená to, že zaměstnanec nikdy nepotřebuje dovolenou.',
              'Zaručuje, že zaměstnanec mluví plynule všemi světovými jazyky.',
              'Označuje schopnost pracovat výhradně o víkendech.'
            ],
            correctAnswerIndex: 0,
            explanation: 'Adaptabilita je schopnost přizpůsobit se proměnlivému prostředí.',
            practicalContext: 'Ukažte adaptabilitu pozitivním přístupem k novým nástrojům a postupům.'
          }
        },
        {
          id: 'cand_ge_4',
          secretWord: 'Integrity',
          hintDefinition: 'The quality of being honest and having strong moral principles; moral uprightness.',
          hangmanWord: 'CESTNOST',
          difficulty: 'Snadná',
          reasonWhyGreat: 'Základní hodnota důvěry v každé zdravé firemní kultuře.',
          millionaire: {
            question: 'Co v kontextu firemních hodnot nejlépe popisuje slovo "Integrity"?',
            options: [
              'Jednat čestně, transparentně a dodržovat slovo i etické zásady i tehdy, když se nikdo nedívá.',
              'Maximální optimalizace daní za každou cenu bez ohledu na pravidla.',
              'Schopnost podepsat jakoukoliv smlouvu bez jejího přečtení.',
              'Pravidelná výměna hardwaru každých šest měsíců.'
            ],
            correctAnswerIndex: 0,
            explanation: 'Integrita je soulad mezi slovy, činy a morálními zásadami.',
            practicalContext: 'Důvěra týmu stojí a padá na integritě každého jednotlivce.'
          }
        }
      ]
    };

    const candidates = fallbackBank[categoryId] || fallbackBank.work_terminology;
    return res.json({ success: true, candidates, source: 'curated_bank' });
  } catch (error: any) {
    console.error('Error generating candidates:', error);
    return res.status(500).json({ error: 'Chyba při přípravě kandidátů.' });
  }
});

// API: Curator Submits Chosen Words for Tomorrow
app.post('/api/curator/submit', (req: Request, res: Response) => {
  try {
    const { targetDateKey, curatorUid, curatorDisplayName, curatorDepartment, chosenWords } = req.body;
    if (!targetDateKey || !chosenWords) {
      return res.status(400).json({ error: 'Chybí zadaná data pro výběr slov.' });
    }

    const assignment = curatorAssignmentsStore.get(targetDateKey) || {
      targetDateKey,
      activeDateKey: new Date().toISOString().split('T')[0],
      curatorUid,
      curatorDisplayName,
      curatorDepartment: curatorDepartment || 'Firemní tým'
    };

    assignment.isCompleted = true;
    assignment.chosenWords = chosenWords;
    assignment.submittedAt = Date.now();
    assignment.curatorDisplayName = curatorDisplayName || assignment.curatorDisplayName;
    assignment.curatorUid = curatorUid || assignment.curatorUid;
    assignment.curatorDepartment = curatorDepartment || assignment.curatorDepartment;

    curatorAssignmentsStore.set(targetDateKey, assignment);

    // Save chosen words directly into dailyWordCache for tomorrow!
    for (const catId of ['work_terminology', 'work_en', 'general_en']) {
      if (chosenWords[catId]) {
        const item = chosenWords[catId];
        const wordData = {
          dateKey: targetDateKey,
          categoryId: catId,
          secretWord: item.secretWord,
          secretWordNormalized: item.secretWord.toLowerCase(),
          hintDefinition: item.hintDefinition,
          hangmanWord: item.hangmanWord || item.secretWord.toUpperCase().slice(0, 14),
          difficulty: item.difficulty || 'Střední',
          millionaire: item.millionaire,
          selectedBy: curatorDisplayName,
          selectedByUid: curatorUid,
          selectedByDepartment: curatorDepartment,
          selectedAt: Date.now()
        };
        const cacheKey = `${targetDateKey}_${catId}`;
        dailyWordCache.set(cacheKey, wordData);
      }
    }

    return res.json({ success: true, message: 'Zítřejší slova byla úspěšně schválena a uložena pro celý tým!' });
  } catch (err: any) {
    console.error('Error submitting curator words:', err);
    return res.status(500).json({ error: 'Chyba při ukládání vybraných slov.' });
  }
});

// API: History of Days
app.get('/api/history', (req: Request, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if today is already in history, if not compose today's entry
    const todayWords: any = {};
    for (const catId of ['work_terminology', 'work_en', 'general_en']) {
      const cacheKey = `${todayStr}_${catId}`;
      if (dailyWordCache.has(cacheKey)) {
        const w = dailyWordCache.get(cacheKey);
        todayWords[catId] = {
          secretWord: w.secretWord,
          hintDefinition: w.hintDefinition,
          difficulty: w.difficulty
        };
      } else {
        const fallbacks = FALLBACK_WORDS[catId] || FALLBACK_WORDS.work_terminology;
        const charSum = todayStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const index = charSum % fallbacks.length;
        const item = fallbacks[index];
        todayWords[catId] = {
          secretWord: item.secretWord,
          hintDefinition: item.hintDefinition,
          difficulty: item.difficulty
        };
      }
    }

    const curatorAssign = curatorAssignmentsStore.get(todayStr);
    const todayRecord = {
      dateKey: todayStr,
      formattedDate: 'Dnes – ' + todayStr,
      curatorName: curatorAssign?.curatorDisplayName || 'Tým',
      curatorDepartment: curatorAssign?.curatorDepartment || 'Tým',
      words: todayWords,
      isToday: true
    };

    return res.json({
      success: true,
      history: [todayRecord, ...historyRecords]
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Chyba při načítání historie.' });
  }
});

// API: Take over curator role immediately (for admin or testing)
app.post('/api/curator/take-over', (req: Request, res: Response) => {
  try {
    const { curatorUid, curatorDisplayName, curatorDepartment } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = getTomorrowDateString(today);
    const curatorName = curatorDisplayName || 'Zbyněk Kašnar';
    const dept = curatorDepartment || 'Vedení & IT Architektura';
    const uid = curatorUid || 'admin_zbynek';

    const assignment = {
      targetDateKey: tomorrow,
      activeDateKey: today,
      curatorUid: uid,
      curatorDisplayName: curatorName,
      curatorDepartment: dept,
      isCompleted: false,
      chosenWords: null,
      submittedAt: null
    };

    const todayAssignment = {
      targetDateKey: today,
      activeDateKey: today,
      curatorUid: uid,
      curatorDisplayName: curatorName,
      curatorDepartment: dept,
      isCompleted: true,
      chosenWords: null,
      submittedAt: Date.now()
    };

    curatorAssignmentsStore.set(tomorrow, assignment);
    curatorAssignmentsStore.set(today, todayAssignment);

    return res.json({
      success: true,
      assignment,
      todayCurator: {
        displayName: curatorName,
        department: dept,
        note: `Jsem kurátorem pro dnešní i zítřejší den (${curatorName}). Hodně štěstí při hádání!`
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Chyba při převzetí role kurátora.' });
  }
});

// API: Reset / Clear system cache & data for pristine testing
app.post('/api/admin/reset-data', (req: Request, res: Response) => {
  try {
    dailyWordCache.clear();
    curatorAssignmentsStore.clear();
    historyRecords = [];
    return res.json({
      success: true,
      message: 'Systémová mezipaměť, historie a kurátorská přiřazení byla vyprázdněna pro čistý start.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Chyba při resetování dat.' });
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
