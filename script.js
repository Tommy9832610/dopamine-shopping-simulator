// Caricamento dei dati persistenti da localStorage o valori iniziali di default
let budget = parseInt(localStorage.getItem('luxury_budget')) || 100000000000;
let totalSpent = parseInt(localStorage.getItem('luxury_spent')) || 0;
const inventory = JSON.parse(localStorage.getItem('luxury_inventory')) || {};
const unlockedAchievements = new Set(JSON.parse(localStorage.getItem('luxury_achievements')) || []);

let comboCount = 0;
let comboMultiplier = 1.0;
let comboTimer;

const productsData = { 
    "Caffè Dorato": 50, "Supercar Elettrica": 250000, "Jet Privato": 45000000, 
    "Mega Yacht": 350000000, "Attico Manhattan": 1200000000, "Stazione Spaziale": 15000000000,
    "👑 Pura Dopamina": 0, "👑 NFT Donut Dorato": 500000000
};

const budgetCounter = document.getElementById('budget-counter');
const comboCounter = document.getElementById('combo-multiplier');
const rankLabel = document.getElementById('user-rank');
const inventoryContainer = document.getElementById('inventory-list');
const buttons = document.querySelectorAll('.buy-btn');

// Inizializza l'interfaccia con i dati salvati
updateBudgetDisplay(budget, false);
checkRankProgression(totalSpent);
renderInventory();

// Salva lo stato nel browser
function saveGameState() {
    localStorage.setItem('luxury_budget', budget);
    localStorage.setItem('luxury_spent', totalSpent);
    localStorage.setItem('luxury_inventory', JSON.stringify(inventory));
    localStorage.setItem('luxury_achievements', JSON.stringify([...unlockedAchievements]));
}

// Spettacolare effetto contatore a scorrimento rapido stile Slot Machine
function updateBudgetDisplay(targetValue, animate = true) {
    if (!animate) {
        budgetCounter.innerText = "$" + targetValue.toLocaleString('en-US');
        return;
    }
    
    let currentValue = parseInt(budgetCounter.innerText.replace(/[^0-9]/g, '')) || 0;
    if (currentValue === targetValue) return;

    // Cambia temporaneamente colore durante il movimento dei soldi
    budgetCounter.style.color = (targetValue > currentValue) ? "var(--mint-green)" : "var(--candy-pink)";

    const duration = 400; 
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        // Calcolo fluido di interpolazione
        const easeProgress = progress * (2 - progress); 
        const nextValue = Math.round(currentValue + (targetValue - currentValue) * easeProgress);
        
        budgetCounter.innerText = "$" + nextValue.toLocaleString('en-US');

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            budgetCounter.innerText = "$" + targetValue.toLocaleString('en-US');
            budgetCounter.style.color = "var(--candy-pink)"; // Torna al colore base
        }
    }
    requestAnimationFrame(step);
}

function playCoinSound(isWin = true) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isWin ? 587.33 : 220, ctx.currentTime); 
        if(isWin) osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch(e) { console.log("Audio in attesa di interazione"); }
}

function triggerAchievement(id, title, desc) {
    if (unlockedAchievements.has(id)) return;
    unlockedAchievements.add(id);
    saveGameState();
    
    document.getElementById('ach-title').innerText = title;
    document.getElementById('ach-desc').innerText = desc;
    const toast = document.getElementById('achievement-toast');
    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.add('hidden'); }, 4000);
}

