import { Request, Response } from 'express';
import prisma from '../config/db';
import { haversine } from '../geofencing/haversine';

export async function getNearbyLocations(req: Request, res: Response) {
  const lat    = parseFloat(req.query.lat    as string);
  const lng    = parseFloat(req.query.lng    as string);
  const radius = parseFloat(req.query.radius as string) || 5000; // default 5 km

  if (isNaN(lat) || isNaN(lng))
    return res.status(400).json({ error: 'lat and lng are required and must be valid numbers.' });

  const locations = await prisma.location.findMany({
    where:   { latitude: { not: null }, longitude: { not: null } },
    include: { _count: { select: { items: true } } },
  });

  const nearby = locations
    .map((loc) => ({
      ...loc,
      distance: haversine(lat, lng, loc.latitude!, loc.longitude!),
    }))
    .filter((loc) => loc.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  res.json(nearby);
}
