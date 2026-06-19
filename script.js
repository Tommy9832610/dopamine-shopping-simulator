// 1. STATO INTERNO DEL GIOCO
let budget = parseInt(localStorage.getItem('luxury_budget')) || 100000000000;
let totalSpent = parseInt(localStorage.getItem('luxury_spent')) || 0;
const inventory = JSON.parse(localStorage.getItem('luxury_inventory')) || {};
const unlockedAchievements = new Set(JSON.parse(localStorage.getItem('luxury_achievements')) || []);

let currentComboCount = 0;
let currentComboMultiplier = 1.0;
let comboTimer;

const productsData = { 
    "Caffè Dorato": 50, "Supercar Elettrica": 250000, "Jet Privato": 45000000, 
    "Mega Yacht": 350000000, "Attico Manhattan": 1200000000, "Stazione Spaziale": 15000000000,
    "👑 Pura Dopamina": 0, "👑 NFT Donut Dorato": 500000000
};

// 2. ELEMENTI HTML DOM
const budgetCounterEl = document.getElementById('budget-counter');
const comboMultiplierEl = document.getElementById('combo-multiplier');
const rankLabelEl = document.getElementById('user-rank');
const inventoryContainerEl = document.getElementById('inventory-list');
const buyButtons = document.querySelectorAll('.buy-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Inizializzazione Interfaccia
updateBudgetDisplay(budget, false);
checkRankProgression(totalSpent);
renderInventory();

// 3. LOGICA DI ATTIVAZIONE DELLA MODALITÀ NOTTE (CIOCCOLATO FONDENTE)
if (localStorage.getItem('luxury_theme') === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeToggleBtn) themeToggleBtn.innerText = "☀️ Modalità Chiara";
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('luxury_theme', 'dark');
            themeToggleBtn.innerText = "☀️ Modalità Chiara";
        } else {
            localStorage.setItem('luxury_theme', 'light');
            themeToggleBtn.innerText = "🍫 Modalità Notte";
        }
        playCustomSound('fluid'); 
    });
}

function saveGameState() {
    localStorage.setItem('luxury_budget', budget);
    localStorage.setItem('luxury_spent', totalSpent);
    localStorage.setItem('luxury_inventory', JSON.stringify(inventory));
    localStorage.setItem('luxury_achievements', JSON.stringify([...unlockedAchievements]));
}

// 4. ANIMAZIONE INCREMENTO NUMERICO (STILE SLOT MACHINE)
function updateBudgetDisplay(targetValue, animate = true) {
    if (!animate || !budgetCounterEl) {
        if (budgetCounterEl) budgetCounterEl.innerText = "$" + targetValue.toLocaleString('en-US');
        return;
    }
    let currentValue = parseInt(budgetCounterEl.innerText.replace(/[^0-9]/g, '')) || 0;
    if (currentValue === targetValue) return;

    budgetCounterEl.style.color = (targetValue > currentValue) ? "var(--mint-green)" : "var(--candy-pink)";
    const duration = 400; 
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const easeProgress = progress * (2 - progress); 
        const nextValue = Math.round(currentValue + (targetValue - currentValue) * easeProgress);
        budgetCounterEl.innerText = "$" + nextValue.toLocaleString('en-US');

        if (progress < 1) { 
            requestAnimationFrame(step); 
        } else {
            budgetCounterEl.innerText = "$" + targetValue.toLocaleString('en-US');
            budgetCounterEl.style.color = "var(--candy-pink)";
        }
    }
    requestAnimationFrame(step);
}

// 5. MOTORE AUDIO PROVVISORIO (Attivato solo per il primo file click.mp3)
function playCustomSound(type) {
    try {
        let soundFile = "";

        // Usiamo temporaneamente click.mp3 per qualsiasi acquisto per vedere se carica l'audio correttamente
        if (type === 'fluid') {
            soundFile = "click.mp3"; 
        } else {
            soundFile = "click.mp3"; 
        }

        if (soundFile !== "") {
            const audio = new Audio(soundFile);
            audio.volume = 0.4; 
            audio.play().catch(e => console.log("Clicca prima sullo sfondo per sbloccare l'audio!"));
        }
    } catch(e) { 
        console.log("Errore nel caricamento del file audio:", e); 
    }
}

function triggerAchievement(id, title, desc) {
    if (unlockedAchievements.has(id)) return;
    unlockedAchievements.add(id);
    saveGameState();
    
    const aTitle = document.getElementById('ach-title');
    const aDesc = document.getElementById('ach-desc');
    const toast = document.getElementById('achievement-toast');
    if(aTitle && aDesc && toast) {
        aTitle.innerText = title;
        aDesc.innerText = desc;
        toast.classList.remove('hidden');
        setTimeout(() => { toast.classList.add('hidden'); }, 4000);
    }
}

function triggerDessertCelebration(spentAll = false) {
    playCustomSound('dopamine');

    const cakeOverlay = document.createElement('div');
    cakeOverlay.style.position = 'fixed';
    cakeOverlay.style.top = '0'; cakeOverlay.style.left = '0';
    cakeOverlay.style.width = '100vw'; cakeOverlay.style.height = '100vh';
    cakeOverlay.style.background = 'var(--bg-color)';
    cakeOverlay.style.display = 'flex'; cakeOverlay.style.flexDirection = 'column';
    cakeOverlay.style.justifyContent = 'center'; cakeOverlay.style.alignItems = 'center';
    cakeOverlay.style.zIndex = '9999';
    
    let subtext = spentAll 
        ? "Hai sacrificato TUTTO il tuo immenso patrimonio in un colpo solo per una scarica di Pura Dopamina! L'economia mondiale è al collasso, ma il tuo cervello sta esplodendo di felicità."
        : "Hai consumato fino all'ultimo centesimo dei 100 Miliardi! Il tuo livello di gratificazione ha raggiunto il massimo storico.";

    cakeOverlay.innerHTML = `
        <div style="font-size: 8rem; animation: bounce 1s infinite alternate;">⚡</div>
        <h1 style="color: var(--candy-pink); font-size: 2.5rem; text-align:center; font-weight:900; margin-top:20px;">
            OVERDOSE DI PURA DOPAMINA! 🧠✨
        </h1>
        <p style="color: var(--text-main); text-align:center; max-width:80%; margin-top:10px; line-height:1.5; font-
