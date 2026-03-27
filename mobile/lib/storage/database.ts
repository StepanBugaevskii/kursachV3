import { Platform } from 'react-native';

// Conditionally import SQLite only on native platforms
let SQLite: any = null;
let db: any = null;

if (Platform.OS !== 'web') {
  try {
    SQLite = require('expo-sqlite');
    db = SQLite.openDatabaseSync('meshshare.db');
  } catch (error) {
    console.warn('SQLite not available:', error);
  }
}

export const initDatabase = async () => {
  if (!db) {
    console.log('⚠️ Database not available (web platform)');
    return;
  }
  
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS chunks (
        fileId TEXT NOT NULL,
        chunkIndex INTEGER NOT NULL,
        data BLOB NOT NULL,
        hash TEXT,
        PRIMARY KEY (fileId, chunkIndex)
      );
    `);
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

export const storeChunk = async (
  fileId: string,
  chunkIndex: number,
  data: Uint8Array,
  hash?: string
) => {
  if (!db) {
    console.warn('Database not available, chunk not stored');
    return;
  }
  
  try {
    const base64Data = Buffer.from(data).toString('base64');
    await db.runAsync(
      'INSERT OR REPLACE INTO chunks (fileId, chunkIndex, data, hash) VALUES (?, ?, ?, ?)',
      [fileId, chunkIndex, base64Data, hash || null]
    );
  } catch (error) {
    console.error('Failed to store chunk:', error);
    throw error;
  }
};

export const getChunk = async (
  fileId: string,
  chunkIndex: number
): Promise<Uint8Array | null> => {
  if (!db) {
    console.warn('Database not available');
    return null;
  }
  
  try {
    const result = await db.getFirstAsync(
      'SELECT data FROM chunks WHERE fileId = ? AND chunkIndex = ?',
      [fileId, chunkIndex]
    ) as { data: string } | null;
    
    if (!result) return null;
    
    return new Uint8Array(Buffer.from(result.data, 'base64'));
  } catch (error) {
    console.error('Failed to get chunk:', error);
    return null;
  }
};

export const deleteFileChunks = async (fileId: string) => {
  if (!db) {
    console.warn('Database not available');
    return;
  }
  
  try {
    await db.runAsync('DELETE FROM chunks WHERE fileId = ?', [fileId]);
  } catch (error) {
    console.error('Failed to delete chunks:', error);
  }
};

export const getAllStoredFiles = async (): Promise<string[]> => {
  if (!db) {
    console.warn('Database not available');
    return [];
  }
  
  try {
    const results = await db.getAllAsync(
      'SELECT DISTINCT fileId FROM chunks'
    ) as Array<{ fileId: string }>;
    return results.map((r: { fileId: string }) => r.fileId);
  } catch (error) {
    console.error('Failed to get stored files:', error);
    return [];
  }
};

export default db;
