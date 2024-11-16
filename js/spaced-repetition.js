class SpacedRepetition {
  constructor() {
    this.defaultEaseFactor = 2.5;
    this.defaultInterval = 1;
  }

  calculateNextReview(card, performance) {
    const now = new Date();

    if (performance === 'easy') {
      card.interval *= card.easeFactor;
      card.easeFactor += 0.1;
    } else {
      card.interval = this.defaultInterval;
      card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
    }

    card.nextReview = new Date(
      now.getTime() + card.interval * 24 * 60 * 60 * 1000,
    );
    return card;
  }

  isDue(card) {
    return new Date(card.nextReview) <= new Date();
  }

  initializeCard(card) {
    return {
      ...card,
      interval: this.defaultInterval,
      easeFactor: this.defaultEaseFactor,
      nextReview: new Date(),
    };
  }
}
