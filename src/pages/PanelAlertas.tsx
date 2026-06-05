import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Clock, Bell, CheckCircle2, Send, User, BookOpen, Calendar, Filter, CheckCheck, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { EstadoUnidad, EstadoNotificacion } from '../types';
import { crearAlertaPrevia } from '../lib/notificacionEngine';

const PanelAlertas: React.FC = () => {
  const { memorandums, notifications, setNotifications } = useAppContext();
  const [filterType, setFilterType] = useState<'TODAS' | 'CRITICAS' | 'PROXIMAS'>('TODAS');
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const unidadesEnAlerta = useMemo(() => {
    const result: { docente: string; docenteId: string; modulo: string; unidad: any; diff: number; mensajeCritico: string }[] = [];
    memorandums.forEach(m => m.modulos.forEach(mod => mod.unidades.forEach(u => {
      if (u.estado === EstadoUnidad.EN_PROGRESO) {
        const diff = Math.ceil((new Date(u.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 3) {
          const mensajeCritico = diff <= 1
            ? `CRÍTICA: Unidad finaliza en ${diff === 0 ? 'menos de 1' : diff} día${diff !== 1 ? 's' : ''} y está EN_PROGRESO`
            : `Alerta: Unidad finaliza en ${diff} días (48-72h) y está EN_PROGRESO`;
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

  const handleNotify = (item: { docente: string; docenteId: string; modulo: string; unidad: any }) => {
    if (notifiedIds.has(item.unidad.id)) return;
    const alerta = crearAlertaPrevia(item.docenteId, item.docente, item.modulo, item.unidad);
    const notificacion = {
      ...alerta,
      id: `NOT-${Date.now()}`,
      canal: 'PANEL' as const,
      estado: EstadoNotificacion.ENVIADA,
      mensaje: `Notificación enviada a ${item.docente}: "${item.unidad.nombre}" finaliza pronto.`,
    };
    setNotifications(prev => [notificacion, ...prev]);
    setNotifiedIds(prev => new Set(prev).add(item.unidad.id));
    setToastMsg(`✅ Notificación enviada a ${item.docente}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleNotifyAll = () => {
    filtered.forEach(item => { if (!notifiedIds.has(item.unidad.id)) handleNotify(item); });
  };

  return (
    <div className="space-y-6 pb-16">
      <Card variant="filled" className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-label-small text-error font-bold uppercase tracking-widest flex items-center gap-1 mb-1">
              Panel de Alertas
            </span>
            <h1 className="text-headline-small text-on-surface font-display">Alertas Críticas</h1>
            <p className="text-body-small text-on-surface-variant mt-1">
              Unidades didácticas próximas a finalizar (48-72h)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge count={unidadesEnAlerta.length} />
            <span className="text-label-medium text-on-surface-variant">alertas activas</span>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 flex-wrap items-center">
        {(['TODAS', 'CRITICAS', 'PROXIMAS'] as const).map(f => (
          <Chip
            key={f}
            variant="filter"
            selected={filterType === f}
            label={f === 'TODAS' ? 'Todas' : f === 'CRITICAS' ? 'Críticas (≤24h)' : 'Próximas (48-72h)'}
            onClick={() => setFilterType(f)}
            icon={f === 'TODAS' ? <Filter size={14} /> : undefined}
          />
        ))}
        <div className="flex-1" />
        {unidadesEnAlerta.length > 0 && (
          <>
            <Button variant="filled" size="sm" icon={<Send size={12} />} onClick={handleNotifyAll}>
              Notificar Todas
            </Button>
            <Chip variant="filter" selected={false} label="WhatsApp: Próximamente" icon={<MessageCircle size={14} />} className="opacity-60 cursor-default" />
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card variant="elevated" className="p-8 text-center">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-on-primary-container" />
          </div>
          <h2 className="text-title-large text-on-surface font-display">Sin Alertas Activas</h2>
          <p className="text-body-medium text-on-surface-variant mt-1">No hay unidades próximas a finalizar en este momento.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <motion.div
              key={`${item.unidad.id}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card
                variant="outlined"
                className={cn(
                  "p-4 flex flex-col sm:flex-row sm:items-center gap-4",
                  item.diff <= 1 ? "border-error" : "border-tertiary-container"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl shrink-0",
                  item.diff <= 1 ? "bg-error-container text-error" : "bg-tertiary-container text-tertiary"
                )}>
                  {item.diff <= 1 ? <AlertTriangle size={20} /> : <Clock size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn("text-label-medium font-bold mb-1", item.diff <= 1 ? "text-error" : "text-tertiary")}>
                    {item.mensajeCritico}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-label-small",
                      item.diff <= 1 ? "bg-error-container text-on-error-container" : "bg-tertiary-container text-on-tertiary-container"
                    )}>
                      {item.diff === 0 ? 'VENCE HOY' : item.diff === 1 ? 'VENCE MAÑANA' : `${item.diff} DÍAS`}
                    </span>
                    <span className="text-body-small text-on-surface-variant">{item.unidad.fechaFin}</span>
                  </div>
                  <h3 className="text-title-small text-on-surface mt-1 leading-tight">{item.unidad.nombre}</h3>
                  <div className="flex items-center gap-3 mt-1 text-body-small text-on-surface-variant">
                    <span className="flex items-center gap-1"><User size={10} /> {item.docente}</span>
                    <span className="flex items-center gap-1"><BookOpen size={10} /> {item.modulo}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {item.unidad.fechaInicio} → {item.unidad.fechaFin}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="tonal"
                    size="sm"
                    icon={notifiedIds.has(item.unidad.id) ? <CheckCheck size={12} /> : <Bell size={12} />}
                    onClick={() => handleNotify(item)}
                    disabled={notifiedIds.has(item.unidad.id)}
                  >
                    {notifiedIds.has(item.unidad.id) ? 'Notificado' : 'Notificar'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 right-6 bg-primary text-on-primary px-3 py-2.5 rounded-xl shadow-elevation-level3 text-xs font-bold z-50 flex items-center gap-2"
        >
          <CheckCircle2 size={14} /> {toastMsg}
        </motion.div>
      )}
    </div>
  );
};

export default PanelAlertas;
