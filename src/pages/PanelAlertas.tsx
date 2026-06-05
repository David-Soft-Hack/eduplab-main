import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, Clock, Bell, CheckCircle2, Send, User, BookOpen,
  Calendar, ArrowRight, Sparkles, Filter, X, CheckCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { EstadoUnidad, UnidadDidactica, TipoNotificacion, EstadoNotificacion } from '../types';
import { crearAlertaPrevia, notificacionesNoLeidas } from '../lib/notificacionEngine';

const PanelAlertas: React.FC = () => {
  const { memorandums, notifications, setNotifications } = useAppContext();
  const [filterType, setFilterType] = useState<'TODAS' | 'CRITICAS' | 'PROXIMAS'>('TODAS');
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const unidadesEnAlerta = useMemo(() => {
    const result: { docente: string; docenteId: string; modulo: string; unidad: UnidadDidactica; diff: number; mensajeCritico: string }[] = [];
    memorandums.forEach(m => m.modulos.forEach(mod => mod.unidades.forEach(u => {
      if (u.estado === EstadoUnidad.EN_PROGRESO) {
        const diff = Math.ceil((new Date(u.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 3) {
          const mensajeCritico = diff <= 1
            ? `🔴 CRÍTICA: Unidad finaliza en ${diff === 0 ? 'menos de 1' : diff} día${diff !== 1 ? 's' : ''} y está EN_PROGRESO`
            : `⚠️ Alerta: Unidad finaliza en ${diff} días (48-72h) y está EN_PROGRESO`;
          result.push({ docente: m.docenteNombre, docenteId: m.docenteId, modulo: mod.nombre, unidad: u, diff, mensajeCritico });
        }
      }
    })));
    return result.sort((a, b) => a.diff - b.diff);
  }, [memorandums]);

  const filtered = useMemo(() => {
    if (filterType === 'CRITICAS') return unidadesEnAlerta.filter(u => u.diff <= 1);
    if (filterType === 'PROXIMAS') return unidadesEnAlerta.filter(u => u.diff >= 2 && u.diff <= 3);
    return unidadesEnAlerta;
  }, [unidadesEnAlerta, filterType]);

  const handleNotify = (item: { docente: string; docenteId: string; modulo: string; unidad: UnidadDidactica }) => {
    if (notifiedIds.has(item.unidad.id)) return;
    const alerta = crearAlertaPrevia(item.docenteId, item.docente, item.modulo, item.unidad);
    const notificacionWhatsApp = {
      ...alerta,
      id: `NOT-WA-${Date.now()}`,
      canal: 'WHATSAPP' as const,
      estado: EstadoNotificacion.ENVIADA,
      mensaje: `📱 Notificación enviada a ${item.docente}: "${item.unidad.nombre}" finaliza pronto.`,
    };
    setNotifications(prev => [notificacionWhatsApp, ...prev]);
    setNotifiedIds(prev => new Set(prev).add(item.unidad.id));
    setToastMsg(`✅ Notificación enviada a ${item.docente}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleNotifyAll = () => {
    filtered.forEach(item => {
      if (!notifiedIds.has(item.unidad.id)) handleNotify(item);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="px-2 py-0.5 text-[8px] font-black text-red-600 bg-red-50 border border-red-100 rounded-full tracking-widest uppercase inline-flex items-center gap-1 mb-1">
            <Sparkles size={9} /> Panel de Alertas
          </span>
          <h1 className="text-xl font-black text-slate-800">Alertas Críticas</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Unidades didácticas próximas a finalizar (48-72h)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black font-mono">
            {unidadesEnAlerta.length} alertas activas
          </span>
        </div>
      </header>

      <div className="flex gap-2">
        {(['TODAS', 'CRITICAS', 'PROXIMAS'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
              filterType === f
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            {f === 'TODAS' ? 'Todas' : f === 'CRITICAS' ? 'Críticas (≤24h)' : 'Próximas (48-72h)'}
          </button>
        ))}
        <div className="flex-1" />
        {unidadesEnAlerta.length > 0 && (
          <button
            onClick={handleNotifyAll}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            <Send size={12} /> Notificar Todas
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-teal-600" />
          </div>
          <h2 className="text-lg font-black text-slate-700">Sin Alertas Activas</h2>
          <p className="text-slate-400 text-sm mt-1">No hay unidades próximas a finalizar en este momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <motion.div
              key={`${item.unidad.id}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "bg-white rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm transition-all",
                item.diff <= 1 ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl shrink-0",
                item.diff <= 1 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
              )}>
                {item.diff <= 1 ? <AlertTriangle size={20} /> : <Clock size={20} />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[9px] font-black mb-1 leading-tight",
                    item.diff <= 1 ? "text-red-600" : "text-amber-600"
                )}>
                  {item.mensajeCritico}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                    item.diff <= 1 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {item.diff === 0 ? 'VENCE HOY' : item.diff === 1 ? 'VENCE MAÑANA' : `${item.diff} DÍAS`}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">{item.unidad.fechaFin}</span>
                </div>
                <h3 className="text-sm font-black text-slate-800 mt-1 leading-tight">{item.unidad.nombre}</h3>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1"><User size={10} /> {item.docente}</span>
                  <span className="flex items-center gap-1"><BookOpen size={10} /> {item.modulo}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> {item.unidad.fechaInicio} → {item.unidad.fechaFin}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleNotify(item)}
                  disabled={notifiedIds.has(item.unidad.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                    notifiedIds.has(item.unidad.id)
                      ? "bg-teal-100 text-teal-700 border border-teal-200 cursor-default"
                      : "bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                  )}
                >
                  {notifiedIds.has(item.unidad.id) ? (
                    <><CheckCheck size={12} /> Notificado</>
                  ) : (
                    <><Bell size={12} /> Notificar</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 right-6 bg-teal-600 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-bold z-50 flex items-center gap-2"
        >
          <CheckCircle2 size={14} /> {toastMsg}
        </motion.div>
      )}
    </div>
  );
};

export default PanelAlertas;
