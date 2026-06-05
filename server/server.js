import express from 'express';
import cors from 'cors';
import './database/db.js';
import { seedDatabase } from './database/seed.js';

import docentesRouter from './routes/docentes.js';
import programasRouter from './routes/programas.js';
import modulosRouter from './routes/modulos.js';
import memorandumsRouter from './routes/memorandums.js';
import unidadesRouter from './routes/unidades.js';
import dosificacionesRouter from './routes/dosificaciones.js';
import notificacionesRouter from './routes/notificaciones.js';

const app = express();
const PORT = process.env.WHATSAPP_PORT || 3002;

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'] }));
app.use(express.json());

app.get('/api/seed', (req, res) => {
  const seeded = seedDatabase();
  res.json({ seeded, message: seeded ? 'Base de datos sembrada con datos iniciales' : 'La base de datos ya contiene datos' });
});

app.use('/api/docentes', docentesRouter);
app.use('/api/programas', programasRouter);
app.use('/api/modulos', modulosRouter);
app.use('/api/memorandums', memorandumsRouter);
app.use('/api/unidades', unidadesRouter);
app.use('/api/dosificaciones', dosificacionesRouter);
app.use('/api/notificaciones', notificacionesRouter);

seedDatabase();

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});
