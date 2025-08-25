// ======================= SUBX Game (API version) =======================
// Toutes les fonctions & UI comme avant, mais le dictionnaire n'est plus local : il est demandé dynamiquement à l'API.

let WORDS = []; // Ne contient plus les mots au chargement !
let subsIndex = {}, allSubs = [];
let subsIndex4 = {}, allSubs4 = [];
let currentMode = "subX", difficulty = 1, speedrunCount = 10;
let setOfSubs = [], currentIndex = 0;
let currentSub = null, currentMots = [];
let startTime = 0, timerInterval = null;
let history = [];
let sessionScore = 0, bestTime = null, partieTerminee = false;
let keepPlayingSub50 = false;

// --- skip logic
let skipBinding = false;
let skipKey = "$";
let skippedSyllabes = [];
let lastSkipHTML = "";

const $ = s => document.querySelector(s);

// === Custom Skip Mode additions ===
let customSkippedSubs = [];
function saveCustomSkippedSubs() {
    localStorage.setItem("customSkippedSubs", JSON.stringify(customSkippedSubs));
}
function loadCustomSkippedSubs() {
    let d = localStorage.getItem("customSkippedSubs");
    customSkippedSubs = d ? JSON.parse(d) : [];
}
loadCustomSkippedSubs();


//////////////////////////////////////////////////////
// ====== THEMES ET LANGUES ======
//////////////////////////////////////////////////////

const THEMES = {
    classic: {
        name: {fr:"Classique",en:"Classic",es:"Clásico"},
        key: "classic",
        vars: {
            "--bg": "#161626", "--panel": "#232344", "--accent": "#574ae2", "--accent2": "#7ad1ff", "--fg": "#e1e2f6",
            "--fg2": "#7f89b1", "--success": "#59e27d", "--danger": "#ee3e67", "--border": "#2e2e69", "--highlight": "#19193a", "--block-bg": "#222243", "--block-border": "#363677"
        }
    },
    emerald: {
        name: {fr:"Émeraude",en:"Emerald",es:"Esmeralda"},
        key: "emerald",
        vars: {
            "--bg": "#11291a", "--panel": "#204d36", "--accent": "#1abc9c", "--accent2": "#40e495", "--fg": "#f1fff7",
            "--fg2": "#5ad1a2", "--success": "#5ad1a2", "--danger": "#ff4f7a", "--border": "#1abc9c", "--highlight": "#14311f", "--block-bg": "#183d28", "--block-border": "#2fc6a6"
        }
    },
    raspberry: {
        name: {fr:"Framboise",en:"Raspberry",es:"Frambuesa"},
        key: "raspberry",
        vars: {
            "--bg": "#2b0a1a", "--panel": "#41102a", "--accent": "#e74c7b", "--accent2": "#ff80ab", "--fg": "#fff0f7",
            "--fg2": "#e9b0d1", "--success": "#59e27d", "--danger": "#ff5e7a", "--border": "#e74c7b", "--highlight": "#3c1421", "--block-bg": "#51142f", "--block-border": "#ff80ab"
        }
    },
    night: {
        name: {fr:"Nuit",en:"Night",es:"Noche"},
        key: "night",
        vars: {
            "--bg": "#0b0e13", "--panel": "#1a202c", "--accent": "#1e293b", "--accent2": "#64748b", "--fg": "#e2e8f0",
            "--fg2": "#94a3b8", "--success": "#7dd3fc", "--danger": "#f87171", "--border": "#334155", "--highlight": "#111827", "--block-bg": "#232d3d", "--block-border": "#64748b"
        }
    },
    sablefonce: {
        name: {fr:"Sable foncé",en:"Dark Sand",es:"Arena oscuro"},
        key: "sablefonce",
        vars: {
            "--bg": "#d2b68a",
            "--panel": "#bfa060",
            "--accent": "#af8f46",
            "--accent2": "#f8e4b2",
            "--fg": "#3a2c16",
            "--fg2": "#7b6b4d",
            "--success": "#41a86e",
            "--danger": "#e14e67",
            "--border": "#a88d50",
            "--highlight": "#e2c987",
            "--block-bg": "#e8d2a1",
            "--block-border": "#c4b269"
        }
    },
    ocean: {
        name: {fr:"Océan",en:"Ocean",es:"Océano"},
        key: "ocean",
        vars: {
            "--bg": "#112131",
            "--panel": "#1b3147",
            "--accent": "#4e9ee4",
            "--accent2": "#5ee2fc",
            "--fg": "#e3f2fd",
            "--fg2": "#a9c6e8",
            "--success": "#60e5b3",
            "--danger": "#f87171",
            "--border": "#4e9ee4",
            "--highlight": "#1a2740",
            "--block-bg": "#19304d",
            "--block-border": "#4e9ee4"
        }
    },
    lava: {
        name: {fr:"Lave",en:"Lava",es:"Lava"},
        key: "lava",
        vars: {
            "--bg": "#2f0909",
            "--panel": "#5a1818",
            "--accent": "#ea5a31",
            "--accent2": "#eab931",
            "--fg": "#ffd6d6",
            "--fg2": "#eab931",
            "--success": "#eab931",
            "--danger": "#ea5a31",
            "--border": "#ea5a31",
            "--highlight": "#461212",
            "--block-bg": "#451b1b",
            "--block-border": "#ea5a31"
        }
    }
};

