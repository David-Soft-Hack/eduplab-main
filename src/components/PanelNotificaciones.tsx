import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck, X, Calendar, AlertTriangle, CheckCircle, FileCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Notificacion, TipoNotificacion } from '../types';
import { marcarComoLeida, notificacionesNoLeidas } from '../lib/notificacionEngine';
import { cn } from '../lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
}

const iconMap: Record<TipoNotificacion, React.ElementType> = {
  [TipoNotificacion.FINALIZACION_UNIDAD]: CheckCircle,
  [TipoNotificacion.FINALIZACION_MODULO]: FileCheck,
  [TipoNotificacion.ALERTA_PREVIA]: AlertTriangle,
  [TipoNotificacion.RECORDATORIO]: Bell,
};

const colorMap: Record<TipoNotificacion, string> = {
  [TipoNotificacion.FINALIZACION_UNIDAD]: 'text-teal-500 bg-teal-500/10',
  [TipoNotificacion.FINALIZACION_MODULO]: 'text-blue-500 bg-blue-500/10',
  [TipoNotificacion.ALERTA_PREVIA]: 'text-amber-500 bg-amber-500/10',
  [TipoNotificacion.RECORDATORIO]: 'text-purple-500 bg-purple-500/10',
};

const PanelNotificaciones: React.FC<Props> = ({ open, onClose }) => {
  const { notifications, setNotifications } = useAppContext();

  const handleMarkRead = (n: Notificacion) => {
    setNotifications(prev => prev.map(item => item.id === n.id ? marcarComoLeida(item) : item));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => n.estado === 'PENDIENTE' || n.estado === 'ENVIADA' ? marcarComoLeida(n) : n));
  };

  const sorted = [...notifications].sort((a, b) => new Date(b.fechaNotificacion).getTime() - new Date(a.fechaNotificacion).getTime());

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative w-full max-w-md bg-metodologico-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-teal-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-tight">Notificaciones</h2>
                <span className="px-1.5 py-0.5 bg-teal-600 text-white text-[8px] font-black rounded-full">
                  {notificacionesNoLeidas(notifications)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleMarkAllRead}
                  className="p-1.5 text-slate-500 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-all text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Leer todas
                </button>
                <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell size={36} className="text-slate-700 mb-3" />
                  <p className="text-slate-500 text-xs font-bold">No hay notificaciones</p>
                  <p className="text-slate-600 text-[10px] mt-1">Las alertas de unidades y módulos aparecerán aquí.</p>
                </div>
              ) : (
                sorted.map(n => {
                  const Icon = iconMap[n.tipo] || Bell;
                  const isUnread = n.estado === 'PENDIENTE' || n.estado === 'ENVIADA';
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "p-3 rounded-xl border transition-all flex gap-3 items-start group",
                        isUnread ? "bg-slate-800/50 border-slate-700" : "bg-slate-900 border-slate-800/50 opacity-70"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg shrink-0", colorMap[n.tipo] || 'text-slate-500 bg-slate-800')}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs leading-snug", isUnread ? "text-slate-200" : "text-slate-500")}>
                          {n.mensaje}
                        </p>
                        <p className="text-[9px] text-slate-600 mt-1 font-mono">
                          {new Date(n.fechaNotificacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {isUnread && (
                        <button
                          onClick={() => handleMarkRead(n)}
                          className="p-1.5 text-slate-600 hover:text-teal-400 hover:bg-slate-700 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                          title="Marcar como leída"
                        >
                          <CheckCheck size={14} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PanelNotificaciones;
