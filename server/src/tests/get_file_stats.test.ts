
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { filesTable } from '../db/schema';
import { getFileStats } from '../handlers/get_file_stats';

describe('getFileStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero when no files exist', async () => {
    const result = await getFileStats();

    expect(result.total_files).toEqual(0);
  });

  it('should return correct count when files exist', async () => {
    // Insert test files
    await db.insert(filesTable).values([
      {
        filename: 'test1.jpg',
        original_filename: 'photo1.jpg',
        file_path: '/uploads/test1.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        upload_token: 'token1'
      },
      {
        filename: 'test2.pdf',
        original_filename: 'document.pdf',
        file_path: '/uploads/test2.pdf',
        file_size: 2048,
        mime_type: 'application/pdf',
        upload_token: 'token2'
      },
      {
        filename: 'test3.txt',
        original_filename: 'notes.txt',
        file_path: '/uploads/test3.txt',
        file_size: 512,
        mime_type: 'text/plain',
        upload_token: 'token3'
      }
    ]).execute();

    const result = await getFileStats();

    expect(result.total_files).toEqual(3);
  });

  it('should return updated count after adding more files', async () => {
    // Start with one file
    await db.insert(filesTable).values({
      filename: 'initial.jpg',
      original_filename: 'first.jpg',
      file_path: '/uploads/initial.jpg',
      file_size: 1024,
      mime_type: 'image/jpeg',
      upload_token: 'initial_token'
    }).execute();

    let result = await getFileStats();
    expect(result.total_files).toEqual(1);

    // Add another file
    await db.insert(filesTable).values({
      filename: 'second.jpg',
      original_filename: 'second.jpg',
      file_path: '/uploads/second.jpg',
      file_size: 2048,
      mime_type: 'image/jpeg',
      upload_token: 'second_token'
    }).execute();

    result = await getFileStats();
    expect(result.total_files).toEqual(2);
  });
});