const LANGUAGES = {
    fr: {
        title: "SUBX Game",
        desc: "Progresse de manière plus simple en t'entrainant sub par sub !",
        modes: [
            "🔢 Train Sub", "🎲 Sub 50", "⚡ Speedrun", "🕹️ Min 1", "🔡 4 Lettres", "🛠️ Custom Skip"
        ],
        customskip: "Custom Skip",
        customskip_desc: "Uniquement les syllabes que tu as déjà skippées.",
        reset_customskip: "Réinitialiser Custom",
        customskip_empty: "Aucune syllabe skippée pour le moment ! Joue et skip pour remplir ce mode.",
        score: "Score session",
        words: "Mots",
        subs: "Subs indexés",
        start: "Démarrer",
        stop: "Arrêter",
        retour: "Retour menu",
        difficulty: "‎ ‎ ‎ ‎ ",
        speedrun: "Nb de syllabes (speedrun) :",
        custom: "Liste personnalisée",
        import: "Importer une liste",
        charger: "Charger",
        historique: "Historique",
        afficherHist: "Afficher l'historique",
        noHist: "Aucune partie jouée.",
        syllabe: "Syllabe à trouver",
        found: "Mot trouvé :",
        reponses: "Réponses pour",
        none: "Aucun mot trouvé pour la syllabe",
        noneList: "Aucune syllabe trouvée pour ce mode/difficulté.",
        change: "Change le mode/difficulté ou ta liste de mots.",
        errList: "Erreur dans la liste !",
        indexEnCours: "Indexation des syllabes en cours...",
        indexOK: "Indexation terminée !",
        time: "Temps",
        terminee: "Partie terminée",
        botdesc: "Commande .c & /c disponible pour recherche de mots !",
        botex: "Exemple : /c aar ou .c aar",
        botw: "Mots disponibles pour",
        botmore: "...et {n} mot(s) de plus.",
        botnone: "Aucun mot trouvé pour la syllabe",
        bothelp: "TokiBot ne comprend que la commande <b>/c</b> ou <b>.c</b> (syllabe) pour l’instant !",
        casual_life: "vie",
        casual_lives: "vies",
        casual_stats: "🕹️ Stats Casual",
        casual_lost: "Vies perdues",
        casual_deadsylls: "Syllabes perdues",
        no_skipped_subs: "Aucune syllabe n'a été ignorée lors de la session précédente."
    },
    en: {
        title: "SUBX Game",
        desc: "Find a word containing the given syllable, move to the next as soon as you find one!",
        modes: [
            "🔢 Train Sub", "🎲 Sub 50", "⚡ Speedrun", "🕹️ Min 1", "🔡 4 Letters", "🛠️ Custom Skip"
        ],
        customskip: "Custom Skip",
        customskip_desc: "Only syllables you have already skipped.",
        reset_customskip: "Reset Custom",
        customskip_empty: "No skipped syllables yet! Play and skip to fill this mode.",
        score: "Session score",
        words: "Words",
        subs: "Indexed subs",
        start: "Start",
        stop: "Stop",
        retour: "Back to menu",
        difficulty: "‎ ‎ ‎ ",
        speedrun: "Nb of subs (speedrun):",
        custom: "Custom word list",
        import: "Import a list",
        charger: "Load",
        historique: "History",
        afficherHist: "Show history",
        noHist: "No games played.",
        syllabe: "Syllable to find",
        found: "Word found:",
        reponses: "Answers for",
        none: "No word found for syllable",
        noneList: "No syllable found for this mode/difficulty.",
        change: "Change mode/difficulty or your word list.",
        errList: "Error in the list!",
        indexEnCours: "Indexing syllables...",
        indexOK: "Indexing complete!",
        time: "Time",
        terminee: "Game finished",
        botdesc: "Type /c or .c (syllable) to see words.",
        botex: "Example: /c aar or .c aar",
        botw: "Words available for",
        botmore: "...and {n} more word(s).",
        botnone: "No word found for syllable",
        bothelp: "TokiBot only understands the <b>/c</b> or <b>.c</b> (syllable) command for now!",
        casual_life: "life",
        casual_lives: "lives",
        casual_stats: "🕹️ Casual stats",
        casual_lost: "Lives lost",
        casual_deadsylls: "Lost syllables",
        no_skipped_subs: "No syllables were skipped in the previous session."
    },
    es: {
        title: "SUBX Game",
        desc: "Encuentra una palabra que contenga la sílaba dada, ¡pasa a la siguiente una vez encontrada!",
        modes: [
            "🔢 Train Sub", "🎲 Sub 50", "⚡ Speedrun", "🕹️ Min 1", "🔡 4 Letras", "🛠️ Custom Skip"
        ],
        customskip: "Custom Skip",
        customskip_desc: "Solo sílabas que ya has saltado.",
        reset_customskip: "Reiniciar Custom",
        customskip_empty: "¡Ninguna sílaba saltada aún! Juega y salta para llenar este modo.",
        score: "Puntuación",
        words: "Palabras",
        subs: "Subs indexados",
        start: "Comenzar",
        stop: "Detener",
        retour: "Volver al menú",
        difficulty: "‎ ‎ ‎ ",
        speedrun: "N° de sílabas (speedrun):",
        custom: "Lista personalizada",
        import: "Importar lista",
        charger: "Cargar",
        historique: "Historial",
        afficherHist: "Mostrar historial",
        noHist: "Ninguna partida jugada.",
        syllabe: "Sílaba a encontrar",
        found: "Palabra encontrada:",
        reponses: "Respuestas para",
        none: "No se encontró palabra para la sílaba",
        noneList: "No se encontró ninguna sílaba para este modo/dificultad.",
        change: "Cambia el modo/dificultad o tu lista de palabras.",
        errList: "¡Error en la lista!",
        indexEnCours: "Indexando sílabas...",
        indexOK: "¡Indexación terminada!",
        time: "Tiempo",
        terminee: "¡Partida terminada!",
        botdesc: "Escribe /c o .c (sílaba) para ver palabras.",
        botex: "Ejemplo: /c aar o .c aar",
        botw: "Palabras disponibles para",
        botmore: "...y {n} palabra(s) más.",
        botnone: "No se encontró palabra para la sílaba",
        bothelp: "¡TokiBot solo entiende el comando <b>/c</b> o <b>.c</b> (sílaba) por ahora!",
        casual_life: "vida",
        casual_lives: "vidas",
        casual_stats: "🕹️ Stats Casual",
        casual_lost: "Vidas perdidas",
        casual_deadsylls: "Sílabas perdidas",
        no_skipped_subs: "No se omitió ninguna sílaba en la sesión anterior."
    }
};

