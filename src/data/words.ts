import { CategoryId, CategoryInfo, DailyWordData } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'general_en',
    title: 'Obecná angličtina',
    subtitle: 'Všeobecná slovní zásoba, idiomy a výrazy',
    badge: 'General EN',
    icon: 'Globe',
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
    description: 'Hledej anglická slova a výrazy, které rozšiřují plynulost v komunikaci.'
  },
  {
    id: 'work_en',
    title: 'Angličtina v práci',
    subtitle: 'Business English, meetingy a korporátní obraty',
    badge: 'Business EN',
    icon: 'Briefcase',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    description: 'Typické výrazy z porad, e-mailů, projektového řízení a týmové spolupráce.'
  },
  {
    id: 'work_terminology',
    title: 'Terminologie v práci',
    subtitle: 'Odborný český i mezinárodní kontext v praxi',
    badge: 'Praxe & Metodika',
    icon: 'Cpu',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Zadávání a hledání v českém i odborném firemním kontextu (např. Synergie, KPI).'
  }
];

// Catalogue of curated daily words with rich Millionaire questions
export const WORDS_CATALOGUE: Record<CategoryId, DailyWordData[]> = {
  general_en: [
    {
      dateKey: '2026-09-01',
      categoryId: 'general_en',
      secretWord: 'Resilience',
      secretWordNormalized: 'resilience',
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
      dateKey: '2026-09-02',
      categoryId: 'general_en',
      secretWord: 'Perspective',
      secretWordNormalized: 'perspective',
      hintDefinition: 'A particular attitude toward or way of regarding something; a point of view.',
      hangmanWord: 'POINT OF VIEW',
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
      dateKey: '2026-09-03',
      categoryId: 'general_en',
      secretWord: 'Accountability',
      secretWordNormalized: 'accountability',
      hintDefinition: 'The fact or condition of being accountable; taking full ownership and responsibility.',
      hangmanWord: 'RESPONSIBILITY',
      difficulty: 'Pokročilá',
      millionaire: {
        question: 'Jaký je klíčový rozdíl mezi pojmy "Responsibility" a "Accountability" v týmovém řízení?',
        options: [
          'Responsibility je přidělený úkol, zatímco Accountability je konečná osobní odpovědnost za výsledek.',
          'Accountability se používá výhradně v účetnictví pro platbu faktur.',
          'Mezi těmito dvěma slovy není v angličtině žádný sémantický rozdíl.',
          'Responsibility má pouze vedoucí projektu, řadoví členové mají accountability.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Osoba s "Accountability" nese konečnou zodpovědnost (odpovídá se za výsledek), zatímco "Responsibility" je prováděcí povinnost.',
        practicalContext: 'V maticích RACI (Responsible, Accountable, Consulted, Informed) určuje "A" člověka s konečným slovem.'
      }
    },
    {
      dateKey: '2026-09-04',
      categoryId: 'general_en',
      secretWord: 'Integrity',
      secretWordNormalized: 'integrity',
      hintDefinition: 'The quality of being honest and having strong moral principles; state of being whole and undivided.',
      hangmanWord: 'HONESTY',
      difficulty: 'Střední',
      millionaire: {
        question: 'Co znamená v profesním kodexu požadavek "Data and process integrity"?',
        options: [
          'Úplnost, správnost a konzistentnost firemních dat a dodržování etických standardů.',
          'Rychlost stahování souborů přes VPN v noci.',
          'Povinnost nosit do kanceláře formální společenský oděv.',
          'Zákaz komunikace s kolegy z jiných oddělení.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Integrita v datech a procesech zaručuje, že nedochází k neautorizovaným změnám, chybám a porušování pravidel.',
        practicalContext: 'Základní hodnota v compliance, auditech a kybernetické bezpečnosti.'
      }
    }
  ],
  work_en: [
    {
      dateKey: '2026-09-01',
      categoryId: 'work_en',
      secretWord: 'Deliverable',
      secretWordNormalized: 'deliverable',
      hintDefinition: 'A tangible or intangible good or service produced as a result of a project that is intended to be delivered to a client or team.',
      hangmanWord: 'OUTPUT ITEM',
      difficulty: 'Střední',
      millionaire: {
        question: 'Kolega na Stand-upu řekne: "The main deliverable for Milestone 2 is ready for review." Co to přesně znamená?',
        options: [
          'Hlavní hmatatelný výstup/dokument pro 2. milník je připraven k revizi a schválení.',
          'Balíček z pošty dorazí až za 2 týdny po termínu.',
          'Projekt má zpoždění a vyžaduje schválení dodatečného rozpočtu.',
          'Tým se musí zúčastnit školení bezpečnosti práce.'
        ],
        correctAnswerIndex: 0,
        explanation: '"Deliverable" je konkrétní projektový výstup či dodávka (např. kód, analýza, design, manuál).',
        practicalContext: 'Pojem se používá ve všech projektových metodikách (Scrum, Prince2, Waterfall) pro vymezení rozsahu práce (Scope).'
      }
    },
    {
      dateKey: '2026-09-02',
      categoryId: 'work_en',
      secretWord: 'Bandwidth',
      secretWordNormalized: 'bandwidth',
      hintDefinition: 'The capacity, time, or mental energy required to handle a specified amount of work or tasks.',
      hangmanWord: 'CAPACITY',
      difficulty: 'Snadná',
      millionaire: {
        question: 'Manažer se ptá: "Do you have the bandwidth to take over the client presentation on Friday?" Co zjišťuje?',
        options: [
          'Zda máš aktuálně časovou a pracovní kapacitu ujmout se této prezentace.',
          'Zda máš v kanceláři dostatečně rychlé internetové Wi-Fi připojení.',
          'Zda máš k dispozici vhodný HDMI kabel do zasedací místnosti.',
          'Zda máš schválenou služební cestu za klientem.'
        ],
        correctAnswerIndex: 0,
        explanation: 'V moderní korporátní angličtině "bandwidth" metaforicky označuje lidskou časovou a mentální kapacitu.',
        practicalContext: 'Velmi zdvořilý způsob, jak říci "Nemám na to teď kapacitu" ("I don\'t have the bandwidth right now").'
      }
    },
    {
      dateKey: '2026-09-03',
      categoryId: 'work_en',
      secretWord: 'Bottleneck',
      secretWordNormalized: 'bottleneck',
      hintDefinition: 'A point of congestion in a production or workflow system that stops or slows down the entire process.',
      hangmanWord: 'CHOKE POINT',
      difficulty: 'Střední',
      millionaire: {
        question: 'Při retrospektivě tým identifikuje, že schvalování u právního oddělení je "bottleneck". Co to indikuje?',
        options: [
          'Místo zúžení a zdržení, které brzdí plynulý průchod celého firemního procesu.',
          'Oddělení, které přináší nejvyšší finanční zisk firmě.',
          'Nejnovější software zavedený do firemní infrastruktury.',
          'Tým, který vyhrál firemní teambuildingovou soutěž.'
        ],
        correctAnswerIndex: 0,
        explanation: '"Bottleneck" (hrdlo láhve) je kritické úzké místo, které limituje celkovou průchodnost celého systému.',
        practicalContext: 'Při optimalizaci procesů a Kanbanu je odstranění bottlenecku prioritou číslo jedna.'
      }
    },
    {
      dateKey: '2026-09-04',
      categoryId: 'work_en',
      secretWord: 'Stakeholder',
      secretWordNormalized: 'stakeholder',
      hintDefinition: 'A person, group or organization that has interest or concern in an organization and the outcome of a project.',
      hangmanWord: 'INTERESTED PARTY',
      difficulty: 'Střední',
      millionaire: {
        question: 'Kdo je v projektu označován jako "Key Stakeholder"?',
        options: [
          'Klíčová zúčastněná strana (zadavatel, sponzor, zákazník), jejíž zájmy přímo ovlivňují výsledek projektu.',
          'Zaměstnanec, který má na starosti nákup kancelářských židlí.',
          'Pouze externí uklízecí agentura.',
          'Osoba, která vlastní akcie konkurenční firmy.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Stakeholder je kdokoliv, kdo má na projektu svůj zájem, vliv nebo dopad na jeho úspěch.',
        practicalContext: 'Pravidelný Stakeholder Management je kritický pro prevenci nedorozumění a schvalování změn.'
      }
    }
  ],
  work_terminology: [
    {
      dateKey: '2026-09-01',
      categoryId: 'work_terminology',
      secretWord: 'Synergie',
      secretWordNormalized: 'synergie',
      hintDefinition: 'Vzájemné působení a spolupráce prvků či týmů, kdy celkový výsledný efekt je větší než prostý součet jednotlivých částí (1 + 1 = 3).',
      hangmanWord: 'SOUCINNOST',
      difficulty: 'Střední',
      millionaire: {
        question: 'Vedení představuje fúzi dvou oddělení se slovy: "Hledáme synergický efekt". Co je reálným cílem?',
        options: [
          'Využít sdílené know-how a nástroje tak, aby společný výkon překonal samostatné fungování.',
          'Zvýšit administrativní zátěž a zavést dvojité schvalování faktur.',
          'Zrušit veškeré pravidelné týmové schůzky bez náhrady.',
          'Oddělit IT infrastrukturu obou týmů do izolovaných sítí.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Synergie znamená, že propojením dvou zdrojů či týmů vzniká přidaná hodnota převyšující součet jejich dílčích výkonů.',
        practicalContext: 'Často zmiňovaný koncept při optimalizaci nákladů, cross-funkční spolupráci a fúzích.'
      }
    },
    {
      dateKey: '2026-09-02',
      categoryId: 'work_terminology',
      secretWord: 'Konsolidace',
      secretWordNormalized: 'konsolidace',
      hintDefinition: 'Sjednocení, upevnění a zjednodušení roztříštěných systémů, databází, procesů či finančních výsledků do jednoho uceleného celku.',
      hangmanWord: 'SJEDNOCENI',
      difficulty: 'Střední',
      millionaire: {
        question: 'Co v IT a provozu obvykle obnáší "konsolidace softwarových nástrojů"?',
        options: [
          'Snížení počtu duplicitních aplikací a přechod na jednotnou, integrovanou platformu.',
          'Nákup dalších 5 různých chatovacích aplikací pro každé oddělení.',
          'Úplné zastavení vývoje a propuštění všech externích konzultantů.',
          'Zvýšení licenčních poplatků bez změny stávajících nástrojů.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Konsolidace vede k redukci duplicit, úspoře nákladů a snížení provozní složitosti.',
        practicalContext: 'Klíčový krok při ročních revizích SaaS rozpočtů a architektury podniku.'
      }
    },
    {
      dateKey: '2026-09-03',
      categoryId: 'work_terminology',
      secretWord: 'Retrospektiva',
      secretWordNormalized: 'retrospektiva',
      hintDefinition: 'Pravidelné týmové ohlédnutí za uplynulým obdobím s cílem identifikovat, co fungovalo, co zlepšit a jak upravit procesy pro další cyklus.',
      hangmanWord: 'OHLEDNUTI',
      difficulty: 'Snadná',
      millionaire: {
        question: 'Jaký je hlavní smysl agilní Retrospektivy na konci sprintu?',
        options: [
          'Konstruktivně zhodnotit spolupráci a nastavit konkrétní akční kroky ke zlepšení týmové dynamiky.',
          'Hledat a veřejně potrestat viníka vzniklých technických chyb.',
          'Představit nový marketingový rozpočet na další fiskální rok.',
          'Zadat programátorům přesný seznam přesčasových hodin.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Retrospektiva je bezpečným prostorem pro kontinuální zlepšování (Kaizen) celého týmu.',
        practicalContext: 'Základní pilíř Scrumu a agilního řízení, kde se aplikují metody jako "Mad/Sad/Glad" či "Start/Stop/Continue".'
      }
    },
    {
      dateKey: '2026-09-04',
      categoryId: 'work_terminology',
      secretWord: 'Onboarding',
      secretWordNormalized: 'onboarding',
      hintDefinition: 'Systematický proces zaškolení, adaptace a začlenění nového zaměstnance do firemní kultury, procesů a technického prostředí.',
      hangmanWord: 'ZASAKOLENI',
      difficulty: 'Snadná',
      millionaire: {
        question: 'Co je hlavním cílem kvalitně nastaveného "Onboardingu" ve firmě?',
        options: [
          'Umožnit nováčkovi rychle a bez stresu pochopit procesy, seznámit se s týmem a dosáhnout samostatnosti.',
          'Okamžitě otestovat nového kolegu tím, že mu nikdo neposkytne přístupy do systému.',
          'Zkontrolovat, zda nováček umí opravit firemní kávovar.',
          'Prodloužit zkušební dobu na dvojnásobek.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Úspěšný onboarding dramaticky snižuje fluktuaci a zkracuje čas potřebný k plné produktivitě (Time-to-Productivity).',
        practicalContext: 'Zahrnuje Buddy program, předání přístupů první den a jasný 30-60-90 denní plán.'
      }
    },
    {
      dateKey: '2026-09-05',
      categoryId: 'work_terminology',
      secretWord: 'Roadmap',
      secretWordNormalized: 'roadmap',
      hintDefinition: 'Strategický plán a vizuální časová osa zobrazující hlavní cíle, milníky a plánované funkcionality produktu v čase.',
      hangmanWord: 'HARMONOGRAM',
      difficulty: 'Střední',
      millionaire: {
        question: 'K čemu slouží "Product Roadmap" představená celému týmu a vedení?',
        options: [
          'Dává jasnou vizi a priority toho, jaké klíčové funkce a iniciativy budeme v příštích kvartálech realizovat.',
          'Jedná se o podrobnou mapu budovy s vyznačením únikových východů.',
          'Seznam adres všech zaměstnanců pro zasílání firemní pošty.',
          'Technická dokumentace konkrétních CSS tříd na webu.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Roadmapa synchronizuje očekávání vývoje, obchodu i managementu ohledně strategického směřování produktu.',
        practicalContext: 'Doporučuje se struktura podle "Now - Next - Later" namísto fixních rigidních termínů na rok dopředu.'
      }
    },
    {
      dateKey: '2026-09-06',
      categoryId: 'work_terminology',
      secretWord: 'SLA',
      secretWordNormalized: 'sla',
      hintDefinition: 'Service Level Agreement – smluvní dohoda o garantované úrovni dostupnosti, reakční doby a kvality poskytované služby.',
      hangmanWord: 'GARANCE',
      difficulty: 'Pokročilá',
      millionaire: {
        question: 'Co znamená, když má kritický IT systém sjednáno "SLA 99.9% a reakční dobu P1 do 15 minut"?',
        options: [
          'Systém smí mít max. ~8,7 hodin výpadku za rok a při kritické chybě musí podpora reagovat do 15 minut.',
          'Vývojáři mají 15 minut na obědovou pauzu.',
          'Zákazník má 15 minut na zaplacení roční faktury.',
          'Aplikace se automaticky smaže každých 15 minut.'
        ],
        correctAnswerIndex: 0,
        explanation: 'SLA definuje metriky dostupnosti (Uptime) a závazné lhůty (MTTA/MTTR) při řešení incidentů.',
        practicalContext: 'Při porušení SLA obvykle nastupují smluvní sankce a penále.'
      }
    }
  ]
};

const STORAGE_KEY_WORDS = 'korpo_words_catalogue_v2';

// In-memory runtime cache for seamless client reactivity
let runtimeCatalogue: Record<CategoryId, DailyWordData[]> | null = null;

// Initialize catalogue from localStorage or initial defaults
export function getWordsCatalogue(): Record<CategoryId, DailyWordData[]> {
  if (runtimeCatalogue) {
    return runtimeCatalogue;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WORDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.general_en && parsed.work_en && parsed.work_terminology) {
          runtimeCatalogue = parsed;
          return runtimeCatalogue!;
        }
      }
    } catch (e) {
      console.warn('Failed to parse words from localStorage, using initial catalogue:', e);
    }
  }

  runtimeCatalogue = JSON.parse(JSON.stringify(WORDS_CATALOGUE));
  return runtimeCatalogue!;
}

// Save catalogue changes to localStorage and in-memory cache
export function saveWordsCatalogue(catalogue: Record<CategoryId, DailyWordData[]>): void {
  runtimeCatalogue = catalogue;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(catalogue));
      // Dispatch custom event for real-time reactivity in UI components
      window.dispatchEvent(new CustomEvent('korpo_words_updated'));
    } catch (e) {
      console.error('Failed to save words to localStorage:', e);
    }
  }
}

// Add or update a specific word in the catalogue
export function saveWordToCatalogue(wordData: DailyWordData): void {
  const catalogue = getWordsCatalogue();
  const categoryWords = catalogue[wordData.categoryId] || [];
  
  // Find if exists by exact dateKey or secretWord
  const existingIdx = categoryWords.findIndex(
    w => w.dateKey === wordData.dateKey || w.secretWord.toLowerCase() === wordData.secretWord.toLowerCase()
  );

  if (existingIdx >= 0) {
    categoryWords[existingIdx] = wordData;
  } else {
    categoryWords.unshift(wordData);
  }

  catalogue[wordData.categoryId] = categoryWords;
  saveWordsCatalogue(catalogue);
}

// Delete a word from the catalogue
export function deleteWordFromCatalogue(categoryId: CategoryId, dateKey: string, secretWord: string): void {
  const catalogue = getWordsCatalogue();
  const categoryWords = catalogue[categoryId] || [];
  
  catalogue[categoryId] = categoryWords.filter(
    w => !(w.dateKey === dateKey && w.secretWord.toLowerCase() === secretWord.toLowerCase())
  );

  saveWordsCatalogue(catalogue);
}

// Set a chosen word as today's active word
export function setWordAsActiveToday(categoryId: CategoryId, wordData: DailyWordData): void {
  const today = getTodayDateString();
  const catalogue = getWordsCatalogue();
  const categoryWords = catalogue[categoryId] || [];

  // Clone word with today's dateKey
  const updatedWord: DailyWordData = {
    ...wordData,
    dateKey: today
  };

  // Remove any previous word for today
  const filtered = categoryWords.filter(w => w.dateKey !== today && w.secretWord.toLowerCase() !== wordData.secretWord.toLowerCase());
  filtered.unshift(updatedWord);

  catalogue[categoryId] = filtered;
  saveWordsCatalogue(catalogue);
}

// Reset catalogue to default curated dictionary
export function resetWordsCatalogueToDefault(): void {
  runtimeCatalogue = JSON.parse(JSON.stringify(WORDS_CATALOGUE));
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_WORDS);
      window.dispatchEvent(new CustomEvent('korpo_words_updated'));
    } catch (e) {
      console.error('Failed to reset catalogue in localStorage:', e);
    }
  }
}

