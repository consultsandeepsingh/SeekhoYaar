/**
 * Utility to detect and normalize Hinglish (Roman Hindi) text
 * Handles: "kya hota hai", "samjhao", "batao", etc.
 */

const HINGLISH_KEYWORDS = new Set([
  'kya', 'hai', 'hota', 'hoti', 'hote', 'kaise', 'kyun', 'kab', 'kahan',
  'samjhao', 'batao', 'bolo', 'dijiye', 'chahiye', 'mujhe', 'tumhe',
  'acha', 'theek', 'nahi', 'nahin', 'matlab', 'matlab', 'seedha',
  'simple', 'asaan', 'mushkil', 'samajh', 'pata', 'lagta', 'wala',
  'wali', 'waale', 'kar', 'karo', 'karna', 'karta', 'karti', 'sab',
  'sirf', 'bas', 'toh', 'aur', 'ya', 'lekin', 'magar', 'agar', 'phir',
  'pehle', 'baad', 'upar', 'neeche', 'andar', 'bahar', 'yeh', 'woh',
  'iska', 'uska', 'inke', 'unke', 'hum', 'tum', 'aap', 'main',
]);

const DEVANAGARI_RANGE = /[\u0900-\u097F]/;

export const HinglishUtils = {
  /**
   * Detect language from student input
   * Returns: 'hindi' | 'hinglish' | 'english'
   */
  detectLanguage(text: string): 'hindi' | 'hinglish' | 'english' {
    // Check for Devanagari Unicode characters
    if (DEVANAGARI_RANGE.test(text)) return 'hindi';

    const words = text.toLowerCase().split(/\s+/);
    const hinglishCount = words.filter((w) => HINGLISH_KEYWORDS.has(w)).length;
    const ratio = hinglishCount / words.length;

    return ratio >= 0.2 ? 'hinglish' : 'english';
  },

  /**
   * Normalize Hinglish text for better AI processing
   */
  normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s?.!,]/g, '') // remove special chars except punctuation
      .replace(/\s+/g, ' ')
      .trim();
  },

  /**
   * Check if text is likely a question
   */
  isQuestion(text: string): boolean {
    const questionWords = ['kya', 'kaise', 'kyun', 'kab', 'kahan', 'what', 'how', 'why', 'when', 'where'];
    const lower = text.toLowerCase();
    return text.includes('?') || questionWords.some((w) => lower.startsWith(w));
  },
};