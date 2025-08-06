
import { serial, text, pgTable, timestamp, integer, bigint } from 'drizzle-orm/pg-core';

export const filesTable = pgTable('files', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(), // Generated filename for storage
  original_filename: text('original_filename').notNull(), // Original filename from user
  file_path: text('file_path').notNull(), // Path to file in uploads directory
  file_size: bigint('file_size', { mode: 'number' }).notNull(), // File size in bytes
  mime_type: text('mime_type').notNull(), // MIME type of the file
  upload_token: text('upload_token').notNull().unique(), // Unique token for file access
  created_at: timestamp('created_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type FileRecord = typeof filesTable.$inferSelect; // For SELECT operations
export type NewFileRecord = typeof filesTable.$inferInsert; // For INSERT operations

// Export all tables for proper query building
export const tables = { files: filesTable };
