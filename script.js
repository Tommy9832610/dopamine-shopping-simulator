let budget = 100000000000; // 100 Miliardi
const budgetCounter = document.getElementById('budget-counter');
const buttons = document.querySelectorAll('.buy-btn');

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.parentElement;
        const price = parseInt(card.getAttribute('data-price'));

        if (budget >= price) {
            budget -= price;
            // Aggiorna il testo formattato in valuta americana
            budgetCounter.innerText = "$" + budget.toLocaleString('en-US');
            
            // Effetto feedback visivo sul counter
            budgetCounter.style.transform = "scale(1.1)";
            setTimeout(() => { budgetCounter.style.transform = "scale(1)"; }, 100);
        } else {
            alert("Hai finito i miliardi! Sei povero!");
        }
    });
});

