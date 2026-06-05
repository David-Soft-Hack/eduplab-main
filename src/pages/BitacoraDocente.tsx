import React, { useState, useMemo, useCallback } from 'react';
import {
  FileText, CheckCircle2, XCircle, Calendar, BookOpen,
  Clock, ChevronLeft, ChevronRight, Sparkles, Save,
  Timer, Sun, Moon, Sunset, List, Zap, Hourglass
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { EstadoUnidad, UnidadDidactica, Dosificacion, ModuloMemorandum, Memorandum, Turno, EntradaCalendario, ConfiguracionFrecuencia } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { generarCalendario } from '../lib/dosificacionEngine';

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const PRECONFIGURED_HOLIDAYS: { dateStr: string; name: string }[] = [
  { dateStr: '01-01', name: 'Año Nuevo' },
  { dateStr: '01-18', name: 'Día de la Autonomía de la Costa Caribe' },
  { dateStr: '05-01', name: 'Día del Trabajador' },
  { dateStr: '05-30', name: 'Día de las Madres' },
  { dateStr: '07-19', name: 'Día del Triunfo de la Revolución' },
  { dateStr: '09-14', name: 'Batalla de San Jacinto' },
  { dateStr: '09-15', name: 'Día de la Independencia de Centroamérica' },
  { dateStr: '12-08', name: 'Día de la Gritería' },
  { dateStr: '12-25', name: 'Día de Navidad' },
];

const TURNOS = [
  { value: Turno.MATUTINO, label: 'Matutino', icon: Sun, desc: '6:00 AM - 12:00 PM' },
  { value: Turno.VESPERTINO, label: 'Vespertino', icon: Sunset, desc: '1:00 PM - 6:00 PM' },
  { value: Turno.NOCTURNO, label: 'Nocturno', icon: Moon, desc: '6:00 PM - 10:00 PM' },
];

const BitacoraDocente: React.FC = () => {
  const { memorandums, dosificaciones, setDosificaciones } = useAppContext();
  const [selectedMemId, setSelectedMemId] = useState('');
  const [selectedModIdx, setSelectedModIdx] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editableHours, setEditableHours] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  const [turno, setTurno] = useState<Turno>(Turno.MATUTINO);
  const [diasClase, setDiasClase] = useState<string[]>(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
  const [horasSesion, setHorasSesion] = useState(4);
  const [usarHorasReloj, setUsarHorasReloj] = useState(false);
  const [customHolidays] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('eduplan_custom_holidays');
      if (saved) return JSON.parse(saved).map((h: any) => h.date);
    } catch {}
    return [];
  });
  const [selectedFeriados, setSelectedFeriados] = useState<string[]>(() => {
    const today = new Date();
    return PRECONFIGURED_HOLIDAYS
      .map(h => `${today.getFullYear()}-${h.dateStr}`)
      .concat(customHolidays);
  });

  const [calendarioGenerado, setCalendarioGenerado] = useState<EntradaCalendario[] | null>(null);
  const [showConfig, setShowConfig] = useState(true);

  const memorandumsActivos = useMemo(() =>
    memorandums.filter(m => m.estado === 'ACTIVO'),
    [memorandums]
  );

  const selectedMem = useMemo(() =>
    memorandumsActivos.find(m => m.id === selectedMemId),
    [memorandumsActivos, selectedMemId]
  );

  const selectedMod: ModuloMemorandum | null = useMemo(() => {
    if (!selectedMem) return null;
    return selectedMem.modulos[selectedModIdx] || null;
  }, [selectedMem, selectedModIdx]);

  const units = useMemo(() => selectedMod?.unidades || [], [selectedMod]);

  const horasAsignadasTotal = useMemo(() =>
    Object.values(editableHours).reduce((a, b) => a + b, 0),
    [editableHours]
  );

  const horasEsperadas = selectedMod?.horasTotales || 0;
  const isValid = horasAsignadasTotal === horasEsperadas && horasEsperadas > 0;
  const diff = horasAsignadasTotal - horasEsperadas;

  const existingDosif = useMemo(() =>
    dosificaciones.find(d => d.memorandumId === selectedMemId && d.moduloId === selectedMod?.codModule),
    [dosificaciones, selectedMemId, selectedMod]
  );

  const feriadosCombinados = useMemo(() => {
    const feriadosFijos = PRECONFIGURED_HOLIDAYS.map(h => {
      const year = selectedMem ? new Date(selectedMem.fechaInicio).getFullYear() : new Date().getFullYear();
      return `${year}-${h.dateStr}`;
    });
    return [...feriadosFijos, ...customHolidays];
  }, [selectedMem, customHolidays]);

  const loadExistingConfig = useCallback(() => {
    if (!existingDosif) return;
    if (existingDosif.turno) setTurno(existingDosif.turno);
    if (existingDosif.configFrecuencia) {
      setDiasClase(existingDosif.configFrecuencia.diasClase);
      setHorasSesion(existingDosif.configFrecuencia.horasSesion);
      setUsarHorasReloj(existingDosif.configFrecuencia.usarHorasReloj);
      setSelectedFeriados(existingDosif.configFrecuencia.fechasFeriadas);
    }
    if (existingDosif.calendario) setCalendarioGenerado(existingDosif.calendario);
  }, [existingDosif]);

  React.useEffect(() => {
    const init: Record<string, number> = {};
    units.forEach(u => {
      const existingUnit = existingDosif?.unidades.find(eu => eu.id === u.id);
      init[u.id] = existingUnit?.horasAsignadas ?? u.horasAsignadas;
    });
    setEditableHours(init);
    setCalendarioGenerado(null);
    setSaved(false);
    loadExistingConfig();
  }, [selectedMemId, selectedModIdx, existingDosif, units, loadExistingConfig]);

  const calendarDays = useMemo(() => {
    if (!selectedMod || units.length === 0) return [];
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const unidadesHoy = units.filter(u => {
        const fi = parseISO(u.fechaInicio);
        const ff = parseISO(u.fechaFin);
        return day >= fi && day <= ff;
      });
      const sesionesHoy = calendarioGenerado?.filter(s => s.fecha === dateStr) || [];
      return { date: day, unidades: unidadesHoy, sesiones: sesionesHoy };
    });
  }, [currentMonth, units, selectedMod, calendarioGenerado]);

  const emptyCols = calendarDays.length > 0 ? getDay(calendarDays[0].date) : 0;

  const toggleDiaClase = (dia: string) => {
    setDiasClase(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  const toggleFeriado = (fecha: string) => {
    setSelectedFeriados(prev =>
      prev.includes(fecha) ? prev.filter(f => f !== fecha) : [...prev, fecha]
    );
  };

  const handleGenerate = () => {
    if (!selectedMod || !isValid) return;
    const firstUnitStart = units[0]?.fechaInicio || selectedMem?.fechaInicio || new Date().toISOString().split('T')[0];
    const result = generarCalendario({
      units: units.map(u => ({ ...u, horasAsignadas: editableHours[u.id] ?? u.horasAsignadas })),
      fechaInicio: firstUnitStart,
      diasClase,
      horasSesion,
      fechasFeriadas: selectedFeriados,
      usarHorasReloj,
    });
    setCalendarioGenerado(result);
  };

  const handleSave = () => {
    if (!selectedMem || !selectedMod || !isValid) return;

    const updatedUnidades = units.map(u => ({
      ...u,
      horasAsignadas: editableHours[u.id] ?? u.horasAsignadas,
    }));

    const existingIdx = dosificaciones.findIndex(
      d => d.memorandumId === selectedMemId && d.moduloId === selectedMod.codModule
    );

    const configFrecuencia: ConfiguracionFrecuencia = {
      diasClase,
      horasSesion,
      usarHorasReloj,
      turno,
      fechasFeriadas: selectedFeriados,
    };

    const dosif: Dosificacion = {
      id: existingIdx >= 0 ? dosificaciones[existingIdx].id : `DOS-${selectedMem.id}-${selectedMod.codModule}`,
      memorandumId: selectedMem.id,
      docenteId: selectedMem.docenteId,
      docenteNombre: selectedMem.docenteNombre,
      moduloId: selectedMod.codModule,
      moduloNombre: selectedMod.nombre,
      unidades: updatedUnidades,
      fechaCreacion: existingIdx >= 0 ? dosificaciones[existingIdx].fechaCreacion : new Date().toISOString().split('T')[0],
      turno,
      configFrecuencia,
      calendario: calendarioGenerado || undefined,
    };

    if (existingIdx >= 0) {
      setDosificaciones(prev => prev.map((d, i) => i === existingIdx ? dosif : d));
    } else {
      setDosificaciones(prev => [...prev, dosif]);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const totalSesiones = calendarioGenerado?.length || 0;
  const totalHorasCalendario = calendarioGenerado?.reduce((a, s) => a + s.horas, 0) || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      <header className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-teal-100 rounded-xl text-teal-700">
            <FileText size={24} />
          </div>
          <div>
            <span className="px-2 py-0.5 text-[8px] font-black text-teal-600 bg-teal-50 border border-teal-100 rounded-full tracking-widest uppercase inline-flex items-center gap-1 mb-1">
              <Sparkles size={9} /> Dosificación Didáctica
            </span>
            <h1 className="text-xl font-black text-slate-800">Planificación de Unidades</h1>
            <p className="text-slate-500 text-xs">Distribuya las horas y genere el calendario de clases</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Memorándum</label>
            <select
              value={selectedMemId}
              onChange={e => { setSelectedMemId(e.target.value); setSelectedModIdx(0); }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-teal-500"
            >
              <option value="">Seleccionar memorándum...</option>
              {memorandumsActivos.map(m => (
                <option key={m.id} value={m.id}>{m.docenteNombre} — {m.programa}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Módulo</label>
            <select
              value={selectedModIdx}
              onChange={e => setSelectedModIdx(parseInt(e.target.value))}
              disabled={!selectedMem}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-teal-500 disabled:opacity-40"
            >
              {selectedMem?.modulos.map((mod, idx) => (
                <option key={idx} value={idx}>{mod.nombre} ({mod.horasTotales}h)</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            {selectedMod && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 w-full">
                <Clock size={14} className="text-teal-600" />
                Horas totales: <span className="text-teal-700">{selectedMod.horasTotales}h</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {selectedMod && units.length > 0 ? (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="w-full p-4 flex items-center justify-between border-b border-slate-100 hover:bg-slate-50/50 transition-all"
            >
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-teal-600" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Configuración de Frecuencia</span>
              </div>
              <ChevronRight size={14} className={cn("text-slate-400 transition-transform", showConfig && "rotate-90")} />
            </button>

            {showConfig && (
              <div className="p-4 sm:p-5 space-y-5">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">Turno</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TURNOS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTurno(t.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                          turno === t.value
                            ? "border-teal-500 bg-teal-50 text-teal-700"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        )}
                      >
                        <t.icon size={20} />
                        <span className="text-[10px] font-black">{t.label}</span>
                        <span className="text-[7px] text-slate-400 font-semibold">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">Días de Clase</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map(d => (
                      <button
                        key={d}
                        onClick={() => toggleDiaClase(d)}
                        className={cn(
                          "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                          diasClase.includes(d)
                            ? "bg-teal-600 border-teal-600 text-white"
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                        )}
                      >
                        {d.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Horas por Sesión</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={horasSesion}
                      onChange={e => setHorasSesion(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Tipo de Hora</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setUsarHorasReloj(false)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all",
                          !usarHorasReloj
                            ? "bg-teal-50 border-teal-500 text-teal-700"
                            : "bg-white border-slate-200 text-slate-500"
                        )}
                      >
                        <Hourglass size={14} /> Académica (45 min)
                      </button>
                      <button
                        onClick={() => setUsarHorasReloj(true)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all",
                          usarHorasReloj
                            ? "bg-teal-50 border-teal-500 text-teal-700"
                            : "bg-white border-slate-200 text-slate-500"
                        )}
                      >
                        <Clock size={14} /> Reloj (60 min)
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">Fechas Feriadas</label>
                  <div className="flex flex-wrap gap-1.5">
                    {feriadosCombinados.map(f => {
                      const holidayName = PRECONFIGURED_HOLIDAYS.find(h => f.endsWith(h.dateStr))?.name || f;
                      return (
                        <button
                          key={f}
                          onClick={() => toggleFeriado(f)}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition-all border",
                            selectedFeriados.includes(f)
                              ? "bg-red-50 border-red-300 text-red-700"
                              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                          )}
                        >
                          {holidayName.length > 18 ? holidayName.substring(0, 18) + '…' : holidayName}
                        </button>
                      );
                    })}
                    {customHolidays.length === 0 && PRECONFIGURED_HOLIDAYS.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">Sin feriados configurados</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-teal-600" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {format(currentMonth, "MMMM yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-2 py-1 text-[9px] font-black text-slate-500 hover:bg-slate-100 rounded-lg transition-all uppercase tracking-wider"
                >
                  Hoy
                </button>
                <button
                  onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-7 gap-px">
                {DAY_LABELS.map(d => (
                  <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-wider py-1.5">
                    {d}
                  </div>
                ))}
                {Array.from({ length: emptyCols }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[60px] bg-slate-50/50 rounded-lg" />
                ))}
                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[60px] p-1.5 rounded-lg border text-[10px] transition-all",
                      day.sesiones.length > 0
                        ? "bg-teal-100/50 border-teal-300"
                        : day.unidades.length > 0
                          ? "bg-teal-50/70 border-teal-200"
                          : "bg-white border-slate-100",
                      isSameDay(day.date, new Date()) && "ring-2 ring-teal-500/30"
                    )}
                  >
                    <span className={cn(
                      "font-black text-[9px]",
                      isSameDay(day.date, new Date()) ? "text-teal-700" : "text-slate-500"
                    )}>
                      {format(day.date, 'd')}
                    </span>
                    {day.sesiones.length > 0 ? (
                      <div className="mt-0.5 space-y-0.5">
                        {day.sesiones.map((s, sIdx) => (
                          <div
                            key={sIdx}
                            className="text-[6px] leading-tight px-1 py-0.5 rounded font-bold bg-teal-600 text-white truncate"
                            title={`${s.nombreUnidad} (${s.horas}h)`}
                          >
                            {s.horas}h {s.nombreUnidad.length > 8 ? s.nombreUnidad.substring(0, 8) + '…' : s.nombreUnidad}
                          </div>
                        ))}
                      </div>
                    ) : (
                      day.unidades.map((u, uIdx) => (
                        <div
                          key={uIdx}
                          className={cn(
                            "mt-0.5 text-[7px] leading-tight px-1 py-0.5 rounded font-semibold truncate",
                            u.estado === EstadoUnidad.FINALIZADA ? "bg-teal-100 text-teal-700" :
                            u.estado === EstadoUnidad.EN_PROGRESO ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-500"
                          )}
                          title={u.nombre}
                        >
                          {u.nombre.length > 12 ? u.nombre.substring(0, 12) + '…' : u.nombre}
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Distribución de Horas por Unidad
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Asigne las horas que corresponden a cada unidad didáctica</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Unidad</th>
                    <th className="text-center px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="text-center px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Fechas</th>
                    <th className="text-center px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider w-28">Horas Asignadas</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u, idx) => (
                    <tr key={u.id} className={cn("border-b border-slate-50", idx % 2 === 0 ? "bg-white" : "bg-slate-50/30")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-5 h-5 rounded flex items-center justify-center text-[8px] font-black text-white",
                            u.estado === EstadoUnidad.FINALIZADA ? "bg-teal-600" :
                            u.estado === EstadoUnidad.EN_PROGRESO ? "bg-amber-500" : "bg-slate-400"
                          )}>
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-800">{u.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                          u.estado === EstadoUnidad.FINALIZADA ? "bg-teal-100 text-teal-700" :
                          u.estado === EstadoUnidad.EN_PROGRESO ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-500"
                        )}>
                          {u.estado === EstadoUnidad.FINALIZADA ? 'Completado' :
                           u.estado === EstadoUnidad.EN_PROGRESO ? 'En curso' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-[10px] text-slate-500">
                        {u.fechaInicio} → {u.fechaFin}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={horasEsperadas}
                          value={editableHours[u.id] ?? u.horasAsignadas}
                          onChange={e => setEditableHours(prev => ({
                            ...prev,
                            [u.id]: Math.max(0, parseInt(e.target.value) || 0),
                          }))}
                          className={cn(
                            "w-20 px-2 py-1.5 text-center text-xs font-bold rounded-lg border outline-teal-500 transition-all",
                            u.estado === EstadoUnidad.FINALIZADA
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                              : "bg-white text-slate-800 border-slate-200 focus:border-teal-400"
                          )}
                          disabled={u.estado === EstadoUnidad.FINALIZADA}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan={3} className="px-4 py-3 text-right text-[9px] font-black text-slate-500 uppercase tracking-wider">
                      Total Horas Asignadas:
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "text-sm font-black font-mono",
                        isValid ? "text-teal-700" : horasAsignadasTotal > horasEsperadas ? "text-red-600" : "text-amber-600"
                      )}>
                        {horasAsignadasTotal}h
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className={cn(
            "rounded-2xl border-2 p-5 flex items-center gap-4 transition-all",
            isValid
              ? "bg-teal-50 border-teal-400"
              : horasAsignadasTotal > 0
                ? "bg-red-50 border-red-300"
                : "bg-slate-50 border-slate-200"
          )}>
            {isValid ? (
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 size={28} className="text-teal-600" />
              </div>
            ) : (
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                horasAsignadasTotal > 0 ? "bg-red-100" : "bg-slate-200"
              )}>
                <XCircle size={28} className={horasAsignadasTotal > 0 ? "text-red-500" : "text-slate-400"} />
              </div>
            )}
            <div className="flex-1">
              {isValid ? (
                <>
                  <h3 className="text-sm font-black text-teal-800">Validación de Carga Horaria: ✅ CUMPLIDA</h3>
                  <p className="text-xs text-teal-600 font-semibold mt-0.5">
                    Las horas asignadas ({horasAsignadasTotal}h) coinciden exactamente con las horas totales del módulo ({horasEsperadas}h).
                  </p>
                </>
              ) : horasAsignadasTotal > 0 ? (
                <>
                  <h3 className="text-sm font-black text-red-700">❌ DISCREPANCIA EN CARGA HORARIA</h3>
                  <p className="text-xs text-red-600 font-semibold mt-0.5">
                    Total asignado: <strong className="font-black">{horasAsignadasTotal}h</strong> vs esperado: <strong className="font-black">{horasEsperadas}h</strong>
                    {diff > 0 ? ` (sobran ${diff}h)` : ` (faltan ${Math.abs(diff)}h)`}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-black text-slate-500">Validación de Carga Horaria: Pendiente</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Asigne las horas a cada unidad para validar la distribución.
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleGenerate}
                disabled={!isValid}
                className={cn(
                  "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm",
                  isValid
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                <Zap size={14} /> Generar Calendario
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid}
                className={cn(
                  "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm",
                  isValid
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                <Save size={14} />
                {saved ? 'Guardado' : existingDosif ? 'Actualizar' : 'Guardar Dosificación'}
              </button>
            </div>
          </div>

          {calendarioGenerado && calendarioGenerado.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List size={16} className="text-teal-600" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Calendario Generado
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-slate-500">
                    {totalSesiones} sesiones
                  </span>
                  <span className="text-[9px] font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    {totalHorasCalendario}h totales
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Fecha</th>
                      <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Día</th>
                      <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Unidad</th>
                      <th className="text-center px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Horas</th>
                      <th className="text-center px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Continuación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calendarioGenerado.map((s, idx) => {
                      const fecha = parseISO(s.fecha);
                      const dayName = DAY_LABELS[fecha.getDay()];
                      return (
                        <tr key={idx} className={cn("border-b border-slate-50", idx % 2 === 0 ? "bg-white" : "bg-slate-50/30")}>
                          <td className="px-4 py-2.5 font-bold text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                          <td className="px-4 py-2.5 font-bold text-slate-700 font-mono">{s.fecha}</td>
                          <td className="px-4 py-2.5 text-slate-500">{dayName}</td>
                          <td className="px-4 py-2.5 font-bold text-slate-800">{s.nombreUnidad.length > 30 ? s.nombreUnidad.substring(0, 30) + '…' : s.nombreUnidad}</td>
                          <td className="px-4 py-2.5 text-center font-black font-mono text-teal-700">{s.horas}h</td>
                          <td className="px-4 py-2.5 text-center">
                            {s.esContinuacion ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[8px] font-black uppercase tracking-wider">
                                Cont.
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : selectedMem ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-black text-slate-600">Sin unidades didácticas</h2>
          <p className="text-slate-400 text-sm mt-1">Este módulo no tiene unidades registradas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <FileText size={40} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-black text-slate-600">Seleccione un Memorándum</h2>
          <p className="text-slate-400 text-sm mt-1">Elija un memorándum activo para comenzar la dosificación.</p>
        </div>
      )}
    </div>
  );
};

export default BitacoraDocente;
