const form = document.getElementById("add-card-form");
const container = document.getElementById("cards-container");

// Load cards
async function loadCards() {
    container.innerHTML = "";
    const res = await fetch("/all-cards");
    const cards = await res.json();

    cards.forEach(c => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card-item";
        cardDiv.innerHTML = `
            <p><strong>Q:</strong> ${c.question}</p>
            <p><strong>A:</strong> ${c.answer}</p>
            <div class="card-buttons">
                <button onclick="editCard(${c.id})">Edit</button>
                <button onclick="deleteCard(${c.id})">Delete</button>
            </div>
        `;
        container.appendChild(cardDiv);
    });
}

// Add card
form.addEventListener("submit", async e => {
    e.preventDefault();
    const question = document.getElementById("question").value;
    const answer = document.getElementById("answer").value;

    await fetch("/add-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer })
    });

    form.reset();
    loadCards();
});

// Delete card
async function deleteCard(id) {
    await fetch(`/delete-card/${id}`, { method: "DELETE" });
    loadCards();
}

// Edit card
async function editCard(id) {
    const question = prompt("New question:");
    const answer = prompt("New answer:");
    if (!question || !answer) return;

    await fetch(`/edit-card/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer })
    });
    loadCards();
}

// Initial load
loadCards();
