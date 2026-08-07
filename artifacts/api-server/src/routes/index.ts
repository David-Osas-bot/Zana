import { Router, type IRouter } from "express";
import healthRouter from "./health";
import zanaRouter from "./zana";

const router: IRouter = Router();

router.use(healthRouter);
router.use(zanaRouter);

export default router;
