// Future: swap provider based on AI_PROVIDER env var
// 'predefined' | 'mistral' | 'openai' | 'gemini'

export type AIProvider = 'predefined' | 'openai' | 'gemini';

export function getProvider(): AIProvider {
  return (process.env.AI_PROVIDER as AIProvider) ?? 'predefined';
}
