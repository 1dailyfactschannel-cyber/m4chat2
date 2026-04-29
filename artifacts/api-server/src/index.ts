import { createServer } from "http";
import app from "./app";
import { createWebSocketServer } from "./websocket/server";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);
const io = createWebSocketServer(httpServer);

// Attach io to app for use in routes
app.set("io", io);

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening");
});
