import { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, BookOpen, CheckCircle2, Clock, AlertTriangle, Bell, Search, FileText, Calendar, TrendingUp, Eye, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EstadoUnidad } from '../types';
import { notificacionesNoLeidas } from '../lib/notificacionEngine';
import PanelNotificaciones from '../components/PanelNotificaciones';

const Dashboard: React.FC = () => {
  const { memorandums, teachers, notifications } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [chartMounted, setChartMounted] = useState(false);
  useEffect(() => { setChartMounted(true); }, []);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const unreadCount = notificacionesNoLeidas(notifications);

  const totalModulos = useMemo(() => memorandums.reduce((acc, m) => acc + m.modulos.length, 0), [memorandums]);

  const unidadesProximas = useMemo(() => {
    const todas: any[] = [];
    memorandums.forEach(m => m.modulos.forEach(mod => mod.unidades.forEach(u => {
      if (u.estado === EstadoUnidad.EN_PROGRESO) {
        const diff = Math.ceil((new Date(u.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 3) todas.push(u);
      }
    })));
    return todas;
  }, [memorandums]);

  const unidadesCriticas = useMemo(() => {
    const todas: { docente: string; modulo: string; unidad: any }[] = [];
    memorandums.forEach(m => m.modulos.forEach(mod => mod.unidades.forEach(u => {
      if (u.estado === EstadoUnidad.EN_PROGRESO) {
        const diff = Math.ceil((new Date(u.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 3) todas.push({ docente: m.docenteNombre, modulo: mod.nombre, unidad: u });
      }
    })));
    return todas;
  }, [memorandums]);

  const stats = [
    { label: 'Módulos Totales', value: totalModulos, icon: BookOpen, color: 'bg-primary', trend: 'Activos' },
    { label: 'Unidades Próximas', value: unidadesProximas.length, icon: AlertTriangle, color: 'bg-tertiary', trend: '48-72h' },
    { label: 'Docentes Activos', value: teachers.length, icon: Users, color: 'bg-secondary', trend: 'Registrados' },
    { label: 'Notificaciones', value: unreadCount, icon: Bell, color: 'bg-error', trend: 'Sin leer' },
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
    <div className="space-y-4 md:space-y-6 pb-16 px-1 sm:px-0">
      <Card variant="filled" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
        <div>
          <span className="text-label-small text-primary font-bold uppercase tracking-widest">Dashboard Metodológico</span>
          <h1 className="text-headline-small text-on-surface font-display tracking-tight">Panel de Seguimiento</h1>
          <p className="text-body-small text-on-surface-variant capitalize mt-1 flex items-center gap-1">
            <Calendar size={12} className="shrink-0" />
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <TextField
            variant="outlined"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar docente o programa..."
            leadingIcon={<Search size={13} />}
            className="flex-1 sm:w-56"
          />
          <Button variant="tonal" size="sm" icon={<Bell size={16} />} onClick={() => setShowNotifPanel(true)}>
            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-error text-on-error text-[8px] font-black rounded-full">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Card variant="elevated" className="p-4 flex flex-col justify-between hover:border-primary/30 transition-all duration-300 relative group">
              <div className="flex items-center justify-between mb-3.5">
                <div className={cn("p-2 sm:p-2.5 rounded-xl text-on-primary transition-all duration-350 group-hover:scale-105", stat.color)}>
                  <stat.icon size={16} />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-container-high text-[8px] font-black text-on-surface-variant uppercase tracking-widest rounded-full">
                  <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                  Live
                </div>
              </div>
              <h3 className="text-label-medium text-on-surface-variant uppercase tracking-widest truncate">{stat.label}</h3>
              <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                <span className="text-display-small text-on-surface font-display tracking-tight">{stat.value}</span>
                <span className="text-label-small text-on-primary-container bg-primary-container px-1.5 py-0.5 rounded font-mono">{stat.trend}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <Card variant="elevated" className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-label-small text-on-surface-variant uppercase tracking-widest block mb-0.5">Progreso de Unidades</span>
                <h3 className="text-title-small text-on-surface font-display uppercase tracking-tight">Por Docente</h3>
              </div>
              <span className="text-label-small text-on-primary-container bg-primary-container px-2 py-0.5 rounded-full">
                {chartData.reduce((a, c) => a + c.completado, 0)} Finalizadas
              </span>
            </div>
            <div className="h-52 w-full">
              {chartMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" />
                    <XAxis dataKey="name" stroke="var(--color-on-surface-variant)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-on-surface-variant)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline-variant)', borderRadius: '10px', color: 'var(--color-on-surface)', fontSize: '10px', padding: '8px' }}
                      labelStyle={{ fontWeight: 'bold', color: 'var(--color-on-surface)' }}
                    />
                    <Bar dataKey="completado" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Finalizadas" />
                    <Bar dataKey="progreso" fill="var(--color-tertiary)" radius={[4, 4, 0, 0]} name="En Progreso" />
                    <Bar dataKey="pendiente" fill="var(--color-on-surface-variant)" opacity={0.3} radius={[4, 4, 0, 0]} name="Pendientes" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card variant="elevated" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-title-small text-on-surface font-display uppercase tracking-tight">Unidades Críticas por Finalizar</h3>
              <Button variant="text" size="sm" onClick={() => navigate('/alertas')} icon={<ChevronRight size={12} />}>
                Ver todas
              </Button>
            </div>
            {unidadesCriticas.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 size={28} className="text-primary mx-auto mb-2" />
                <p className="text-body-small text-on-surface-variant font-semibold">No hay unidades críticas por finalizar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unidadesCriticas.map((item, idx) => {
                  const diff = Math.ceil((new Date(item.unidad.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={idx} className={cn(
                      "p-3 rounded-xl border flex items-center gap-3",
                      diff <= 1 ? "bg-error-container/30 border-error-container" : "bg-tertiary-container/30 border-tertiary-container"
                    )}>
                      <div className={cn("p-2 rounded-lg shrink-0", diff <= 1 ? "bg-error-container text-error" : "bg-tertiary-container text-tertiary")}>
                        <Clock size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-small font-bold text-on-surface truncate">{item.unidad.nombre}</p>
                        <p className="text-label-small text-on-surface-variant">{item.docente} • {item.modulo}</p>
                      </div>
                      <div className={cn("px-2 py-1 rounded-lg text-label-small font-mono font-bold", diff <= 1 ? "bg-error-container text-on-error-container" : "bg-tertiary-container text-on-tertiary-container")}>
                        {diff === 0 ? 'Hoy' : `${diff}d`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card variant="elevated" className="p-4">
            <h3 className="text-title-small text-on-surface font-display uppercase tracking-widest mb-4">Docentes Asignados</h3>
            <div className="space-y-2.5">
              {filteredDocentes.map((m, idx) => {
                const totalU = m.modulos.reduce((acc, mod) => acc + mod.unidades.length, 0);
                const finU = m.modulos.reduce((acc, mod) => acc + mod.unidades.filter(u => u.estado === EstadoUnidad.FINALIZADA).length, 0);
                const pct = totalU > 0 ? Math.round((finU / totalU) * 100) : 0;
                return (
                  <div key={idx} className="p-3 rounded-xl bg-surface-container-low hover:bg-primary-container/20 transition-colors">
                    <div className="flex gap-3 items-start cursor-pointer" onClick={() => navigate('/dosificacion')}>
                      <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-outline-variant shadow-sm shrink-0">
                        <span className="text-label-small text-primary font-bold uppercase leading-none">
                          {m.docenteNombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-body-medium text-on-surface truncate">{m.docenteNombre}</h4>
                        <p className="text-label-small text-on-surface-variant uppercase tracking-widest truncate mt-0.5">{m.programa}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-label-small text-on-surface-variant">{pct}%</span>
                        </div>
                      </div>
                      <Button variant="text" size="sm" icon={<Eye size={14} />} />
                    </div>
                    <div className="mt-2.5 space-y-1.5 border-t border-outline-variant/40 pt-2.5">
                      {m.modulos.map((mod: any, mIdx: number) => {
                        const modTotal = mod.unidades.length;
                        const modFin = mod.unidades.filter((u: any) => u.estado === EstadoUnidad.FINALIZADA).length;
                        const modPct = modTotal > 0 ? Math.round((modFin / modTotal) * 100) : 0;
                        return (
                          <div key={mIdx} className="flex items-center gap-2">
                            <span className="text-label-small text-on-surface-variant w-2/5 truncate">{mod.nombre}</span>
                            <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", modPct === 100 ? "bg-primary" : "bg-tertiary")} style={{ width: `${modPct}%` }} />
                            </div>
                            <span className="text-label-small text-on-surface-variant font-mono w-8 text-right">{modPct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card variant="filled" className="p-4 bg-gradient-to-br from-primary to-primary/80 text-on-primary overflow-hidden relative group">
            <div className="relative z-10 space-y-1.5">
              <TrendingUp size={36} className="text-on-primary/20 mb-2 group-hover:scale-105 transition-transform" />
              <h3 className="text-title-small font-black uppercase tracking-tight">Resumen Metodológico</h3>
              <p className="text-on-primary/70 text-body-small leading-relaxed max-w-[200px]">
                {unidadesCriticas.length > 0
                  ? `${unidadesCriticas.length} unidad(es) por finalizar en los próximos 3 días.`
                  : 'Todas las unidades están al día.'}
              </p>
              <div className="flex items-center gap-1.5 font-black text-headline-small pt-1">
                {chartData.reduce((a, c) => a + c.completado, 0)} / {chartData.reduce((a, c) => a + c.completado + c.progreso + c.pendiente, 0)}
                <span className="text-label-small font-black uppercase text-on-primary/75 bg-on-primary/10 px-1.5 py-0.5 rounded">Unidades</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-on-primary/5 rounded-full blur-2xl" />
          </Card>

          <Button
            variant="elevated"
            className="w-full"
            onClick={() => navigate('/memorandum')}
            icon={<FileText size={14} />}
          >
            Nuevo Memorándum
          </Button>
        </div>
      </div>

      <PanelNotificaciones open={showNotifPanel} onClose={() => setShowNotifPanel(false)} />
    </div>
  );
};

export default Dashboard;
