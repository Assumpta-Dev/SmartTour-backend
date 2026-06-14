import prisma from '../config/db';

export const getCategories = () =>
  prisma.category.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { name: 'asc' },
  });

export const getCategoryBySlug = (slug: string) =>
  prisma.category.findUnique({ where: { slug } });

export const createCategory = (data: { name: string; slug: string; icon?: string }) =>
  prisma.category.create({ data });

export const updateCategory = (id: number, data: Partial<{ name: string; icon: string }>) =>
  prisma.category.update({ where: { id }, data });

export const deleteCategory = (id: number) =>
  prisma.category.delete({ where: { id } });
