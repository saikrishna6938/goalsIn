"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongo_1 = require("./config/mongo");
const WebsiteRoute_1 = __importDefault(require("./routes/WebsiteRoute"));
const AuthenticateRoute_1 = __importDefault(require("./routes/AuthenticateRoute"));
const IndexRoute_1 = __importDefault(require("./routes/IndexRoute"));
const MainRoute_1 = __importDefault(require("./routes/MainRoute"));
const CheckAccessRoute_1 = require("./routes/CheckAccessRoute");
const StructureRoute_1 = __importDefault(require("./routes/StructureRoute"));
const RolesRoute_1 = __importDefault(require("./routes/RolesRoute"));
const DocumentTypeRoute_1 = __importDefault(require("./routes/DocumentTypeRoute"));
const TasksRoute_1 = __importDefault(require("./routes/TasksRoute"));
const DocumentAnswersRoute_1 = __importDefault(require("./routes/DocumentAnswersRoute"));
const UploadRoute_1 = __importDefault(require("./routes/UploadRoute"));
const GlobalRoutes_1 = __importDefault(require("./routes/GlobalRoutes"));
const ActionsRoute_1 = __importDefault(require("./routes/ActionsRoute"));
const NotesRoutes_1 = __importDefault(require("./routes/NotesRoutes"));
const HistoryRoutes_1 = __importDefault(require("./routes/HistoryRoutes"));
const DataTablesRoutes_1 = __importDefault(require("./routes/DataTablesRoutes"));
const SearchRoute_1 = __importDefault(require("./routes/SearchRoute"));
const TaskTagDetailsRoute_1 = __importDefault(require("./routes/TaskTagDetailsRoute"));
const UserIntrayRoute_1 = __importDefault(require("./routes/UserIntrayRoute"));
const AdminRolesManagerRoute_1 = __importDefault(require("./routes/AdminRolesManagerRoute"));
const DocumentTypeRolesManagerRoute_1 = __importDefault(require("./routes/DocumentTypeRolesManagerRoute"));
const InternalTagsRoute_1 = __importDefault(require("./routes/InternalTagsRoute"));
const ControlCenterRoute_1 = __importDefault(require("./routes/ControlCenterRoute"));
const DocumentObjectRoute_1 = __importDefault(require("./routes/DocumentObjectRoute"));
const AdminDocumentTypeRoute_1 = __importDefault(require("./routes/Admin/AdminDocumentTypeRoute"));
const AdminDocumentTypeRolesRoute_1 = __importDefault(require("./routes/Admin/AdminDocumentTypeRolesRoute"));
const AdminWorkflowRoute_1 = __importDefault(require("./routes/Admin/WorkflowRoutes/AdminWorkflowRoute"));
const AdminDataTableRoute_1 = __importDefault(require("./routes/Admin/AdminDataTableRoute"));
const AdminFormRoutes_1 = __importDefault(require("./routes/Admin/AdminFormRoutes"));
const AdminControlCentersRoutes_1 = __importDefault(require("./routes/Admin/AdminControlCentersRoutes"));
const AdminNewsletterRoute_1 = __importDefault(require("./routes/Admin/AdminNewsletterRoute"));
const AdminOptionsDataRoute_1 = __importDefault(require("./routes/Admin/AdminOptionsDataRoute"));
const AdminDocumentTagRoute_1 = __importDefault(require("./routes/Admin/AdminDocumentTagRoute"));
const ProfileSettingsRoutes_1 = __importDefault(require("./routes/Admin/ProfileSettingsRoutes"));
const SocketRoutes_1 = __importDefault(require("./routes/SocketRoutes"));
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "1mb" }));
app.get("/health", async (_req, res) => {
    try {
        const db = await (0, mongo_1.getMongoDb)();
        await db.command({ ping: 1 });
        res.json({ status: "ok", database: db.databaseName });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});
app.get("/collections", async (_req, res) => {
    try {
        const db = await (0, mongo_1.getMongoDb)();
        const collections = await db.listCollections({}, { nameOnly: true }).toArray();
        res.json({
            status: "ok",
            data: collections.map((collection) => collection.name),
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});
app.use(WebsiteRoute_1.default);
app.use(AuthenticateRoute_1.default);
app.use(IndexRoute_1.default);
app.use(CheckAccessRoute_1.checkAccessRoute);
app.use(MainRoute_1.default);
app.use(StructureRoute_1.default);
app.use(RolesRoute_1.default);
app.use(DocumentTypeRoute_1.default);
app.use(DocumentAnswersRoute_1.default);
app.use(UploadRoute_1.default);
app.use(TasksRoute_1.default);
app.use(GlobalRoutes_1.default);
app.use(ActionsRoute_1.default);
app.use(NotesRoutes_1.default);
app.use(HistoryRoutes_1.default);
app.use(DataTablesRoutes_1.default);
app.use(SearchRoute_1.default);
app.use(TaskTagDetailsRoute_1.default);
app.use(UserIntrayRoute_1.default);
app.use(AdminRolesManagerRoute_1.default);
app.use(DocumentTypeRolesManagerRoute_1.default);
app.use(InternalTagsRoute_1.default);
app.use(ControlCenterRoute_1.default);
app.use(DocumentObjectRoute_1.default);
app.use(AdminDocumentTypeRoute_1.default);
app.use(AdminDocumentTypeRolesRoute_1.default);
app.use(AdminWorkflowRoute_1.default);
app.use(AdminDataTableRoute_1.default);
app.use(AdminFormRoutes_1.default);
app.use(AdminControlCentersRoutes_1.default);
app.use(AdminNewsletterRoute_1.default);
app.use(AdminOptionsDataRoute_1.default);
app.use(AdminDocumentTagRoute_1.default);
app.use(ProfileSettingsRoutes_1.default);
app.use(SocketRoutes_1.default);
app.use((req, res) => {
    res.status(404).json({ status: "not_found", path: req.path });
});
exports.default = app;
