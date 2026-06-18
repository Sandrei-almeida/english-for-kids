import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Component } from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { Songs } from './pages/Songs';
import { Games } from './pages/Games';
import { Parents } from './pages/Parents';
import { SongManager } from './pages/SongManager';
import './styles/global.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-[#F7FFF9]">
        <div className="text-6xl mb-4">😢</div>
        <h1 className="text-xl font-bold text-[#2D3436] mb-2">Algo deu errado</h1>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">{this.state.error}</p>
        <button onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#FF6B6B] text-white rounded-full font-bold">
          Recarregar
        </button>
      </div>
    );
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
