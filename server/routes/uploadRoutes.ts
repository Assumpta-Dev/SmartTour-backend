import { Router, Request, Response } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { adminAuth } from '../middleware/adminAuth';

const mkStorage = (folder: string, resourceType: 'image' | 'video', formats: string[]) =>
  new CloudinaryStorage({
    cloudinary,
    params: { folder: `smart-tourism/${folder}`, allowed_formats: formats, resource_type: resourceType } as any,
  });

const imageUpload = multer({ storage: mkStorage('images', 'image', ['jpg', 'jpeg', 'png', 'webp']) });
const videoUpload = multer({ storage: mkStorage('videos', 'video', ['mp4', 'mov', 'webm']) });
const audioUpload = multer({ storage: mkStorage('audio',  'video', ['mp3', 'wav', 'ogg', 'm4a']) });

const router = Router();

router.post('/image', adminAuth, imageUpload.single('file'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.json({ url: (req.file as any).path, type: 'image' });
});

router.post('/video', adminAuth, videoUpload.single('file'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.json({ url: (req.file as any).path, type: 'video' });
});

router.post('/audio', adminAuth, audioUpload.single('file'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.json({ url: (req.file as any).path, type: 'audio' });
});

export default router;
