import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'storage', 'data');

// Simple lock queue for serializing atomic writes per filename
const writeLocks: Record<string, Promise<void>> = {};

/**
 * Reads a JSON file from storage/data/[filename]
 */
export function readJSON<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

/**
 * Writes data atomically to storage/data/[filename] using a temporary file & rename
 */
export async function writeJSONAtomic<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = path.join(DATA_DIR, `${filename}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Queue writes sequentially to prevent race conditions
  const previousLock = writeLocks[filename] || Promise.resolve();

  const currentWrite = (async () => {
    await previousLock;
    try {
      const serialized = JSON.stringify(data, null, 2);
      fs.writeFileSync(tempPath, serialized, 'utf-8');
      
      // Perform atomic rename
      fs.renameSync(tempPath, filePath);
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch {}
      }
      throw error;
    }
  })();

  writeLocks[filename] = currentWrite.catch(() => {});
  return currentWrite;
}
