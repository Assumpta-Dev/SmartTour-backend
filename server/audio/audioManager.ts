// Manages audio file references; actual files are stored on CDN / object storage
export function buildAudioUrl(objectId: string, lang = 'en'): string {
  const base = process.env.CDN_URL ?? 'https://cdn.example.com/audio';
  return `${base}/${lang}/${objectId}.mp3`;
}
