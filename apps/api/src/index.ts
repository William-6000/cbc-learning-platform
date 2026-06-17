import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { authRoutes }       from "./routes/auth.routes";
import { pathwayRoutes }    from "./routes/pathway.routes";
import { assessmentRoutes } from "./routes/assessment.routes";
import { cslRoutes }        from "./routes/csl.routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth",        authRoutes);
app.use("/api/pathways",    pathwayRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/csl",         cslRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));

export default app;
