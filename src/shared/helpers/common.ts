import { createHmac } from 'node:crypto';

export function generateRandomValue(min: number, max: number, numAfterDigit = 0): number {
  return +(Math.random() * (max - min) + min).toFixed(numAfterDigit);
}

export function getRandomItems<T>(items: T[]): T[] {
  const startPosition = generateRandomValue(0, items.length - 1);
  const endPosition = startPosition + generateRandomValue(startPosition, items.length);
  return items.slice(startPosition, endPosition);
}

export function getRandomItem<T>(items: T[]): T {
  return items[generateRandomValue(0, items.length - 1)];
}

export function createSHA256(line: string, salt: string): string {
  const shaHasher = createHmac('sha256', salt);
  return shaHasher.update(line).digest('hex');
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error occurred';
}
