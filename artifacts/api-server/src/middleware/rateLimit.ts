import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

function getClientIP(req: Request): string {
  // X-Forwarded-For from nginx proxy
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || "unknown";
}

export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requests per 5 minutes (6 per minute)
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIP,
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1200, // 1200 requests per minute (20/sec)
  message: { error: "Too many requests, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIP,
});
