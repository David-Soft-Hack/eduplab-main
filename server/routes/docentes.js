import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM docentes ORDER BY nombre').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM docentes WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Docente no encontrado' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { nombre, email, telefono, carrera, especialidad, estado } = req.body;
  if (!nombre || !email) return res.status(400).json({ error: 'Nombre y email requeridos' });
  const id = `DOC-${Date.now()}`;
  const fechaRegistro = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO docentes (id, nombre, email, telefono, carrera, especialidad, estado, fechaRegistro) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, nombre, email, telefono || null, carrera || null, especialidad || null, estado || 'Activo', fechaRegistro);
  res.status(201).json({ id, nombre, email, telefono, carrera, especialidad, estado: estado || 'Activo', fechaRegistro });
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM docentes WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Docente no encontrado' });
  const { nombre, email, telefono, carrera, especialidad, estado } = req.body;
  db.prepare('UPDATE docentes SET nombre = ?, email = ?, telefono = ?, carrera = ?, especialidad = ?, estado = ? WHERE id = ?')
    .run(nombre || existing.nombre, email || existing.email, telefono !== undefined ? telefono : existing.telefono, carrera !== undefined ? carrera : existing.carrera, especialidad !== undefined ? especialidad : existing.especialidad, estado || existing.estado, req.params.id);
  res.json(db.prepare('SELECT * FROM docentes WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM docentes WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Docente no encontrado' });
  db.prepare('DELETE FROM docentes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Docente eliminado', id: req.params.id });
});

export default router;
