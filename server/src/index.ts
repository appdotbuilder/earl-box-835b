
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { uploadFileInputSchema, getFileByTokenInputSchema } from './schema';
import { uploadFile } from './handlers/upload_file';
import { getFileByToken } from './handlers/get_file_by_token';
import { getFileStats } from './handlers/get_file_stats';
import { serveFile } from './handlers/serve_file';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Upload file endpoint
  uploadFile: publicProcedure
    .input(uploadFileInputSchema)
    .mutation(({ input }) => uploadFile(input)),
  
  // Get file stats (total count)
  getFileStats: publicProcedure
    .query(() => getFileStats()),
  
  // Get file by token (for internal use)
  getFileByToken: publicProcedure
    .input(getFileByTokenInputSchema)
    .query(({ input }) => getFileByToken(input)),
  
  // Serve file content
  serveFile: publicProcedure
    .input(getFileByTokenInputSchema)
    .query(({ input }) => serveFile(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Earl Box TRPC server listening at port: ${port}`);
}

start();
