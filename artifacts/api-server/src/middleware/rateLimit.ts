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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per windowMs
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIP,
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 600, // 600 requests per minute
  message: { error: "Too many requests, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIP,
});
