import { useState } from 'react';
import { useSongs } from '../hooks/useSongs';
import type { Song } from '../hooks/useSongs';

type NewSong = Pick<Song, 'title' | 'titlePT' | 'duration' | 'audioFile' | 'audioUrl' | 'youtubeUrl' | 'difficulty' | 'theme' | 'tags'>;

const EMPTY_FORM: NewSong = {
  title: '',
  titlePT: '',
  duration: 120,
  audioFile: '',
  audioUrl: '',
  youtubeUrl: '',
  difficulty: 'easy',
  theme: '',
  tags: [],
};

export function SongManager() {
  const { songs, toggleSongActive, removeSong, addSong } = useSongs();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewSong>(EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSong({
      ...form,
      lyrics: [],
      active: true,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    });
    setForm(EMPTY_FORM);
    setTagsInput('');
    setShowForm(false);
  };

  const difficultyBadge = (d: string) =>
    d === 'easy' ? 'bg-green-100 text-green-700' :
    d === 'medium' ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-[#2D3436]">🎵 Gerenciar Músicas</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-[#FF6B6B] text-white px-4 py-2 rounded-full font-bold shadow active:scale-95 transition-all"
        >
          {showForm ? '✕ Cancelar' : '+ Adicionar'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-4 mb-6 flex flex-col gap-3">
          <h3 className="font-bold text-[#2D3436]">Nova Música</h3>

          {[
            { label: 'Título (EN)', key: 'title' as const },
            { label: 'Título (PT)', key: 'titlePT' as const },
            { label: 'Arquivo de áudio (/audio/songs/...)', key: 'audioFile' as const },
            { label: 'URL de áudio (opcional)', key: 'audioUrl' as const },
            { label: 'URL do YouTube (opcional)', key: 'youtubeUrl' as const },
            { label: 'Tema', key: 'theme' as const },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs text-gray-500">{field.label}</label>
              <input
                type="text"
                value={form[field.key] as string}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                className="block w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#4ECDC4]"
                required={field.key === 'title' || field.key === 'titlePT'}
              />
            </div>
          ))}

          <div>
            <label className="text-xs text-gray-500">Duração (segundos)</label>
            <input
              type="number"
              min={1}
              value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
              className="block w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#4ECDC4]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Dificuldade</label>
            <select
              value={form.difficulty}
              onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as Song['difficulty'] }))}
              className="block w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#4ECDC4]"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="ex: animals, fun, beginner"
              className="block w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#4ECDC4]"
            />
          </div>

          <button
            type="submit"
            className="bg-[#4ECDC4] text-white py-3 rounded-2xl font-bold shadow active:scale-95 transition-all"
          >
            Salvar Música
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {songs.map(song => (
          <div
            key={song.id}
            className={`bg-white rounded-2xl shadow p-4 flex items-center gap-3 transition-opacity ${
              !song.active ? 'opacity-50' : ''
            }`}
          >
            <div className="flex-1">
              <p className="font-bold text-[#2D3436]">{song.title}</p>
              <p className="text-xs text-gray-500">{song.titlePT} · {song.duration}s</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${difficultyBadge(song.difficulty)}`}>
                {song.difficulty}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleSongActive(song.id)}
                aria-label={song.active ? 'Desativar' : 'Ativar'}
                className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all ${
                  song.active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {song.active ? '✅' : '⭕'}
              </button>
              <button
                onClick={() => removeSong(song.id)}
                aria-label="Remover"
                className="w-10 h-10 rounded-full bg-red-50 text-red-400 text-lg flex items-center justify-center hover:bg-red-100 transition-all"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
