import { CheckCheck, Bell, Calendar, AlertTriangle, CheckCircle, FileCheck } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { List, ListItem } from './ui/List';
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
  [TipoNotificacion.FINALIZACION_UNIDAD]: 'text-primary bg-primary-container',
  [TipoNotificacion.FINALIZACION_MODULO]: 'text-secondary bg-secondary-container',
  [TipoNotificacion.ALERTA_PREVIA]: 'text-tertiary bg-tertiary-container',
  [TipoNotificacion.RECORDATORIO]: 'text-on-surface-variant bg-surface-container-high',
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
    <Dialog
      open={open}
      onClose={onClose}
      title="Notificaciones"
      actions={
        <div className="flex items-center gap-2">
          <Badge count={notificacionesNoLeidas(notifications)} />
          <Button variant="tonal" size="sm" icon={<CheckCheck size={14} />} onClick={handleMarkAllRead}>
            Leer todas
          </Button>
        </div>
      }
      className="max-w-md"
    >
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell size={36} className="text-on-surface-variant/30 mb-3" />
          <p className="text-body-medium text-on-surface-variant font-bold">No hay notificaciones</p>
          <p className="text-body-small text-on-surface-variant/60 mt-1">Las alertas de unidades y módulos aparecerán aquí.</p>
        </div>
      ) : (
        <List>
          {sorted.map(n => {
            const Icon = iconMap[n.tipo] || Bell;
            const isUnread = n.estado === 'PENDIENTE' || n.estado === 'ENVIADA';
            return (
              <ListItem
                key={n.id}
                headline={n.mensaje}
                supporting={new Date(n.fechaNotificacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                leading={
                  <div className={cn('p-2 rounded-lg', colorMap[n.tipo] || 'text-on-surface-variant bg-surface-container-high')}>
                    <Icon size={14} />
                  </div>
                }
                trailing={
                  isUnread ? (
                    <Button variant="text" size="sm" icon={<CheckCheck size={14} />} onClick={() => handleMarkRead(n)} />
                  ) : undefined
                }
                className={cn(isUnread ? '' : 'opacity-60')}
              />
            );
          })}
        </List>
      )}
    </Dialog>
  );
};

export default PanelNotificaciones;
