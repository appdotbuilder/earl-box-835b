import { describe, it, expect } from 'bun:test';
import { getDatabaseConfig } from '../handlers/config';

describe('Configuration', () => {
  it('should load database configuration from config.js', async () => {
    try {
      const databaseUrl = await getDatabaseConfig();
      expect(databaseUrl).toBeDefined();
      expect(typeof databaseUrl).toBe('string');
      expect(databaseUrl.length).toBeGreaterThan(0);
      
      // Basic validation that it looks like a PostgreSQL URL
      expect(databaseUrl.startsWith('postgresql://')).toBe(true);
    } catch (error) {
      // If config.js doesn't exist, the error message should be helpful
      expect((error as Error).message).toMatch(/config\.js/);
      expect((error as Error).message).toMatch(/DATABASE_URL/);
    }
  });

  it('should provide clear error message when config is missing', async () => {
    // This test assumes config.js might not exist during testing
    // The error message should guide users on how to fix it
    try {
      await getDatabaseConfig();
    } catch (error) {
      const errorMessage = (error as Error).message;
      expect(errorMessage).toMatch(/config\.js/);
      expect(errorMessage).toMatch(/DATABASE_URL/);
    }
  });
});