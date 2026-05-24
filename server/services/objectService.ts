import prisma from '../config/db';

export async function getAllObjects(page: number, limit: number, type?: string) {
  const where = type ? { type } : {};
  const [data, total] = await Promise.all([
    prisma.object.findMany({
      where,
      skip:    (page - 1) * limit,
      take:    limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.object.count({ where }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getObjectById(id: string) {
  return prisma.object.findUnique({ where: { id: parseInt(id) } });
}

export async function getObjectByNfc(nfcId: string) {
  return prisma.object.findUnique({ where: { nfcId } });
}

export async function getObjectByQr(qrCode: string) {
  return prisma.object.findUnique({ where: { qrCode } });
}

export async function getNearbyObjects(lat: number, lng: number, radiusMeters = 200) {
  const delta = radiusMeters / 111320;
  return prisma.object.findMany({
    where: {
      latitude:  { gte: lat - delta, lte: lat + delta },
      longitude: { gte: lng - delta, lte: lng + delta },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createObject(data: {
  name: string; type: string; description: string;
  latitude: number; longitude: number;
  imageUrl?: string; audioUrl?: string; nfcId?: string; qrCode?: string;
}) {
  return prisma.object.create({ data });
}

export async function updateObject(id: string, data: Partial<{
  name: string; type: string; description: string;
  latitude: number; longitude: number;
  imageUrl: string; audioUrl: string; nfcId: string; qrCode: string;
}>) {
  return prisma.object.update({ where: { id: parseInt(id) }, data });
}

export async function deleteObject(id: string) {
  return prisma.object.delete({ where: { id: parseInt(id) } });
}
