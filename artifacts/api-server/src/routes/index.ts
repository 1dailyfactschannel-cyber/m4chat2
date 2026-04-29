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

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(chatsRouter);
router.use(messagesRouter);
router.use(filesRouter);
router.use(signalRouter);
router.use(linkPreviewRouter);
router.use(gifsRouter);

export default router;
