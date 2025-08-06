
import { db } from '../db';
import { filesTable } from '../db/schema';
import { count } from 'drizzle-orm';
import { type FileStats } from '../schema';

export async function getFileStats(): Promise<FileStats> {
  try {
    // Query the database to get the total count of uploaded files
    const result = await db
      .select({ count: count() })
      .from(filesTable)
      .execute();

    return {
      total_files: result[0].count
    };
  } catch (error) {
    console.error('Failed to get file stats:', error);
    throw error;
  }
}
