import crypto from 'crypto';

/**
 * Creates a deterministic hash from input
 */
export function createHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Extracts video ID from YouTube URL or ID
 */
export function extractVideoId(input: string | null): string | null {
  if (!input) return null;
  
  // If it's already an 11-char ID, return as is
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }
  
  // Try to extract from URL
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
  const match = input.match(regExp);
  
  return match && match[1] ? match[1] : null;
}

/**
 * Simple retry wrapper for async functions
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; initialDelay?: number; maxDelay?: number } = { maxRetries: 3 }
): Promise<T> {
  const { maxRetries, initialDelay = 1000, maxDelay = 5000 } = options;
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) break;
      
      // Exponential backoff with jitter
      const delay = Math.min(initialDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries reached');
}

/**
 * Simple in-memory cache with TTL
 */
export class Cache<T> {
  private store: Map<string, { data: T; expires: number }>;
  private ttl: number;

  constructor(ttlSeconds: number) {
    this.store = new Map();
    this.ttl = ttlSeconds * 1000; // Convert to milliseconds
  }

  get(key: string): T | undefined {
    const item = this.store.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expires) {
      this.store.delete(key);
      return undefined;
    }
    
    return item.data;
  }

  set(key: string, data: T): void {
    this.store.set(key, {
      data,
      expires: Date.now() + this.ttl,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
