import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileSpreadsheet, Download, Filter, Calendar, User, BookOpen,
  CheckCircle2, Clock, AlertTriangle, Sparkles, Printer
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { EstadoUnidad } from '../types';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const GeneradorInformes: React.FC = () => {
  const { memorandums, teachers } = useAppContext();
  const [dateFilter, setDateFilter] = useState<'SEMANA' | 'MES' | 'TODOS'>('SEMANA');
  const [docenteFilter, setDocenteFilter] = useState('');
  const [carreraFilter, setCarreraFilter] = useState('');

  const programas = useMemo(() => {
    try {
      const saved = localStorage.getItem('eduplan_academic_programs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }, []);

  const today = new Date();
  const weekEnd = addDays(today, 7);
  const monthEnd = addDays(today, 30);

  const filteredReport = useMemo(() => {
    return memorandums
      .filter(m => !docenteFilter || m.docenteId === docenteFilter)
      .filter(m => !carreraFilter || m.programa === carreraFilter)
      .flatMap(m =>
        m.modulos.flatMap(mod => {
          const finalizadas = mod.unidades.filter(u => u.estado === EstadoUnidad.FINALIZADA);
          const enProgreso = mod.unidades.filter(u => u.estado === EstadoUnidad.EN_PROGRESO);
          const pendientes = mod.unidades.filter(u => u.estado === EstadoUnidad.PENDIENTE);

          const enRango = (u: { fechaFin: string }) => {
            const f = new Date(u.fechaFin);
            if (dateFilter === 'SEMANA') return f >= today && f <= weekEnd;
            if (dateFilter === 'MES') return f >= today && f <= monthEnd;
            return true;
          };

          const proximas = mod.unidades.filter(u => enRango(u) && u.estado !== EstadoUnidad.FINALIZADA);

          return {
            docente: m.docenteNombre,
            docenteId: m.docenteId,
            programa: m.programa,
            modulo: mod.nombre,
            totalUnidades: mod.unidades.length,
            finalizadas: finalizadas.length,
            enProgreso: enProgreso.length,
            pendientes: pendientes.length,
            proximasFinalizar: proximas,
            fechaFin: mod.unidades[mod.unidades.length - 1]?.fechaFin || '-',
          };
        })
      );
  }, [memorandums, dateFilter, docenteFilter, carreraFilter, today, weekEnd, monthEnd]);

  const handleExportCSV = () => {
    const headers = 'Docente,Programa,Módulo,Total Unidades,Finalizadas,En Progreso,Pendientes,Fecha Fin\n';
    const rows = filteredReport.map(r =>
      `"${r.docente}","${r.programa}","${r.modulo}",${r.totalUnidades},${r.finalizadas},${r.enProgreso},${r.pendientes},"${r.fechaFin}"`
    ).join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-metodologico-${format(today, 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm no-print">
        <div>
          <span className="px-2 py-0.5 text-[8px] font-black text-teal-600 bg-teal-50 border border-teal-100 rounded-full tracking-widest uppercase inline-flex items-center gap-1 mb-1">
            <Sparkles size={9} /> Generador de Informes
          </span>
          <h1 className="text-xl font-black text-slate-800">Reportes Metodológicos</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Estado de finalización de módulos y unidades didácticas
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
          >
            <Printer size={14} /> Imprimible
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 no-print">
        {(['SEMANA', 'MES', 'TODOS'] as const).map(f => (
          <button
            key={f}
            onClick={() => setDateFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
              dateFilter === f
                ? "bg-teal-600 border-teal-600 text-white"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            {f === 'SEMANA' ? 'Esta Semana' : f === 'MES' ? 'Este Mes' : 'Todos'}
          </button>
        ))}
        <div className="w-px bg-slate-200 mx-1" />
        <select
          value={docenteFilter}
          onChange={e => setDocenteFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 outline-teal-500"
        >
          <option value="">Todos los docentes</option>
          {teachers.map((t: any) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
        <select
          value={carreraFilter}
          onChange={e => setCarreraFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 outline-teal-500"
        >
          <option value="">Todos los programas</option>
          {[...new Set(memorandums.map(m => m.programa))].sort().map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <span className="px-3 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-500 flex items-center gap-1">
          <Filter size={12} /> {filteredReport.length} resultados
        </span>
      </div>

      <div className="print-area">
        {filteredReport.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
            <FileSpreadsheet size={40} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-black text-slate-700">Sin datos para el período</h2>
            <p className="text-slate-400 text-sm mt-1">No hay módulos que finalicen en el rango seleccionado.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReport.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        {item.programa}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold">{item.docente}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-800 mt-1">{item.modulo}</h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Progreso</span>
                      <span className="text-lg font-black text-slate-800">
                        {item.totalUnidades > 0 ? Math.round((item.finalizadas / item.totalUnidades) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-center">
                    <span className="text-[8px] font-black text-teal-600 uppercase block">Finalizadas</span>
                    <span className="text-lg font-black text-teal-700">{item.finalizadas}</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
                    <span className="text-[8px] font-black text-amber-600 uppercase block">En Progreso</span>
                    <span className="text-lg font-black text-amber-700">{item.enProgreso}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase block">Pendientes</span>
                    <span className="text-lg font-black text-slate-600">{item.pendientes}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Fin estimado: {item.fechaFin}</span>
                    {item.proximasFinalizar.length > 0 && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-amber-600">
                        <AlertTriangle size={10} />
                        {item.proximasFinalizar.length} unidad(es) por finalizar
                      </span>
                    )}
                  </div>
                  {item.proximasFinalizar.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.proximasFinalizar.map((u, uIdx) => (
                        <span key={uIdx} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-bold border border-amber-200">
                          {u.nombre} — {u.fechaFin}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneradorInformes;
