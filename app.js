// app.js
// User stats
let stats = {
  wordsLearned: 0,
  currentStreak: 0,
  totalReviews: 0,
  correctReviews: 0,
};

// Current card index
let currentCardIndex = 0;

// DOM elements
const flashcard = document.getElementById('flashcard');
const frontWord = document.getElementById('front-word');
const backWord = document.getElementById('back-word');
const btnHard = document.getElementById('btn-hard');
const btnEasy = document.getElementById('btn-easy');
const btnNext = document.getElementById('btn-next');
const progressFill = document.getElementById('progress-fill');
const wordsLearnedElement = document.getElementById('words-learned');
const currentStreakElement = document.getElementById('current-streak');
const accuracyElement = document.getElementById('accuracy');

// Initialize
updateCard();
updateStats();

// Event Listeners
flashcard.addEventListener('click', () => {
  flashcard.classList.toggle('flipped');
});

btnHard.addEventListener('click', () => {
  updateSpacedRepetition(false);
  nextCard();
});

btnEasy.addEventListener('click', () => {
  updateSpacedRepetition(true);
  nextCard();
});

btnNext.addEventListener('click', nextCard);

// Functions
function updateCard() {
  const card = vocabulary[currentCardIndex];
  frontWord.textContent = card.front;
  backWord.textContent = card.back;
  flashcard.classList.remove('flipped');
  updateProgress();
}

function nextCard() {
  currentCardIndex = (currentCardIndex + 1) % vocabulary.length;
  updateCard();
}

function updateSpacedRepetition(wasEasy) {
  const card = vocabulary[currentCardIndex];

  if (wasEasy) {
    card.interval *= card.easeFactor;
    card.easeFactor += 0.1;
    stats.correctReviews++;
    stats.currentStreak++;
    stats.wordsLearned = Math.min(vocabulary.length, stats.wordsLearned + 1);
  } else {
    card.interval = 1;
    card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
    stats.currentStreak = 0;
  }

  stats.totalReviews++;
  card.nextReview = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000);
  updateStats();
}

function updateProgress() {
  const progress = ((currentCardIndex + 1) / vocabulary.length) * 100;
  progressFill.style.width = `${progress}%`;
}

function updateStats() {
  wordsLearnedElement.textContent = stats.wordsLearned;
  currentStreakElement.textContent = stats.currentStreak;
  const accuracy =
    stats.totalReviews === 0
      ? 0
      : Math.round((stats.correctReviews / stats.totalReviews) * 100);
  accuracyElement.textContent = `${accuracy}%`;
}
