const utils = {
  formatDate(date) {
    return new Date(date).toLocaleDateString();
  },

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  },
};
