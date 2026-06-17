import { useState } from 'react';
import { vocabulary } from '../utils/vocabulary';
import { useProgress } from '../hooks/useProgress';

type GameState = 'menu' | 'playing' | 'correct' | 'wrong';

export function Games() {
  const { incrementGamesPlayed } = useProgress();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const ROUNDS = 5;

  const level = vocabulary.find(l => l.id === selectedLevel);

  const startGame = (levelId: number) => {
    setSelectedLevel(levelId);
    setScore(0);
    setRound(0);
    generateQuestion(levelId, 0);
    setGameState('playing');
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
      setGameState('correct');
    } else {
      setGameState('wrong');
    }
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= ROUNDS) {
        setGameState('menu');
        setSelectedLevel(null);
      } else {
        setRound(nextRound);
        generateQuestion(selectedLevel!, currentIndex + 1);
        setGameState('playing');
      }
    }, 1200);
  };

  if (gameState !== 'menu' && level) {
    const item = level.items[currentIndex];
    return (
      <div className="max-w-sm mx-auto px-4 py-8 flex flex-col items-center gap-6">
        <div className="w-full flex justify-between text-sm text-gray-500">
          <span>{level.namePT}</span>
          <span>Rodada {round + 1}/{ROUNDS} · Pontos: {score}</span>
        </div>

        <div
          className={`w-40 h-40 rounded-3xl flex items-center justify-center text-7xl shadow-lg transition-all ${
            gameState === 'correct' ? 'bg-green-100 scale-110' :
            gameState === 'wrong' ? 'bg-red-100 scale-95' : 'bg-[#FFE66D]'
          }`}
        >
          {item.emoji}
        </div>

        <p className="text-3xl font-extrabold text-[#2D3436]">{item.word}</p>

        {gameState === 'correct' && <p className="text-green-500 text-2xl font-bold">✅ Correct!</p>}
        {gameState === 'wrong' && <p className="text-red-400 text-2xl font-bold">❌ Try again!</p>}

        <p className="text-gray-500">O que é isso em português?</p>

        <div className="grid grid-cols-1 gap-3 w-full">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => gameState === 'playing' && handleAnswer(opt)}
              disabled={gameState !== 'playing'}
              className="py-4 rounded-2xl bg-white shadow text-xl font-bold text-[#2D3436] hover:bg-[#4ECDC4] hover:text-white active:scale-95 transition-all disabled:opacity-60"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <h2 className="text-2xl font-extrabold text-[#2D3436] mb-6 text-center">🎮 Games</h2>
      <p className="text-center text-gray-500 mb-6">Escolha um tema para jogar!</p>

      <div className="flex flex-col gap-4">
        {vocabulary.map(level => (
          <button
            key={level.id}
            onClick={() => startGame(level.id)}
            className="rounded-2xl p-5 flex items-center gap-4 shadow-lg active:scale-95 transition-all text-white"
            style={{ backgroundColor: level.color }}
          >
            <span className="text-4xl">{level.items[0].emoji}</span>
            <div className="text-left">
              <p className="text-xl font-extrabold">{level.name}</p>
              <p className="text-sm opacity-80">{level.namePT} · {level.items.length} palavras</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
