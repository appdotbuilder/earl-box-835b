
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { filesTable } from '../db/schema';
import { type GetFileByTokenInput, type UploadFileInput } from '../schema';
import { getFileByToken } from '../handlers/get_file_by_token';

// Test file input
const testFile: UploadFileInput = {
  filename: 'test-file.txt',
  original_filename: 'original.txt',
  file_path: '/uploads/test-file.txt',
  file_size: 1024,
  mime_type: 'text/plain',
  upload_token: 'test-token-12345'
};

const testInput: GetFileByTokenInput = {
  token: 'test-token-12345'
};

describe('getFileByToken', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return file record when token exists', async () => {
    // Create test file record
    await db.insert(filesTable)
      .values({
        filename: testFile.filename,
        original_filename: testFile.original_filename,
        file_path: testFile.file_path,
        file_size: testFile.file_size,
        mime_type: testFile.mime_type,
        upload_token: testFile.upload_token
      })
      .execute();

    const result = await getFileByToken(testInput);

    expect(result).not.toBeNull();
    expect(result?.filename).toEqual('test-file.txt');
    expect(result?.original_filename).toEqual('original.txt');
    expect(result?.file_path).toEqual('/uploads/test-file.txt');
    expect(result?.file_size).toEqual(1024);
    expect(result?.mime_type).toEqual('text/plain');
    expect(result?.upload_token).toEqual('test-token-12345');
    expect(result?.id).toBeDefined();
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(typeof result?.file_size).toEqual('number');
  });

  it('should return null when token does not exist', async () => {
    const result = await getFileByToken({ token: 'non-existent-token' });

    expect(result).toBeNull();
  });

  it('should handle empty database', async () => {
    const result = await getFileByToken(testInput);

    expect(result).toBeNull();
  });

  it('should find correct file when multiple files exist', async () => {
    // Create multiple test files
    const files = [
      { ...testFile, upload_token: 'token-1', filename: 'file1.txt' },
      { ...testFile, upload_token: 'token-2', filename: 'file2.txt' },
      { ...testFile, upload_token: 'token-3', filename: 'file3.txt' }
    ];

    for (const file of files) {
      await db.insert(filesTable)
        .values({
          filename: file.filename,
          original_filename: file.original_filename,
          file_path: file.file_path,
          file_size: file.file_size,
          mime_type: file.mime_type,
          upload_token: file.upload_token
        })
        .execute();
    }

    const result = await getFileByToken({ token: 'token-2' });

    expect(result).not.toBeNull();
    expect(result?.filename).toEqual('file2.txt');
    expect(result?.upload_token).toEqual('token-2');
  });
});
