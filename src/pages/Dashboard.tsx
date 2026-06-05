import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, BookOpen, CheckCircle2, Clock, AlertTriangle, Bell, Search,
  FileText, Calendar, TrendingUp, Sparkles, Eye, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EstadoUnidad, UnidadDidactica } from '../types';
import { notificacionesNoLeidas } from '../lib/notificacionEngine';
import PanelNotificaciones from '../components/PanelNotificaciones';

const Dashboard: React.FC = () => {
  const { memorandums, teachers, notifications } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const unreadCount = notificacionesNoLeidas(notifications);

  const totalModulos = useMemo(() => {
    return memorandums.reduce((acc, m) => acc + m.modulos.length, 0);
  }, [memorandums]);

  const unidadesProximas = useMemo(() => {
    const todas: UnidadDidactica[] = [];
    memorandums.forEach(m => m.modulos.forEach(mod => mod.unidades.forEach(u => {
      if (u.estado === EstadoUnidad.EN_PROGRESO) {
        const diff = Math.ceil((new Date(u.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 3) todas.push(u);
      }
    })));
    return todas;
  }, [memorandums]);

  const unidadesCriticas = useMemo(() => {
    const todas: { docente: string; modulo: string; unidad: UnidadDidactica }[] = [];
    memorandums.forEach(m => m.modulos.forEach(mod => mod.unidades.forEach(u => {
      if (u.estado === EstadoUnidad.EN_PROGRESO) {
        const diff = Math.ceil((new Date(u.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 3) todas.push({ docente: m.docenteNombre, modulo: mod.nombre, unidad: u });
      }
    })));
    return todas;
  }, [memorandums]);

  const stats = [
    { label: 'Módulos Totales', value: totalModulos, icon: BookOpen, color: 'bg-teal-600', trend: 'Activos' },
    { label: 'Unidades Próximas', value: unidadesProximas.length, icon: AlertTriangle, color: 'bg-amber-600', trend: '48-72h' },
    { label: 'Docentes Activos', value: teachers.length, icon: Users, color: 'bg-blue-600', trend: 'Registrados' },
    { label: 'Notificaciones', value: unreadCount, icon: Bell, color: 'bg-red-600', trend: 'Sin leer' },
  ];

  const chartData = useMemo(() => {
    return memorandums.map(m => ({
      name: m.docenteNombre.split(' ').pop() || m.docenteNombre,
      completado: m.modulos.reduce((acc, mod) => acc + mod.unidades.filter(u => u.estado === EstadoUnidad.FINALIZADA).length, 0),
      progreso: m.modulos.reduce((acc, mod) => acc + mod.unidades.filter(u => u.estado === EstadoUnidad.EN_PROGRESO).length, 0),
      pendiente: m.modulos.reduce((acc, mod) => acc + mod.unidades.filter(u => u.estado === EstadoUnidad.PENDIENTE).length, 0),
    }));
  }, [memorandums]);

  const filteredDocentes = useMemo(() => {
    if (!searchTerm) return memorandums;
    return memorandums.filter(m =>
      m.docenteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.programa.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [memorandums, searchTerm]);

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-16 px-1 sm:px-0">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="px-2 py-0.5 text-[8px] font-black text-teal-600 bg-teal-50 border border-teal-100 rounded-full tracking-widest uppercase inline-flex items-center gap-1 mb-1">
            <Sparkles size={9} /> Dashboard Metodológico
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-black text-slate-800 tracking-tight leading-none">
            Panel de Seguimiento
          </h1>
          <p className="text-slate-400 text-[10px] sm:text-xs font-semibold capitalize mt-1 flex items-center gap-1">
            <Calendar size={12} className="text-slate-400 shrink-0" />
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="relative group flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={13} />
            <input 
              type="text" 
              placeholder="Buscar docente o programa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:bg-white transition-all text-xs font-semibold placeholder-slate-400"
            />
          </div>
          <button
            onClick={() => setShowNotifPanel(true)}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-500 transition-all relative shrink-0"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[7px] font-black rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04 }}
            className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 flex flex-col justify-between hover:border-teal-500/30 transition-all duration-300 relative group shadow-sm"
          >
            <div className="flex items-center justify-between mb-3.5">
              <div className={cn("p-2 sm:p-2.5 rounded-xl text-white transition-all duration-350 group-hover:scale-105", stat.color)}>
                <stat.icon size={16} />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 text-[8px] font-black text-slate-400 uppercase tracking-widest rounded-full border border-slate-100">
                <span className="w-1 h-1 rounded-full bg-teal-500 animate-pulse" />
                Live
              </div>
            </div>
            <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.label}</h3>
            <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
              <span className="text-xl sm:text-2xl font-display font-black text-slate-800 tracking-tight leading-none">{stat.value}</span>
              <span className="text-[8px] font-black text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded uppercase font-mono tracking-tighter">{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Progreso de Unidades</span>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Por Docente</h3>
              </div>
              <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                {chartData.reduce((a, c) => a + c.completado, 0)} Finalizadas
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '10px', padding: '8px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                  <Bar dataKey="completado" fill="#0d9488" radius={[4, 4, 0, 0]} name="Finalizadas" />
                  <Bar dataKey="progreso" fill="#f59e0b" radius={[4, 4, 0, 0]} name="En Progreso" />
                  <Bar dataKey="pendiente" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Pendientes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Unidades Críticas por Finalizar</h3>
              <button onClick={() => navigate('/alertas')} className="text-[9px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1">
                Ver todas <ChevronRight size={12} />
              </button>
            </div>
            {unidadesCriticas.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 size={28} className="text-teal-500 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">No hay unidades críticas por finalizar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unidadesCriticas.map((item, idx) => {
                  const diff = Math.ceil((new Date(item.unidad.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={idx} className={cn(
                      "p-3 rounded-xl border flex items-center gap-3",
                      diff <= 1 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
                    )}>
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        diff <= 1 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      )}>
                        <Clock size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-800 truncate">{item.unidad.nombre}</p>
                        <p className="text-[9px] text-slate-500 font-semibold">{item.docente} • {item.modulo}</p>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-lg text-[9px] font-black font-mono",
                        diff <= 1 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {diff === 0 ? 'Hoy' : `${diff}d`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Docentes Asignados</h3>
            <div className="space-y-2.5">
                  {filteredDocentes.map((m, idx) => {
                const totalU = m.modulos.reduce((acc, mod) => acc + mod.unidades.length, 0);
                const finU = m.modulos.reduce((acc, mod) => acc + mod.unidades.filter(u => u.estado === EstadoUnidad.FINALIZADA).length, 0);
                const pct = totalU > 0 ? Math.round((finU / totalU) * 100) : 0;
                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50/55 hover:bg-teal-50/40 transition-colors border border-slate-100">
                    <div className="flex gap-3 items-start cursor-pointer" onClick={() => navigate('/dosificacion')}>
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                        <span className="text-[8px] font-black text-teal-600 uppercase leading-none">
                          {m.docenteNombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-slate-800 text-xs leading-snug truncate">{m.docenteNombre}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">{m.programa}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[8px] font-black text-slate-500">{pct}%</span>
                        </div>
                      </div>
                      <button className="p-1 text-slate-400 hover:text-teal-600">
                        <Eye size={14} />
                      </button>
                    </div>
                    <div className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2.5">
                      {m.modulos.map((mod, mIdx) => {
                        const modTotal = mod.unidades.length;
                        const modFin = mod.unidades.filter(u => u.estado === EstadoUnidad.FINALIZADA).length;
                        const modPct = modTotal > 0 ? Math.round((modFin / modTotal) * 100) : 0;
                        return (
                          <div key={mIdx} className="flex items-center gap-2">
                            <span className="text-[8px] font-semibold text-slate-500 w-2/5 truncate" title={mod.nombre}>
                              {mod.nombre}
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={cn(
                                "h-full rounded-full",
                                modPct === 100 ? "bg-teal-600" : "bg-amber-500"
                              )} style={{ width: `${modPct}%` }} />
                            </div>
                            <span className="text-[7px] font-black text-slate-400 font-mono w-8 text-right">{modPct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-4 sm:p-5 rounded-2xl shadow-md text-white overflow-hidden relative group">
            <div className="relative z-10 space-y-1.5">
              <TrendingUp size={36} className="text-white/20 mb-2 group-hover:scale-105 transition-transform" />
              <h3 className="text-sm font-black uppercase tracking-tight">Resumen Metodológico</h3>
              <p className="text-white/70 text-[11px] leading-relaxed max-w-[200px]">
                {unidadesCriticas.length > 0
                  ? `${unidadesCriticas.length} unidad(es) por finalizar en los próximos 3 días.`
                  : 'Todas las unidades están al día.'}
              </p>
              <div className="flex items-center gap-1.5 font-black text-xl pt-1">
                {chartData.reduce((a, c) => a + c.completado, 0)} / {chartData.reduce((a, c) => a + c.completado + c.progreso + c.pendiente, 0)}
                <span className="text-[8px] font-black uppercase text-white/75 bg-white/10 px-1.5 py-0.5 rounded">Unidades</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          </div>

          <button
            onClick={() => navigate('/memorandum')}
            className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-all flex items-center justify-center gap-2"
          >
            <FileText size={14} />
            Nuevo Memorándum
          </button>
        </div>
      </div>

      <PanelNotificaciones open={showNotifPanel} onClose={() => setShowNotifPanel(false)} />
    </div>
  );
};

export default Dashboard;
