import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Rocket, CheckCircle2, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(120),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmar_senha: z.string(),
}).refine((d) => d.senha === d.confirmar_senha, {
  message: 'As senhas não coincidem',
  path: ['confirmar_senha'],
});

type FormData = z.infer<typeof schema>;

export default function SetupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api.get('/setup/status')
      .then(({ data }) => {
        if (data.initialized) navigate('/login', { replace: true });
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [navigate]);

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await api.post('/setup/initialize', {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
      });
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao inicializar o sistema.');
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
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in">
        {/* Success state */}
        {done ? (
          <div className="glass-card p-8 text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 border border-success/20 mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">Sistema inicializado!</h2>
            <p className="text-sm text-text-secondary">Redirecionando para o login...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 mb-4 shadow-gold">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2L3 8.5V20L14 26L25 20V8.5L14 2Z" stroke="#FFD700" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M14 2V26M3 8.5L25 20M25 8.5L3 20" stroke="#FFD700" strokeWidth="1" strokeOpacity="0.4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Horizon HUB</h1>
              <p className="text-sm text-text-secondary mt-1">Configuração Inicial</p>
            </div>

            {/* Card */}
            <div className="glass-card p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-text-primary">Bem-vindo!</h2>
                <p className="text-xs text-text-secondary mt-1">
                  Crie sua conta de administrador para começar.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nome */}
                <div>
                  <label htmlFor="nome" className="input-label">Nome completo</label>
                  <input
                    id="nome"
                    type="text"
                    autoComplete="name"
                    placeholder="Seu nome"
                    className={cn('input', errors.nome && 'border-danger/40')}
                    {...register('nome')}
                  />
                  {errors.nome && <p className="mt-1 text-xs text-danger">{errors.nome.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="input-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    className={cn('input', errors.email && 'border-danger/40')}
                    {...register('email')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
                </div>

                {/* Senha */}
                <div>
                  <label htmlFor="senha" className="input-label">Senha</label>
                  <div className="relative">
                    <input
                      id="senha"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      className={cn('input pr-10', errors.senha && 'border-danger/40')}
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
                  {errors.senha && <p className="mt-1 text-xs text-danger">{errors.senha.message}</p>}
                </div>

                {/* Confirmar senha */}
                <div>
                  <label htmlFor="confirmar_senha" className="input-label">Confirmar senha</label>
                  <input
                    id="confirmar_senha"
                    type="password"
                    placeholder="Repita a senha"
                    className={cn('input', errors.confirmar_senha && 'border-danger/40')}
                    {...register('confirmar_senha')}
                  />
                  {errors.confirmar_senha && (
                    <p className="mt-1 text-xs text-danger">{errors.confirmar_senha.message}</p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2.5">
                    <p className="text-xs text-danger">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Rocket size={15} />
                  )}
                  {isSubmitting ? 'Inicializando...' : 'Inicializar Sistema'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
