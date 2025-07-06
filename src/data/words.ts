export const wordLists = {
  easy: [
    'cat', 'dog', 'sun', 'run', 'fun', 'car', 'eat', 'red', 'big', 'yes',
    'no', 'go', 'up', 'me', 'we', 'he', 'she', 'can', 'see', 'the',
    'and', 'you', 'are', 'not', 'but', 'was', 'his', 'her', 'him'
  ],
  normal: [
    'house', 'water', 'light', 'world', 'music', 'dance', 'smile', 'dream',
    'story', 'peace', 'happy', 'friend', 'family', 'nature', 'flower',
    'mountain', 'ocean', 'forest', 'animal', 'planet', 'future', 'memory',
    'journey', 'freedom', 'courage', 'wisdom', 'beauty', 'energy', 'wonder'
  ],
  hard: [
    'technology', 'development', 'programming', 'algorithm', 'architecture',
    'psychology', 'philosophy', 'communication', 'international', 'organization',
    'responsibility', 'understanding', 'opportunities', 'achievements', 'imagination',
    'extraordinary', 'professional', 'transformation', 'collaboration', 'investigation',
    'determination', 'concentration', 'representation', 'administration', 'configuration'
  ],
  expert: [
    'implementation', 'synchronization', 'authentication', 'optimization',
    'characteristics', 'responsibilities', 'recommendations', 'specifications',
    'infrastructure', 'documentation', 'internationalization', 'troubleshooting',
    'acknowledgment', 'accomplishment', 'comprehensive', 'unprecedented',
    'revolutionary', 'extraordinary', 'sophisticated', 'breakthrough'
  ]
};

export const getRandomWord = (difficulty: keyof typeof wordLists): string => {
  const words = wordLists[difficulty];
  return words[Math.floor(Math.random() * words.length)];
};

export const reverseWord = (word: string): string => {
  return word.split('').reverse().join('');
};