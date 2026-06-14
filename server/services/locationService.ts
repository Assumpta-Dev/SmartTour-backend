import prisma from '../config/db';

export const getLocations = (featured?: boolean) =>
  prisma.location.findMany({
    where:   featured ? { featured: true } : undefined,
    include: { _count: { select: { items: true } } },
    orderBy: { name: 'asc' },
  });

export const getLocationBySlug = (slug: string) =>
  prisma.location.findUnique({
    where:   { slug },
    include: { items: { include: { category: true, media: { orderBy: { order: 'asc' }, take: 1 } } } },
  });

export const getLocationById = (id: number) =>
  prisma.location.findUnique({ where: { id } });

export const createLocation = (data: {
  name: string; slug: string; description: string;
  coverImage?: string; videoUrl?: string;
  latitude?: number; longitude?: number; featured?: boolean;
}) => prisma.location.create({ data });

export const updateLocation = (id: number, data: Partial<{
  name: string; description: string; coverImage: string;
  videoUrl: string; latitude: number; longitude: number; featured: boolean;
}>) => prisma.location.update({ where: { id }, data });

export const deleteLocation = (id: number) =>
  prisma.location.delete({ where: { id } });
