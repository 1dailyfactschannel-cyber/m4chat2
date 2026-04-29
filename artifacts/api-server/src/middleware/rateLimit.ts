import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per windowMs
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Too many requests, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
