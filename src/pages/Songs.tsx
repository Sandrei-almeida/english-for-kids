import { useState } from 'react';
import { useSongs } from '../hooks/useSongs';
import { SongPlayer } from '../components/music/SongPlayer';

const THEME_EMOJI: Record<string, string> = {
  stars: '⭐',
  transport: '🚌',
  animals: '🐄',
  greetings: '👋',
  colors: '🌈',
};

export function Songs() {
  const { songs } = useSongs();
  const [activeSongId, setActiveSongId] = useState<number | null>(null);

  const activeSongs = songs.filter(s => s.active);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-extrabold text-[#2D3436] mb-6 text-center">🎵 Songs</h2>

      {activeSongId !== null && (
        <div className="mb-6">
          <SongPlayer songId={activeSongId} onClose={() => setActiveSongId(null)} />
        </div>
      )}

      <div className="flex flex-col gap-4">
        {activeSongs.map(song => (
          <div
            key={song.id}
            className="bg-white rounded-2xl shadow p-4 flex items-center gap-4"
          >
            <div className="text-4xl w-12 text-center">
              {THEME_EMOJI[song.theme] ?? '🎶'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#2D3436]">{song.title}</p>
              <p className="text-sm text-gray-500">{song.titlePT}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {song.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-[#F7FFF9] text-[#4ECDC4] text-xs px-2 py-0.5 rounded-full border border-[#4ECDC4]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setActiveSongId(song.id === activeSongId ? null : song.id)}
              aria-label={`Tocar ${song.title}`}
              className={`w-14 h-14 rounded-full text-2xl flex items-center justify-center shadow transition-all active:scale-95 ${
                activeSongId === song.id
                  ? 'bg-[#FFE66D] text-[#2D3436]'
                  : 'bg-[#FF6B6B] text-white hover:bg-[#e05555]'
              }`}
            >
              {activeSongId === song.id ? '⏸️' : '▶️'}
            </button>
          </div>
        ))}

        {activeSongs.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            Nenhuma música ativa. Ative músicas no painel de gerenciamento.
          </p>
        )}
      </div>
    </div>
  );
}
