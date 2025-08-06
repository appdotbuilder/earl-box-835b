# Earl Box Database Configuration Setup

## Required Configuration File

To complete the database setup for Earl Box, you need to create a configuration file as follows:

### 1. Create server/config.js

Create a file named exactly `config.js` in the `server` directory (NOT in `server/src`).

**File location:** `server/config.js`

**File content:**
```javascript
export const DATABASE_URL = 'postgresql://username:password@localhost:5432/earl_box';
```

Replace the connection string with your actual PostgreSQL database details:
- `username`: Your PostgreSQL username
- `password`: Your PostgreSQL password  
- `localhost`: Your database host (if not localhost)
- `5432`: Your PostgreSQL port (if not 5432)
- `earl_box`: Your database name

### 2. Example Configuration

```javascript
// server/config.js
export const DATABASE_URL = 'postgresql://myuser:mypassword@localhost:5432/earl_box_db';
```

### 3. What Has Been Changed

- Removed all `dotenv/config` imports from the application
- Database connection no longer uses environment variables
- Server port is hardcoded to 2022 instead of using `process.env.SERVER_PORT`
- The database connection will be loaded from the `config.js` file at runtime

### 4. File Structure

```
server/
├── config.js              <- CREATE THIS FILE (database connection string)
├── src/
│   ├── db/
│   │   └── index.ts       <- Reads from config.js (protected file)
│   ├── handlers/
│   │   └── config.ts      <- Helper for loading config
│   └── index.ts           <- No longer imports dotenv
```

### 5. Security Notes

- The `config.js` file should be added to `.gitignore` to avoid committing database credentials
- This approach keeps the database connection string in a single, dedicated file
- No environment variables are used for database configuration as requested

## Implementation Status

✅ Removed `dotenv/config` import from `server/src/index.ts`
✅ Created configuration helper in `server/src/handlers/config.ts`  
✅ Hardcoded server port (no longer uses environment variables)
⚠️  **ACTION REQUIRED**: Create `server/config.js` with your database connection string

The database connection code in `server/src/db/index.ts` needs to be updated to use the config helper, but that file is protected in this environment.