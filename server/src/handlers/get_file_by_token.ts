
import { db } from '../db';
import { filesTable } from '../db/schema';
import { type GetFileByTokenInput, type FileRecord } from '../schema';
import { eq } from 'drizzle-orm';

export const getFileByToken = async (input: GetFileByTokenInput): Promise<FileRecord | null> => {
  try {
    // Query database for file with matching token
    const results = await db.select()
      .from(filesTable)
      .where(eq(filesTable.upload_token, input.token))
      .execute();

    // Return first result or null if not found
    if (results.length === 0) {
      return null;
    }

    const file = results[0];
    return {
      ...file,
      file_size: Number(file.file_size) // Convert bigint to number for consistency
    };
  } catch (error) {
    console.error('File lookup by token failed:', error);
    throw error;
  }
};
