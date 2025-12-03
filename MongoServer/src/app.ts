import express from "express";
import type { Request, Response } from "express";
import { getMongoDb } from "./config/mongo";
import WebsiteRoute from "./routes/WebsiteRoute";
import AuthenticateRoute from "./routes/AuthenticateRoute";
import IndexRoute from "./routes/IndexRoute";
import MainRoute from "./routes/MainRoute";
import { checkAccessRoute } from "./routes/CheckAccessRoute";
import StructureRoute from "./routes/StructureRoute";
import RolesRoute from "./routes/RolesRoute";
import DocumentTypeRoute from "./routes/DocumentTypeRoute";
import TasksRoute from "./routes/TasksRoute";
import DocumentAnswersRoute from "./routes/DocumentAnswersRoute";
import UploadRoute from "./routes/UploadRoute";
import GlobalRoutes from "./routes/GlobalRoutes";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req: Request, res: Response) => {
  try {
    const db = await getMongoDb();
    await db.command({ ping: 1 });
    res.json({ status: "ok", database: db.databaseName });
  } catch (error) {
    res.status(500).json({ status: "error", message: (error as Error).message });
  }
});

app.get("/collections", async (_req: Request, res: Response) => {
  try {
    const db = await getMongoDb();
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    res.json({
      status: "ok",
      data: collections.map((collection) => collection.name),
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: (error as Error).message });
  }
});

app.use(WebsiteRoute);
app.use(AuthenticateRoute);
app.use(IndexRoute);
app.use(checkAccessRoute);
app.use(MainRoute);
app.use(StructureRoute);
app.use(RolesRoute);
app.use(DocumentTypeRoute);
app.use(TasksRoute);
app.use(DocumentAnswersRoute);
app.use(UploadRoute);
app.use(GlobalRoutes);

app.use((req, res) => {
  res.status(404).json({ status: "not_found", path: req.path });
});

export default app;
