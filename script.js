let budget = 100000000000; 
let totalSpent = 0;
let comboCount = 0;
let comboMultiplier = 1.0;
let comboTimer;
const inventory = {};
const unlockedAchievements = new Set();

const productsData = { 
    "Caffè Dorato": 50,
    "Supercar Elettrica": 250000, 
    "Jet Privato": 45000000, 
    "Mega Yacht": 350000000,
    "Attico Manhattan": 1200000000,
    "Stazione Spaziale": 15000000000
};

const budgetCounter = document.getElementById('budget-counter');
const comboCounter = document.getElementById('combo-multiplier');
const rankLabel = document.getElementById('user-rank');
const inventoryContainer = document.getElementById('inventory-list');
const buttons = document.querySelectorAll('.buy-btn');

function playCoinSound(isWin = true) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isWin ? 'sine' : 'sawtooth';
        osc.frequency.setValueAtTime(isWin ? 587.33 : 100, ctx.currentTime); 
        if(isWin) osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
    } catch(e) { console.log("Audio bloccato"); }
}

function triggerAchievement(id, title, desc) {
    if (unlockedAchievements.has(id)) return;
    unlockedAchievements.add(id);
    document.getElementById('ach-title').innerText = title;
    document.getElementById('ach-desc').innerText = desc;
    const toast = document.getElementById('achievement-toast');
    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.add('hidden'); }, 4000);
}

// 🍰 IL NUOVO DOLCE: Il Glitch Di Sistema e Reset Temporale
function triggerSystemGlitch() {
    // 1. Suono di errore grave distorto
    playCoinSound(false);
    
    // 2. Crea l'effetto Matrix sullo schermo
    const glitchOverlay = document.createElement('div');
    glitchOverlay.style.position = 'fixed';
    glitchOverlay.style.top = '0';
    glitchOverlay.style.left = '0';
    glitchOverlay.style.width = '100vw';
    glitchOverlay.style.height = '100vh';
    glitchOverlay.style.backgroundColor = '#000';
    glitchOverlay.style.color = '#00ff66';
    glitchOverlay.style.fontFamily = 'monospace';
    glitchOverlay.style.padding = '20px';
    glitchOverlay.style.zIndex = '9999';
    glitchOverlay.style.overflow = 'hidden';
    glitchOverlay.innerHTML = '<h2>⚠️ CRITICAL ERROR: CAPITALISM OVERFLOW ⚠️</h2>';
    document.body.appendChild(glitchOverlay);

    // 3. Genera righe di codice impazzite
    let lines = 0;
    const interval = setInterval(() => {
        const p = document.createElement('p');
        p.innerText = `ERR_BUDGET_UNDERFLOW: Ricalcolo realtà in corso... [${(Math.random() * 100000).toFixed(0)}] SYSTEM_RESET=TRUE`;
        glitchOverlay.appendChild(p);
        window.scrollTo(0, document.body.scrollHeight);
        lines++;
        
        // Fai lampeggiare il counter del budget dietro le quinte
        budgetCounter.innerText = "SYSTEM_FAILURE";
        budgetCounter.style.color = "#ff0055";

        if (lines > 30) {
            clearInterval(interval);
            // 4. Reset totale del gioco dopo 3 secondi di glitch
            setTimeout(() => {
                glitchOverlay.remove();
                budget = 100000000000; // Ridai i 100 miliardi
                totalSpent = 0;
                budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
                budgetCounter.style.color = "var(--neon-green)";
                rankLabel.innerText = "Miliardario Base 🥉";
                rankLabel.className = "rank-bronze";
                inventoryContainer.innerHTML = '<p class="empty-msg">Il mercato si è resettato. Il tuo caveau è stato confiscato.</p>';
                // Svuota inventario logico
                for (let key in inventory) delete inventory[key];
                confetti({ particleCount: 100, spread: 70 });
            }, 1500);
        }
    }, 50);
}

// Volatilità Mercato
setInterval(() => {
    if (budget === "SYSTEM_FAILURE") return;
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.getAttribute('data-name');
        const basePrice = parseInt(card.getAttribute('data-base-price'));
        const changePercent = (Math.random() * 24 - 12) / 100;
        let currentPrice = Math.round(basePrice * (1 + changePercent));
        
        productsData[name] = currentPrice;
        let displayPrice = Math.round(currentPrice / comboMultiplier);

        const trendSpan = card.querySelector('.trend');
        card.querySelector('.price').childNodes[0].nodeValue = "$" + displayPrice.toLocaleString('en-US') + " ";
        if (changePercent >= 0) { trendSpan.innerText = `▲ +${Math.round(changePercent*100)}%`; trendSpan.className = "trend up"; } 
        else { trendSpan.innerText = `▼ ${Math.round(changePercent*100)}%`; trendSpan.className = "trend down"; }
    });
}, 4000);

