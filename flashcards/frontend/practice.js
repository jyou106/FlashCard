const flashcard = document.getElementById("flashcard");
const showBtn = document.getElementById("show-btn");
const knownBtn = document.getElementById("known-btn");
const unknownBtn = document.getElementById("unknown-btn");
const exitBtn = document.getElementById("exit-btn");

let practiceCards = [];
let currentIndex = 0;
let showingAnswer = false;

// Load all cards for practice
async function loadCards() {
    const res = await fetch("/all-cards");
    practiceCards = await res.json();

    if (practiceCards.length === 0) {
        flashcard.textContent = "No flashcards available!";
        showBtn.style.display = "none";
        knownBtn.style.display = "none";
        unknownBtn.style.display = "none";
        return;
    }

    currentIndex = 0;
    showingAnswer = false;
    showCurrentCard();
}

// Show current card (question by default)
function showCurrentCard() {
    const card = practiceCards[currentIndex];
    flashcard.textContent = showingAnswer ? card.answer : card.question;
    showBtn.textContent = showingAnswer ? "Show Question" : "Show Answer";
}

// Toggle between question and answer
showBtn.addEventListener("click", () => {
    showingAnswer = !showingAnswer;
    showCurrentCard();
});

// Mark card as known/unknown
async function markCard(correct) {
    const card = practiceCards[currentIndex];
    await fetch("/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: card.id, correct })
    });

    currentIndex++;
    showingAnswer = false;

    if (currentIndex >= practiceCards.length) {
        alert("Practice complete!");
        window.location.href = "/"; // back to main page
        return;
    }

    showCurrentCard();
}

knownBtn.addEventListener("click", () => markCard(true));
unknownBtn.addEventListener("click", () => markCard(false));

// Exit practice mode
exitBtn.addEventListener("click", () => {
    window.location.href = "/";
});

// Initialize
loadCards();
