import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from '../components/auth/LoginModal';
import { vocabulary } from '../utils/vocabulary';

export function Parents() {
  const { progress, updateProgress, syncing } = useProgress();
  const { user, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const totalVocab = Object.values(progress.vocabulary).reduce((a, b) => a + b, 0);
  const maxVocab = vocabulary.reduce((sum, l) => sum + l.items.length, 0);
  const pct = Math.round((totalVocab / maxVocab) * 100);
  const lastActive = new Date(progress.lastActive).toLocaleDateString('pt-BR');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-extrabold text-[#2D3436] mb-2 text-center">👨‍👩‍👧 Painel dos Pais</h2>
      <p className="text-center text-gray-500 mb-4 text-sm">Última atividade: {lastActive}</p>

      {/* Login status */}
      {user ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-green-800">✅ Logado</p>
            <p className="text-xs text-green-600">{user.email}</p>
            {syncing && <p className="text-xs text-green-500">Sincronizando...</p>}
          </div>
          <button
            onClick={signOut}
            className="text-xs bg-white border border-green-200 text-green-700 px-3 py-1.5 rounded-full font-bold hover:bg-green-100 transition-all"
          >
            Sair
          </button>
        </div>
      ) : (
        <div className="bg-[#FFE66D]/30 border border-[#FFE66D] rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold text-[#2D3436] mb-1">💾 Progresso salvo só neste navegador</p>
          <p className="text-xs text-gray-600 mb-3">
            Faça login para salvar na nuvem e acessar de qualquer dispositivo.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="w-full py-3 rounded-2xl bg-[#FF6B6B] text-white font-extrabold shadow active:scale-95 transition-all"
          >
            Entrar / Criar conta
          </button>
        </div>
      )}

      {/* Child name */}
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
          <div className="bg-[#4ECDC4] h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        {vocabulary.map((level, idx) => {
          const keys: (keyof typeof progress.vocabulary)[] = ['colors', 'animals', 'fruits', 'numbers', 'house'];
          const key = keys[idx];
          const known = progress.vocabulary[key] ?? 0;
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
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${(known / total) * 100}%`, backgroundColor: level.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link to="/song-manager"
        className="block text-center bg-[#4ECDC4] text-white rounded-2xl py-4 font-bold text-lg shadow active:scale-95 transition-all">
        🎵 Gerenciar Músicas
      </Link>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
