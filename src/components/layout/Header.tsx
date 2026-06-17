import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: '🏠 Home' },
  { to: '/songs', label: '🎵 Songs' },
  { to: '/games', label: '🎮 Games' },
  { to: '/parents', label: '👨‍👩‍👧 Parents' },
];

export function Header() {
  const { pathname } = useLocation();

  return (
    <header className="bg-[#FF6B6B] shadow-md">
      <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col items-center gap-2">
        <h1 className="text-white text-2xl font-extrabold tracking-wide">
          🌟 English for Kids
        </h1>
        <nav className="flex gap-2 flex-wrap justify-center">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                pathname === item.to
                  ? 'bg-white text-[#FF6B6B]'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
