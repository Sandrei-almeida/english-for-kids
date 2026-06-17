import { useState, useEffect } from 'react';

export interface ChildProgress {
  childId: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  vocabulary: {
    colors: number;
    animals: number;
    fruits: number;
    numbers: number;
    house: number;
  };
  gamesPlayed: number;
  songsListened: number;
  streak: number;
  lastActive: string;
}

const DEFAULT_PROGRESS: ChildProgress = {
  childId: 'child-1',
  name: 'Minha Criança',
  level: 1,
  vocabulary: { colors: 0, animals: 0, fruits: 0, numbers: 0, house: 0 },
  gamesPlayed: 0,
  songsListened: 0,
  streak: 0,
  lastActive: new Date().toISOString(),
};

const STORAGE_KEY = 'english-kids-progress';

export function useProgress() {
  const [progress, setProgress] = useState<ChildProgress>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const updateProgress = (updates: Partial<ChildProgress>) => {
    setProgress(prev => ({ ...prev, ...updates, lastActive: new Date().toISOString() }));
  };

  const incrementSongsListened = () => {
    setProgress(prev => ({
      ...prev,
      songsListened: prev.songsListened + 1,
      lastActive: new Date().toISOString(),
    }));
  };

  const incrementGamesPlayed = () => {
    setProgress(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      lastActive: new Date().toISOString(),
    }));
  };

  const updateVocabulary = (category: keyof ChildProgress['vocabulary'], count: number) => {
    setProgress(prev => ({
      ...prev,
      vocabulary: { ...prev.vocabulary, [category]: count },
      lastActive: new Date().toISOString(),
    }));
  };

  return { progress, updateProgress, incrementSongsListened, incrementGamesPlayed, updateVocabulary };
}