function triggerDessertCelebration(spentAll = false) {
    playCoinSound(true);

    const cakeOverlay = document.createElement('div');
    cakeOverlay.style.position = 'fixed';
    cakeOverlay.style.top = '0';
    cakeOverlay.style.left = '0';
    cakeOverlay.style.width = '100vw';
    cakeOverlay.style.height = '100vh';
    cakeOverlay.style.background = 'rgba(255, 240, 245, 0.98)';
    cakeOverlay.style.display = 'flex';
    cakeOverlay.style.flexDirection = 'column';
    cakeOverlay.style.justifyContent = 'center';
    cakeOverlay.style.alignItems = 'center';
    cakeOverlay.style.zIndex = '9999';
    
    let subtext = spentAll 
        ? "Hai sacrificato TUTTO il tuo patrimonio per un'overdose di Pura Dopamina! L'economia mondiale è al collasso, ma il tuo cervello sta esplodendo di felicità."
        : "Hai consumato fino all'ultimo centesimo dei 100 Miliardi! Il tuo livello di gratificazione ha raggiunto il massimo storico.";

    cakeOverlay.innerHTML = `
        <div style="font-size: 8rem; animation: bounce 1s infinite alternate;">⚡</div>
        <h1 style="color: #ff69b4; font-size: 2.5rem; text-align:center; font-weight:900; margin-top:20px;">
            OVERDOSE DI PURA DOPAMINA! 🧠✨
        </h1>
        <p style="color: #4a2840; font-size: 1.2rem; text-align:center; max-width:80%; margin-top:10px; line-height:1.5; font-weight: bold;">
            ${subtext}
        </p>
        <button id="close-cake-btn" style="margin-top: 30px; background: #70d6ff; color: #fff; border: none; padding: 15px 40px; font-weight: bold; border-radius: 16px; cursor: pointer; font-size:1.1rem; box-shadow: 0 5px 15px rgba(112,214,255,0.4);">RICEVI ALTRI 100 MILIARDI</button>
    `;
    document.body.appendChild(cakeOverlay);

    const end = Date.now() + (5 * 1000);
    (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff69b4', '#ffb703', '#70d6ff'] });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff69b4', '#ffb703', '#70d6ff'] });
        if (Date.now() < end) { requestAnimationFrame(frame); }
    }());

    document.getElementById('close-cake-btn').addEventListener('click', () => {
        cakeOverlay.remove();
        budget = 100000000000; 
        totalSpent = 0;
        updateBudgetDisplay(budget, true);
        rankLabel.innerText = "Miliardario Base 🥉";
        rankLabel.className = "rank-bronze";
        
        for (let member in inventory) delete inventory[member];
        saveGameState();
        renderInventory();
    });
}

// Cliccando sul tastone, azzera tutto
document.getElementById('mega-cake-btn').addEventListener('click', () => {
    if (budget > 0) {
        totalSpent += budget;
        budget = 0; 
        updateBudgetDisplay(budget, true);
        triggerAchievement('all_in_cake', "Iniezione di Felicità ⚡", "Hai scambiato 100 miliardi per una scarica pura di neurotrasmettitori.");
        updateInventoryHTML("👑 Pura Dopamina");
        setTimeout(() => { triggerDessertCelebration(true); }, 500);
    }
});

