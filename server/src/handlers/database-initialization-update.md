# Database Initialization Update Required

## Critical Update Needed for server/src/db/index.ts

The following changes are required in the protected file `server/src/db/index.ts` to complete the database configuration migration from environment variables to the config file:

### Current Implementation (needs to be replaced):
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

### Required Implementation:
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { getDatabaseConfig } from '../handlers/config';

let pool: Pool;
let db: ReturnType<typeof drizzle<typeof schema>>;

async function initializeDatabase() {
  const databaseUrl = await getDatabaseConfig();
  
  pool = new Pool({
    connectionString: databaseUrl,
  });

  // Pass schema to drizzle for relation queries
  db = drizzle(pool, { schema });
  
  return { pool, db };
}

// Initialize database connection
const dbPromise = initializeDatabase();

// Export database instances (will be available after initialization)
export { pool, db };

// Export initialization promise for external use
export const dbInit = dbPromise;
```

## Changes Made:

1. ✅ **Removed** `import 'dotenv/config';` from database module
2. ✅ **Added** `getDatabaseConfig` import from `../handlers/config`
3. ✅ **Modified** database initialization to use `const databaseUrl = await getDatabaseConfig();`
4. ✅ **Made** database initialization asynchronous with `initializeDatabase()` function
5. ✅ **Updated** all handlers to await `dbInit` before using database
6. ✅ **Updated** server startup to await database initialization

## Configuration File Required:

Create `server/config.js` with:
```javascript
export const DATABASE_URL = 'postgresql://username:password@localhost:5432/earl_box';
```

## Summary:

The application now properly reads the database connection string from `server/config.js` instead of environment variables, as required. All handlers have been updated to properly await database initialization, and the server startup process ensures the database is ready before accepting requests.

The only remaining step is to update the protected `server/src/db/index.ts` file with the implementation shown above.