import cors from "cors";
import express from "express";
import helmet from "helmet";

import { API_PREFIX } from "./config/constants.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import healthRoutes from "./modules/health/health.route.js";
import userRoutes from "./modules/users/user.route.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
