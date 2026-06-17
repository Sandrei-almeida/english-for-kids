import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  onClose: () => void;
}

type Mode = 'login' | 'register';

export function LoginModal({ onClose }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else onClose();
    } else {
      const { error } = await signUp(email, password);
      if (error) setError(error);
      else setSuccess('Conta criada! Verifique seu e-mail para confirmar.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌟</div>
          <h2 className="text-2xl font-extrabold text-[#2D3436]">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login'
              ? 'Acesse o progresso da sua criança'
              : 'Crie sua conta para salvar o progresso'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="block w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-[#4ECDC4] text-[#2D3436]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="mínimo 6 caracteres"
              minLength={6}
              className="block w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-[#4ECDC4] text-[#2D3436]"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm rounded-xl p-3 text-center">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#FF6B6B] text-white font-extrabold text-lg shadow-lg active:scale-95 transition-all disabled:opacity-60 mt-2"
          >
            {loading ? '...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div className="text-center mt-4">
          {mode === 'login' ? (
            <p className="text-sm text-gray-500">
              Não tem conta?{' '}
              <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                className="text-[#4ECDC4] font-bold">
                Criar agora
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Já tem conta?{' '}
              <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="text-[#4ECDC4] font-bold">
                Entrar
              </button>
            </p>
          )}
        </div>

        <button onClick={onClose}
          className="mt-3 w-full py-2 rounded-full bg-gray-100 text-gray-500 text-sm hover:bg-gray-200 transition-all">
          Continuar sem login
        </button>
      </div>
    </div>
  );
}