let currentLang = "fr";
let currentTheme = "classic";

function t(key, vars={}) {
    let str = LANGUAGES[currentLang][key] ?? key;
    for (const k in vars) str = str.replaceAll("{"+k+"}",vars[k]);
    return str;
}
function setTheme(themeKey) {
    const theme = THEMES[themeKey] ?? THEMES.classic;
    for (const k in theme.vars) {
        document.documentElement.style.setProperty(k, theme.vars[k]);
    }
    currentTheme = themeKey;
    document.body.setAttribute('data-theme', themeKey);
    document.querySelectorAll('.theme-option').forEach(opt=>opt.classList.toggle('selected',opt.dataset.theme===themeKey));
}
function setLang(langKey) {
    currentLang = langKey;
    $("#main-title").textContent = LANGUAGES[langKey].title;
    $("#main-desc").textContent = LANGUAGES[langKey].desc;
    document.querySelectorAll(".mode-btn").forEach((btn,i)=>{
        const modeText = (LANGUAGES[langKey].modes[i]||"").trim();
        if (btn.querySelector('.emoji') && btn.querySelector('.mode-label')) {
            let match = modeText.match(/^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}]*)?\s*(.*)$/u);
            btn.querySelector('.emoji').textContent = match && match[1] ? match[1] : "";
            btn.querySelector('.mode-label').textContent = match && match[2] ? match[2] : modeText;
        } else {
            btn.textContent = modeText;
        }
    });
    $("#difficulty").previousElementSibling.textContent = t("difficulty");
    $("#speedrun-count").previousElementSibling.textContent = t("speedrun");
    $("#custom-words").placeholder = t("custom");
    $("#toggle-import").textContent = t("import");
    $("#load-custom").textContent = t("charger");
    $("#history-panel .sidebar-title").textContent = t("historique");
    $("#toggle-history").textContent = t("afficherHist");
    $("#import-panel .sidebar-title").textContent = t("custom");
    $("#start-btn").textContent = t("start");
    $("#stop-btn").textContent = t("stop");
    $("#return-btn").textContent = t("retour");
    $("#reset-customskip").textContent = t("reset_customskip");
    showStats();
    showHistory();
    $("#chatbot-header").innerHTML = `TokiBot <span class="chatbot-subtext">${t("botdesc")}</span>`;
    if (!$("#chatbot-messages").children.length) {
        chatbotAddMsg(`Salut ! Je suis TokiBot 🤖<br>${t("botdesc")}<br>${t("botex")}`);
    }
}
function buildThemeDropdown() {
    let html = '';
    for (const key in THEMES) {
        html += `<button class="theme-option${key===currentTheme?' selected':''}" data-theme="${key}">${THEMES[key].name[currentLang]}</button>`;
    }
    return html;
}
function buildLangDropdown() {
    return `
    <button class="lang-option${currentLang==='fr'?' selected':''}" data-lang="fr">🇫🇷 Français</button>
    <button class="lang-option${currentLang==='en'?' selected':''}" data-lang="en">🇬🇧 English</button>
    <button class="lang-option${currentLang==='es'?' selected':''}" data-lang="es">🇪🇸 Español</button>
    `;
}
window.addEventListener('DOMContentLoaded',()=>{
    let themeDrop = document.createElement("div");
    themeDrop.className = "theme-dropdown";
    themeDrop.innerHTML = buildThemeDropdown();
    document.getElementById("theme-chooser").appendChild(themeDrop);

    let langDrop = document.createElement("div");
    langDrop.className = "lang-dropdown";
    langDrop.innerHTML = buildLangDropdown();
    document.getElementById("lang-toggle").appendChild(langDrop);

    document.getElementById("theme-chooser").onclick = e=>{
        themeDrop.classList.toggle("show");
        langDrop.classList.remove("show");
        e.stopPropagation();
    };
    document.getElementById("lang-toggle").onclick = e=>{
        langDrop.classList.toggle("show");
        themeDrop.classList.remove("show");
        e.stopPropagation();
    };
    themeDrop.onclick = e=>{
        if(e.target.classList.contains("theme-option")){
            setTheme(e.target.dataset.theme);
            themeDrop.classList.remove("show");
        }
    };
    langDrop.onclick = e=>{
        if(e.target.classList.contains("lang-option")){
            setLang(e.target.dataset.lang);
            langDrop.classList.remove("show");
            themeDrop.innerHTML = buildThemeDropdown();
        }
    };
    document.body.addEventListener("click",()=>{
        themeDrop.classList.remove("show");
        langDrop.classList.remove("show");
    });
});

