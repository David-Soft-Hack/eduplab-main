import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM unidades ORDER BY fechaInicio').all();
  res.json(rows);
});

export default router;
