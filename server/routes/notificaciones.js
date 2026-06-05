import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM notificaciones ORDER BY fechaNotificacion DESC').all();
  const enriched = rows.map(n => ({
    ...n,
    metadata: n.metadata ? JSON.parse(n.metadata) : undefined,
  }));
  res.json(enriched);
});

router.post('/', (req, res) => {
  const { tipo, docenteId, docenteNombre, moduloNombre, unidadNombre, fechaEvento, estado, canal, mensaje, metadata } = req.body;
  const id = `NOT-${Date.now()}`;
  const fechaNotificacion = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO notificaciones (id, tipo, docenteId, docenteNombre, moduloNombre, unidadNombre, fechaEvento, fechaNotificacion, estado, canal, mensaje, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, tipo, docenteId, docenteNombre, moduloNombre || null, unidadNombre || null, fechaEvento, fechaNotificacion, estado || 'PENDIENTE', canal || 'PANEL', mensaje, metadata ? JSON.stringify(metadata) : null);
  res.status(201).json({ id, tipo, docenteId, docenteNombre, moduloNombre, unidadNombre, fechaEvento, fechaNotificacion, estado: estado || 'PENDIENTE', canal: canal || 'PANEL', mensaje, metadata });
});

export default router;
