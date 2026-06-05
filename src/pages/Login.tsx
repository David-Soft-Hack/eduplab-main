import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-[#2563eb] via-[#4f46e5] to-[#7c3aed] p-3 sm:p-6 overflow-x-hidden">
      
      {/* Decorative Floating ambient lights */}
      <div className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[370px] bg-white rounded-[2.25rem] sm:rounded-[2.75rem] shadow-2xl overflow-hidden relative border-4 border-white/25 flex flex-col justify-between"
      >
        {/* UPPER BANNER ZONE WITH GRADIENT AND WAVED SVG SPLIT */}
        <div className="relative bg-gradient-to-b from-[#3b82f6] to-[#4f46e5] h-[190px] sm:h-[210px] w-full flex flex-col items-center justify-center text-center overflow-hidden shrink-0 z-0 select-none">
          
          {/* Subtle sparkles overlay background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />

          {/* Sparkles Floating icon */}
          <div className="absolute top-4 right-4 text-white/40 animate-pulse hidden sm:block">
            <Sparkles size={16} />
          </div>

          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="z-10 flex flex-col items-center mt-[-15px]"
          >
            {/* Custom high fidelity leaf/wing logo */}
            <div className="w-16 h-16 text-white drop-shadow-md flex items-center justify-center">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-14 h-14">
                <path d="M50,15 C40,32 23,28 19,52 C16,66 21,72 30,72 C44,72 46,45 50,15 Z" />
                <path d="M50,15 C60,32 77,28 81,52 C84,66 79,72 70,72 C56,72 54,45 50,15 Z" />
              </svg>
            </div>
            {/* Brand text */}
            <h1 className="text-white text-base font-extrabold tracking-[0.25em] leading-none uppercase mt-1">
              EduPlan
            </h1>
            <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider mt-1.5 font-mono">
              Coordinador Metodológico
            </p>
          </motion.div>

          {/* DOUBLE DYNAMIC WAVE LINES (Matches the mockup reference style perfectly) */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10">
            {/* Layer 1: Semi-transparent purple back wave */}
            <svg viewBox="0 0 500 85" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[38px] opacity-80 z-10">
              <path d="M0,45 C160,25 290,95 500,45 L500,85 L0,85 Z" fill="#7c3aed" />
            </svg>
            {/* Layer 2: White foreground wave */}
            <svg viewBox="0 0 500 85" preserveAspectRatio="none" className="relative block w-full h-[36px] z-20">
              <path d="M0,50 C150,90 300,20 500,60 L500,85 L0,85 Z" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* INPUT AND FORM ZONE */}
        <div className="p-7 sm:p-8 pt-4 sm:pt-6 bg-white flex-1 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-[19px] sm:text-[21px] font-bold text-slate-800 leading-none">
                ¡Bienvenido de nuevo!
              </h2>
              <p className="text-slate-450 text-[10px] sm:text-xs font-semibold mt-1.5">
                Ingresa al Portal de Coordinación Metodológica
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Field 1: Email Capsule */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={15} className="group-focus-within:text-[#4f46e5] transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-5 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 placeholder-slate-400 text-xs sm:text-[13px] font-semibold transition-all shadow-inner"
                  placeholder="Correo Institucional"
                  required
                />
              </div>

              {/* Field 2: Password Capsule */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} className="group-focus-within:text-[#4f46e5] transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 placeholder-slate-400 text-xs sm:text-[13px] font-semibold transition-all shadow-inner"
                  placeholder="Contraseña"
                  id="password_field"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4.5 flex items-center text-slate-400 hover:text-[#4f46e5] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Remember Me and Forgot Password row */}
              <div className="flex items-center justify-between px-1 text-[10px] sm:text-[11px] select-none">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#4f46e5] border-[#4f46e5]' : 'border-slate-300 bg-white group-hover:border-[#4f46e5]'}`}>
                    {rememberMe && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-slate-500 font-bold">Recordarme</span>
                </label>
                <button 
                  type="button" 
                  className="font-bold text-slate-400 hover:text-[#4f46e5] transition-colors"
                >
                  ¿Olvidaste contraseña?
                </button>
              </div>

              {/* Login Button with rounded capsule */}
              <button
                type="submit"
                className="w-full mt-2.5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-black text-xs sm:text-[13px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transform transition duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Ingresar
              </button>
            </form>

            <p className="text-center text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider leading-none mt-2">
              ¿Nuevo usuario? <span className="text-[#4f46e5] underline cursor-pointer hover:text-indigo-700">Registrarse</span>
            </p>
          </div>

          <div className="pt-2">
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Diseñado para el instituto • 2026
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

