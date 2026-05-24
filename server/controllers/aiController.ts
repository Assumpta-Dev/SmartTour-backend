import { Request, Response } from 'express';
import { getAIAnswer } from '../services/aiService';

export async function chatWithAI(req: Request, res: Response) {
  const { question, objectId } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });
  const answer = await getAIAnswer(question, objectId);
  res.json({ answer });
}
