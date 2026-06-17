import { useRef, useState } from 'react';
import { useSongs } from '../hooks/useSongs';
import { SongPlayer } from '../components/music/SongPlayer';

const THEME_EMOJI: Record<string, string> = {
  stars: '⭐',
  transport: '🚌',
  animals: '🐄',
  greetings: '👋',
  colors: '🌈',
  body: '🙌',
  weather: '⛅',
  alphabet: '🔤',
  emotions: '😊',
  numbers: '🔢',
};

export function Songs() {
  const { songs } = useSongs();
  const [activeSongId, setActiveSongId] = useState<number | null>(null);
  const playerRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const activeSongs = songs.filter(s => s.active);

  const handleSelect = (songId: number) => {
    const isClosing = activeSongId === songId;
    setActiveSongId(isClosing ? null : songId);

    if (!isClosing) {
      // Aguarda o player ser renderizado e rola até ele
      setTimeout(() => {
        playerRefs.current[songId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-extrabold text-[#2D3436] mb-6 text-center">🎵 Songs</h2>

      <div className="flex flex-col gap-3">
        {activeSongs.map(song => (
          <div key={song.id}>
            {/* Song card */}
            <button
              onClick={() => handleSelect(song.id)}
              className={`w-full bg-white rounded-2xl shadow p-4 flex items-center gap-4 text-left transition-all active:scale-95 ${
                activeSongId === song.id ? 'ring-2 ring-[#FF6B6B]' : 'hover:shadow-md'
              }`}
            >
              <div className="text-4xl w-12 text-center flex-shrink-0">
                {THEME_EMOJI[song.theme] ?? '🎶'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#2D3436] truncate">{song.title}</p>
                <p className="text-sm text-gray-500 truncate">{song.titlePT}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {song.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="bg-[#F7FFF9] text-[#4ECDC4] text-xs px-2 py-0.5 rounded-full border border-[#4ECDC4]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-full text-xl flex items-center justify-center shadow flex-shrink-0 transition-all ${
                  activeSongId === song.id
                    ? 'bg-[#FFE66D] text-[#2D3436]'
                    : 'bg-[#FF6B6B] text-white'
                }`}
              >
                {activeSongId === song.id ? '✕' : '▶️'}
              </div>
            </button>

            {/* Player inline abaixo do card */}
            {activeSongId === song.id && (
              <div
                ref={el => { playerRefs.current[song.id] = el; }}
                className="mt-2 mb-1"
              >
                <SongPlayer
                  songId={song.id}
                  onClose={() => setActiveSongId(null)}
                />
              </div>
            )}
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
