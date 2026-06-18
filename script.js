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
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isWin ? 587.33 : 220, ctx.currentTime); 
        if(isWin) osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch(e) { console.log("Audio non sbloccato"); }
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

// 🍰 IL DOLCE VERO: Schermata celebrativa con torta gigante ed emoji
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
        ? "Hai sacrificato TUTTO il tuo immenso patrimonio cliccando sul Tasto Torta! L'economia mondiale è crollata in dolcezza."
        : "Hai consumato fino all'ultimo centesimo dei 100 Miliardi! Ti sei meritato questa mega torta virtuale!";

    cakeOverlay.innerHTML = `
        <div style="font-size: 8rem; animation: bounce 1s infinite alternate;">🎂</div>
        <h1 style="color: #ff69b4; font-size: 2.5rem; text-align:center; font-weight:900; margin-top:20px;">
            IL DOLCE SUPREMO DELLA VITTORIA! 🍰
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
        budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
        rankLabel.innerText = "Miliardario Base 🥉";
        rankLabel.className = "rank-bronze";
    });
}

// 🍰 INTERRUTTORE DEL TASTO-TORTA GIGANTE
document.getElementById('mega-cake-btn').addEventListener('click', () => {
    if (budget > 0) {
        totalSpent += budget;
        budget = 0; 
        budgetCounter.innerText = "$0";
        
        triggerAchievement('all_in_cake', "Il Grande Sacrificio 🎂", "Hai scambiato 100 miliardi per una singola fetta di torta monumentale.");
        updateInventoryHTML("👑 Torta Suprema dell'Apocalisse Finanziaria");
        
        setTimeout(() => { triggerDessertCelebration(true); }, 300);
    }
});

// Volatilità Mercato
setInterval(() => {
    document.querySelectorAll('.product-card:not(.premium-cake-card)').forEach(card => {
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

const fomoPhrases = [
    "🍭 NEWS: Gli investitori stanno correndo ad acquistare l'Attico a Manhattan prima che finisca la glassa!",
    "🧁 AVVISO: Il Rank 'Re della Pasticceria' richiede una spesa folle. Mangia tutto il budget!",
    "🍩 CRIPTO: Un utente ha scambiato un Donut d'Oro per un intero Jet Privato.",
    "✨ FRENESIA: Clicca 5 vezes rapidamente per scatenare l'overdose di sconti!"
];

setInterval(() => {
    document.getElementById('fomo-ticker').innerText = fomoPhrases[Math.floor(Math.random() * fomoPhrases.length)];
}, 5000);

function checkRankProgression(spent) {
    if (spent >= 60000000000) { rankLabel.innerText = "Re della Pasticceria 👑🍰"; rankLabel.className = "rank-master"; }
    else if (spent >= 10000000000) { rankLabel.innerText = "Magnate della Glassa 🍩"; rankLabel.className = "rank-gold"; }
    else if (spent >= 50000000) { rankLabel.innerText = "Pasticciere d'Élite 🧁"; rankLabel.className = "rank-silver"; }
}

// Acquisti Standard
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.parentElement;
        const name = card.getAttribute('data-name');
        const finalPrice = Math.round(productsData[name] / comboMultiplier);

        if (budget >= finalPrice) {
            budget -= finalPrice;
            totalSpent += finalPrice;
            playCoinSound(true);

            if (budget < 100000000) {
                triggerAchievement('sweet_victory', "Pasticceria d'Élite 🍰", "Hai consumato tutto il capitale.");
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

            budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
            checkRankProgression(totalSpent);
            updateInventoryHTML(name);
            confetti({ particleCount: 20, spread: 30 });
        } else {
            alert("❌ Borsa Chiusa: Fondi insufficienti!");
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
        const itemHtml = `<div class="inv-item" id="inv-${name}" onclick="sellItem('${name}')">${name} <b class="qty" style="color:var(--candy-gold)">x1</b></div>`;
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
            if (Object.keys(inventory).length === 0) inventoryContainer.innerHTML = '<p class="empty-msg">Nessun bene di lusso registrato.</p>';
        } else {
            document.getElementById(`inv-${name}`).querySelector('.qty').innerText = `x${inventory[name].count}`;
        }
        budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
    }
};

document.getElementById('gamble-btn').addEventListener('click', () => {
    const cost = 500000000;
    if (budget >= cost) {
        budget -= cost;
        budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
        if (Math.random() > 0.6) {
            playCoinSound(true);
            triggerAchievement('gambler_win', "Lupo della Finanza", "Hai vinto la scommessa!");
            updateInventoryHTML("👑 NFT Donut Dorato");
            confetti({ particleCount: 100, spread: 80, colors: ['#ffb703', '#70d6ff'] });
        } else {
            playCoinSound(false);
            alert("📉 Crollo della panna! Investimento azzerato.");
            triggerAchievement('gambler_loss', "Bancarotta", "Niente caramelle per stavolta.");
        }
    } else {
        alert("Fondi insufficienti!");
    }
});
