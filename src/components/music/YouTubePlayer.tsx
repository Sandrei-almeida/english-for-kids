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
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadYouTubeAPI(() => {
      if (!containerRef.current) return;
      const div = document.createElement('div');
      containerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(div, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => {
            setReady(true);
            onReady?.();
            tickRef.current = setInterval(() => {
              const t = playerRef.current?.getCurrentTime?.() ?? 0;
              onTimeUpdate(t);
            }, 300);
          },
        },
      });
    });

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      playerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-2xl overflow-hidden transition-all ${
        hidden ? 'h-0 opacity-0 pointer-events-none' : 'aspect-video'
      } ${!ready ? 'bg-gray-100 animate-pulse' : ''}`}
    />
  );
}
