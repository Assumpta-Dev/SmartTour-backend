import cloudinary, { v2 } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const imageStorage = new CloudinaryStorage({
  cloudinary: v2,
  params: {
    folder:          'smart-tourism/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 1200, crop: 'limit' }],
  } as object,
});

const audioStorage = new CloudinaryStorage({
  cloudinary: v2,
  params: {
    folder:          'smart-tourism/audio',
    allowed_formats: ['mp3', 'wav', 'ogg', 'm4a'],
    resource_type:   'video',
  } as object,
});

export const uploadImage = multer({ storage: imageStorage });
export const uploadAudio = multer({ storage: audioStorage });
export const upload      = multer({
  storage: multer.memoryStorage(),
});
export default v2;
