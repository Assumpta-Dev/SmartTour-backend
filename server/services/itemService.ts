import prisma from '../config/db';

const itemInclude = {
  location: true,
  category: true,
  media:    { orderBy: { order: 'asc' as const } },
};

export const getItems = async (page = 1, limit = 20, locationId?: number, categoryId?: number, search?: string) => {
  const where: any = {};
  if (locationId) where.locationId = locationId;
  if (categoryId) where.categoryId = categoryId;
  if (search)     where.name = { contains: search, mode: 'insensitive' };
  const [data, total] = await Promise.all([
    prisma.item.findMany({ where, include: itemInclude, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' } }),
    prisma.item.count({ where }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getItemBySlug = (slug: string) =>
  prisma.item.findUnique({ where: { slug }, include: itemInclude });

export const getItemById = (id: number) =>
  prisma.item.findUnique({ where: { id }, include: itemInclude });

export const getRelatedItems = (itemId: number, categoryId: number, locationId: number) =>
  prisma.item.findMany({
    where:   { OR: [{ categoryId }, { locationId }], NOT: { id: itemId } },
    include: { media: { take: 1, orderBy: { order: 'asc' } }, category: true },
    take:    6,
  });

export const createItem = (data: {
  name: string; slug: string; description: string; locationId: number; categoryId: number;
  audioUrl?: string; videoUrl?: string; duration?: string;
  facts?: string; habitat?: string; conservation?: string; rating?: number; featured?: boolean;
}) => prisma.item.create({ data, include: itemInclude });

export const updateItem = (id: number, data: Partial<{
  name: string; description: string; locationId: number; categoryId: number;
  audioUrl: string; videoUrl: string; duration: string;
  facts: string; habitat: string; conservation: string; rating: number; featured: boolean;
}>) => prisma.item.update({ where: { id }, data, include: itemInclude });

export const deleteItem = (id: number) =>
  prisma.item.delete({ where: { id } });

export const incrementViewCount = (id: number) =>
  prisma.item.update({ where: { id }, data: { viewCount: { increment: 1 } } });

export const addMedia = (data: { itemId: number; url: string; type: string; caption?: string; order?: number }) =>
  prisma.media.create({ data });

export const deleteMedia = (id: number) =>
  prisma.media.delete({ where: { id } });
