// js/ui-manager.js
class UIManager {
  constructor(deckManager) {
    this.deckManager = deckManager;
    this.currentDeck = null;
    this.currentCards = [];
    this.currentCardIndex = 0;
    this.initializeElements();
    this.bindEvents();
    this.showScreen('main-menu');
    this.updateDecksGrid();
    this.updateStats();
  }

  initializeElements() {
    // Main elements
    this.deckSelect = document.getElementById('deck-select');
    this.decksGrid = document.getElementById('decks-grid');

    // Study screen elements
    this.flashcard = document.getElementById('flashcard');
    this.frontWord = document.getElementById('front-word');
    this.backWord = document.getElementById('back-word');
    this.pronunciation = document.getElementById('pronunciation');
    this.studyProgress = document.getElementById('study-progress');
    this.deckName = document.getElementById('deck-name');
    this.progressFill = document.getElementById('progress-fill');

    // Buttons
    this.easyButton = document.getElementById('btn-easy');
    this.hardButton = document.getElementById('btn-hard');
    this.nextButton = document.getElementById('btn-next');
    this.newDeckButton = document.getElementById('new-deck-btn');
    this.importExportButton = document.getElementById('import-export-btn');
    this.exportButton = document.getElementById('export-btn');
    this.importButton = document.getElementById('import-btn');
    this.addCardButton = document.getElementById('add-card-btn');

    // Forms
    this.newDeckForm = document.getElementById('new-deck-form');
    this.cardsContainer = document.getElementById('cards-container');

    // Stats elements
    this.wordsLearnedElement = document.getElementById('words-learned');
    this.currentStreakElement = document.getElementById('current-streak');
    this.accuracyElement = document.getElementById('accuracy');
    this.dueReviewsElement = document.getElementById('due-reviews');
  }

