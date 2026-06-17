import { Link } from 'react-router-dom';

const sections = [
  { to: '/songs', emoji: '🎵', label: 'Songs', labelPT: 'Músicas', bg: 'bg-[#FF6B6B]' },
  { to: '/games', emoji: '🎮', label: 'Games', labelPT: 'Jogos', bg: 'bg-[#4ECDC4]' },
  { to: '/parents', emoji: '👨‍👩‍👧', label: 'Parents', labelPT: 'Para os Pais', bg: 'bg-[#A78BFA]' },
];

export function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-8">
      <div className="text-center">
        <div className="text-7xl mb-4">🌟</div>
        <h2 className="text-3xl font-extrabold text-[#2D3436]">Hello!</h2>
        <p className="text-lg text-gray-500 mt-1">Let's learn English together!</p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        {sections.map(s => (
          <Link
            key={s.to}
            to={s.to}
            className={`${s.bg} text-white rounded-3xl p-6 flex items-center gap-4 shadow-lg active:scale-95 transition-transform`}
          >
            <span className="text-5xl">{s.emoji}</span>
            <div>
              <p className="text-2xl font-extrabold">{s.label}</p>
              <p className="text-sm opacity-80">{s.labelPT}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center max-w-xs">
        Aprenda inglês brincando · 15 min por dia · Método progressivo
      </p>
    </div>
  );
}
