import express, { Request, Response, NextFunction } from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import prisma from './config/db';

import objectRoutes   from './routes/objectRoutes';
import aiRoutes       from './routes/aiRoutes';
import geofenceRoutes from './routes/geofenceRoutes';
import adminRoutes    from './routes/adminRoutes';
import { rateLimiter } from './middleware/rateLimiter';

const app  = express();
const PORT = process.env.PORT ?? 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.use('/api',          objectRoutes);
app.use('/api/ai',       aiRoutes);
app.use('/api/geofence', geofenceRoutes);
app.use('/api/admin',    adminRoutes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Global error handler — always returns JSON
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({ error: err.message ?? 'Unexpected error.' });
});

app.listen(PORT, async () => {
  console.log(`\n🚀 Smart Tourism API running on http://localhost:${PORT}`);
  console.log(`📖 Swagger docs:           http://localhost:${PORT}/api/docs`);
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (e) {
    console.error('❌ Database connection failed:', (e as Error).message);
  }
});
