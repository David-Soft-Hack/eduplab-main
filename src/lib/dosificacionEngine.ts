import { UnidadDidactica, EntradaCalendario } from '../types';

const MAPA_DIAS: Record<string, number> = {
  'Domingo': 0,
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5,
  'Sábado': 6,
};

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getNextClassDate(
  fromDate: Date,
  diasClase: string[],
  fechasFeriadas: string[]
): Date {
  let date = new Date(fromDate);
  let guard = 0;
  while (guard < 1000) {
    const dayName = Object.entries(MAPA_DIAS).find(([, v]) => v === date.getDay())?.[0] || '';
    const dateStr = formatDate(date);
    if (diasClase.includes(dayName) && !fechasFeriadas.includes(dateStr)) {
      return date;
    }
    date.setDate(date.getDate() + 1);
    guard++;
  }
  return date;
}

export interface GenerarCalendarioInput {
  units: UnidadDidactica[];
  fechaInicio: string;
  diasClase: string[];
  horasSesion: number;
  fechasFeriadas?: string[];
  usarHorasReloj?: boolean;
}

export function generarCalendario(input: GenerarCalendarioInput): EntradaCalendario[] {
  const { units, fechaInicio, diasClase, horasSesion, fechasFeriadas = [], usarHorasReloj = false } = input;
  const schedule: EntradaCalendario[] = [];

  if (diasClase.length === 0 || units.length === 0) return schedule;

  let currentDate = getNextClassDate(new Date(fechaInicio), diasClase, fechasFeriadas);
  let currentSessionUsed = 0;
  let unitCounter = 0;

  for (const unit of units) {
    let pending = unit.horasAsignadas;
    if (pending <= 0) continue;
    let isContinuation = false;
    unitCounter++;

    while (pending > 0) {
      if (currentSessionUsed >= horasSesion) {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 1);
        currentDate = getNextClassDate(next, diasClase, fechasFeriadas);
        currentSessionUsed = 0;
      }

      const remaining = horasSesion - currentSessionUsed;
      const toAssign = Math.min(pending, remaining);

      schedule.push({
        fecha: formatDate(currentDate),
        codUnidad: unit.id,
        nombreUnidad: unit.nombre,
        horas: toAssign,
        esContinuacion: isContinuation,
      });

      currentSessionUsed += toAssign;
      pending -= toAssign;
      isContinuation = true;
    }
  }

  return schedule;
}
