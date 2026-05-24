// Plug in ElevenLabs / Azure TTS in Phase 2
// Set AUDIO_PROVIDER=elevenlabs + ELEVENLABS_API_KEY in .env

export async function generateAudio(_text: string, _lang = 'en'): Promise<string> {
  throw new Error('Audio service not yet configured. See AUDIO_PROVIDER in .env');
}
//