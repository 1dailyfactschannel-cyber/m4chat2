import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import adminRouter from "./routes/admin";
import { logger } from "./lib/logger";
import { apiRateLimiter } from "./middleware/rateLimit";

const app: Express = express();

// Trust proxy (required for rate-limit behind nginx)
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Rate limiting
app.use(apiRateLimiter);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads (RustFS presigned URLs preferred, but local fallback)
app.use("/uploads", express.static(process.env.UPLOAD_DIR || "uploads"));

app.use("/api", router);
app.use("/admin", adminRouter);

// Health check endpoint for Docker/Portainer
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
