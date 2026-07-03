import { Router, Request, Response } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { upload } from '../config/cloudinary';
import cloudinary from '../config/cloudinary';

const router = Router();

router.post('/image', adminAuth, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.json({ url: (req.file as any).path, type: 'image' });
});

router.post('/video', adminAuth, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.json({ url: (req.file as any).path, type: 'video' });
});

router.post('/audio', adminAuth, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.json({ url: (req.file as any).path, type: 'audio' });
});

// Returns a signed upload signature so the frontend can upload large files
// (especially videos) directly to Cloudinary, bypassing the backend server.
router.get('/signature', adminAuth, (req: Request, res: Response) => {
  const folder        = (req.query.folder as string) ?? 'smart-tourism/videos';
  const resource_type = (req.query.resource_type as string) ?? 'video';
  const timestamp     = Math.round(Date.now() / 1000);
  // resource_type must NOT be in the signed params — only timestamp + folder are signed
  const signature     = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!,
  );
  res.json({
    timestamp,
    signature,
    folder,
    resource_type,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  });
});

export default router;
