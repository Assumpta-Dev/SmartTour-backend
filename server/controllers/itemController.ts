import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as svc from '../services/itemService';
import { destroyCloudinary } from '../config/cloudinary';

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function handleErr(res: Response, e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'An item with this name already exists.' });
    if (e.code === 'P2025') return res.status(404).json({ error: 'Item not found.' });
  }
  res.status(500).json({ error: e instanceof Error ? e.message : 'Server error.' });
}

export async function listItems(req: Request, res: Response) {
  try {
    const { page, limit, locationId, categoryId, search } = req.query;
    res.json(await svc.getItems(
      parseInt(page as string) || 1,
      parseInt(limit as string) || 20,
      locationId ? parseInt(locationId as string) : undefined,
      categoryId ? parseInt(categoryId as string) : undefined,
      search as string | undefined,
    ));
  } catch (e) { handleErr(res, e); }
}

export async function getItem(req: Request, res: Response) {
  try {
    const item = await svc.getItemBySlug(req.params.slug);
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    await svc.incrementViewCount(item.id);
    const related = await svc.getRelatedItems(item.id, item.categoryId, item.locationId);
    res.json({ ...item, related });
  } catch (e) { handleErr(res, e); }
}

export async function createItem(req: Request, res: Response) {
  try {
    const { name, description, locationId, categoryId, audioUrl, videoUrl, duration, facts, habitat, conservation, rating, featured } = req.body;
    if (!name || !description || !locationId || !categoryId)
      return res.status(400).json({ error: 'name, description, locationId and categoryId are required.' });
    const files = req.files as Record<string, Express.Multer.File[]>;
    const item  = await svc.createItem({
      name, slug: slugify(name), description,
      locationId: parseInt(locationId),
      categoryId: parseInt(categoryId),
      audioUrl: (files?.audio?.[0] as any)?.path ?? audioUrl,
      videoUrl: (files?.video?.[0] as any)?.path ?? videoUrl,
      duration, facts, habitat, conservation,
      rating:   rating   ? parseFloat(rating)   : undefined,
      featured: featured === 'true',
    });
    if (files?.images) {
      for (let i = 0; i < files.images.length; i++) {
        await svc.addMedia({ itemId: item.id, url: (files.images[i] as any).path, type: 'image', order: i });
      }
    }
    res.status(201).json(await svc.getItemById(item.id));
  } catch (e) { handleErr(res, e); }
}

export async function updateItem(req: Request, res: Response) {
  try {
    const id       = parseInt(req.params.id);
    const data: any = { ...req.body };
    const files    = req.files as Record<string, Express.Multer.File[]>;
    const existing = await svc.getItemById(id);
    if (files?.audio?.[0]) {
      if (existing?.audioUrl?.includes('cloudinary')) await destroyCloudinary(existing.audioUrl, 'video');
      data.audioUrl = (files.audio[0] as any).path;
    }
    if (files?.video?.[0]) {
      if (existing?.videoUrl?.includes('cloudinary')) await destroyCloudinary(existing.videoUrl, 'video');
      data.videoUrl = (files.video[0] as any).path;
    } else if (data.videoUrl === undefined) {
      delete data.videoUrl;
    }
    if (data.locationId) data.locationId = parseInt(data.locationId);
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    if (data.rating)     data.rating     = parseFloat(data.rating);
    if (data.featured !== undefined) data.featured = data.featured === 'true';
    await svc.updateItem(id, data);
    if (files?.images && files.images.length > 0) {
      await Promise.all((existing?.media.filter(m => m.type === 'image') ?? []).map(async m => {
        await destroyCloudinary(m.url);
        await svc.deleteMedia(m.id);
      }));
      for (let i = 0; i < files.images.length; i++) {
        await svc.addMedia({ itemId: id, url: (files.images[i] as any).path, type: 'image', order: i });
      }
    }
    res.json(await svc.getItemById(id));
  } catch (e) { handleErr(res, e); }
}

export async function deleteItem(req: Request, res: Response) {
  try {
    const id   = parseInt(req.params.id);
    const item = await svc.getItemById(id);
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    await Promise.all(item.media.map(m => destroyCloudinary(m.url, m.type === 'video' ? 'video' : 'image')));
    await svc.deleteItem(id);
    res.json({ message: 'Item deleted.' });
  } catch (e) { handleErr(res, e); }
}

export async function deleteMediaItem(req: Request, res: Response) {
  try {
    await svc.deleteMedia(parseInt(req.params.mediaId));
    res.json({ message: 'Media deleted.' });
  } catch (e) { handleErr(res, e); }
}
