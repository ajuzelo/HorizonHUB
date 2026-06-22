import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Check if system needs first-run setup
    api.get('/setup/status')
      .then(({ data }) => {
        if (!data.initialized) navigate('/setup', { replace: true });
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await api.post('/auth/login', { email: data.email, senha: data.senha });
      setAuth(res.data.token, res.data.user, res.data.profiles, res.data.settings);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao realizar login.');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 mb-4 shadow-gold">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L3 8.5V20L14 26L25 20V8.5L14 2Z" stroke="#FFD700" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M14 2V26M3 8.5L25 20M25 8.5L3 20" stroke="#FFD700" strokeWidth="1" strokeOpacity="0.4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Horizon HUB</h1>
          <p className="text-sm text-text-secondary mt-1">Administrativo Pessoal</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-text-primary mb-5">Entrar na sua conta</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className={cn('input', errors.email && 'border-danger/40 focus:ring-danger/20')}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="senha" className="input-label">Senha</label>
              <div className="relative">
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn('input pr-10', errors.senha && 'border-danger/40 focus:ring-danger/20')}
                  {...register('senha')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1 text-xs text-danger">{errors.senha.message}</p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2.5">
                <p className="text-xs text-danger">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <LogIn size={15} />
              )}
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Horizon HUB v1.0 · Administrativo Pessoal
        </p>
      </div>
    </div>
  );
}
