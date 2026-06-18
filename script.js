let budget = 100000000000; 
let totalSpent = 0;
let itemsOwnedCount = 0;
const inventory = {};

const budgetCounter = document.getElementById('budget-counter');
const itemsCounter = document.getElementById('items-owned');
const rankLabel = document.getElementById('user-rank');
const inventoryContainer = document.getElementById('inventory-list');
const buttons = document.querySelectorAll('.buy-btn');

const fomoPhrases = [
    "🚨 MERCATO: Gli investitori della Silicon Valley stanno esaurendo le scorte di Jet Privati.",
    "📈 AVVISO: Il Rank 'Imperatore del Mondo' richiede una spesa totale superiore a 50 Miliardi.",
    "💎 CRIPTO: Un acquirente anonimo ha appena scambiato arte digitale per un intero Grattacielo.",
    "🔥 OBSOLESCENZA: Le Hypercar stanno subendo un picco di richieste."
];

setInterval(() => {
    const ticker = document.getElementById('fomo-ticker');
    ticker.innerText = fomoPhrases[Math.floor(Math.random() * fomoPhrases.length)];
}, 5000);

// Sistema articolato di progressione Rank
function checkRankProgression(spent) {
    if (spent >= 50000000000) {
        rankLabel.innerText = "Imperatore del Mondo 👑";
        rankLabel.className = "rank-master";
    } else if (spent >= 5000000000) {
        rankLabel.innerText = "Magnate Supremo 💎";
        rankLabel.className = "rank-gold";
    } else if (spent >= 50000000) {
        rankLabel.innerText = "Plutocrate d'Élite 🥈";
        rankLabel.className = "rank-silver";
    }
}

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.parentElement;
        const price = parseInt(card.getAttribute('data-price'));
        const name = card.getAttribute('data-name');

        if (budget >= price) {
            budget -= price;
            totalSpent += price;
            itemsOwnedCount++;
            
            // Aggiorna HUD e innesca animazione pulsante
            budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
            itemsCounter.innerText = itemsOwnedCount;
            
            checkRankProgression(totalSpent);

            budgetCounter.style.transform = "scale(1.1)";
            setTimeout(() => { budgetCounter.style.transform = "scale(1)"; }, 100);

            // Logica Inventario di Lusso
            if (inventory[name]) {
                inventory[name].count++;
                document.getElementById(`inv-${name}`).querySelector('.qty').innerText = `x${inventory[name].count}`;
            } else {
                inventory[name] = { count: 1 };
                if(itemsOwnedCount === 1) inventoryContainer.innerHTML = ''; 
                
                const itemHtml = `<div class="inv-item" id="inv-${name}">${name} <b class="qty" style="color:var(--neon-gold)">x1</b></div>`;
                inventoryContainer.insertAdjacentHTML('beforeend', itemHtml);
            }

            // Esplosione Coriandoli Premium Multi-direzionale
            confetti({ particleCount: 100, spread: 70, origin: { x: 0.1, y: 0.8 } });
            confetti({ particleCount: 100, spread: 70, origin: { x: 0.9, y: 0.8 } });

        } else {
            alert("❌ Transazione respinta. La tua banca ha bloccato i fondi insufficienti!");
        }
    });
});