  bindEvents() {
    // Flashcard interaction
    this.flashcard.addEventListener('click', () => {
      this.flashcard.classList.toggle('flipped');
    });

    // Study controls
    this.easyButton.addEventListener('click', () => {
      this.handleCardReview('easy');
    });

    this.hardButton.addEventListener('click', () => {
      this.handleCardReview('hard');
    });

    this.nextButton.addEventListener('click', () => {
      this.showNextCard();
    });

    // Navigation
    this.newDeckButton.addEventListener('click', () => {
      this.showScreen('new-deck-screen');
    });

    this.importExportButton.addEventListener('click', () => {
      this.showScreen('import-export-screen');
    });

    // Deck management
    this.newDeckForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleNewDeckSubmit();
    });

    this.addCardButton.addEventListener('click', () => {
      this.addCardInputs();
    });

    // Import/Export
    this.exportButton.addEventListener('click', () => {
      this.handleExport();
    });

    this.importButton.addEventListener('click', () => {
      this.handleImport();
    });

    // Deck selection
    this.deckSelect.addEventListener('change', () => {
      const selectedDeckId = this.deckSelect.value;
      if (selectedDeckId) {
        this.startStudySession(selectedDeckId);
      }
    });
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
  }

  updateDecksGrid() {
    const decksGrid = document.getElementById('decks-grid');
    decksGrid.innerHTML = '';

    this.deckManager.decks.forEach((deck) => {
      const dueCards = this.deckManager.getDueCards(deck.id).length;
      const deckElement = this.createDeckElement(deck, dueCards);
      decksGrid.appendChild(deckElement);
    });
  }

  createDeckElement(deck, dueCards) {
    const element = document.createElement('div');
    element.className = 'deck-card';
    element.innerHTML = `
            <h3>${deck.name}</h3>
            <div class="deck-info">
                <p>Language: ${deck.language}</p>
                <p>Cards: ${deck.cards.length}</p>
                <p>Due: ${dueCards}</p>
            </div>
        `;
    element.addEventListener('click', () => this.startStudySession(deck.id));
    return element;
  }

  startStudySession(deckId) {
    this.currentDeck = this.deckManager.getDeck(deckId);
    this.currentCards = utils.shuffleArray(
      this.deckManager.getDueCards(deckId),
    );
    this.currentCardIndex = 0;

    if (this.currentCards.length === 0) {
      alert('No cards due for review!');
      return;
    }

    this.showScreen('study-screen');
    this.updateCard();
  }

  updateCard() {
    if (this.currentCardIndex >= this.currentCards.length) {
      alert('Session complete!');
      this.showScreen('main-menu');
      this.updateDecksGrid();
      this.updateStats();
      return;
    }

    const card = this.currentCards[this.currentCardIndex];
    this.cardFront.textContent = card.front;
    this.cardBack.textContent = card.back;

    // Reset card state
    this.cardBack.classList.add('hidden');
    this.showAnswerButton.classList.remove('hidden');
    this.answerButtons.classList.add('hidden');
  }
  updateStats() {
    const stats = this.deckManager.stats;
    const totalDueCards = this.deckManager.decks.reduce(
      (total, deck) => total + this.deckManager.getDueCards(deck.id).length,
      0,
    );

    // Update stats display
    this.wordsLearnedElement.textContent = stats.totalReviews || 0;
    this.currentStreakElement.textContent = stats.currentStreak || 0;

    // Calculate and display accuracy
    const accuracy = stats.totalReviews
      ? Math.round((stats.correctReviews / stats.totalReviews) * 100)
      : 0;
    this.accuracyElement.textContent = `${accuracy}%`;

    // Update due reviews count
    this.dueReviewsElement.textContent = totalDueCards;
  }

  // Additional UI methods
  handleCardReview(performance) {
    const currentCard = this.currentCards[this.currentCardIndex];
    this.deckManager.updateCard(
      this.currentDeck.id,
      currentCard.id,
      performance,
    );

    // Hide review buttons and show next button
    this.easyButton.style.display = 'none';
    this.hardButton.style.display = 'none';
    this.nextButton.style.display = 'block';

    this.updateStats();
  }

  showNextCard() {
    this.currentCardIndex++;
    if (this.currentCardIndex >= this.currentCards.length) {
      alert('Review session complete!');
      this.showScreen('main-menu');
      this.updateDecksGrid();
    } else {
      this.updateCard();
    }
  }

  handleNewDeckSubmit() {
    const deckNameInput = document.getElementById('deck-name-input');
    const languageSelect = document.getElementById('deck-language');

    const deck = this.deckManager.createDeck(
      deckNameInput.value,
      languageSelect.value,
    );

    // Add all cards from the form
    const cardInputs = document.querySelectorAll('.card-input');
    cardInputs.forEach((cardInput) => {
      const front = cardInput.querySelector('[name="front"]').value;
      const back = cardInput.querySelector('[name="back"]').value;
      const pronunciation = cardInput.querySelector(
        '[name="pronunciation"]',
      ).value;

      this.deckManager.addCard(deck.id, front, back, pronunciation);
    });

    // Reset form and return to main menu
    this.newDeckForm.reset();
    this.cardsContainer.innerHTML = '';
    this.showScreen('main-menu');
    this.updateDecksGrid();
  }

  addCardInputs() {
    const cardInput = document.createElement('div');
    cardInput.className = 'card-input';
    cardInput.innerHTML = `
            <input type="text" name="front" placeholder="Front side" required>
            <input type="text" name="back" placeholder="Back side" required>
            <input type="text" name="pronunciation" placeholder="Pronunciation">
            <button type="button" class="btn-secondary remove-card">×</button>
        `;

    cardInput.querySelector('.remove-card').addEventListener('click', () => {
      cardInput.remove();
    });

    this.cardsContainer.appendChild(cardInput);
  }

  handleExport() {
    const dataStr = this.deckManager.exportDecks();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'linguacards_decks.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  handleImport() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const success = this.deckManager.importDecks(e.target.result);
        if (success) {
          this.updateDecksGrid();
          alert('Decks imported successfully!');
        } else {
          alert('Failed to import decks. Please check the file format.');
        }
        fileInput.value = '';
      };
      reader.readAsText(file);
    }
  }
}