//////////////////////////////////////////////////////
// ====== Variables et utilitaires ======
//////////////////////////////////////////////////////

let WORDS = []; // Ne contient plus les mots au chargement !
let subsIndex = {}, allSubs = [];
let subsIndex4 = {}, allSubs4 = [];
let currentMode = "subX", difficulty = 1, speedrunCount = 10;
let setOfSubs = [], currentIndex = 0;
let currentSub = null, currentMots = [];
let startTime = 0, timerInterval = null;
let history = [];
let sessionScore = 0, bestTime = null, partieTerminee = false;
let keepPlayingSub50 = false;

// --- skip logic
let skipBinding = false;
let skipKey = "$";
let skippedSyllabes = [];
let lastSkipHTML = "";

const $ = s => document.querySelector(s);

// === Custom Skip Mode additions ===
let customSkippedSubs = [];
function saveCustomSkippedSubs() {
    localStorage.setItem("customSkippedSubs", JSON.stringify(customSkippedSubs));
}
function loadCustomSkippedSubs() {
    let d = localStorage.getItem("customSkippedSubs");
    customSkippedSubs = d ? JSON.parse(d) : [];
}
loadCustomSkippedSubs();

//////////////////////////////////////////////////////
// ====== Fonctions utilitaires (syllabes, index) ======
//////////////////////////////////////////////////////

