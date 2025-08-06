
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { filesTable } from '../db/schema';
import { type UploadFileInput } from '../schema';
import { uploadFile } from '../handlers/upload_file';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: UploadFileInput = {
  filename: 'test-file-123.jpg',
  original_filename: 'my-photo.jpg',
  file_path: '/uploads/test-file-123.jpg',
  file_size: 1024000, // 1MB
  mime_type: 'image/jpeg',
  upload_token: 'unique-token-123'
};

describe('uploadFile', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should upload file and return success response', async () => {
    const result = await uploadFile(testInput);

    expect(result.success).toBe(true);
    expect(result.file_url).toBe('http://localhost:2022/file/unique-token-123');
    expect(result.token).toBe('unique-token-123');
  });

  it('should save file metadata to database', async () => {
    await uploadFile(testInput);

    const files = await db.select()
      .from(filesTable)
      .where(eq(filesTable.upload_token, testInput.upload_token))
      .execute();

    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('test-file-123.jpg');
    expect(files[0].original_filename).toBe('my-photo.jpg');
    expect(files[0].file_path).toBe('/uploads/test-file-123.jpg');
    expect(files[0].file_size).toBe(1024000);
    expect(files[0].mime_type).toBe('image/jpeg');
    expect(files[0].upload_token).toBe('unique-token-123');
    expect(files[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle large file sizes correctly', async () => {
    const largeFileInput: UploadFileInput = {
      ...testInput,
      file_size: 150 * 1024 * 1024, // 150MB
      upload_token: 'large-file-token'
    };

    const result = await uploadFile(largeFileInput);

    expect(result.success).toBe(true);
    expect(result.token).toBe('large-file-token');

    const files = await db.select()
      .from(filesTable)
      .where(eq(filesTable.upload_token, largeFileInput.upload_token))
      .execute();

    expect(files[0].file_size).toBe(150 * 1024 * 1024);
  });

  it('should handle different file types', async () => {
    const pdfFileInput: UploadFileInput = {
      ...testInput,
      filename: 'document.pdf',
      original_filename: 'important-document.pdf',
      mime_type: 'application/pdf',
      upload_token: 'pdf-token-456'
    };

    const result = await uploadFile(pdfFileInput);

    expect(result.success).toBe(true);

    const files = await db.select()
      .from(filesTable)
      .where(eq(filesTable.upload_token, pdfFileInput.upload_token))
      .execute();

    expect(files[0].mime_type).toBe('application/pdf');
    expect(files[0].filename).toBe('document.pdf');
  });
});
