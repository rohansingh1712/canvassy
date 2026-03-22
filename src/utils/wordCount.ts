export const WORD_LIMIT = 500;
export const WORD_WARNING_THRESHOLD = 450;

export function countWords(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Remove markdown syntax for more accurate counting
  const cleanText = text
    .replace(/#{1,6}\s/g, '') // headers
    .replace(/[*_~`]/g, '') // emphasis and code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .trim();

  return cleanText.split(/\s+/).filter(word => word.length > 0).length;
}

export function getWordCountStatus(count: number): 'normal' | 'warning' | 'limit' {
  if (count >= WORD_LIMIT) return 'limit';
  if (count >= WORD_WARNING_THRESHOLD) return 'warning';
  return 'normal';
}