function checkRankProgression(spent) {
    if (spent >= 60000000000) { rankLabel.innerText = "Imperatore del Mondo 👑"; rankLabel.className = "rank-master"; }
    else if (spent >= 10000000000) { rankLabel.innerText = "Magnate Supremo 💎"; rankLabel.className = "rank-gold"; }
    else if (spent >= 50000000) { rankLabel.innerText = "Plutocrate d'Élite 🥈"; rankLabel.className = "rank-silver"; }
}

// Acquisti
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        if (budget === "SYSTEM_FAILURE") return;
        const card = e.target.parentElement;
        const name = card.getAttribute('data-name');
        const finalPrice = Math.round(productsData[name] / comboMultiplier);

        if (budget >= finalPrice) {
            budget -= finalPrice;
            totalSpent += finalPrice;
            playCoinSound(true);

            // Innesca il Glitch se finisci i soldi veri o compri l'oggetto finale!
            if (budget < 100000000 || name === "Stazione Spaziale") {
                triggerAchievement('matrix_break', "Rottura della Simulazione 🕶️", "Hai rotto l'economia mondiale.");
                triggerSystemGlitch();
                return;
            }

            comboCount++;
            if (comboCount >= 5 && comboMultiplier === 1.0) {
                comboMultiplier = 2.0;
                comboCounter.innerText = "FRENESIA 2.0x 🔥";
                clearTimeout(comboTimer);
                comboTimer = setTimeout(() => { comboCount = 0; comboMultiplier = 1.0; comboCounter.innerText = "1.0x"; }, 3000);
                confetti({ particleCount: 100, spread: 70 });
            }

            budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
            checkRankProgression(totalSpent);
            updateInventoryHTML(name);
            confetti({ particleCount: 20, spread: 30 });
        } else {
            alert("❌ Fondi insufficienti!");
        }
    });
});

function updateInventoryHTML(name) {
    if (inventory[name]) {
        inventory[name].count++;
        document.getElementById(`inv-${name}`).querySelector('.qty').innerText = `x${inventory[name].count}`;
    } else {
        inventory[name] = { count: 1 };
        if(Object.keys(inventory).length === 1) inventoryContainer.innerHTML = ''; 
        const itemHtml = `<div class="inv-item" id="inv-${name}" onclick="sellItem('${name}')">${name} <b class="qty" style="color:var(--neon-gold)">x1</b></div>`;
        inventoryContainer.insertAdjacentHTML('beforeend', itemHtml);
    }
}

window.sellItem = function(name) {
    if (budget === "SYSTEM_FAILURE") return;
    if (inventory[name] && inventory[name].count > 0) {
        budget += productsData[name];
        inventory[name].count--;
        playCoinSound(true);

        if (inventory[name].count === 0) {
            delete inventory[name];
            document.getElementById(`inv-${name}`).remove();
            if (Object.keys(inventory).length === 0) inventoryContainer.innerHTML = '<p class="empty-msg">Nessun bene di lusso nel database.</p>';
        } else {
            document.getElementById(`inv-${name}`).querySelector('.qty').innerText = `x${inventory[name].count}`;
        }
        budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
    }
};

document.getElementById('gamble-btn').addEventListener('click', () => {
    if (budget === "SYSTEM_FAILURE") return;
    const cost = 500000000;
    if (budget >= cost) {
        budget -= cost;
        budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
        
        if (Math.random() > 0.6) {
            playCoinSound(true);
            triggerAchievement('gambler_win', "Lupo del Web", "Hai vinto la scommessa ad alto rischio!");
            updateInventoryHTML("👑 NFT Scimmia di Diamante");
            confetti({ particleCount: 100, spread: 80, colors: ['#ffaa00', '#00f3ff'] });
        } else {
            playCoinSound(false);
            alert("📉 L'investimento è crollato a zero!");
            triggerAchievement('gambler_loss', "Bancarotta Emotiva", "Hai azzerato un capitale nel casinò.");
        }
    } else {
        alert("Fondi insufficienti!");
    }
});

