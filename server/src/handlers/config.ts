/**
 * Configuration module for Earl Box
 * This module loads database connection string from server/config.js
 * 
 * The config.js file should be created at server/config.js with the following content:
 * export const DATABASE_URL = 'postgresql://username:password@localhost:5432/earl_box';
 */

// Type definition for the config module
interface ConfigModule {
  DATABASE_URL: string;
}

export async function getDatabaseConfig(): Promise<string> {
  try {
    // Import database configuration from config.js file
    // This file should be located at server/config.js (not in src/)
    const configPath = '../../config.js';
    const config = await import(configPath) as ConfigModule;
    
    if (!config.DATABASE_URL || typeof config.DATABASE_URL !== 'string') {
      throw new Error('DATABASE_URL not found or invalid in config.js');
    }
    
    return config.DATABASE_URL;
  } catch (error) {
    console.error('Failed to load database config from server/config.js:', error);
    throw new Error(
      'Database configuration file not found or invalid. ' +
      'Please create server/config.js with: export const DATABASE_URL = "your_database_url";'
    );
  }
}

/**
 * Instructions for setup:
 * 
 * 1. Create a file named 'config.js' in the server directory (server/config.js)
 * 2. Add the following content to server/config.js:
 * 
 *    export const DATABASE_URL = 'postgresql://username:password@localhost:5432/earl_box';
 * 
 * 3. Replace the connection string with your actual PostgreSQL database details
 * 4. The database connection will be read from this file instead of environment variables
 * 5. Remove any dotenv imports and environment variable usage for database connection
 */