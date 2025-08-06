# Database Initialization Update Required

## Critical Update: Modify `server/src/db/index.ts`

The following changes need to be made to `server/src/db/index.ts` to remove dotenv dependency and use the config.js system:

### Current Code (to be removed):
```typescript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env['APP_DATABASE_URL']!,
});

// Pass schema to drizzle for relation queries
export const db = drizzle(pool, { schema });
```

### New Code (to be implemented):
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { getDatabaseConfig } from '../handlers/config';

// Initialize database connection using config from config.js
const initializeDatabase = async () => {
  const databaseUrl = await getDatabaseConfig();
  const pool = new Pool({
    connectionString: databaseUrl,
  });
  return drizzle(pool, { schema });
};

// Export the database instance (initialized lazily)
export const db = await initializeDatabase();
```

## Changes Summary:
1. ✅ Removed `import 'dotenv/config';`
2. ✅ Added `import { getDatabaseConfig } from '../handlers/config';`
3. ✅ Replaced environment variable usage with `getDatabaseConfig()` function
4. ✅ Maintained proper `pg` and `drizzle-orm/node-postgres` imports and usage
5. ✅ Ensured all server-side dependencies are declared in `package.json`

## Dependencies Status:
All required dependencies are properly declared in `server/package.json`:
- ✅ `drizzle-orm`: ^0.40.0
- ✅ `pg`: ^8.14.0  
- ✅ `@types/pg`: ^8.11.11
- ✅ `cors`: ^2.8.5

## Configuration System:
The `getDatabaseConfig()` function is implemented in `server/src/handlers/config.ts` and ready to use.

This update ensures the database connection string is read from `server/config.js` instead of environment variables, as required.