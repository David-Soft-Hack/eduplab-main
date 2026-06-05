import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM dosificaciones ORDER BY fechaCreacion DESC').all();
  const enriched = rows.map(d => ({
    ...d,
    configFrecuencia: d.configFrecuencia ? JSON.parse(d.configFrecuencia) : null,
    unidades: db.prepare('SELECT * FROM unidades WHERE codModule = ? AND memorandumId = ?').all(d.moduloId, d.memorandumId),
  }));
  res.json(enriched);
});

export default router;
