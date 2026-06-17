import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Props {
  videoId: string;
  hidden: boolean;
  onTimeUpdate: (time: number) => void;
  onReady?: () => void;
}

let apiLoaded = false;
let apiReady = false;
const readyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(onReady: () => void) {
  if (apiReady) { onReady(); return; }
  readyCallbacks.push(onReady);
  if (apiLoaded) return;
  apiLoaded = true;
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);
  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    readyCallbacks.forEach(cb => cb());
    readyCallbacks.length = 0;
  };
}

export function YouTubePlayer({ videoId, hidden, onTimeUpdate, onReady }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    loadYouTubeAPI(() => {
      if (!wrapperRef.current) return;

      // Create a fresh placeholder div inside the wrapper
      const placeholder = document.createElement('div');
      wrapperRef.current.appendChild(placeholder);

      playerRef.current = new window.YT.Player(placeholder, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            setPlayerReady(true);
            onReady?.();
            tickRef.current = setInterval(() => {
              const t = playerRef.current?.getCurrentTime?.() ?? 0;
              onTimeUpdate(t);
            }, 250);
          },
        },
      });

      // Force iframe to fill container after a tick
      setTimeout(() => {
        const iframe = wrapperRef.current?.querySelector('iframe');
        if (iframe) {
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.position = 'absolute';
          iframe.style.top = '0';
          iframe.style.left = '0';
        }
      }, 800);
    });

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      playerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <div
      className={`transition-all duration-300 ${hidden ? 'hidden' : 'block'}`}
    >
      {/* 16:9 aspect ratio container */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
        <div
          ref={wrapperRef}
          className="absolute inset-0 w-full h-full"
        />
        {!playerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-white text-sm animate-pulse">Carregando vídeo...</div>
          </div>
        )}
      </div>
    </div>
  );
}
