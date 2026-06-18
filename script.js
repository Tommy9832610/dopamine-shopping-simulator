let budget = 100000000000; 
let totalSpent = 0;
let comboCount = 0;
let comboMultiplier = 1.0;
let comboTimer;
const inventory = {};
const unlockedAchievements = new Set();

// Database dei prezzi fluttuanti per TUTTI e 6 i prodotti
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

// Sintetizzatore di Suoni Arcade Nativo
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
    } catch(e) { console.log("Audio non sbloccato"); }
}

// Gestore obiettivi sbloccati
function triggerAchievement(id, title, desc) {
    if (unlockedAchievements.has(id)) return;
    unlockedAchievements.add(id);
    document.getElementById('ach-title').innerText = title;
    document.getElementById('ach-desc').innerText = desc;
    const toast = document.getElementById('achievement-toast');
    toast.classList.remove('hidden');
    confetti({ particleCount: 50, spread: 60, colors: ['#ffaa00'] });
    setTimeout(() => { toast.classList.add('hidden'); }, 4000);
}

// Algoritmo di Volatilità (Cambia i prezzi reali ogni 4 secondi)
setInterval(() => {
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.getAttribute('data-name');
        const basePrice = parseInt(card.getAttribute('data-base-price'));
        const changePercent = (Math.random() * 24 - 12) / 100; // Fluttuazione ±12%
        let currentPrice = Math.round(basePrice * (1 + changePercent));
        
        productsData[name] = currentPrice;
        let displayPrice = Math.round(currentPrice / comboMultiplier);

        const trendSpan = card.querySelector('.trend');
        card.querySelector('.price').childNodes[0].nodeValue = "$" + displayPrice.toLocaleString('en-US') + " ";
        if (changePercent >= 0) { trendSpan.innerText = `▲ +${Math.round(changePercent*100)}%`; trendSpan.className = "trend up"; } 
        else { trendSpan.innerText = `▼ ${Math.round(changePercent*100)}%`; trendSpan.className = "trend down"; }
    });
}, 4000);

// Progressione di Rank
function checkRankProgression(spent) {
    if (spent >= 60000000000) { rankLabel.innerText = "Imperatore del Mondo 👑"; rankLabel.className = "rank-master"; }
    else if (spent >= 10000000000) { rankLabel.innerText = "Magnate Supremo 💎"; rankLabel.className = "rank-gold"; }
    else if (spent >= 50000000) { rankLabel.innerText = "Plutocrate d'Élite 🥈"; rankLabel.className = "rank-silver"; }
}

// Logica di Acquisto
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.parentElement;
        const name = card.getAttribute('data-name');
        const finalPrice = Math.round(productsData[name] / comboMultiplier);

        if (budget >= finalPrice) {
            budget -= finalPrice;
            totalSpent += finalPrice;
            playCoinSound(true);

            if(budget < 50000000000) triggerAchievement('half_gone', "Mezzo miliardario", "Hai speso la metà del tuo patrimonio iniziale.");

            comboCount++;
            if (comboCount >= 5 && comboMultiplier === 1.0) {
                comboMultiplier = 2.0;
                comboCounter.innerText = "FRENESIA 2.0x 🔥";
                triggerAchievement('frenzy', "Shopping Compulsivo", "Hai attivato il boost frenesia per prezzi dimezzati!");
            }

            clearTimeout(comboTimer);
            comboTimer = setTimeout(() => { comboCount = 0; comboMultiplier = 1.0; comboCounter.innerText = "1.0x"; }, 3000);

            budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
            checkRankProgression(totalSpent);
            updateInventoryHTML(name);
            confetti({ particleCount: 30, spread: 40 });
        } else {
            alert("❌ Transazione respinta: Fondi insufficienti per l'acquisto diretto!");
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

// Logica di Vendita
window.sellItem = function(name) {
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

// Logica Casinò / Azzardo Criptato
document.getElementById('gamble-btn').addEventListener('click', () => {
    const cost = 500000000;
    if (budget >= cost) {
        budget -= cost;
        budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
        
        if (Math.random() > 0.6) { // 40% di Vittoria
            playCoinSound(true);
            triggerAchievement('gambler_win', "Lupo del Web", "Hai vinto la scommessa ad alto rischio!");
            updateInventoryHTML("👑 NFT Scimmia di Diamante");
            confetti({ particleCount: 100, spread: 80, colors: ['#ffaa00', '#00f3ff'] });
        } else {
            playCoinSound(false);
            alert("📉 Crollo di mercato! Il tuo investimento di 500 milioni è andato a zero!");
            triggerAchievement('gambler_loss', "Bancarotta Emotiva", "Hai azzerato un capitale nel casinò clandestino.");
        }
    } else {
        alert("Fondi insufficienti per tentare la fortuna al casinò.");
    }
}); 
