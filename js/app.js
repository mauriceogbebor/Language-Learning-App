document.addEventListener('DOMContentLoaded', () => {
  const deckManager = new DeckManager();
  const uiManager = new UIManager(deckManager);

  // Add default decks if no decks exist
  if (deckManager.decks.length === 0) {
    initializeDefaultDecks(deckManager);
  }
});

// Default decks data
const defaultDecks = {
  japanese: {
    name: 'Japanese Basics',
    language: 'japanese',
    cards: [
      { front: 'こんにちは', back: 'Hello', pronunciation: 'Konnichiwa' },
      { front: 'ありがとう', back: 'Thank you', pronunciation: 'Arigatou' },
      { front: 'さようなら', back: 'Goodbye', pronunciation: 'Sayounara' },
      { front: 'おはよう', back: 'Good morning', pronunciation: 'Ohayou' },
      { front: '水', back: 'Water', pronunciation: 'Mizu' },
      { front: '猫', back: 'Cat', pronunciation: 'Neko' },
      { front: '犬', back: 'Dog', pronunciation: 'Inu' },
      { front: '一', back: 'One', pronunciation: 'Ichi' },
      { front: '二', back: 'Two', pronunciation: 'Ni' },
      { front: '三', back: 'Three', pronunciation: 'San' },
    ],
  },
  spanish: {
    name: 'Spanish Essentials',
    language: 'spanish',
    cards: [
      { front: 'Hola', back: 'Hello', pronunciation: 'OH-lah' },
      { front: 'Gracias', back: 'Thank you', pronunciation: 'GRAH-see-ahs' },
      { front: 'Por favor', back: 'Please', pronunciation: 'poor fah-VOR' },
      {
        front: 'Buenos días',
        back: 'Good morning',
        pronunciation: 'BWEH-nohs DEE-ahs',
      },
      { front: 'Agua', back: 'Water', pronunciation: 'AH-gwah' },
      { front: 'Gato', back: 'Cat', pronunciation: 'GAH-toh' },
      { front: 'Perro', back: 'Dog', pronunciation: 'PEH-roh' },
      { front: 'Uno', back: 'One', pronunciation: 'OO-noh' },
      { front: 'Dos', back: 'Two', pronunciation: 'dohs' },
      { front: 'Tres', back: 'Three', pronunciation: 'trehs' },
    ],
  },
};

function initializeDefaultDecks(deckManager) {
  Object.values(defaultDecks).forEach((deckData) => {
    const deck = deckManager.createDeck(deckData.name, deckData.language);
    deckData.cards.forEach((card) => {
      deckManager.addCard(deck.id, card.front, card.back, card.pronunciation);
    });
  });
}

// Additional UI Manager methods
UIManager.prototype.updateCard = function () {
  const card = this.currentCards[this.currentCardIndex];
  if (!card) return;

  // Update card content
  document.getElementById('front-word').textContent = card.front;
  document.getElementById('back-word').textContent = card.back;
  document.getElementById('pronunciation').textContent = card.pronunciation;

  // Update progress
  document.getElementById('study-progress').textContent = `Card ${
    this.currentCardIndex + 1
  }/${this.currentCards.length}`;
  document.getElementById('deck-name').textContent = this.currentDeck.name;

  // Update progress bar
  const progress =
    ((this.currentCardIndex + 1) / this.currentCards.length) * 100;
  document.getElementById('progress-fill').style.width = `${progress}%`;

  // Reset card flip
  document.getElementById('flashcard').classList.remove('flipped');
};

UIManager.prototype.updateStats = function () {
  const stats = this.deckManager.stats;
  document.getElementById('words-learned').textContent = stats.totalReviews;
  document.getElementById('current-streak').textContent = stats.currentStreak;

  const accuracy =
    stats.totalReviews === 0
      ? 0
      : Math.round((stats.correctReviews / stats.totalReviews) * 100);
  document.getElementById('accuracy').textContent = `${accuracy}%`;

  // Update due reviews count
  let totalDue = 0;
  this.deckManager.decks.forEach((deck) => {
    totalDue += this.deckManager.getDueCards(deck.id).length;
  });
  document.getElementById('due-reviews').textContent = totalDue;
};

UIManager.prototype.handleCardResponse = function (performance) {
  if (!this.currentDeck || !this.currentCards[this.currentCardIndex]) return;

  const card = this.currentCards[this.currentCardIndex];
  this.deckManager.updateCard(this.currentDeck.id, card.id, performance);

  this.currentCardIndex++;

  if (this.currentCardIndex >= this.currentCards.length) {
    alert('Review session complete!');
    this.showScreen('main-menu');
    this.updateDecksGrid();
    this.updateStats();
  } else {
    this.updateCard();
  }
};

UIManager.prototype.handleNewDeck = function (event) {
  event.preventDefault();

  const name = document.getElementById('deck-name-input').value;
  const language = document.getElementById('deck-language').value;

  const deck = this.deckManager.createDeck(name, language);

  // Get all card inputs
  const cardInputs = document.querySelectorAll('.card-input');
  cardInputs.forEach((input) => {
    const front = input.querySelector('.front-input').value;
    const back = input.querySelector('.back-input').value;
    const pronunciation = input.querySelector('.pronunciation-input').value;

    if (front && back) {
      this.deckManager.addCard(deck.id, front, back, pronunciation);
    }
  });

  this.showScreen('main-menu');
  this.updateDecksGrid();
};

UIManager.prototype.addCardInput = function () {
  const container = document.getElementById('cards-container');
  const cardInput = document.createElement('div');
  cardInput.className = 'card-input';
  cardInput.innerHTML = `
        <input type="text" class="front-input" placeholder="Front side" required>
        <input type="text" class="back-input" placeholder="Back side" required>
        <input type="text" class="pronunciation-input" placeholder="Pronunciation">
        <button type="button" class="btn-secondary remove-card">×</button>
    `;

  cardInput.querySelector('.remove-card').addEventListener('click', () => {
    cardInput.remove();
  });

  container.appendChild(cardInput);
};

UIManager.prototype.handleImportExport = function () {
  const importBtn = document.getElementById('import-btn');
  const exportBtn = document.getElementById('export-btn');
  const fileInput = document.getElementById('import-file');

  exportBtn.addEventListener('click', () => {
    const data = this.deckManager.exportDecks();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linguacards_decks.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) {
      alert('Please select a file to import');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const success = this.deckManager.importDecks(e.target.result);
      if (success) {
        alert('Decks imported successfully!');
        this.updateDecksGrid();
      } else {
        alert('Failed to import decks. Please check the file format.');
      }
    };
    reader.readAsText(file);
  });
};
