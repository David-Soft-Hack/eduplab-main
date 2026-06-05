import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Plus, Edit3, Trash2, Mail, Phone, BookOpen, Award, Loader2, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { Dialog } from '../components/ui/Dialog';
import { Chip } from '../components/ui/Chip';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';

const API = 'http://localhost:3002/api';

interface DocenteForm {
  nombre: string;
  email: string;
  telefono: string;
  carrera: string;
  especialidad: string;
  estado: 'Activo' | 'Inactivo';
}

const emptyForm: DocenteForm = {
  nombre: '',
  email: '',
  telefono: '',
  carrera: '',
  especialidad: '',
  estado: 'Activo',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Docentes: React.FC = () => {
  const { teachers, setTeachers } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'TODOS' | 'Activo' | 'Inactivo'>('TODOS');
  const [form, setForm] = useState<DocenteForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch = !searchTerm ||
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.carrera.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado = filterEstado === 'TODOS' || t.estado === filterEstado;
      return matchSearch && matchEstado;
    });
  }, [teachers, searchTerm, filterEstado]);

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setShowForm(true);
  };

  const handleOpenEdit = (t: any) => {
    setForm({
      nombre: t.nombre,
      email: t.email,
      telefono: t.telefono || '',
      carrera: t.carrera || '',
      especialidad: t.especialidad || '',
      estado: t.estado,
    });
    setEditingId(t.id);
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) { setFormError('El nombre es requerido'); return; }
    if (!form.email.trim()) { setFormError('El correo es requerido'); return; }
    if (!EMAIL_REGEX.test(form.email.trim())) { setFormError('Correo electrónico inválido'); return; }
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        const res = await fetch(`${API}/docentes/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Error al actualizar');
        const updated = await res.json();
        setTeachers(prev => prev.map(t => t.id === editingId ? updated : t));
      } else {
        const res = await fetch(`${API}/docentes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Error al crear');
        const created = await res.json();
        setTeachers(prev => [created, ...prev]);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API}/docentes/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setTeachers(prev => prev.filter(t => t.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-16">
      <Card variant="filled" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
        <div>
          <span className="text-label-small text-primary font-bold uppercase tracking-widest">Gestión Docente</span>
          <h1 className="text-headline-small text-on-surface font-display tracking-tight">Docentes</h1>
          <p className="text-body-small text-on-surface-variant mt-1">Administración de la planta docente del instituto</p>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Button variant="filled" size="sm" icon={<Plus size={14} />} onClick={handleOpenCreate}>
            Nuevo Docente
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 items-center">
        {(['TODOS', 'Activo', 'Inactivo'] as const).map(f => (
          <Chip
            key={f}
            variant="filter"
            selected={filterEstado === f}
            label={f === 'TODOS' ? 'Todos' : f}
            onClick={() => setFilterEstado(f)}
          />
        ))}
        <div className="flex-1" />
        <TextField
          variant="outlined"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar docente..."
          leadingIcon={<Search size={13} />}
          className="w-full sm:w-56"
        />
        <Badge count={filtered.length} />
        <span className="text-label-small text-on-surface-variant">{filtered.length === 1 ? '1 docente' : `${filtered.length} docentes`}</span>
      </div>

      {filtered.length === 0 ? (
        <Card variant="elevated" className="p-8 text-center">
          <Users size={40} className="text-on-surface-variant/30 mx-auto mb-4" />
          <h2 className="text-title-large text-on-surface font-display">
            {searchTerm || filterEstado !== 'TODOS' ? 'Sin resultados' : 'No hay docentes registrados'}
          </h2>
          <p className="text-body-medium text-on-surface-variant mt-1">
            {searchTerm || filterEstado !== 'TODOS'
              ? 'Intenta con otros términos de búsqueda.'
              : 'Agrega el primer docente para comenzar.'}
          </p>
          {!searchTerm && filterEstado === 'TODOS' && (
            <Button variant="tonal" size="sm" icon={<Plus size={14} />} onClick={handleOpenCreate} className="mt-4">
              Agregar Docente
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card variant="elevated" className="p-4 h-full flex flex-col">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
                    <span className="text-title-small text-on-primary-container font-bold">
                      {t.nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-title-small text-on-surface font-bold truncate">{t.nombre}</h3>
                    <div className="flex items-center gap-1 text-label-small text-on-surface-variant mt-0.5">
                      <Mail size={10} />
                      <span className="truncate">{t.email}</span>
                    </div>
                    {t.telefono && (
                      <div className="flex items-center gap-1 text-label-small text-on-surface-variant">
                        <Phone size={10} />
                        <span>{t.telefono}</span>
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-label-small font-bold',
                    t.estado === 'Activo' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-highest text-on-surface-variant',
                  )}>
                    {t.estado}
                  </span>
                </div>

                {(t.carrera || t.especialidad) && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/40 space-y-1">
                    {t.carrera && (
                      <div className="flex items-center gap-1.5 text-label-small text-on-surface-variant">
                        <BookOpen size={10} />
                        <span>{t.carrera}</span>
                      </div>
                    )}
                    {t.especialidad && (
                      <div className="flex items-center gap-1.5 text-label-small text-on-surface-variant">
                        <Award size={10} />
                        <span>{t.especialidad}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-outline-variant/40">
                  <Button variant="tonal" size="sm" icon={<Edit3 size={12} />} onClick={() => handleOpenEdit(t)} className="flex-1">
                    Editar
                  </Button>
                  <Button variant="text" size="sm" icon={<Trash2 size={12} />} onClick={() => setDeleteId(t.id)} className="text-error">
                    Eliminar
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog
        open={showForm}
        onClose={() => { if (!saving) setShowForm(false); }}
        title={editingId ? 'Editar Docente' : 'Nuevo Docente'}
        actions={
          <div className="flex gap-2 w-full">
            <Button variant="text" onClick={() => setShowForm(false)} disabled={saving} className="flex-1">Cancelar</Button>
            <Button
              variant="filled"
              onClick={handleSave}
              disabled={saving || !form.nombre.trim() || !form.email.trim()}
              icon={saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              className="flex-1"
            >
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="px-3 py-2 rounded-lg bg-error-container text-on-error-container text-body-small">
              {formError}
            </div>
          )}
          <TextField
            variant="outlined"
            label="Nombre completo *"
            value={form.nombre}
            onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
            fullWidth
          />
          <TextField
            variant="outlined"
            label="Correo electrónico *"
            type="email"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            fullWidth
          />
          <TextField
            variant="outlined"
            label="Teléfono"
            value={form.telefono}
            onChange={e => setForm(prev => ({ ...prev, telefono: e.target.value }))}
            fullWidth
          />
          <TextField
            variant="outlined"
            label="Carrera"
            value={form.carrera}
            onChange={e => setForm(prev => ({ ...prev, carrera: e.target.value }))}
            fullWidth
          />
          <TextField
            variant="outlined"
            label="Especialidad"
            value={form.especialidad}
            onChange={e => setForm(prev => ({ ...prev, especialidad: e.target.value }))}
            fullWidth
          />
          <div>
            <span className="text-label-medium text-on-surface-variant block mb-2">Estado</span>
            <div className="flex gap-2">
              {(['Activo', 'Inactivo'] as const).map(est => (
                <Chip
                  key={est}
                  variant="filter"
                  selected={form.estado === est}
                  label={est}
                  onClick={() => setForm(prev => ({ ...prev, estado: est }))}
                />
              ))}
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Eliminar docente"
        actions={
          <div className="flex gap-2 w-full">
            <Button variant="text" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
            <Button
              variant="filled"
              onClick={handleDelete}
              icon={<Trash2 size={14} />}
              className="flex-1 bg-error hover:bg-error/90"
            >
              Eliminar
            </Button>
          </div>
        }
      >
        <p className="text-body-medium text-on-surface-variant">
          ¿Estás seguro de eliminar a <strong className="text-on-surface">{teachers.find(t => t.id === deleteId)?.nombre}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </Dialog>
    </div>
  );
};

export default Docentes;
