class DeckManager {
  constructor() {
    this.decks = storage.getDecks();
    this.stats = storage.getStats();
    this.spacedRepetition = new SpacedRepetition();
  }

  createDeck(name, language) {
    const deck = {
      id: utils.generateId(),
      name,
      language,
      cards: [],
      created: new Date(),
      lastReview: null,
    };
    this.decks.push(deck);
    this.save();
    return deck;
  }

  addCard(deckId, front, back, pronunciation) {
    const deck = this.getDeck(deckId);
    if (!deck) return null;

    const card = this.spacedRepetition.initializeCard({
      id: utils.generateId(),
      front,
      back,
      pronunciation,
    });

    deck.cards.push(card);
    this.save();
    return card;
  }

  getDueCards(deckId) {
    const deck = this.getDeck(deckId);
    if (!deck) return [];
    return deck.cards.filter((card) => this.spacedRepetition.isDue(card));
  }

  updateCard(deckId, cardId, performance) {
    const deck = this.getDeck(deckId);
    if (!deck) return null;

    const card = deck.cards.find((c) => c.id === cardId);
    if (!card) return null;

    this.spacedRepetition.calculateNextReview(card, performance);
    this.updateStats(performance === 'easy');
    this.save();
    return card;
  }

  updateStats(wasCorrect) {
    if (wasCorrect) {
      this.stats.correctReviews++;
      this.stats.currentStreak++;
    } else {
      this.stats.currentStreak = 0;
    }
    this.stats.totalReviews++;
    this.stats.lastReview = new Date();
    storage.saveStats(this.stats);
  }

  getDeck(deckId) {
    return this.decks.find((d) => d.id === deckId);
  }

  save() {
    storage.saveDecks(this.decks);
  }

  exportDecks() {
    return JSON.stringify(this.decks, null, 2);
  }

  importDecks(jsonString) {
    try {
      const importedDecks = JSON.parse(jsonString);
      this.decks = [...this.decks, ...importedDecks];
      this.save();
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}
