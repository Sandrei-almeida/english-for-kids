import { useState, useEffect } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { vocabulary } from '../../utils/vocabulary';
import type { VocabItem } from '../../utils/vocabulary';

type Result = 'idle' | 'listening' | 'correct' | 'close' | 'wrong';

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z]/g, '').trim();
}

function checkAnswer(spoken: string, expected: string): Result {
  const s = normalize(spoken);
  const e = normalize(expected);
  if (s === e) return 'correct';
  if (s.includes(e) || e.includes(s)) return 'close';
  // Check if first 3 chars match (beginner tolerance)
  if (s.length >= 3 && e.length >= 3 && s.slice(0, 3) === e.slice(0, 3)) return 'close';
  return 'wrong';
}

const RESULT_CONFIG: Record<Result, { emoji: string; msg: string; color: string }> = {
  idle:      { emoji: '🎤', msg: 'Pressione e fale!',    color: 'bg-gray-50' },
  listening: { emoji: '👂', msg: 'Ouvindo...',            color: 'bg-yellow-50' },
  correct:   { emoji: '⭐', msg: 'Perfect! Great job!',   color: 'bg-green-50' },
  close:     { emoji: '👍', msg: 'Almost! Try again!',    color: 'bg-blue-50' },
  wrong:     { emoji: '🔄', msg: 'Try again!',            color: 'bg-red-50' },
};

interface Props {
  onBack: () => void;
}

export function SpeakAndLearn({ onBack }: Props) {
  const { listening, transcript, supported, startListening, stopListening, speak, reset } = useSpeech();

  const [levelIndex, setLevelIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [result, setResult] = useState<Result>('idle');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [showWord, setShowWord] = useState(false);

  const ROUNDS = 6;
  const level = vocabulary[levelIndex];
  const item: VocabItem = level.items[itemIndex % level.items.length];

  // Auto-check when transcript arrives
  useEffect(() => {
    if (!transcript) return;
    const res = checkAnswer(transcript, item.word);
    setResult(res);
    if (res === 'correct') setScore(s => s + 1);
  }, [transcript]);

  const handleListen = () => {
    if (listening) { stopListening(); return; }
    reset();
    setResult('listening');
    startListening();
  };

  const handleSpeak = () => {
    speak(item.word);
  };

  const handleNext = () => {
    const next = round + 1;
    if (next >= ROUNDS) {
      // show final score — reset
      setRound(0);
      setScore(0);
      setItemIndex(0);
      setResult('idle');
      setShowWord(false);
      return;
    }
    setRound(next);
    setItemIndex(i => i + 1);
    setResult('idle');
    setShowWord(false);
    reset();
  };

  if (!supported) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 px-4 text-center">
        <div className="text-5xl">😔</div>
        <p className="text-[#2D3436] font-bold">Reconhecimento de voz não disponível</p>
        <p className="text-gray-500 text-sm">Use o Google Chrome para esta funcionalidade.</p>
        <button onClick={onBack} className="mt-4 px-6 py-3 rounded-full bg-[#FF6B6B] text-white font-bold">
          Voltar
        </button>
      </div>
    );
  }

  const isDone = result === 'correct' || result === 'close';
  const cfg = RESULT_CONFIG[result];

  return (
    <div className="max-w-sm mx-auto px-4 py-6 flex flex-col items-center gap-4">
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-2xl">←</button>
        <span className="text-sm text-gray-500 font-medium">
          {round + 1}/{ROUNDS} · ⭐ {score}
        </span>
        <div className="w-8" />
      </div>

      {/* Level selector */}
      <div className="flex gap-2 flex-wrap justify-center">
        {vocabulary.map((lv, i) => (
          <button
            key={lv.id}
            onClick={() => { setLevelIndex(i); setItemIndex(0); setResult('idle'); setShowWord(false); reset(); }}
            className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
              i === levelIndex ? 'text-white shadow' : 'bg-gray-100 text-gray-500'
            }`}
            style={i === levelIndex ? { backgroundColor: lv.color } : {}}
          >
            {lv.namePT}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className={`w-full rounded-3xl p-6 flex flex-col items-center gap-3 transition-all ${cfg.color}`}>
        <div className="text-8xl">{item.emoji}</div>

        {showWord ? (
          <p className="text-3xl font-extrabold text-[#2D3436]">{item.word}</p>
        ) : (
          <p className="text-gray-400 text-sm">Fale o nome em inglês!</p>
        )}

        <p className="text-lg">{cfg.emoji} <span className="font-medium">{cfg.msg}</span></p>

        {transcript && (
          <p className="text-sm text-gray-500">
            Você disse: <span className="font-bold text-[#2D3436]">"{transcript}"</span>
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 w-full justify-center">
        {/* Ouvir pronúncia */}
        <button
          onClick={handleSpeak}
          aria-label="Ouvir pronúncia"
          className="w-16 h-16 rounded-full bg-[#4ECDC4] text-white text-2xl flex items-center justify-center shadow hover:bg-[#3ab5ad] active:scale-95 transition-all"
        >
          🔊
        </button>

        {/* Microfone */}
        <button
          onClick={handleListen}
          aria-label={listening ? 'Parar gravação' : 'Falar'}
          className={`w-20 h-20 rounded-full text-3xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${
            listening
              ? 'bg-red-400 text-white animate-pulse'
              : 'bg-[#FF6B6B] text-white hover:bg-[#e05555]'
          }`}
        >
          🎤
        </button>

        {/* Ver palavra */}
        <button
          onClick={() => setShowWord(v => !v)}
          aria-label="Ver palavra"
          className="w-16 h-16 rounded-full bg-[#FFE66D] text-[#2D3436] text-2xl flex items-center justify-center shadow hover:bg-yellow-300 active:scale-95 transition-all"
        >
          👁️
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        🔊 Ouça · 🎤 Fale · 👁️ Ver palavra
      </p>

      {/* Next button */}
      {isDone && (
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-[#FF6B6B] text-white text-xl font-extrabold shadow-lg active:scale-95 transition-all"
        >
          {round + 1 >= ROUNDS ? `🏆 Fim! Pontos: ${score}/${ROUNDS}` : 'Próxima →'}
        </button>
      )}

      {result === 'wrong' && (
        <button
          onClick={() => { setResult('idle'); reset(); }}
          className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold active:scale-95 transition-all"
        >
          Tentar de novo
        </button>
      )}
    </div>
  );
}
