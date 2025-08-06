
import { db } from '../db';
import { filesTable } from '../db/schema';
import { type UploadFileInput, type UploadResponse } from '../schema';

export const uploadFile = async (input: UploadFileInput): Promise<UploadResponse> => {
  try {
    // Insert file record into database
    const result = await db.insert(filesTable)
      .values({
        filename: input.filename,
        original_filename: input.original_filename,
        file_path: input.file_path,
        file_size: input.file_size,
        mime_type: input.mime_type,
        upload_token: input.upload_token
      })
      .returning()
      .execute();

    const fileRecord = result[0];
    
    return {
      success: true,
      file_url: `http://localhost:2022/file/${fileRecord.upload_token}`,
      token: fileRecord.upload_token
    };
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};
