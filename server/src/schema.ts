
import { z } from 'zod';

// File upload schema
export const fileSchema = z.object({
  id: z.number(),
  filename: z.string(),
  original_filename: z.string(),
  file_path: z.string(),
  file_size: z.number(),
  mime_type: z.string(),
  upload_token: z.string(), // Unique token for accessing the file
  created_at: z.coerce.date()
});

export type FileRecord = z.infer<typeof fileSchema>;

// Input schema for uploading files
export const uploadFileInputSchema = z.object({
  filename: z.string(),
  original_filename: z.string(),
  file_path: z.string(),
  file_size: z.number().max(200 * 1024 * 1024), // 200MB max
  mime_type: z.string(),
  upload_token: z.string()
});

export type UploadFileInput = z.infer<typeof uploadFileInputSchema>;

// Schema for file access by token
export const getFileByTokenInputSchema = z.object({
  token: z.string()
});

export type GetFileByTokenInput = z.infer<typeof getFileByTokenInputSchema>;

// Response schema for upload
export const uploadResponseSchema = z.object({
  success: z.boolean(),
  file_url: z.string(),
  token: z.string()
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;

// Schema for file statistics
export const fileStatsSchema = z.object({
  total_files: z.number()
});

export type FileStats = z.infer<typeof fileStatsSchema>;
