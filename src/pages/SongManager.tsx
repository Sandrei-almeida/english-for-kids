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

function getYoutubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function SongManager() {
  const { songs, toggleSongActive, removeSong, addSong } = useSongs();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewSong>(EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [savedSong, setSavedSong] = useState<Song | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSong: Omit<Song, 'id'> = {
      ...form,
      lyrics: [],
      active: true,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    };
    addSong(newSong);
    // Guarda para mostrar o JSON
    setSavedSong({ ...newSong, id: Date.now() });
    setForm(EMPTY_FORM);
    setTagsInput('');
    setShowForm(false);
  };

  const copyJson = (song: Song) => {
    const entry = {
      id: song.id,
      title: song.title,
      titlePT: song.titlePT,
      theme: song.theme,
      duration: song.duration,
      audioFile: song.audioFile || '',
      audioUrl: song.audioUrl || '',
      youtubeUrl: song.youtubeUrl || '',
      lyrics: [],
      difficulty: song.difficulty,
      active: true,
      tags: song.tags,
    };
    navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
    setCopiedId(song.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const difficultyBadge = (d: string) =>
    d === 'easy' ? 'bg-green-100 text-green-700' :
    d === 'medium' ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';

  // Músicas que só existem no localStorage (id > 1000000000 = gerado por Date.now())
  const tempSongs = songs.filter(s => s.id > 1_000_000_000);
  const officialSongs = songs.filter(s => s.id <= 1_000_000_000);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-extrabold text-[#2D3436]">🎵 Gerenciar Músicas</h2>
        <button
          onClick={() => { setShowForm(v => !v); setSavedSong(null); }}
          className="bg-[#FF6B6B] text-white px-4 py-2 rounded-full font-bold shadow active:scale-95 transition-all"
        >
          {showForm ? '✕ Cancelar' : '+ Adicionar'}
        </button>
      </div>

      {/* Aviso sobre músicas temporárias */}
      {tempSongs.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold text-yellow-800 mb-1">⚠️ {tempSongs.length} música(s) temporária(s)</p>
          <p className="text-xs text-yellow-700 mb-2">
            Músicas adicionadas aqui ficam salvas só neste navegador. Para torná-las permanentes (com legenda automática), copie o JSON e adicione ao arquivo <code className="bg-yellow-100 px-1 rounded">src/data/songs.json</code> no GitHub.
          </p>
          {tempSongs.map(s => (
            <button
              key={s.id}
              onClick={() => copyJson(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all mr-2 mb-1 ${
                copiedId === s.id
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
              }`}
            >
              {copiedId === s.id ? '✅ Copiado!' : `📋 Copiar JSON: ${s.title}`}
            </button>
          ))}
        </div>
      )}

      {/* Confirmação após salvar */}
      {savedSong && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold text-blue-800 mb-1">✅ "{savedSong.title}" adicionada temporariamente</p>
          <p className="text-xs text-blue-700 mb-2">
            Para adicionar permanentemente com legenda automática:
          </p>
          <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1 mb-3">
            <li>Copie o JSON abaixo</li>
            <li>Abra <strong>github.com/Sandrei-almeida/english-for-kids</strong></li>
            <li>Edite <strong>src/data/songs.json</strong></li>
            <li>Cole antes do último <code>{']'}</code> da lista de songs</li>
            <li>Salve — o Vercel publica e busca a legenda automaticamente</li>
          </ol>
          <button
            onClick={() => copyJson(savedSong)}
            className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
              copiedId === savedSong.id ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {copiedId === savedSong.id ? '✅ Copiado!' : '📋 Copiar JSON'}
          </button>
        </div>
      )}

      {/* Formulário de nova música */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-4 mb-6 flex flex-col gap-3">
          <h3 className="font-bold text-[#2D3436]">Nova Música</h3>

          {[
            { label: 'Título (EN) *', key: 'title' as const, required: true },
            { label: 'Título (PT) *', key: 'titlePT' as const, required: true },
            { label: 'URL do YouTube *', key: 'youtubeUrl' as const, required: true },
            { label: 'Tema (ex: colors, body, numbers)', key: 'theme' as const, required: false },
            { label: 'Arquivo de áudio (opcional)', key: 'audioFile' as const, required: false },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs text-gray-500">{field.label}</label>
              <input
                type="text"
                value={form[field.key] as string}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                className="block w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#4ECDC4]"
                required={field.required}
                placeholder={field.key === 'youtubeUrl' ? 'https://www.youtube.com/watch?v=...' : ''}
              />
              {field.key === 'youtubeUrl' && form.youtubeUrl && getYoutubeId(form.youtubeUrl) && (
                <p className="text-xs text-green-600 mt-0.5">✅ ID detectado: {getYoutubeId(form.youtubeUrl)}</p>
              )}
            </div>
          ))}

          <div>
            <label className="text-xs text-gray-500">Duração (segundos)</label>
            <input type="number" min={1} value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
              className="block w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#4ECDC4]" />
          </div>

          <div>
            <label className="text-xs text-gray-500">Dificuldade</label>
            <select value={form.difficulty}
              onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as Song['difficulty'] }))}
              className="block w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#4ECDC4]">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Tags (separadas por vírgula)</label>
            <input type="text" value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="ex: animals, fun, beginner"
              className="block w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#4ECDC4]" />
          </div>

          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            💡 A legenda será buscada automaticamente depois que você adicionar esta música ao <strong>songs.json</strong> no GitHub.
          </div>

          <button type="submit"
            className="bg-[#4ECDC4] text-white py-3 rounded-2xl font-bold shadow active:scale-95 transition-all">
            Salvar e ver instruções →
          </button>
        </form>
      )}

      {/* Lista de músicas oficiais */}
      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-bold">Músicas no songs.json</p>
      <div className="flex flex-col gap-3 mb-6">
        {officialSongs.map(song => (
          <div key={song.id}
            className={`bg-white rounded-2xl shadow p-4 flex items-center gap-3 transition-opacity ${!song.active ? 'opacity-50' : ''}`}>
            <div className="flex-1">
              <p className="font-bold text-[#2D3436]">{song.title}</p>
              <p className="text-xs text-gray-500">{song.titlePT} · {song.duration}s · {song.lyrics.length} linhas de legenda</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${difficultyBadge(song.difficulty)}`}>
                {song.difficulty}
              </span>
            </div>
            <button onClick={() => toggleSongActive(song.id)} aria-label={song.active ? 'Desativar' : 'Ativar'}
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all ${
                song.active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}>
              {song.active ? '✅' : '⭕'}
            </button>
          </div>
        ))}
      </div>

      {/* Músicas temporárias */}
      {tempSongs.length > 0 && (
        <>
          <p className="text-xs text-yellow-600 mb-2 uppercase tracking-wide font-bold">⚠️ Temporárias (só neste navegador)</p>
          <div className="flex flex-col gap-3">
            {tempSongs.map(song => (
              <div key={song.id}
                className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-[#2D3436]">{song.title}</p>
                  <p className="text-xs text-gray-500">{song.titlePT}</p>
                </div>
                <button onClick={() => copyJson(song)}
                  className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                    copiedId === song.id ? 'bg-green-500 text-white' : 'bg-yellow-200 text-yellow-900'
                  }`}>
                  {copiedId === song.id ? '✅' : '📋'}
                </button>
                <button onClick={() => removeSong(song.id)} aria-label="Remover"
                  className="w-10 h-10 rounded-full bg-red-50 text-red-400 text-lg flex items-center justify-center hover:bg-red-100 transition-all">
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
