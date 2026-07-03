import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as svc from '../services/categoryService';

function handleErr(res: Response, e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Category already exists.' });
  }
  res.status(500).json({ error: e instanceof Error ? e.message : 'Server error.' });
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function listCategories(_req: Request, res: Response) {
  try { res.json(await svc.getCategories()); }
  catch (e) { handleErr(res, e); }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, slug, icon, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required.' });
    const cat   = await svc.createCategory({ name, slug: slug || slugify(name), icon, description });
    const files = req.files as Record<string, Express.Multer.File[]>;
    if (files?.images) {
      for (let i = 0; i < files.images.length; i++) {
        await svc.addCategoryImage(cat.id, (files.images[i] as any).path, i);
      }
    }
    res.status(201).json(await svc.getCategoryBySlug(cat.slug));
  } catch (e) { handleErr(res, e); }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { name, slug, icon, description } = req.body;
    const data: any = {};
    if (name)        data.name        = name;
    if (slug)        data.slug        = slug;
    if (icon)        data.icon        = icon;
    if (description !== undefined) data.description = description;
    const cat   = await svc.updateCategory(id, data);
    const files = req.files as Record<string, Express.Multer.File[]>;
    if (files?.images && files.images.length > 0) {
      await Promise.all((cat.images ?? []).map(img => svc.deleteCategoryImage(img.id)));
      for (let i = 0; i < files.images.length; i++) {
        await svc.addCategoryImage(id, (files.images[i] as any).path, i);
      }
    }
    res.json(await svc.getCategoryBySlug(cat.slug));
  } catch (e) { handleErr(res, e); }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    await svc.deleteCategory(parseInt(req.params.id));
    res.json({ message: 'Category deleted.' });
  } catch (e) { handleErr(res, e); }
}
