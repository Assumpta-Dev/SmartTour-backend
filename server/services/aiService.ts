// Phase 1 — predefined responses
// Phase 2: set AI_PROVIDER=openai and add OPENAI_API_KEY to .env
const PREDEFINED: Record<string, string> = {
  bird:       'This area hosts over 30 bird species including sunbirds and weavers.',
  tree:       'This tree is estimated to be over 80 years old and is native to East Africa.',
  history:    'This site dates back to the early 20th century.',
  restaurant: 'The nearest restaurant is about 300 metres east of your current position.',
  age:        'The age of this exhibit is documented in the object description panel.',
};

export async function getAIAnswer(question: string, _objectId: string): Promise<string> {
  const q = question.toLowerCase();
  for (const [keyword, answer] of Object.entries(PREDEFINED)) {
    if (q.includes(keyword)) return answer;
  }
  return "I don't have specific information about that — our on-site guides are happy to help!";
}