// Suppression des accents
function removeDiacritics(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

// Découpe un mot en syllabes (2 ou 3 lettres)
function getSyllables(word) {
    const syllables = [];
    const parts = word.split(/[-']/).filter(p => p.length >= 2);
    for (const part of parts) {
        let norm = removeDiacritics(part.toLowerCase());
        for (let i = 0; i < norm.length; i++) {
            if (i + 2 <= norm.length) syllables.push(norm.substring(i, i + 2));
            if (i + 3 <= norm.length) syllables.push(norm.substring(i, i + 3));
        }
    }
    return syllables;
}
// Découpe un mot en syllabes de 4 lettres
function getSyllables4(word) {
    const syllables = [];
    const parts = word.split(/[-']/).filter(p => p.length >= 4);
    for (const part of parts) {
        let norm = removeDiacritics(part.toLowerCase());
        for (let i = 0; i < norm.length; i++) {
            if (i + 4 <= norm.length) syllables.push(norm.substring(i, i + 4));
        }
    }
    return syllables;
}

// Indexation rapide des syllabes à partir d'une liste de mots
function fastIndexSubs(words) {
    let index = {};
    for (let w of words) {
        for (const s of getSyllables(w)) {
            if (!index[s]) index[s] = { mots: new Set(), count: 0 };
            index[s].mots.add(w);
            index[s].count += 1;
        }
    }
    let arr = Object.entries(index).map(([syll, obj]) => ({
        syll,
        mots: Array.from(obj.mots),
        count: obj.count
    }));
    arr.sort((a, b) => a.count - b.count || a.syll.localeCompare(b.syll));
    Object.values(index).forEach(obj => obj.mots = Array.from(obj.mots));
    return { index, arr };
}
function fastIndexSubs4(words) {
    let index = {};
    for (let w of words) {
        for (const s of getSyllables4(w)) {
            if (!index[s]) index[s] = { mots: new Set(), count: 0 };
            index[s].mots.add(w);
            index[s].count += 1;
        }
    }
    let arr = Object.entries(index).map(([syll, obj]) => ({
        syll,
        mots: Array.from(obj.mots),
        count: obj.count
    }));
    arr.sort((a, b) => a.count - b.count || a.syll.localeCompare(b.syll));
    Object.values(index).forEach(obj => obj.mots = Array.from(obj.mots));
    return { index, arr };
}

//////////////////////////////////////////////////////
// ====== Nouvelle logique : Récupération du dictionnaire via l'API ======
//////////////////////////////////////////////////////

async function fetchAllWords() {
    // API pour tout charger : GET /api/getwords?syllabe=all
    const response = await fetch('/api/getwords?syllabe=all');
    if (!response.ok) throw new Error("Erreur de chargement du dictionnaire");
    const data = await response.json();
    return data.mots;
}

async function fetchWordsForSyllabe(syllabe) {
    const response = await fetch(`/api/getwords?syllabe=${encodeURIComponent(syllabe)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.mots;
}

//////////////////////////////////////////////////////
// ====== UI & interactions ======
//////////////////////////////////////////////////////

function showStats() {
    $("#total-subs").textContent = `${t("subs")}: ${allSubs.length}`;
    $("#total-mots").textContent = `${t("words")}: ${WORDS.length}`;
    $("#session-score").textContent = `${t("score")}: ${sessionScore}`;
    let nb = 0;
    if (currentMode === "subX") {
        nb = allSubs.filter(x => x.count === difficulty).length;
        $("#syllabes-pour-sub").textContent = `Syllabes sub${difficulty} : ${nb}`;
    } else if (currentMode === "sub50") {
        nb = allSubs.filter(x => x.count >= 1 && x.count <= 50).length;
        $("#syllabes-pour-sub").textContent = `Syllabes (1-50) : ${nb}`;
    } else if (currentMode === "speedrun") {
        $("#syllabes-pour-sub").textContent = `Syllabes speedrun : ${speedrunCount}`;
    } else if (currentMode === "4lettres") {
        nb = allSubs4.filter(x => x.count >= 1).length;
        $("#syllabes-pour-sub").textContent = `Syllabes 4L : ${nb}`;
    } else if (currentMode === "customskip") {
        $("#syllabes-pour-sub").textContent = `${t("customskip_desc")}`;
    } else {
        $("#syllabes-pour-sub").textContent = "";
    }
}

function updateProgress() {
    $("#progress-bar").innerHTML = "";
    $("#remaining-box").textContent = "";
    if (["subX","speedrun","4lettres","customskip"].includes(currentMode)) {
        $("#set-progress").textContent = setOfSubs.length > 1 ?
            `Progression : ${currentIndex + 1}/${setOfSubs.length} syllabes` : "";
    } else {
        $("#set-progress").textContent = "";
    }
}

function pickSubs(mode) {
    let subs = [];
    if (mode === "subX") {
        subs = allSubs.filter(x => x.count === difficulty);
    }
    if (mode === "sub50") {
        let pool = allSubs.filter(x => x.count >= 1 && x.count <= 50);
        if (pool.length) {
            const idx = Math.floor(Math.random() * pool.length);
            subs = [pool[idx]];
        }
    }
    if (mode === "speedrun") {
        let pool = allSubs.filter(x => x.count >= 1 && x.count <= 10);
        for (let i = 0; i < speedrunCount && pool.length; i++) {
            let idx = Math.floor(Math.random() * pool.length);
            subs.push(pool[idx]);
            pool.splice(idx, 1);
        }
    }
    if (mode === "4lettres") {
        subs = allSubs4.filter(x => x.count >= 100);
        shuffleArray(subs);
    }
    if (mode === "customskip") {
        subs = [];
        for (let s of customSkippedSubs) {
            let obj = allSubs.find(x => x.syll === s);
            if (obj) subs.push(obj);
        }
    }
    return subs;
}

//////////////////////////////////////////////////////
// ====== Indexation via API au chargement ======
//////////////////////////////////////////////////////

async function indexAllSyllabes() {
    $("#feedback").className = "";
    $("#feedback").textContent = t("indexEnCours");
    try {
        WORDS = await fetchAllWords();
        const { index, arr } = fastIndexSubs(WORDS);
        subsIndex = index;
        allSubs = arr;
        const { index: index4, arr: arr4 } = fastIndexSubs4(WORDS);
        subsIndex4 = index4;
        allSubs4 = arr4;
        $("#feedback").className = "success";
        $("#feedback").textContent = `${t("indexOK")} ${arr.length} subs.`;
        showStats();
    } catch (err) {
        $("#feedback").className = "danger";
        $("#feedback").textContent = "Erreur API";
    }
}

//////////////////////////////////////////////////////
// ====== Reste du code du jeu (startGame, checkGuess, etc.) ======
//////////////////////////////////////////////////////

function startGame() {
    partieTerminee = false;
    $("#game-section").classList.remove("hidden");
    $("#feedback").className = "";
    $("#feedback").textContent = "";
    $("#guess-input").value = "";
    $("#guess-input").classList.remove("hidden");
    $("#return-btn").classList.add("hidden");
    $("#stop-btn").classList.toggle("hidden", currentMode !== "sub50");
    keepPlayingSub50 = false;
    skippedSyllabes = [];
    lastSkipHTML = "";

    difficulty = parseInt($("#difficulty").value, 10);
    speedrunCount = parseInt($("#speedrun-count").value, 10);
    if (currentMode === "retry") {
        if (skippedSyllabes.length === 0) {
            $("#feedback").className = "danger";
            $("#feedback").textContent = t("no_skipped_subs");
            return;
        }
        setOfSubs = [...skippedSyllabes];
        shuffleArray(setOfSubs);
        $("#main-title").textContent = t("mode_retry");
    } else {
        setOfSubs = pickSubs(currentMode);
        if (setOfSubs.length > 1) shuffleArray(setOfSubs);
    }
    currentIndex = 0;
    if (!setOfSubs.length) {
        $("#syllabe-box").textContent = t("noneList");
        $("#found-box").innerHTML = "";
        $("#feedback").className = "danger";
        $("#feedback").textContent = t("change");
        $("#guess-input").classList.add("hidden");
        $("#progress-bar").innerHTML = "";
        $("#remaining-box").textContent = "";
        $("#set-progress").textContent = "";
        return;
    }
    currentSub = setOfSubs[currentIndex];
    currentMots = currentSub.mots;
    updateSyllabeBox();
    $("#timer-box").textContent = "⏱️ "+t("time")+": 0s";
    $("#found-box").innerHTML = "";
    $("#guess-input").focus();
    $("#return-btn").classList.add("hidden");
    sessionScore++;
    showStats();
    updateProgress();
}

function updateSyllabeBox() {
    $("#syllabe-box").innerHTML = `${t("syllabe")} : <span style="background:var(--accent);padding:3px 14px;border-radius:9px;color:#fff;">${currentSub.syll.toUpperCase()}</span>
    <span style="color:var(--fg2);font-size:0.82em;margin-left:14px;">(${currentSub.count} mot${currentSub.count > 1 ? "s" : ""})</span>`;
    if (lastSkipHTML) {
        $("#found-box").innerHTML = lastSkipHTML;
    } else {
        $("#found-box").innerHTML = "";
    }
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function checkGuess() {
    let val = removeDiacritics($("#guess-input").value.toLowerCase().trim());
    let match = currentMots.find(m => removeDiacritics(m.toLowerCase()) === val);
    if (match) {
        lastSkipHTML = "";
        $("#found-box").innerHTML = `${t("found")} <span style='color:var(--success)'>${match}</span>`;
        $("#feedback").className = "";
        $("#feedback").textContent = "";
        $("#guess-input").value = "";
        setTimeout(nextSyllabeOrContinue, 120);
    } else if (val.length > 0) {
        $("#feedback").className = "danger";
        $("#feedback").textContent = t("none");
    } else {
        $("#feedback").className = "";
        $("#feedback").textContent = "";
    }
}

function nextSyllabeOrContinue() {
    if (["subX","speedrun","retry","4lettres","customskip"].includes(currentMode)) {
        if (currentIndex + 1 < setOfSubs.length) {
            currentIndex++;
            currentSub = setOfSubs[currentIndex];
            currentMots = currentSub.mots;
            updateSyllabeBox();
            $("#feedback").className = "";
            $("#feedback").textContent = "";
            $("#guess-input").value = "";
            $("#guess-input").focus();
            updateProgress();
            startTime = Date.now();
        } else {
            endGame();
        }
    } else if (currentMode === "sub50") {
        if (!keepPlayingSub50) {
            let pool = allSubs.filter(x => x.count >= 1 && x.count <= 50);
            if (pool.length) {
                currentSub = pool[Math.floor(Math.random() * pool.length)];
                currentMots = currentSub.mots;
                updateSyllabeBox();
                $("#feedback").className = "";
                $("#feedback").textContent = "";
                $("#guess-input").value = "";
                $("#guess-input").focus();
                updateProgress();
                startTime = Date.now();
            }
        }
    }
}

function endGame() {
    let totalSec = Math.round((Date.now() - startTime) / 1000);
    $("#feedback").className = "success";
    $("#feedback").textContent = `${t("terminee")} ! (${totalSec} ${t("time").toLowerCase()}s)`;
    $("#return-btn").classList.remove("hidden");
    $("#guess-input").classList.add("hidden");
    $("#stop-btn").classList.add("hidden");
    clearInterval(timerInterval);
    partieTerminee = true;
    bestTime = bestTime ? Math.min(bestTime, totalSec) : totalSec;
    history.push({
        date: new Date().toLocaleString(),
        mode: currentMode,
        subs: setOfSubs.map(x => x.syll),
        temps: totalSec,
        score: sessionScore,
        skippedSyllabes: [...skippedSyllabes] 
    });
    showHistory();
}

// ========== SKIP/BIND LOGIC ==========

function handleSkip() {
    skippedSyllabes.push(currentSub.syll);
    // Ajout à la liste customSkippedSubs persistante si pas déjà dedans
    if (!customSkippedSubs.includes(currentSub.syll)) {
        customSkippedSubs.push(currentSub.syll);
        saveCustomSkippedSubs();
    }
    let mots = currentMots.slice().sort((a,b)=>a.length-b.length||a.localeCompare(b)).slice(0,15);
    lastSkipHTML = `${t("reponses")} "<span style="color:var(--accent2)">${currentSub.syll}</span>" : <span style="color:var(--fg)">${mots.join(", ")}${currentMots.length>15?"...":""}</span>`;
    $("#found-box").innerHTML = lastSkipHTML;
    $("#feedback").className = "";
    $("#feedback").textContent = "";
    setTimeout(nextSyllabeOrContinue, 700);
    showHistory();
}

$("#bind-btn")?.addEventListener('click', () => {
    skipBinding = true;
    $("#bind-btn").classList.add("binding");
    $("#bind-btn").textContent = "Appuyez sur une touche...";
});

window.addEventListener("keydown", (e) => {
    if (skipBinding) {
        skipKey = e.key;
        skipBinding = false;
        $("#bind-btn").classList.remove("binding");
        $("#bind-btn").textContent = `Bind (${skipKey})`;
        e.preventDefault();
    } else if (skipKey && e.key === skipKey && !$("#guess-input").classList.contains("hidden")) {
        if (currentMode === "casual" && casualGameActive) {
            e.preventDefault();
            $("#feedback").className = "danger";
            $("#feedback").textContent = "⛔️ Le skip est désactivé en mode Min 1 !";
        } else {
            e.preventDefault();
            handleSkip();
        }
    }
});

// ========== TOKIBOT CHAT ==========

function chatbotAddMsg(msg, user = false) {
    const div = document.createElement('div');
    div.className = 'chatbot-msg ' + (user ? 'chatbot-user' : 'chatbot-bot');
    div.innerHTML = msg;
    $("#chatbot-messages").appendChild(div);
    $("#chatbot-messages").scrollTop = $("#chatbot-messages").scrollHeight + 100;
}

async function chatbotHandleInput(val) {
    // Commande /add ou .add pour ajouter une syllabe à Custom
    if (/^[/.]add\s+(\S{2,})$/i.test(val)) {
        const syl = val.match(/^[/.]add\s+(\S{2,})$/i)[1].toLowerCase();
        let exists = allSubs.find(x => x.syll === syl);
        if (!exists) {
            chatbotAddMsg(`<b>❌ Syllabe <span style="color:var(--accent2)">${syl.toUpperCase()}</span> inconnue.</b>`);
        } else if (customSkippedSubs.includes(syl)) {
            chatbotAddMsg(`<b>ℹ️ Syllabe <span style="color:var(--accent2)">${syl.toUpperCase()}</span> déjà dans Custom.</b>`);
        } else {
            customSkippedSubs.push(syl);
            saveCustomSkippedSubs();
            chatbotAddMsg(`<b>✅ Syllabe <span style="color:var(--accent2)">${syl.toUpperCase()}</span> ajoutée à Custom !</b>`);
            showStats();
        }
        return;
    }
    // Commande recherche /c ou .c
    if (/^[/.]c\s+(\S+)$/i.test(val)) {
        const syll = val.match(/^[/.]c\s+(\S+)$/i)[1].toLowerCase();
        // API call : demande à l'API les mots pour la syllabe
        let mots = await fetchWordsForSyllabe(syll);
        if (mots.length > 0) {
            const motsSorted = mots.slice().sort((a, b) => a.length - b.length || a.localeCompare(b));
            const shortList = motsSorted.slice(0, 5);
            let html = `<b>${t("botw")} <span style="color:var(--accent2)">${syll.toUpperCase()}</span> :</b><br><span style="color:var(--fg)">`;
            html += shortList.join(", ") + "</span>";
            if (mots.length > 5)
                html += `<br><span style="font-size:0.93em;opacity:.8">${t("botmore",{n:mots.length-5})}</span>`;
            chatbotAddMsg(html);
        } else {
            chatbotAddMsg(`<b>${t("botnone")} <span style="color:var(--accent2)">${syll.toUpperCase()}</span>.</b>`);
        }
        return;
    }
    // Sinon aide
    if (val.trim() !== "") {
        chatbotAddMsg(t("bothelp"));
    }
}

$("#chatbot-send")?.addEventListener('click', function() {
    const val = $("#chatbot-input").value;
    if (!val.trim()) return;
    chatbotAddMsg(val, true);
    chatbotHandleInput(val);
    $("#chatbot-input").value = "";
});
$("#chatbot-input")?.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        $("#chatbot-send").click();
    }
});

//////////////////////////////////////////////////////
// ====== Initialisation du site ======
//////////////////////////////////////////////////////

window.addEventListener("DOMContentLoaded", async () => {
    chatbotAddMsg(`Salut ! Je suis TokiBot 🤖<br>${t("botdesc")}<br>${t("botex")}`);
    setTheme(currentTheme);
    setLang(currentLang);
    await indexAllSyllabes();
});

// Le reste des interactions/boutons/handlers du jeu ne change pas.
// Si tu veux intégrer l'import de liste personnalisée (local, pas via API), tu peux le réactiver : il remplacera `WORDS` localement et réindexera via fastIndexSubs comme avant.