const storage = {
  saveDecks(decks) {
    localStorage.setItem('linguaCards_decks', JSON.stringify(decks));
  },

  getDecks() {
    const decks = localStorage.getItem('linguaCards_decks');
    return decks ? JSON.parse(decks) : [];
  },

  saveStats(stats) {
    localStorage.setItem('linguaCards_stats', JSON.stringify(stats));
  },

  getStats() {
    const stats = localStorage.getItem('linguaCards_stats');
    return stats
      ? JSON.parse(stats)
      : {
          wordsLearned: 0,
          currentStreak: 0,
          totalReviews: 0,
          correctReviews: 0,
          lastReview: null,
        };
  },
};
