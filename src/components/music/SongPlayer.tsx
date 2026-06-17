import { useRef, useState, useCallback } from 'react';
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

const OFFSET_KEY = 'english-kids-lyric-offset';
function loadOffsets(): Record<number, number> {
  try { return JSON.parse(localStorage.getItem(OFFSET_KEY) ?? '{}'); } catch { return {}; }
}
function saveOffset(id: number, val: number) {
  const all = loadOffsets();
  all[id] = val;
  localStorage.setItem(OFFSET_KEY, JSON.stringify(all));
}

export function SongPlayer({ songId, onClose }: Props) {
  const { getSongById } = useSongs();
  const { incrementSongsListened } = useProgress();
  const song = getSongById(songId);

  // ── Todos os hooks ANTES de qualquer return condicional ──
  const howlRef = useRef<Howl | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [counted, setCounted] = useState(false);
  const [hideVideo, setHideVideo] = useState(false);
  const [showOffsetCtrl, setShowOffsetCtrl] = useState(false);
  const [offset, setOffsetState] = useState<number>(() => loadOffsets()[songId] ?? 0);

  const updateOffset = useCallback((val: number) => {
    setOffsetState(val);
    saveOffset(songId, val);
  }, [songId]);

  const youtubeId = song?.youtubeUrl ? getYoutubeEmbedId(song.youtubeUrl) : null;
  const hasDirectAudio = !!(song?.audioUrl || song?.audioFile);
  const adjustedTime = currentTime - offset;

  const currentLyricIndex = song?.lyrics.findIndex(
    l => adjustedTime >= l.start && adjustedTime < l.end
  ) ?? -1;


  const formatTime = (s: number) => {
    const m = Math.floor(Math.max(0, s) / 60);
    const sec = Math.floor(Math.max(0, s) % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const initHowl = () => {
    if (!song || youtubeId || !hasDirectAudio) return;
    howlRef.current = new Howl({
      src: [song.audioUrl || song.audioFile],
      volume: volume / 100,
      onend: () => {
        setPlaying(false); setCurrentTime(0);
        if (!counted) { incrementSongsListened(); setCounted(true); }
      },
    });
  };

  const startTicker = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const t = howlRef.current?.seek() as number | undefined;
      if (typeof t === 'number') setCurrentTime(t);
    }, 250);
  };

  const play = () => { if (!howlRef.current) initHowl(); howlRef.current?.play(); setPlaying(true); startTicker(); };
  const pause = () => { howlRef.current?.pause(); setPlaying(false); if (intervalRef.current) clearInterval(intervalRef.current); };
  const stop = () => { howlRef.current?.stop(); setPlaying(false); setCurrentTime(0); if (intervalRef.current) clearInterval(intervalRef.current); };
  const seekTo = (v: number) => { howlRef.current?.seek(v); setCurrentTime(v); };

  if (!song) return <p className="text-center p-4">Música não encontrada.</p>;

  // Altura de cada linha em px — fixo para cálculo do translate
  const LINE_H = 36;
  const VISIBLE_H = 180; // max-h do container

  // Karaokê: desliza a lista para centralizar a linha ativa
  const translateY = currentLyricIndex < 0
    ? 0
    : VISIBLE_H / 2 - LINE_H / 2 - currentLyricIndex * LINE_H;

  const lyricsJSX = song.lyrics.length === 0
    ? (
      <div className="bg-[#F7FFF9] rounded-2xl p-3 mt-3 text-center text-gray-400 text-sm py-4">
        Sem letra disponível
      </div>
    )
    : (
      <div
        className="bg-[#F7FFF9] rounded-2xl mt-3 overflow-hidden relative"
        style={{ height: VISIBLE_H }}
      >
        {/* Gradiente topo */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#F7FFF9] to-transparent z-10 pointer-events-none" />
        {/* Gradiente base */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#F7FFF9] to-transparent z-10 pointer-events-none" />

        {/* Lista que desliza */}
        <div
          style={{
            transform: `translateY(${translateY}px)`,
            transition: 'transform 0.35s ease',
          }}
          className="flex flex-col px-3 pt-1"
        >
          {song.lyrics.map((lyric, i) => (
            <p
              key={i}
              style={{ height: LINE_H, lineHeight: `${LINE_H}px` }}
              className={`text-center text-sm px-2 rounded-lg transition-all duration-200 truncate ${
                i === currentLyricIndex
                  ? 'text-[#FF6B6B] font-bold text-base scale-105'
                  : i < currentLyricIndex
                  ? 'text-gray-300'
                  : 'text-gray-500'
              }`}
            >
              {lyric.line}
            </p>
          ))}
        </div>
      </div>
    );

  const offsetCtrlJSX = showOffsetCtrl && (
    <div className="mt-2 bg-gray-50 rounded-xl p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 font-medium">⏱ Ajuste da letra</span>
        <span className="text-xs font-bold text-[#FF6B6B]">
          {offset > 0 ? `+${offset}s` : offset < 0 ? `${offset}s` : 'sincronizada'}
        </span>
      </div>
      <input type="range" min={-10} max={10} step={0.5} value={offset}
        onChange={e => updateOffset(Number(e.target.value))}
        className="w-full accent-[#FF6B6B]" />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>← Letra atrasada</span>
        <button onClick={() => updateOffset(0)} className="text-[#4ECDC4] font-bold">Zerar</button>
        <span>Letra adiantada →</span>
      </div>
      <p className="text-xs text-gray-400 text-center mt-1">
        Letra antes do som → arraste para a esquerda
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl p-5 max-w-md mx-auto">
      <div className="text-center mb-3">
        <div className="text-4xl mb-1">🎵</div>
        <h2 className="text-lg font-bold text-[#2D3436] leading-tight">{song.title}</h2>
        <p className="text-xs text-gray-400">{song.titlePT}</p>
      </div>

      {youtubeId ? (
        <>
          <div className="flex justify-center gap-2 mb-3 flex-wrap">
            <button onClick={() => setHideVideo(v => !v)}
              className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                hideVideo ? 'bg-[#FFE66D] text-[#2D3436]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {hideVideo ? '🎵 Só áudio' : '📺 Com vídeo'}
            </button>
            <button onClick={() => setShowOffsetCtrl(v => !v)}
              className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                showOffsetCtrl ? 'bg-[#4ECDC4] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              ⚙️ Letra {offset !== 0 ? `(${offset > 0 ? '+' : ''}${offset}s)` : ''}
            </button>
          </div>

          {offsetCtrlJSX}

          <YouTubePlayer
            videoId={youtubeId}
            hidden={hideVideo}
            onTimeUpdate={(t) => {
              setCurrentTime(t);
              if (t > 3 && !counted) { incrementSongsListened(); setCounted(true); }
            }}
          />

          {lyricsJSX}

          {currentTime > 0 && (
            <p className="text-center text-xs text-gray-400 mt-1">⏱ {formatTime(currentTime)}</p>
          )}
        </>
      ) : hasDirectAudio ? (
        <>
          <div className="flex justify-end mb-1">
            <button onClick={() => setShowOffsetCtrl(v => !v)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-full bg-gray-100">
              ⚙️ Ajustar letra
            </button>
          </div>
          {offsetCtrlJSX}
          {lyricsJSX}
          <div className="my-3">
            <input type="range" min={0} max={song.duration} value={currentTime}
              onChange={e => seekTo(Number(e.target.value))}
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
