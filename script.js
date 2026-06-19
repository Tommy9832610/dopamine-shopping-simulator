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

// 🔊 INIZIALIZZAZIONE AUDIO GLOBALE (Previene i blocchi del browser)
// Usiamo un suono CDN pubblico standard e leggero per il test del click
const globalClickAudio = new Audio("https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/button_tiny.mp3");
globalClickAudio.volume = 0.5;
globalClickAudio.preload = "auto";

// Sblocca l'audio al primo tocco sullo schermo (Indispensabile per iOS/Android)
document.addEventListener('click', () => {
    globalClickAudio.play().then(() => {
        // Suono riprodotto con successo, audio sbloccato!
        globalClickAudio.pause();
        globalClickAudio.currentTime = 0;
    }).catch(e => console.log("In attesa di interazione reale"));
}, { once: true });

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

// 5. RIPRODUTTORE AUDIO OTTIMIZZATO
function playCustomSound(type) {
    try {
        // Riproduciamo il file audio globale pre-caricato
        globalClickAudio.currentTime = 0;
        globalClickAudio.play().catch(e => {
            console.log("Riproduzione intercettata o bloccata:", e);
        });
    } catch(e) { 
        console.log("Errore riproduzione:", e); 
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
        <p style="color: var(--text-main); text-align:center; max-width:80%; margin-top:10px; line-height:1.5; font-weight: bold;">
            ${subtext}
        </p>
        <button id="close-cake-btn" style="margin-top: 30px; background: var(--candy-blue); color: #fff; border: none; padding: 15px 40px; font-weight: bold; border-radius: 16px; cursor: pointer; font-size:1.1rem; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">RICOMINCIA LA SCALATA SOCIALE</button>
    `;
    document.body.appendChild(cakeOverlay);

    if(typeof confetti === 'function') {
        const end = Date.now() + (5 * 1000);
        (function frame() {
            confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff69b4', '#ffb703', '#70d6ff'] });
            confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff69b4', '#ffb703', '#70d6ff'] });
            if (Date.now() < end) { requestAnimationFrame(frame); }
        }());
    }

    document.getElementById('close-cake-btn').addEventListener('click', () => {
        cakeOverlay.remove();
        budget = 100000000000; 
        totalSpent = 0;
        updateBudgetDisplay(budget, true);
        if(rankLabelEl) {
            rankLabelEl.innerText = "Miliardario Base 🥉";
            rankLabelEl.className = "rank-bronze";
        }
        for (let member in inventory) delete inventory[member];
        saveGameState(); renderInventory();
    });
}

const megaCakeBtn = document.getElementById('mega-cake-btn');
if(megaCakeBtn) {
    megaCakeBtn.addEventListener('click', () => {
        if (budget > 0) {
            totalSpent += budget; budget = 0; 
            updateBudgetDisplay(budget, true);
            triggerAchievement('all_in_cake', "Iniezione di Felicità ⚡", "Hai scambiato 100 miliardi per una scarica pura di neurotrasmettitori.");
            updateInventoryHTML("👑 Pura Dopamina");
            setTimeout(() => { triggerDessertCelebration(true); }, 500);
        }
    });
}

// 6. VOLATILITÀ DI BORSA AUTOMATICA
setInterval(() => {
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.getAttribute('data-name');
        if(!name) return;
        const basePrice = parseInt(card.getAttribute('data-base-price'));
        const changePercent = (Math.random() * 24 - 12) / 100;
        let currentPrice = Math.round(basePrice * (1 + changePercent));
        
        productsData[name] = currentPrice;
        let displayPrice = Math.round(currentPrice / currentComboMultiplier);

        const trendSpan = card.querySelector('.trend');
        const priceEl = card.querySelector('.price');
        if(priceEl) priceEl.childNodes[0].nodeValue = "$" + displayPrice.toLocaleString('en-US') + " ";
        
        card.classList.remove('flash-up', 'flash-down');
        void card.offsetWidth; 

        if (trendSpan) {
            if (changePercent >= 0) { 
                trendSpan.innerText = `▲ +${Math.round(changePercent*100)}%`; trendSpan.className = "trend up"; 
                card.classList.add('flash-up');
            } else { 
                trendSpan.innerText = `▼ ${Math.round(changePercent*100)}%`; trendSpan.className = "trend down"; 
                card.classList.add('flash-down');
            }
        }
    });
}, 4000);

const fomoPhrases = [
    "🍭 NEWS: Gli investitori stanno correndo ad acquistare l'Attico a Manhattan prima che finisca la glassa!",
    "🧁 AVVISO: Il Rank 'Re della Pasticceria' richiede una spesa folle. Mangia tutto il budget!",
    "🍩 CRIPTO: Un utente ha scambiato un Donut d'Oro per un intero Jet Privato.",
    "✨ FRENESIA: Clicca 5 volte rapidamente per scatenare l'overdose di sconti!"
];
setInterval(() => {
    const tickerEl = document.getElementById('fomo-ticker');
    if(tickerEl) tickerEl.innerText = fomoPhrases[Math.floor(Math.random() * fomoPhrases.length)];
}, 5000);

function checkRankProgression(spent) {
    if(!rankLabelEl) return;
    if (spent >= 60000000000) { rankLabelEl.innerText = "Re della Pasticceria 👑🍰"; rankLabelEl.className = "rank-master"; }
    else if (spent >= 10000000000) { rankLabelEl.innerText = "Magnate della Glassa 🍩"; rankLabelEl.className = "rank-gold"; }
    else if (spent >= 50000000) { rankLabelEl.innerText = "Pasticciere d'Élite 🧁"; rankLabelEl.className = "rank-silver"; }
}

// 7. LOGICA DI ACQUISTO COMPONENTI
buyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.parentElement;
        const name = card.getAttribute('data-name');
        const finalPrice = Math.round(productsData[name] /
