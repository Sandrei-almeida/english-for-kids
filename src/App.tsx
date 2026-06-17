import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { Songs } from './pages/Songs';
import { Games } from './pages/Games';
import { Parents } from './pages/Parents';
import { SongManager } from './pages/SongManager';
import './styles/global.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F7FFF9]">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/songs" element={<Songs />} />
              <Route path="/games" element={<Games />} />
              <Route path="/parents" element={<Parents />} />
              <Route path="/song-manager" element={<SongManager />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
