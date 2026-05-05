import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import chatsRouter from "./chats";
import messagesRouter from "./messages";
import filesRouter from "./files";
import signalRouter from "./signal";
import linkPreviewRouter from "./linkPreview";
import gifsRouter from "./gifs";
import stickersRouter from "./stickers";
import botsRouter from "./bots";
import settingsRouter from "./settings";
import { apiRateLimiter } from "../middleware/rateLimit";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter); // auth has its own rate limiter
router.use(apiRateLimiter); // apply to all subsequent routes
router.use(usersRouter);
router.use(chatsRouter);
router.use(messagesRouter);
router.use(filesRouter);
router.use(signalRouter);
router.use(linkPreviewRouter);
router.use(gifsRouter);
router.use(stickersRouter);
router.use(botsRouter);
router.use(settingsRouter);

export default router;
