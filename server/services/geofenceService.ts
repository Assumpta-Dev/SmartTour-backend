import prisma from '../config/db';
import { haversine } from '../geofencing/haversine';

export async function getZonesNear(lat: number, lng: number) {
  const zones = await prisma.zone.findMany();
  return zones.filter((z) => haversine(lat, lng, z.latitude, z.longitude) <= z.radius);
}
