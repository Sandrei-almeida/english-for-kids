import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  childId: 'local',
  name: 'Minha Criança',
  level: 1,
  vocabulary: { colors: 0, animals: 0, fruits: 0, numbers: 0, house: 0 },
  gamesPlayed: 0,
  songsListened: 0,
  streak: 0,
  lastActive: new Date().toISOString(),
};

const LOCAL_KEY = 'english-kids-progress';

function loadLocal(): ChildProgress {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PROGRESS;
  } catch { return DEFAULT_PROGRESS; }
}

function saveLocal(p: ChildProgress) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(p));
}

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ChildProgress>(loadLocal);
  const [syncing, setSyncing] = useState(false);

  // Carrega do Supabase quando usuário loga
  useEffect(() => {
    if (!user) return;
    setSyncing(true);
    supabase
      .from('progress')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          const p: ChildProgress = {
            childId: user.id,
            name: data.child_name ?? 'Minha Criança',
            level: data.level ?? 1,
            vocabulary: data.vocabulary ?? DEFAULT_PROGRESS.vocabulary,
            gamesPlayed: data.games_played ?? 0,
            songsListened: data.songs_listened ?? 0,
            streak: data.streak ?? 0,
            lastActive: data.last_active ?? new Date().toISOString(),
          };
          setProgress(p);
          saveLocal(p);
        }
        setSyncing(false);
      });
  }, [user]);

  const persist = useCallback(async (p: ChildProgress) => {
    saveLocal(p);
    if (!user) return;
    await supabase.from('progress').upsert({
      user_id: user.id,
      child_name: p.name,
      level: p.level,
      vocabulary: p.vocabulary,
      games_played: p.gamesPlayed,
      songs_listened: p.songsListened,
      streak: p.streak,
      last_active: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }, [user]);

  const updateProgress = (updates: Partial<ChildProgress>) => {
    setProgress(prev => {
      const next = { ...prev, ...updates, lastActive: new Date().toISOString() };
      persist(next);
      return next;
    });
  };

  const incrementSongsListened = () => {
    setProgress(prev => {
      const next = { ...prev, songsListened: prev.songsListened + 1, lastActive: new Date().toISOString() };
      persist(next);
      return next;
    });
  };

  const incrementGamesPlayed = () => {
    setProgress(prev => {
      const next = { ...prev, gamesPlayed: prev.gamesPlayed + 1, lastActive: new Date().toISOString() };
      persist(next);
      return next;
    });
  };

  const updateVocabulary = (category: keyof ChildProgress['vocabulary'], count: number) => {
    setProgress(prev => {
      const next = {
        ...prev,
        vocabulary: { ...prev.vocabulary, [category]: count },
        lastActive: new Date().toISOString(),
      };
      persist(next);
      return next;
    });
  };

  return { progress, syncing, updateProgress, incrementSongsListened, incrementGamesPlayed, updateVocabulary };
}
