import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

router.get('/', (req, res) => {
  const mems = db.prepare('SELECT * FROM memorandums ORDER BY fechaEmision DESC').all();
  const enriched = mems.map(m => {
    const unidades = db.prepare('SELECT * FROM unidades WHERE memorandumId = ? ORDER BY fechaInicio').all(m.id);
    const modMap = {};
    unidades.forEach(u => {
      if (!modMap[u.codModule]) {
        const modInfo = db.prepare('SELECT nombre, totalHoraAcademic as horasTotales FROM modulos WHERE id = ?').get(u.codModule);
        modMap[u.codModule] = { codModule: u.codModule, nombre: modInfo?.nombre || u.codModule, horasTotales: modInfo?.horasTotales || 0, unidades: [] };
      }
      modMap[u.codModule].unidades.push(u);
    });
    return { ...m, modulos: Object.values(modMap) };
  });
  res.json(enriched);
});

export default router;
