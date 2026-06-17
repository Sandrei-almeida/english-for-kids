import { useState } from 'react';
import { vocabulary } from '../utils/vocabulary';
import { useProgress } from '../hooks/useProgress';
import { SpeakAndLearn } from '../components/games/SpeakAndLearn';

type GameMode = 'menu' | 'flashcard' | 'speak' | 'speak-active';
type FlashState = 'menu' | 'playing' | 'correct' | 'wrong';

export function Games() {
  const { incrementGamesPlayed } = useProgress();
  const [mode, setMode] = useState<GameMode>('menu');

  // Flashcard game state
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [flashState, setFlashState] = useState<FlashState>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const ROUNDS = 5;
  const level = vocabulary.find(l => l.id === selectedLevel);

  const startFlashcard = (levelId: number) => {
    setSelectedLevel(levelId);
    setScore(0);
    setRound(0);
    generateQuestion(levelId, 0);
    setFlashState('playing');
    incrementGamesPlayed();
  };

  const generateQuestion = (levelId: number, idx: number) => {
    const lv = vocabulary.find(l => l.id === levelId)!;
    const correctItem = lv.items[idx % lv.items.length];
    const others = lv.items
      .filter(i => i.word !== correctItem.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const opts = [...others.map(i => i.wordPT), correctItem.wordPT].sort(() => Math.random() - 0.5);
    setCurrentIndex(idx % lv.items.length);
    setOptions(opts);
  };

  const handleAnswer = (answer: string) => {
    if (!level) return;
    const correct = level.items[currentIndex].wordPT;
    if (answer === correct) {
      setScore(s => s + 1);
      setFlashState('correct');
    } else {
      setFlashState('wrong');
    }
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= ROUNDS) {
        setFlashState('menu');
        setSelectedLevel(null);
        setMode('menu');
      } else {
        setRound(nextRound);
        generateQuestion(selectedLevel!, currentIndex + 1);
        setFlashState('playing');
      }
    }, 1200);
  };

  // Speak & Learn mode
  if (mode === 'speak' || mode === 'speak-active') {
    return <SpeakAndLearn onBack={() => setMode('menu')} />;
  }

  // Flashcard playing
  if (mode === 'flashcard' && flashState !== 'menu' && level) {
    const item = level.items[currentIndex];
    return (
      <div className="max-w-sm mx-auto px-4 py-8 flex flex-col items-center gap-6">
        <div className="w-full flex justify-between text-sm text-gray-500">
          <button onClick={() => { setMode('menu'); setFlashState('menu'); }} className="text-gray-400 hover:text-gray-600">← Voltar</button>
          <span>{level.namePT} · Rodada {round + 1}/{ROUNDS} · ⭐ {score}</span>
        </div>

        <div className={`w-40 h-40 rounded-3xl flex items-center justify-center text-7xl shadow-lg transition-all ${
          flashState === 'correct' ? 'bg-green-100 scale-110' :
          flashState === 'wrong' ? 'bg-red-100 scale-95' : 'bg-[#FFE66D]'
        }`}>
          {item.emoji}
        </div>

        <p className="text-3xl font-extrabold text-[#2D3436]">{item.word}</p>

        {flashState === 'correct' && <p className="text-green-500 text-2xl font-bold">✅ Correct!</p>}
        {flashState === 'wrong' && <p className="text-red-400 text-2xl font-bold">❌ Try again!</p>}

        <p className="text-gray-500">O que é isso em português?</p>

        <div className="grid grid-cols-1 gap-3 w-full">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => flashState === 'playing' && handleAnswer(opt)}
              disabled={flashState !== 'playing'}
              className="py-4 rounded-2xl bg-white shadow text-xl font-bold text-[#2D3436] hover:bg-[#4ECDC4] hover:text-white active:scale-95 transition-all disabled:opacity-60"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Main menu
  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <h2 className="text-2xl font-extrabold text-[#2D3436] mb-2 text-center">🎮 Games</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Escolha como quer aprender!</p>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setMode('flashcard')}
          className={`rounded-2xl p-4 flex flex-col items-center gap-2 shadow transition-all active:scale-95 ${
            mode === 'flashcard' ? 'bg-[#FF6B6B] text-white' : 'bg-white text-[#2D3436]'
          }`}
        >
          <span className="text-3xl">🃏</span>
          <span className="font-bold text-sm">Flashcard</span>
          <span className="text-xs opacity-70">Adivinhe a palavra</span>
        </button>

        <button
          onClick={() => setMode('speak')}
          className="rounded-2xl p-4 flex flex-col items-center gap-2 shadow transition-all active:scale-95 bg-white text-[#2D3436]"
        >
          <span className="text-3xl">🎤</span>
          <span className="font-bold text-sm">Speak & Learn</span>
          <span className="text-xs opacity-70">Pratique pronúncia</span>
        </button>
      </div>

      {/* Flashcard level selector */}
      {mode === 'flashcard' && (
        <>
          <p className="text-center text-gray-500 mb-3 text-sm">Escolha um tema:</p>
          <div className="flex flex-col gap-4">
            {vocabulary.map(lv => (
              <button
                key={lv.id}
                onClick={() => startFlashcard(lv.id)}
                className="rounded-2xl p-5 flex items-center gap-4 shadow-lg active:scale-95 transition-all text-white"
                style={{ backgroundColor: lv.color }}
              >
                <span className="text-4xl">{lv.items[0].emoji}</span>
                <div className="text-left">
                  <p className="text-xl font-extrabold">{lv.name}</p>
                  <p className="text-sm opacity-80">{lv.namePT} · {lv.items.length} palavras</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
