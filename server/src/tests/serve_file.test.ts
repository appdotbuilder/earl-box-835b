
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { filesTable } from '../db/schema';
import { type GetFileByTokenInput } from '../schema';
import { serveFile } from '../handlers/serve_file';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const testInput: GetFileByTokenInput = {
  token: 'test-token-123'
};

const testFilePath = join(process.cwd(), 'test-uploads', 'test-file.txt');
const testFileContent = 'Test file content for serving';

describe('serveFile', () => {
  beforeEach(async () => {
    await createDB();
    
    // Create test directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'test-uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create test file on disk
    writeFileSync(testFilePath, testFileContent);
    
    // Insert test file record
    await db.insert(filesTable)
      .values({
        filename: 'test-file.txt',
        original_filename: 'original-test.txt',
        file_path: testFilePath,
        file_size: Buffer.byteLength(testFileContent),
        mime_type: 'text/plain',
        upload_token: 'test-token-123'
      })
      .execute();
  });

  afterEach(async () => {
    // Clean up test file
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
    
    await resetDB();
  });

  it('should return file info for valid token', async () => {
    const result = await serveFile(testInput);

    expect(result).not.toBeNull();
    expect(result?.file_path).toEqual(testFilePath);
    expect(result?.mime_type).toEqual('text/plain');
    expect(result?.original_filename).toEqual('original-test.txt');
  });

  it('should return null for non-existent token', async () => {
    const invalidInput: GetFileByTokenInput = {
      token: 'non-existent-token'
    };

    const result = await serveFile(invalidInput);

    expect(result).toBeNull();
  });

  it('should return null when file record exists but file is missing from disk', async () => {
    // Remove the file from disk but keep the database record
    unlinkSync(testFilePath);

    const result = await serveFile(testInput);

    expect(result).toBeNull();
  });

  it('should handle database query correctly', async () => {
    // Insert another file with different token
    await db.insert(filesTable)
      .values({
        filename: 'other-file.txt',
        original_filename: 'other-original.txt',
        file_path: '/path/to/other/file.txt',
        file_size: 1000,
        mime_type: 'text/plain',
        upload_token: 'other-token'
      })
      .execute();

    // Should still return the correct file for our token
    const result = await serveFile(testInput);

    expect(result).not.toBeNull();
    expect(result?.file_path).toEqual(testFilePath);
    expect(result?.original_filename).toEqual('original-test.txt');
  });

  it('should verify file exists on disk before returning', async () => {
    const result = await serveFile(testInput);

    expect(result).not.toBeNull();
    // Verify the file actually exists at the returned path
    expect(existsSync(result!.file_path)).toBe(true);
  });
});
