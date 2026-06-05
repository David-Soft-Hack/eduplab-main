import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { FileSpreadsheet, Download, Filter, AlertTriangle, Printer } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useAppContext } from '../context/AppContext';
import { EstadoUnidad } from '../types';
import { format, addDays } from 'date-fns';

const GeneradorInformes: React.FC = () => {
  const { memorandums, teachers } = useAppContext();
  const [dateFilter, setDateFilter] = useState<'SEMANA' | 'MES' | 'TODOS'>('SEMANA');
  const [docenteFilter, setDocenteFilter] = useState('');
  const [carreraFilter, setCarreraFilter] = useState('');

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

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 pb-16">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <Card variant="filled" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 no-print">
        <div>
          <span className="text-label-small text-primary font-bold uppercase tracking-widest">Generador de Informes</span>
          <h1 className="text-headline-small text-on-surface font-display">Reportes Metodológicos</h1>
          <p className="text-body-small text-on-surface-variant mt-1">
            Estado de finalización de módulos y unidades didácticas
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outlined" size="sm" icon={<Printer size={14} />} onClick={handlePrint}>
            Imprimible
          </Button>
          <Button variant="filled" size="sm" icon={<Download size={14} />} onClick={handleExportCSV}>
            Exportar CSV
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 no-print items-center">
        {(['SEMANA', 'MES', 'TODOS'] as const).map(f => (
          <Chip
            key={f}
            variant="filter"
            selected={dateFilter === f}
            label={f === 'SEMANA' ? 'Esta Semana' : f === 'MES' ? 'Este Mes' : 'Todos'}
            onClick={() => setDateFilter(f)}
          />
        ))}
        <div className="w-px h-6 bg-outline-variant mx-2" />
        <select
          value={docenteFilter}
          onChange={e => setDocenteFilter(e.target.value)}
          className="h-9 px-3 bg-surface border border-outline-variant rounded-full text-label-small text-on-surface font-medium outline-primary"
        >
          <option value="">Todos los docentes</option>
          {teachers.map((t: any) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
        <select
          value={carreraFilter}
          onChange={e => setCarreraFilter(e.target.value)}
          className="h-9 px-3 bg-surface border border-outline-variant rounded-full text-label-small text-on-surface font-medium outline-primary"
        >
          <option value="">Todos los programas</option>
          {[...new Set(memorandums.map(m => m.programa))].sort().map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <Chip variant="assist" label={`${filteredReport.length} resultados`} icon={<Filter size={12} />} />
      </div>

      <div className="print-area">
        {filteredReport.length === 0 ? (
          <Card variant="elevated" className="p-8 text-center">
            <FileSpreadsheet size={40} className="text-on-surface-variant/30 mx-auto mb-4" />
            <h2 className="text-title-large text-on-surface font-display">Sin datos para el período</h2>
            <p className="text-body-medium text-on-surface-variant mt-1">No hay módulos que finalicen en el rango seleccionado.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredReport.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card variant="elevated" className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-label-small text-on-primary-container bg-primary-container px-2 py-0.5 rounded uppercase tracking-wider">
                          {item.programa}
                        </span>
                        <span className="text-label-small text-on-surface-variant">{item.docente}</span>
                      </div>
                      <h3 className="text-title-medium text-on-surface font-display mt-1">{item.modulo}</h3>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-label-small text-on-surface-variant uppercase block">Progreso</span>
                        <span className="text-title-large text-on-surface font-display">
                          {item.totalUnidades > 0 ? Math.round((item.finalizadas / item.totalUnidades) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    <div className="p-3 bg-primary-container rounded-xl border border-primary-container text-center">
                      <span className="text-label-small text-on-primary-container uppercase block">Finalizadas</span>
                      <span className="text-title-large text-on-primary-container font-display">{item.finalizadas}</span>
                    </div>
                    <div className="p-3 bg-tertiary-container rounded-xl border border-tertiary-container text-center">
                      <span className="text-label-small text-tertiary uppercase block">En Progreso</span>
                      <span className="text-title-large text-tertiary font-display">{item.enProgreso}</span>
                    </div>
                    <div className="p-3 bg-surface-container-highest rounded-xl border border-outline-variant text-center">
                      <span className="text-label-small text-on-surface-variant uppercase block">Pendientes</span>
                      <span className="text-title-large text-on-surface-variant font-display">{item.pendientes}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-outline-variant/40">
                    <div className="flex items-center justify-between">
                      <span className="text-label-small text-on-surface-variant uppercase">Fin estimado: {item.fechaFin}</span>
                      {item.proximasFinalizar.length > 0 && (
                        <span className="flex items-center gap-1 text-label-small text-tertiary">
                          <AlertTriangle size={10} />
                          {item.proximasFinalizar.length} unidad(es) por finalizar
                        </span>
                      )}
                    </div>
                    {item.proximasFinalizar.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.proximasFinalizar.map((u: any, uIdx: number) => (
                          <span key={uIdx} className="px-2 py-1 bg-tertiary-container text-on-tertiary-container rounded-lg text-label-small font-medium border border-tertiary-container">
                            {u.nombre} — {u.fechaFin}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneradorInformes;
