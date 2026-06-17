import { useRef, useState } from 'react';
import { Howl } from 'howler';
import { useSongs } from '../../hooks/useSongs';
import { useProgress } from '../../hooks/useProgress';
import { YouTubePlayer } from './YouTubePlayer';

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
  const [hideVideo, setHideVideo] = useState(false);

  const youtubeId = song?.youtubeUrl ? getYoutubeEmbedId(song.youtubeUrl) : null;
  const hasDirectAudio = !!(song?.audioUrl || song?.audioFile);

  // Direct audio setup (Howler)
  const initHowl = () => {
    if (!song || youtubeId || !hasDirectAudio) return;
    const src = song.audioUrl || song.audioFile;
    howlRef.current = new Howl({
      src: [src],
      volume: volume / 100,
      onend: () => {
        setPlaying(false);
        setCurrentTime(0);
        if (!counted) { incrementSongsListened(); setCounted(true); }
      },
    });
  };

  const startTicker = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const seek = howlRef.current?.seek() as number | undefined;
      if (typeof seek === 'number') setCurrentTime(Math.floor(seek));
    }, 300);
  };

  const play = () => {
    if (!howlRef.current) initHowl();
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

  const seek = (value: number) => {
    howlRef.current?.seek(value);
    setCurrentTime(value);
  };

  // Lyrics sync
  const currentLyricIndex = song?.lyrics.findIndex(
    l => currentTime >= l.start && currentTime < l.end
  ) ?? -1;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!song) return <p className="text-center p-4">Música não encontrada.</p>;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-5 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="text-4xl mb-1">🎵</div>
        <h2 className="text-lg font-bold text-[#2D3436] leading-tight">{song.title}</h2>
        <p className="text-xs text-gray-400">{song.titlePT}</p>
      </div>

      {/* YouTube mode */}
      {youtubeId ? (
        <>
          {/* Toggle video/audio */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setHideVideo(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                hideVideo
                  ? 'bg-[#FFE66D] text-[#2D3436]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {hideVideo ? '🎵 Só áudio' : '📺 Com vídeo'}
              <span className="text-xs font-normal opacity-60">
                {hideVideo ? '(clique para ver vídeo)' : '(clique para esconder)'}
              </span>
            </button>
          </div>

          {/* YouTube Player — esconde visualmente mas mantém áudio */}
          <div className="mb-3">
            <YouTubePlayer
              videoId={youtubeId}
              hidden={hideVideo}
              onTimeUpdate={(t) => {
                setCurrentTime(t);
                if (t > 3 && !counted) {
                  incrementSongsListened();
                  setCounted(true);
                }
              }}
            />
          </div>

          {/* Letras sincronizadas */}
          {song.lyrics.length > 0 && (
            <div className="bg-[#F7FFF9] rounded-2xl p-3 max-h-52 overflow-y-auto flex flex-col gap-1">
              {song.lyrics.map((lyric, i) => (
                <p
                  key={i}
                  className={`text-center text-base transition-all duration-200 px-2 py-0.5 rounded-lg ${
                    i === currentLyricIndex
                      ? 'bg-[#FF6B6B] text-white font-bold scale-105 shadow-sm'
                      : i < currentLyricIndex
                      ? 'text-gray-300 text-sm'
                      : 'text-gray-500'
                  }`}
                >
                  {lyric.line}
                </p>
              ))}
            </div>
          )}

          {currentTime > 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              ⏱ {formatTime(currentTime)}
            </p>
          )}
        </>
      ) : hasDirectAudio ? (
        <>
          {/* Lyrics with highlight for direct audio */}
          <div className="bg-[#F7FFF9] rounded-2xl p-3 mb-3 min-h-[80px] max-h-48 overflow-y-auto flex flex-col gap-1">
            {song.lyrics.map((lyric, i) => (
              <p
                key={i}
                className={`text-center text-base transition-all duration-200 px-2 py-0.5 rounded-lg ${
                  i === currentLyricIndex
                    ? 'bg-[#FF6B6B] text-white font-bold scale-105'
                    : i < currentLyricIndex
                    ? 'text-gray-300 text-sm'
                    : 'text-gray-500'
                }`}
              >
                {lyric.line}
              </p>
            ))}
          </div>

          <div className="mb-3">
            <input type="range" min={0} max={song.duration} value={currentTime}
              onChange={e => seek(Number(e.target.value))}
              className="w-full accent-[#FF6B6B]" aria-label="Progresso" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(song.duration)}</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-3">
            <button onClick={stop} aria-label="Parar"
              className="w-12 h-12 rounded-full bg-gray-100 text-xl flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all">⏹️</button>
            <button onClick={playing ? pause : play} aria-label={playing ? 'Pausar' : 'Tocar'}
              className="w-14 h-14 rounded-full bg-[#FF6B6B] text-white text-2xl flex items-center justify-center hover:bg-[#e05555] active:scale-95 transition-all shadow-lg">
              {playing ? '⏸️' : '▶️'}
            </button>
            <button onClick={() => { stop(); setTimeout(play, 100); }} aria-label="Repetir"
              className="w-12 h-12 rounded-full bg-gray-100 text-xl flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all">🔄</button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-lg">🔊</span>
            <input type="range" min={0} max={100} value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full accent-[#4ECDC4]" aria-label="Volume" />
            <span className="text-xs text-gray-500 w-8">{volume}%</span>
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-gray-400">
          <p className="text-4xl mb-2">🎵</p>
          <p className="text-sm">Áudio não disponível.</p>
        </div>
      )}

      {onClose && (
        <button onClick={onClose}
          className="mt-4 w-full py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-sm">
          Fechar
        </button>
      )}
    </div>
  );
}
