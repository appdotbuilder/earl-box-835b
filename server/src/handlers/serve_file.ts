
import { db } from '../db';
import { filesTable } from '../db/schema';
import { type GetFileByTokenInput } from '../schema';
import { eq } from 'drizzle-orm';
import { existsSync } from 'fs';

export async function serveFile(input: GetFileByTokenInput): Promise<{
  file_path: string;
  mime_type: string;
  original_filename: string;
} | null> {
  try {
    // Get file record by token
    const results = await db.select()
      .from(filesTable)
      .where(eq(filesTable.upload_token, input.token))
      .execute();

    if (results.length === 0) {
      return null; // File not found
    }

    const fileRecord = results[0];

    // Verify the file exists on disk
    if (!existsSync(fileRecord.file_path)) {
      return null; // File record exists but file is missing from disk
    }

    // Return file information needed to serve the file
    return {
      file_path: fileRecord.file_path,
      mime_type: fileRecord.mime_type,
      original_filename: fileRecord.original_filename
    };
  } catch (error) {
    console.error('File serving failed:', error);
    throw error;
  }
}
