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
import ActionsRoute from "./routes/ActionsRoute";
import NotesRoutes from "./routes/NotesRoutes";
import HistoryRoutes from "./routes/HistoryRoutes";
import DataTablesRoutes from "./routes/DataTablesRoutes";
import SearchRoute from "./routes/SearchRoute";
import TaskTagDetailsRoute from "./routes/TaskTagDetailsRoute";
import UserIntrayRoute from "./routes/UserIntrayRoute";
import AdminRolesManagerRoute from "./routes/AdminRolesManagerRoute";
import DocumentTypeRolesManagerRoute from "./routes/DocumentTypeRolesManagerRoute";
import InternalTagsRoute from "./routes/InternalTagsRoute";
import ControlCenterRoutes from "./routes/ControlCenterRoute";
import DocumentObjectRoute from "./routes/DocumentObjectRoute";
import AdminDocumentTypeRoute from "./routes/Admin/AdminDocumentTypeRoute";
import AdminDocumentTypeRolesRoute from "./routes/Admin/AdminDocumentTypeRolesRoute";
import AdminWorkflowRoutes from "./routes/Admin/WorkflowRoutes/AdminWorkflowRoute";
import AdminDataTableRoute from "./routes/Admin/AdminDataTableRoute";
import AdminFormRoutes from "./routes/Admin/AdminFormRoutes";
import AdminControlCenterRoutes from "./routes/Admin/AdminControlCentersRoutes";
import AdminNewsletterRoute from "./routes/Admin/AdminNewsletterRoute";
import AdminOptionsDataRoute from "./routes/Admin/AdminOptionsDataRoute";
import AdminDocumentTagRoute from "./routes/Admin/AdminDocumentTagRoute";
import AdminUserSettingsTypesRoute from "./routes/Admin/ProfileSettingsRoutes";
import SocketRoutes from "./routes/SocketRoutes";

const allowedOrigins = [
  "http://jlisting.org",
  "https://dev.jlisting.org",
  "http://dev.jlisting.org",
  "https://gradwalk.us",
  "https://panel.gradwalk.us",
  "http://192.168.1.2:5200",
  "http://192.168.1.2:3000",
  "http://localhost:3000",
  "http://localhost:5200",
];

const app = express();
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

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
app.use(DocumentAnswersRoute);
app.use(UploadRoute);
app.use(TasksRoute);
app.use(GlobalRoutes);
app.use(ActionsRoute);
app.use(NotesRoutes);
app.use(HistoryRoutes);
app.use(DataTablesRoutes);
app.use(SearchRoute);
app.use(TaskTagDetailsRoute);
app.use(UserIntrayRoute);
app.use(AdminRolesManagerRoute);
app.use(DocumentTypeRolesManagerRoute);
app.use(InternalTagsRoute);
app.use(ControlCenterRoutes);
app.use(DocumentObjectRoute);
app.use(AdminDocumentTypeRoute);
app.use(AdminDocumentTypeRolesRoute);
app.use(AdminWorkflowRoutes);
app.use(AdminDataTableRoute);
app.use(AdminFormRoutes);
app.use(AdminControlCenterRoutes);
app.use(AdminNewsletterRoute);
app.use(AdminOptionsDataRoute);
app.use(AdminDocumentTagRoute);
app.use(AdminUserSettingsTypesRoute);
app.use(SocketRoutes);

app.use((req, res) => {
  res.status(404).json({ status: "not_found", path: req.path });
});

export default app;
