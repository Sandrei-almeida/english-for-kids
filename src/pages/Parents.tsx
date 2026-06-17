import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { vocabulary } from '../utils/vocabulary';

export function Parents() {
  const { progress, updateProgress } = useProgress();

  const totalVocab = Object.values(progress.vocabulary).reduce((a, b) => a + b, 0);
  const maxVocab = vocabulary.reduce((sum, l) => sum + l.items.length, 0);
  const pct = Math.round((totalVocab / maxVocab) * 100);

  const lastActive = new Date(progress.lastActive).toLocaleDateString('pt-BR');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-extrabold text-[#2D3436] mb-2 text-center">👨‍👩‍👧 Painel dos Pais</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Última atividade: {lastActive}</p>

      {/* Name editor */}
      <div className="bg-white rounded-2xl shadow p-4 mb-4 flex items-center gap-3">
        <span className="text-3xl">👧</span>
        <div className="flex-1">
          <label className="text-xs text-gray-400">Nome da criança</label>
          <input
            type="text"
            value={progress.name}
            onChange={e => updateProgress({ name: e.target.value })}
            className="block w-full font-bold text-[#2D3436] border-b border-gray-200 focus:outline-none focus:border-[#4ECDC4] mt-1"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Músicas', value: progress.songsListened, emoji: '🎵' },
          { label: 'Jogos', value: progress.gamesPlayed, emoji: '🎮' },
          { label: 'Nível', value: progress.level, emoji: '⭐' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl shadow p-4 text-center">
            <div className="text-3xl">{stat.emoji}</div>
            <div className="text-2xl font-extrabold text-[#2D3436]">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Vocabulary progress */}
      <div className="bg-white rounded-2xl shadow p-4 mb-4">
        <h3 className="font-bold text-[#2D3436] mb-3">Vocabulário ({pct}% do total)</h3>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
          <div
            className="bg-[#4ECDC4] h-3 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        {vocabulary.map(level => {
          const key = ['colors', 'animals', 'fruits', 'numbers', 'house'][level.id - 1] as keyof typeof progress.vocabulary;
          const known = progress.vocabulary[key];
          const total = level.items.length;
          return (
            <div key={level.id} className="flex items-center gap-3 mb-2">
              <span className="text-lg w-8 text-center">{level.items[0].emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>{level.namePT}</span>
                  <span className="text-gray-500">{known}/{total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${(known / total) * 100}%`, backgroundColor: level.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Song manager link */}
      <Link
        to="/song-manager"
        className="block text-center bg-[#4ECDC4] text-white rounded-2xl py-4 font-bold text-lg shadow active:scale-95 transition-all"
      >
        🎵 Gerenciar Músicas
      </Link>
    </div>
  );
}