// Export dictionary as JSON string
export function exportWordsCatalogueJson(): string {
  const catalogue = getWordsCatalogue();
  return JSON.stringify(catalogue, null, 2);
}

// Import dictionary from JSON string
export function importWordsCatalogueJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object' && parsed.work_terminology && Array.isArray(parsed.work_terminology)) {
      saveWordsCatalogue(parsed);
      return true;
    }
  } catch (e) {
    console.error('Failed to import JSON catalogue:', e);
  }
  return false;
}

// Function to get today's word or a deterministic fallback based on day of year
export function getDailyWord(categoryId: CategoryId, customDate?: string): DailyWordData {
  const dateStr = customDate || getTodayDateString();
  const catalogue = getWordsCatalogue();
  const list = catalogue[categoryId] || WORDS_CATALOGUE[categoryId] || [];
  
  if (list.length === 0) {
    return WORDS_CATALOGUE[categoryId][0];
  }

  // Look for exact match for this date
  const exact = list.find(w => w.dateKey === dateStr);
  if (exact) return exact;

  // Deterministic daily fallback from catalogue list using date hash
  const charSum = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const index = charSum % list.length;
  const word = list[index];
  return {
    ...word,
    dateKey: dateStr
  };
}

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getFormattedCzechDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('cs-CZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch {
    // fallback
  }
  return dateStr;
}
