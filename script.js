let budget = 100000000000; 
let totalSpent = 0;
let comboCount = 0;
let comboMultiplier = 1.0;
let comboTimer;
const inventory = {};
const unlockedAchievements = new Set();

const productsData = { "Supercar Elettrica": 250000, "Jet Privato": 45000000, "Mega Yacht": 350000000 };

const budgetCounter = document.getElementById('budget-counter');
const comboCounter = document.getElementById('combo-multiplier');
const rankLabel = document.getElementById('user-rank');
const inventoryContainer = document.getElementById('inventory-list');
const buttons = document.querySelectorAll('.buy-btn');

// CHICCA 2: Sintetizzatore Audio nativo (Effetto Suono Soldi "Cha-Ching")
function playCoinSound(isWin = true) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    // Se vinci fa un bip ascendente (festa), se perdi un suono cupo discendente
    osc.frequency.setValueAtTime(isWin ? 587.33 : 220, ctx.currentTime); 
    if(isWin) osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
}

// Gestore obiettivi sbloccati pop-up
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

// Cambia i prezzi (Mercato Volatile)
setInterval(() => {
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.getAttribute('data-name');
        const basePrice = parseInt(card.getAttribute('data-base-price'));
        const changePercent = (Math.random() * 20 - 10) / 100;
        let currentPrice = Math.round(basePrice * (1 + changePercent));
        let displayPrice = Math.round(currentPrice / comboMultiplier);
        productsData[name] = currentPrice;

        const trendSpan = card.querySelector('.trend');
        card.querySelector('.price').childNodes[0].nodeValue = "$" + displayPrice.toLocaleString('en-US') + " ";
        if (changePercent >= 0) { trendSpan.innerText = `▲ +${Math.round(changePercent*100)}%`; trendSpan.className = "trend up"; } 
        else { trendSpan.innerText = `▼ ${Math.round(changePercent*100)}%`; trendSpan.className = "trend down"; }
    });
}, 4000);

// Logica Acquisto standard
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.parentElement;
        const name = card.getAttribute('data-name');
        const finalPrice = Math.round(productsData[name] / comboMultiplier);

        if (budget >= finalPrice) {
            budget -= finalPrice;
            totalSpent += finalPrice;
            playCoinSound(true);

            // Controllo obiettivi
            if(budget < 1000000000) triggerAchievement('billion', "Spendaccione compulsivo", "Hai un conto inferiore al miliardo. Continua così!");

            comboCount++;
            if (comboCount >= 5 && comboMultiplier === 1.0) {
                comboMultiplier = 2.0;
                comboCounter.innerText = "FRENESIA 2.0x 🔥";
                triggerAchievement('frenzy', "Modalità Casinò", "Hai attivato la frenesia dello shopping compulsivo!");
            }

            clearTimeout(comboTimer);
            comboTimer = setTimeout(() => { comboCount = 0; comboMultiplier = 1.0; comboCounter.innerText = "1.0x"; }, 3000);

            budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
            updateInventoryHTML(name);
            confetti({ particleCount: 30, spread: 40 });
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

// CHICCA 3: Logica Azvardo / Investimento Anonimo
document.getElementById('gamble-btn').addEventListener('click', () => {
    const cost = 500000000; // 500 Milioni
    if (budget >= cost) {
        budget -= cost;
        budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
        
        const chance = Math.random();
        if (chance > 0.6) { // 40% di possibilità di vincere un NFT Unico
            playCoinSound(true);
            triggerAchievement('gambler_win', "Lupo della Criptovaluta", "Hai rischiato grosso e hai vinto il jackpot!");
            updateInventoryHTML("👑 NFT Scimmia di Diamante");
            confetti({ particleCount: 150, spread: 100, colors: ['#ffaa00', '#00f3ff'] });
        } else { // 60% di possibilità di perdere tutto l'investimento
            playCoinSound(false);
            alert("📉 L'investimento è crollato a zero! Hai perso 500.000.000$!");
            triggerAchievement('gambler_loss', "Bancarotta Emotiva", "Hai bruciato mezzo miliardo nel nulla.");
        }
    } else {
        alert("Non hai abbastanza liquidità per rischiare questo investimento d'azzardo.");
    }
});
