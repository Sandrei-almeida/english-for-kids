import { useState, useEffect } from 'react';
import songsData from '../data/songs.json';

export interface Lyric {
  line: string;
  start: number;
  end: number;
}

export interface Song {
  id: number;
  title: string;
  titlePT: string;
  theme: string;
  duration: number;
  audioFile: string;
  audioUrl: string;
  youtubeUrl?: string;
  lyrics: Lyric[];
  difficulty: 'easy' | 'medium' | 'hard';
  active: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  namePT: string;
}

const STORAGE_KEY = 'english-kids-songs';

function loadFromStorage(): Song[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(songs: Song[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>(() => {
    return loadFromStorage() ?? (songsData.songs as Song[]);
  });
  const [categories] = useState<Category[]>(songsData.categories as Category[]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    saveToStorage(songs);
  }, [songs]);

  const addSong = (song: Omit<Song, 'id'>) => {
    const newSong: Song = { ...song, id: Date.now() };
    setSongs(prev => [...prev, newSong]);
  };

  const updateSong = (id: number, updates: Partial<Song>) => {
    setSongs(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSong = (id: number) => {
    setSongs(prev => prev.map(s => (s.id === id ? { ...s, active: false } : s)));
  };

  const toggleSongActive = (id: number) => {
    setSongs(prev => prev.map(s => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const filterByCategory = (categoryId: string): Song[] => {
    return songs.filter(s => s.tags.includes(categoryId) || s.theme === categoryId);
  };

  const getSongById = (id: number): Song | undefined => {
    return songs.find(s => s.id === id);
  };

  const getSongByTitle = (title: string): Song | undefined => {
    return songs.find(s => s.title.toLowerCase() === title.toLowerCase());
  };

  return {
    songs,
    categories,
    loading,
    error,
    addSong,
    updateSong,
    removeSong,
    toggleSongActive,
    filterByCategory,
    getSongById,
    getSongByTitle,
  };
}
