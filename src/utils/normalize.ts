const DIACRITICS_REGEX = new RegExp('[\\u0300-\\u036f]', 'g');
const PUNCTUATION_REGEX = /['".,-]/g;

export function normalizeAnswer(input: string): string {
  return input
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toLowerCase()
    .replace(PUNCTUATION_REGEX, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
