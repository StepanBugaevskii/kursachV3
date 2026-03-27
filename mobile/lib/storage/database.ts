import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('meshshare.db');

export const initDatabase = async () => {
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
  try {
    const result = await db.getFirstAsync<{ data: string }>(
      'SELECT data FROM chunks WHERE fileId = ? AND chunkIndex = ?',
      [fileId, chunkIndex]
    );
    
    if (!result) return null;
    
    return new Uint8Array(Buffer.from(result.data, 'base64'));
  } catch (error) {
    console.error('Failed to get chunk:', error);
    return null;
  }
};

export const deleteFileChunks = async (fileId: string) => {
  try {
    await db.runAsync('DELETE FROM chunks WHERE fileId = ?', [fileId]);
  } catch (error) {
    console.error('Failed to delete chunks:', error);
  }
};

export const getAllStoredFiles = async (): Promise<string[]> => {
  try {
    const results = await db.getAllAsync<{ fileId: string }>(
      'SELECT DISTINCT fileId FROM chunks'
    );
    return results.map((r) => r.fileId);
  } catch (error) {
    console.error('Failed to get stored files:', error);
    return [];
  }
};

export default db;
