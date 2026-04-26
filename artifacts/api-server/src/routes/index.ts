import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import chatsRouter from "./chats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(chatsRouter);

export default router;
