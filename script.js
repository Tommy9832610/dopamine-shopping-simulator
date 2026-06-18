let budget = 100000000000; 
let itemsOwnedCount = 0;
const inventory = {};

const budgetCounter = document.getElementById('budget-counter');
const itemsCounter = document.getElementById('items-owned');
const inventoryContainer = document.getElementById('inventory-list');
const buttons = document.querySelectorAll('.buy-btn');

// Frasi FOMO casuali per alterare lo stato emotivo
const fomoPhrases = [
    "🔥 Elon Musk ha appena venduto le sue azioni per comprare un Caffè Dorato.",
    "⚠️ Scorte di 'Isola Privata' in esaurimento nel server asiatico!",
    "💸 Un utente anonimo ha speso $15.000.000.000 negli ultimi 30 secondi.",
    "🚀 Il valore di status del tuo Vault è aumentato del 12%."
];

setInterval(() => {
    const ticker = document.getElementById('fomo-ticker');
    ticker.innerText = fomoPhrases[Math.floor(Math.random() * fomoPhrases.length)];
}, 6000);

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.parentElement;
        const price = parseInt(card.getAttribute('data-price'));
        const name = card.getAttribute('data-name');
        const emoji = card.querySelector('.product-emoji').innerText;

        if (budget >= price) {
            budget -= price;
            itemsOwnedCount++;
            
            // Aggiorna HUD con animazione di impatto
            budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
            itemsCounter.innerText = itemsOwnedCount;
            
            budgetCounter.style.transform = "scale(1.15) rotate(-1deg)";
            setTimeout(() => { budgetCounter.style.transform = "scale(1) rotate(0deg)"; }, 100);

            // Gestione Logica Inventario
            if (inventory[name]) {
                inventory[name].count++;
                document.getElementById(`inv-${name}`).querySelector('.qty').innerText = `x${inventory[name].count}`;
            } else {
                inventory[name] = { count: 1, emoji: emoji };
                // Rimuove messaggio "vuoto" se è il primo oggetto
                if(itemsOwnedCount === 1) inventoryContainer.innerHTML = ''; 
                
                const itemHtml = `<div class="inv-item" id="inv-${name}"><span>${emoji}</span> ${name} <b class="qty" style="color:#00f3ff">x1</b></div>`;
                inventoryContainer.insertAdjacentHTML('beforeend', itemHtml);
            }

            // Splendida doppia esplosione di coriandoli
            confetti({ particleCount: 80, spread: 60, origin: { x: 0.2, y: 0.8 } });
            confetti({ particleCount: 80, spread: 60, origin: { x: 0.8, y: 0.8 } });

        } else {
            alert("❌ Fondi insufficienti nel tuo conto d'alta finanza!");
        }
    });
});
