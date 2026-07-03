import { v2 } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = new CloudinaryStorage({
  cloudinary: v2,
  params: (_req: any, file: Express.Multer.File) => {
    if (file.fieldname === 'video') return { folder: 'smart-tourism/videos', resource_type: 'video' };
    if (file.fieldname === 'audio') return { folder: 'smart-tourism/audio',  resource_type: 'video' };
    return { folder: 'smart-tourism/images', resource_type: 'image' };
  },
});

export const upload = multer({ storage });

export function destroyCloudinary(url: string, resourceType: 'image' | 'video' = 'image') {
  const pub = url.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
  return v2.uploader.destroy(pub, { resource_type: resourceType }).catch(() => null);
}

export default v2;
