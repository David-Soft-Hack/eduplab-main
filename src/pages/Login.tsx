import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-primary via-secondary to-tertiary p-3 sm:p-6 overflow-x-hidden">
      <div className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-tertiary/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full w-full max-w-[370px] bg-surface rounded-[2.25rem] sm:rounded-[2.75rem] shadow-elevation-level5 overflow-hidden relative border-4 border-surface/25 flex flex-col justify-between"
      >
        <div className="relative bg-gradient-to-b from-primary to-secondary h-[190px] sm:h-[210px] w-full flex flex-col items-center justify-center text-center overflow-hidden shrink-0 z-0 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
          <div className="absolute top-4 right-4 text-on-primary/40 animate-pulse hidden sm:block">
            <Sparkles size={16} />
          </div>

          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="z-10 flex flex-col items-center mt-[-15px]"
          >
            <div className="w-16 h-16 text-on-primary drop-shadow-md flex items-center justify-center">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-14 h-14">
                <path d="M50,15 C40,32 23,28 19,52 C16,66 21,72 30,72 C44,72 46,45 50,15 Z" />
                <path d="M50,15 C60,32 77,28 81,52 C84,66 79,72 70,72 C56,72 54,45 50,15 Z" />
              </svg>
            </div>
            <h1 className="text-on-primary text-base font-extrabold tracking-[0.25em] leading-none uppercase mt-1">
              EduPlan
            </h1>
            <p className="text-on-primary/60 text-[9px] font-bold uppercase tracking-wider mt-1.5 font-mono">
              Coordinador Metodológico
            </p>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10">
            <svg viewBox="0 0 500 85" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[38px] opacity-80 z-10">
              <path d="M0,45 C160,25 290,95 500,45 L500,85 L0,85 Z" fill="var(--color-tertiary)" />
            </svg>
            <svg viewBox="0 0 500 85" preserveAspectRatio="none" className="relative block w-full h-[36px] z-20">
              <path d="M0,50 C150,90 300,20 500,60 L500,85 L0,85 Z" fill="var(--color-surface)" />
            </svg>
          </div>
        </div>

        <div className="p-4 bg-surface flex-1 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-[19px] sm:text-[21px] font-bold text-on-surface leading-none font-display">
                ¡Bienvenido de nuevo!
              </h2>
              <p className="text-on-surface-variant text-[10px] sm:text-xs font-semibold mt-1.5">
                Ingresa al Portal de Coordinación Metodológica
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <TextField
                variant="outlined"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Correo Institucional"
                leadingIcon={<Mail size={15} />}
                required
                fullWidth
              />

              <div className="relative">
                <TextField
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  leadingIcon={<Lock size={15} />}
                  required
                  fullWidth
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="flex items-center justify-between px-1 text-[10px] sm:text-[11px] select-none">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${rememberMe ? 'bg-primary border-primary' : 'border-outline-variant bg-surface group-hover:border-primary'}`}>
                    {rememberMe && <span className="w-1.5 h-1.5 bg-on-primary rounded-full" />}
                  </div>
                  <span className="text-on-surface-variant font-bold">Recordarme</span>
                </label>
                <button type="button" className="font-bold text-on-surface-variant hover:text-primary transition-colors">
                  ¿Olvidaste contraseña?
                </button>
              </div>

              <Button
                type="submit"
                variant="filled"
                className="w-full mt-2.5"
                size="lg"
              >
                Ingresar
              </Button>
            </form>

            <p className="text-center text-[10px] sm:text-xs text-on-surface-variant font-bold uppercase tracking-wider leading-none mt-2">
              ¿Nuevo usuario? <span className="text-primary underline cursor-pointer hover:text-primary/80">Registrarse</span>
            </p>
          </div>

          <div className="pt-2">
            <p className="text-center text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
              Diseñado para el instituto • 2026
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
