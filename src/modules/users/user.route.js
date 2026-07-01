import { Router } from "express";

import { listUsers } from "./user.controller.js";

const router = Router();

router.get("/", listUsers);

export default router;