// Motore Volatilità con iniezione di bagliori (Flash CSS) sulle Card
setInterval(() => {
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.getAttribute('data-name');
        if(!name) return;
        const basePrice = parseInt(card.getAttribute('data-base-price'));
        const changePercent = (Math.random() * 24 - 12) / 100;
        let currentPrice = Math.round(basePrice * (1 + changePercent));
        
        productsData[name] = currentPrice;
        let displayPrice = Math.round(currentPrice / comboMultiplier);

        const trendSpan = card.querySelector('.trend');
        card.querySelector('.price').childNodes[0].nodeValue = "$" + displayPrice.toLocaleString('en-US') + " ";
        
        // Rimuove vecchie classi di flash per poterle reinnescare
        card.classList.remove('flash-up', 'flash-down');
        void card.offsetWidth; // Trucco per forzare il riavvio dell'animazione nel browser

        if (changePercent >= 0) { 
            trendSpan.innerText = `▲ +${Math.round(changePercent*100)}%`; trendSpan.className = "trend up"; 
            card.classList.add('flash-up');
        } else { 
            trendSpan.innerText = `▼ ${Math.round(changePercent*100)}%`; trendSpan.className = "trend down"; 
            card.classList.add('flash-down');
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
    document.getElementById('fomo-ticker').innerText = fomoPhrases[Math.floor(Math.random() * fomoPhrases.length)];
}, 5000);

function checkRankProgression(spent) {
    if (spent >= 60000000000) { rankLabel.innerText = "Re della Pasticceria 👑🍰"; rankLabel.className = "rank-master"; }
    else if (spent >= 10000000000) { rankLabel.innerText = "Magnate della Glassa 🍩"; rankLabel.className = "rank-gold"; }
    else if (spent >= 50000000) { rankLabel.innerText = "Pasticciere d'Élite 🧁"; rankLabel.className = "rank-silver"; }
}

// Logica Acquisti
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.parentElement;
        const name = card.getAttribute('data-name');
        const finalPrice = Math.round(productsData[name] / comboMultiplier);

        if (budget >= finalPrice) {
            budget -= finalPrice;
            totalSpent += finalPrice;
            playCoinSound(true);

            if (budget < 100000000 && budget > 0) {
                triggerAchievement('sweet_victory', "Pasticceria d'Élite 2", "Hai consumato tutto il capitale.");
                triggerDessertCelebration(false);
            }

            comboCount++;
            if (comboCount >= 5 && comboMultiplier === 1.0) {
                comboMultiplier = 2.0;
                comboCounter.innerText = "FRENESIA 2.0x 🔥";
                clearTimeout(comboTimer);
                comboTimer = setTimeout(() => { comboCount = 0; comboMultiplier = 1.0; comboCounter.innerText = "1.0x"; }, 3000);
                confetti({ particleCount: 100, spread: 70 });
            }

            updateBudgetDisplay(budget, true);
            checkRankProgression(totalSpent);
            updateInventoryHTML(name);
            confetti({ particleCount: 20, spread: 30 });
        } else {
            alert("❌ Borsa Chiusa: Fondi insufficienti!");
        }
    });
});

function updateInventoryHTML(name) {
    if (inventory[name]) { inventory[name].count++; } else { inventory[name] = { count: 1 }; }
    saveGameState();
    renderInventory();
}

function renderInventory() {
    const keys = Object.keys(inventory).filter(k => inventory[k].count > 0);
    if (keys.length === 0) {
        inventoryContainer.innerHTML = '<p class="empty-msg">Nessun bene di lusso registrato a tuo nome nel database.</p>';
        return;
    }

    inventoryContainer.innerHTML = '';
    keys.forEach(name => {
        const div = document.createElement('div');
        div.className = 'inv-item';
        div.innerHTML = `${name} <b class="qty" style="color:var(--candy-gold)">x${inventory[name].count}</b>`;
        div.addEventListener('click', () => { sellItem(name); });
        inventoryContainer.appendChild(div);
    });
}

function sellItem(name) {
    if (inventory[name] && inventory[name].count > 0) {
        const refundValue = productsData[name] || 0;
        budget += refundValue;
        inventory[name].count--;

        if (inventory[name].count === 0) { delete inventory[name]; }
        
        playCoinSound(true);
        updateBudgetDisplay(budget, true);
        saveGameState();
        renderInventory();
    }
}

document.getElementById('gamble-btn').addEventListener('click', () => {
    const cost = 500000000;
    if (budget >= cost) {
        budget -= cost;
        updateBudgetDisplay(budget, true);
        
        if (Math.random() > 0.6) {
            playCoinSound(true);
            triggerAchievement('gambler_win', "Lupo della Finanza", "Hai vinto la scommessa!");
            updateInventoryHTML("👑 NFT Donut Dorato");
            confetti({ particleCount: 100, spread: 80, colors: ['#ffb703', '#70d6ff'] });
        } else {
            playCoinSound(false);
            alert("📉 Crollo della panna! Investimento azzerato.");
            triggerAchievement('gambler_loss', "Bancarotta", "Niente caramelle per stavolta.");
            saveGameState();
        }
    } else {
        alert("Fondi insufficienti!");
    }
});
