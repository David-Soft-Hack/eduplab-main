import { EstadoUnidad, Notificacion, TipoNotificacion, EstadoNotificacion, UnidadDidactica, ModuloMemorandum } from '../types';

let notifCounter = 0;

function generateId(): string {
  notifCounter++;
  return `NOT-${Date.now()}-${notifCounter}`;
}

export function crearNotificacionFinalizacionUnidad(
  docenteId: string,
  docenteNombre: string,
  moduloNombre: string,
  unidad: UnidadDidactica
): Notificacion {
  return {
    id: generateId(),
    tipo: TipoNotificacion.FINALIZACION_UNIDAD,
    docenteId,
    docenteNombre,
    moduloNombre,
    unidadNombre: unidad.nombre,
    fechaEvento: unidad.fechaFin,
    fechaNotificacion: new Date().toISOString(),
    estado: EstadoNotificacion.PENDIENTE,
    canal: 'CALENDARIO',
    mensaje: `${docenteNombre} ha finalizado la unidad "${unidad.nombre}" del módulo "${moduloNombre}".`,
    metadata: { codUnidad: unidad.id, codModule: unidad.codModule },
  };
}

export function crearNotificacionFinalizacionModulo(
  docenteId: string,
  docenteNombre: string,
  moduloNombre: string,
  modulos: ModuloMemorandum[]
): Notificacion | null {
  const modulo = modulos.find(m => m.nombre === moduloNombre);
  if (!modulo) return null;
  const todasFinalizadas = modulo.unidades.every(u => u.estado === EstadoUnidad.FINALIZADA);
  if (!todasFinalizadas) return null;
  return {
    id: generateId(),
    tipo: TipoNotificacion.FINALIZACION_MODULO,
    docenteId,
    docenteNombre,
    moduloNombre,
    fechaEvento: new Date().toISOString().split('T')[0],
    fechaNotificacion: new Date().toISOString(),
    estado: EstadoNotificacion.PENDIENTE,
    canal: 'CALENDARIO',
    mensaje: `¡Módulo "${moduloNombre}" completado! ${docenteNombre} ha finalizado todas las unidades del módulo.`,
    metadata: { codModule: modulo.codModule },
  };
}

export function crearAlertaPrevia(
  docenteId: string,
  docenteNombre: string,
  moduloNombre: string,
  unidad: UnidadDidactica
): Notificacion {
  return {
    id: generateId(),
    tipo: TipoNotificacion.ALERTA_PREVIA,
    docenteId,
    docenteNombre,
    moduloNombre,
    unidadNombre: unidad.nombre,
    fechaEvento: unidad.fechaFin,
    fechaNotificacion: new Date().toISOString(),
    estado: EstadoNotificacion.PENDIENTE,
    canal: 'PANEL',
    mensaje: `⚠️ La unidad "${unidad.nombre}" del módulo "${moduloNombre}" finaliza en menos de 3 días.`,
    metadata: { codUnidad: unidad.id, codModule: unidad.codModule },
  };
}

export function verificarAlertasPendientes(unidades: UnidadDidactica[]): UnidadDidactica[] {
  const hoy = new Date();
  return unidades.filter(u => {
    if (u.estado !== EstadoUnidad.EN_PROGRESO) return false;
    const fechaFin = new Date(u.fechaFin);
    const diff = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  });
}

export function marcarComoLeida(notificacion: Notificacion): Notificacion {
  return { ...notificacion, estado: EstadoNotificacion.LEIDA, fechaLeida: new Date().toISOString() };
}

export function notificacionesNoLeidas(notificaciones: Notificacion[]): number {
  return notificaciones.filter(n => n.estado === EstadoNotificacion.PENDIENTE || n.estado === EstadoNotificacion.ENVIADA).length;
}
