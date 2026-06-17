import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { useSongs } from '../../hooks/useSongs';
import { useProgress } from '../../hooks/useProgress';

interface Props {
  songId: number;
  onClose?: () => void;
}

function getYoutubeEmbedId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function SongPlayer({ songId, onClose }: Props) {
  const { getSongById } = useSongs();
  const { incrementSongsListened } = useProgress();
  const song = getSongById(songId);

  const howlRef = useRef<Howl | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [counted, setCounted] = useState(false);

  const youtubeId = song?.youtubeUrl ? getYoutubeEmbedId(song.youtubeUrl) : null;
  const hasDirectAudio = !!(song?.audioUrl || song?.audioFile);

  useEffect(() => {
    if (!song || youtubeId || !hasDirectAudio) return;
    const src = song.audioUrl || song.audioFile;

    howlRef.current = new Howl({
      src: [src],
      volume: volume / 100,
      onend: () => {
        setPlaying(false);
        setCurrentTime(0);
        if (!counted) {
          incrementSongsListened();
          setCounted(true);
        }
      },
    });

    return () => {
      howlRef.current?.unload();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  useEffect(() => {
    howlRef.current?.volume(volume / 100);
  }, [volume]);

  const startTicker = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const seek = howlRef.current?.seek() as number | undefined;
      if (typeof seek === 'number') setCurrentTime(Math.floor(seek));
    }, 500);
  };

  const play = () => {
    howlRef.current?.play();
    setPlaying(true);
    startTicker();
  };

  const pause = () => {
    howlRef.current?.pause();
    setPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const stop = () => {
    howlRef.current?.stop();
    setPlaying(false);
    setCurrentTime(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const replay = () => { stop(); setTimeout(play, 100); };

  const seek = (value: number) => {
    howlRef.current?.seek(value);
    setCurrentTime(value);
  };

  const currentLyricIndex = song?.lyrics.findIndex(
    l => currentTime >= l.start && currentTime < l.end
  ) ?? -1;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!song) return <p className="text-center p-4">Música não encontrada.</p>;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">🎵</div>
        <h2 className="text-xl font-bold text-[#2D3436]">{song.title}</h2>
        <p className="text-sm text-gray-500">{song.titlePT}</p>
      </div>

      {/* YouTube embed */}
      {youtubeId ? (
        <div className="mb-4">
          <div className="rounded-2xl overflow-hidden aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
              title={song.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              onLoad={() => { if (!counted) { incrementSongsListened(); setCounted(true); } }}
            />
          </div>

          {/* Lyrics below video */}
          {song.lyrics.length > 0 && (
            <div className="bg-[#F7FFF9] rounded-2xl p-4 mt-3 flex flex-col gap-1">
              {song.lyrics.map((lyric, i) => (
                <p key={i} className="text-center text-sm text-gray-600">{lyric.line}</p>
              ))}
            </div>
          )}
        </div>
      ) : hasDirectAudio ? (
        <>
          {/* Lyrics with highlight */}
          <div className="bg-[#F7FFF9] rounded-2xl p-4 mb-4 min-h-[100px] flex flex-col gap-2">
            {song.lyrics.map((lyric, i) => (
              <p
                key={i}
                className={`text-center text-lg transition-all duration-300 ${
                  i === currentLyricIndex
                    ? 'text-[#FF6B6B] font-bold scale-105'
                    : 'text-gray-400'
                }`}
              >
                {lyric.line}
              </p>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <input
              type="range" min={0} max={song.duration} value={currentTime}
              onChange={e => seek(Number(e.target.value))}
              className="w-full accent-[#FF6B6B]"
              aria-label="Progresso da música"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(song.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mb-4">
            <button onClick={stop} aria-label="Parar"
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all">
              ⏹️
            </button>
            <button onClick={playing ? pause : play} aria-label={playing ? 'Pausar' : 'Tocar'}
              className="w-16 h-16 rounded-full bg-[#FF6B6B] text-white text-3xl flex items-center justify-center hover:bg-[#e05555] active:scale-95 transition-all shadow-lg">
              {playing ? '⏸️' : '▶️'}
            </button>
            <button onClick={replay} aria-label="Repetir"
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all">
              🔄
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <span className="text-xl">🔊</span>
            <input type="range" min={0} max={100} value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full accent-[#4ECDC4]" aria-label="Volume" />
            <span className="text-sm text-gray-500 w-8">{volume}%</span>
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-gray-400">
          <p className="text-4xl mb-2">🎵</p>
          <p className="text-sm">Áudio não disponível para esta música.</p>
        </div>
      )}

      {onClose && (
        <button onClick={onClose}
          className="mt-4 w-full py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
          Fechar
        </button>
      )}
    </div>
  );
}
