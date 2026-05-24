import { Request, Response } from 'express';
import { getZonesNear } from '../services/geofenceService';

export async function checkGeofence(req: Request, res: Response) {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });
  const zones = await getZonesNear(lat, lng);
  res.json(zones);
}
