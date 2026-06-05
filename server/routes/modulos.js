import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

router.get('/', (req, res) => {
  const modulos = db.prepare('SELECT * FROM modulos ORDER BY nombre').all();
  const enriched = modulos.map(m => {
    const units = db.prepare('SELECT * FROM modulos_units WHERE codModule = ?').all(m.id);
    const activities = db.prepare('SELECT * FROM modulos_activities WHERE codModule = ?').all(m.id);
    return { ...m, units, activities, cantidadUnidades: units.length };
  });
  res.json(enriched);
});

export default router;
