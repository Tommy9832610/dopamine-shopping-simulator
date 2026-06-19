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

// Inizializzazione Interfaccia
updateBudgetDisplay(budget, false);
checkRankProgression(totalSpent);
renderInventory();

// Gestore Tema Dark/Light
const themeToggleBtn = document.getElementById('theme-toggle-btn');
if(localStorage.getItem('luxury_theme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggleBtn.innerText = "☀️ Modalità Chiara";
}
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    if(document.body.classList.contains('dark-theme')) {
        localStorage.setItem('luxury_theme', 'dark');
        themeToggleBtn.innerText = "☀️ Modalità Chiara";
        playCustomSound('fluid');
    } else {
        localStorage.setItem('luxury_theme', 'light');
        themeToggleBtn.innerText = "🍫 Modalità Notte";
        playCustomSound('fluid');
    }
});

function saveGameState() {
    localStorage.setItem('luxury_budget', budget);
    localStorage.setItem('luxury_spent', totalSpent);
    localStorage.setItem('luxury_inventory', JSON.stringify(inventory));
    localStorage.setItem('luxury_achievements', JSON.stringify([...unlockedAchievements]));
}

function updateBudgetDisplay(targetValue, animate = true) {
    if (!animate) {
        budgetCounter.innerText = "$" + targetValue.toLocaleString('en-US');
        return;
    }
    let currentValue = parseInt(budgetCounter.innerText.replace(/[^0-9]/g, '')) || 0;
    if (currentValue === targetValue) return;

    budgetCounter.style.color = (targetValue > currentValue) ? "var(--mint-green)" : "var(--candy-pink)";
    const duration = 400; 
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const easeProgress = progress * (2 - progress); 
        const nextValue = Math.round(currentValue + (targetValue - currentValue) * easeProgress);
        budgetCounter.innerText = "$" + nextValue.toLocaleString('en-US');

        if (progress < 1) { requestAnimationFrame(step); } 
        else {
            budgetCounter.innerText = "$" + targetValue.toLocaleString('en-US');
            budgetCounter.style.color = "var(--candy-pink)";
        }
    }
    requestAnimationFrame(step);
}

// 🔊 NUOVO MOTORE AUDIO AVANZATO (Sintesi Campionamenti)
function playCustomSound(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);

        if (type === 'fluid') {
            // Suono Caffè/Click: Cristallino e rapido
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.connect(gain); osc.start(); osc.stop(ctx.currentTime + 0.08);
        } 
        else if (type === 'engine') {
            // Suono Motori (Supercar/Jet/Yacht): Ruggito discendente rotolante
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(280, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
            
            // Filtro passa-basso per renderlo più "corposo"
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, ctx.currentTime);

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            
            osc.connect(filter); filter.connect(gain);
            osc.start(); osc.stop(ctx.currentTime + 0.25);
        } 
        else if (type === 'space') {
            // Suono Fantascientifico Spaziale: Accordo profondo risonante
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            osc1.type = 'triangle'; osc2.type = 'sine';
            osc1.frequency.setValueAtTime(150, ctx.currentTime);
            osc2.frequency.setValueAtTime(300, ctx.currentTime);
            
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            
            osc1.connect(gain); osc2.connect(gain);
            osc1.start(); osc2.start();
            osc1.stop(ctx.currentTime + 0.6); osc2.stop(ctx.currentTime + 0.6);
        }
        else if (type === 'dopamine') {
            // Arpeggio Euforico per il Bottone Pura Dopamina
            const now = ctx.currentTime;
            const notes = [440, 554.37, 659.25, 880];
            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + (index * 0.06));
                gain.gain.setValueAtTime(0.06, now + (index * 0.06));
                gain.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.06) + 0.15);
                osc.connect(gain); osc.start(now + (index * 0.06)); osc.stop(now + (index * 0.06) + 0.15);
            });
        }
        else if (type === 'casino') {
            // Trillo Arcade da Slot Machine per le scommesse
            const now = ctx.currentTime;
            for(let i=0; i<6; i++) {
                const osc = ctx.createOscillator();
                osc.type = 'square';
                osc.frequency.setValueAtTime(i % 2 === 0 ? 783.99 : 987.77, now + (i * 0.05));
                gain.gain.setValueAtTime(0.03, now + (i * 0.05));
                gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.05) + 0.05);
                osc.connect(gain); osc.start(now + (i * 0.05)); osc.stop(now + (i * 0.05) + 0.05);
            }
        }
        else if (type === 'loss') {
            // Suono fallimento scommessa (basso calante)
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.connect(gain); osc.start(); osc.stop(ctx.currentTime + 0.3);
        }
    } catch(e) { console.log("Audio bloccato dalle policy"); }
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
        saveGameState(); renderInventory();
    });
}

document.getElementById('mega-cake-btn').addEventListener('click', () => {
    if (budget > 0) {
        totalSpent += budget; budget = 0; 
        updateBudgetDisplay(budget, true);
        triggerAchievement('all_in_cake', "Iniezione di Felicità ⚡", "Hai scambiato 100 miliardi per una scarica pura di neurotrasmettitori.");
        updateInventoryHTML("👑 Pura Dopamina");
        setTimeout(() => { triggerDessertCelebration(true); }, 500);
    }
});

// Motore Volatilità di Borsa
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
        
        card.classList.remove('flash-up', 'flash-down');
        void card.offsetWidth; 

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

// Logica di Acquisto
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.parentElement;
        const name = card.getAttribute('data-name');
        const sType = card.getAttribute('data-sound') || 'fluid';
        const finalPrice = Math.round(productsData[name] / comboMultiplier);

        if (budget >= finalPrice) {
            budget -= finalPrice; totalSpent += finalPrice;
            playCustomSound(sType); // Innesca il suono specifico dell'oggetto

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
        } else { alert("❌ Borsa Chiusa: Fondi insufficienti!"); }
    });
});

function updateInventoryHTML(name) {
    if (inventory[name]) { inventory[name].count++; } else { inventory[name] = { count: 1 }; }
    saveGameState(); renderInventory();
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
        budget += refundValue; inventory[name].count--;
        if (inventory[name].count === 0) { delete inventory[name]; }
        
        playCustomSound('fluid');
        updateBudgetDisplay(budget, true);
        saveGameState(); renderInventory();
    }
}

// Slot Machine
document.getElementById('gamble-btn').addEventListener('click', () => {
    const cost = 500000000;
    if (budget >= cost) {
        budget -= cost; updateBudgetDisplay(budget, true);
        playCustomSound('casino'); // Suono rullo slot
        
        setTimeout(() => {
            if (Math.random() > 0.6) {
                triggerAchievement('gambler_win', "Lupo della Finanza", "Hai vinto la scommessa!");
                updateInventoryHTML("👑 NFT Donut Dorato");
                confetti({ particleCount: 100, spread: 80, colors: ['#ffb703', '#70d6ff'] });
            } else {
                playCustomSound('loss'); // Suono fallimento cupo
                alert("📉 Crollo della panna! Investimento azzerato.");
                triggerAchievement('gambler_loss', "Bancarotta", "Niente caramelle per stavolta.");
                saveGameState();
            }
        }, 300);
    } else { alert("Fondi insufficienti!"); }
});
