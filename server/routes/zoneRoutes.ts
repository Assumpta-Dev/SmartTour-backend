import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Public — tourists use geofence/check, but listing zones is fine publicly too
router.get('/', async (_req: Request, res: Response) => {
  const zones = await prisma.zone.findMany({ orderBy: { zoneName: 'asc' } });
  res.json(zones);
});

router.get('/:id', async (req: Request, res: Response) => {
  const zone = await prisma.zone.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!zone) return res.status(404).json({ error: 'Zone not found.' });
  res.json(zone);
});

// Admin only
router.post('/', adminAuth, async (req: Request, res: Response) => {
  const { zoneName, radius, latitude, longitude, triggerAudio } = req.body;
  if (!zoneName || !radius || !latitude || !longitude)
    return res.status(400).json({ error: 'zoneName, radius, latitude and longitude are required.' });
  const zone = await prisma.zone.create({
    data: { zoneName, radius: parseInt(radius), latitude: parseFloat(latitude), longitude: parseFloat(longitude), triggerAudio },
  });
  res.status(201).json(zone);
});

router.put('/:id', adminAuth, async (req: Request, res: Response) => {
  const data: any = { ...req.body };
  if (data.radius)    data.radius    = parseInt(data.radius);
  if (data.latitude)  data.latitude  = parseFloat(data.latitude);
  if (data.longitude) data.longitude = parseFloat(data.longitude);
  const zone = await prisma.zone.update({ where: { id: parseInt(req.params.id) }, data });
  res.json(zone);
});

router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
  await prisma.zone.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Zone deleted.' });
});

export default router;
