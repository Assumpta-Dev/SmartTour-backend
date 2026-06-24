import prisma from '../config/db';

export const getCategories = () =>
  prisma.category.findMany({
    include: { _count: { select: { items: true } }, images: { orderBy: { order: 'asc' } } },
    orderBy: { name: 'asc' },
  });

export const getCategoryBySlug = (slug: string) =>
  prisma.category.findUnique({ where: { slug }, include: { images: { orderBy: { order: 'asc' } } } });

export const createCategory = (data: { name: string; slug: string; icon?: string; description?: string }) =>
  prisma.category.create({ data, include: { images: true } });

export const updateCategory = (id: number, data: Partial<{ name: string; slug: string; icon: string; description: string }>) =>
  prisma.category.update({ where: { id }, data, include: { images: true } });

export const addCategoryImage = (categoryId: number, url: string, order: number) =>
  prisma.categoryImage.create({ data: { categoryId, url, order } });

export const deleteCategoryImage = (id: number) =>
  prisma.categoryImage.delete({ where: { id } });

export const deleteCategory = (id: number) =>
  prisma.category.delete({ where: { id } });
