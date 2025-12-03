"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.containsScriptOrMaliciousContent = void 0;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express_1 = require("express");
const express = require("express");
const IndexRoute_1 = __importDefault(require("./routes/IndexRoute"));
const MainRoute_1 = __importDefault(require("./routes/MainRoute"));
const CheckAccessRoute_1 = require("./routes/CheckAccessRoute");
const AuthenticateRoute_1 = __importDefault(require("./routes/AuthenticateRoute"));
const StructureRoute_1 = __importDefault(require("./routes/StructureRoute"));
const RolesRoute_1 = __importDefault(require("./routes/RolesRoute"));
const DocumentTypeRoute_1 = __importDefault(require("./routes/DocumentTypeRoute"));
const keys_1 = __importDefault(require("./keys"));
const DocumentAnswersRoute_1 = __importDefault(require("./routes/DocumentAnswersRoute"));
const DocumentTypeRolesManagerRoute_1 = __importDefault(require("./routes/DocumentTypeRolesManagerRoute"));
const UploadRoute_1 = __importDefault(require("./routes/UploadRoute"));
const TasksRoute_1 = __importDefault(require("./routes/TasksRoute"));
const GlobalRoutes_1 = __importDefault(require("./routes/GlobalRoutes"));
const ActionsRoute_1 = __importDefault(require("./routes/ActionsRoute"));
const NotesRoutes_1 = __importDefault(require("./routes/NotesRoutes"));
const HistoryRoutes_1 = __importDefault(require("./routes/HistoryRoutes"));
const ControlCenterRoute_1 = __importDefault(require("./routes/ControlCenterRoute"));
const DataTablesRoutes_1 = __importDefault(require("./routes/DataTablesRoutes"));
const SearchRoute_1 = __importDefault(require("./routes/SearchRoute"));
const UserIntrayRoute_1 = __importDefault(require("./routes/UserIntrayRoute"));
const http = require("http"); // Add the http module
const socketIo = __importStar(require("socket.io"));
const TaskTagDetailsRoute_1 = __importDefault(require("./routes/TaskTagDetailsRoute"));
const WebsiteRoute_1 = __importDefault(require("./routes/WebsiteRoute"));
const AdminRolesManagerRoute_1 = __importDefault(require("./routes/AdminRolesManagerRoute"));
const InternalTagsRoute_1 = __importDefault(require("./routes/InternalTagsRoute"));
const AdminDocumentTypeRoutes_1 = __importDefault(require("./routes/Admin/AdminDocumentTypeRoutes"));
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
const DocumentObjectRoute_1 = __importDefault(require("./routes/DocumentObjectRoute"));
const socket_1 = require("./socket");
const mysql = __importStar(require("mysql2/promise"));
const jwt = __importStar(require("jsonwebtoken"));
class Server {
    constructor() {
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
        const corsOptions = {
            // Dynamically validate origin; allow non-browser clients (no origin)
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
                return callback(new Error("Not allowed by CORS"));
            },
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "X-Requested-With",
                "Accept",
            ],
            exposedHeaders: ["Content-Disposition"],
            optionsSuccessStatus: 204,
        };
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = new socketIo.Server(this.httpServer, {
            cors: {
                origin: allowedOrigins,
                credentials: true,
                methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            },
        });
        (0, socket_1.setIo)(this.io);
        this.app.use(cookieParser());
        this.config();
        // CORS: first, a conservative manual layer for reliability
        this.app.use((req, res, next) => {
            const origin = req.headers.origin;
            if (origin && allowedOrigins.includes(origin)) {
                res.header("Access-Control-Allow-Origin", origin);
                res.header("Vary", "Origin");
            }
            res.header("Access-Control-Allow-Credentials", "true");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
            if (req.method === "OPTIONS")
                return res.sendStatus(204);
            next();
        });
        // Socket auth middleware: populate socket.data.userId and join room
        this.io.use((socket, next) => {
            var _a, _b;
            try {
                const headers = socket.handshake.headers || {};
                const query = (socket.handshake.query || {});
                const authHeader = headers["authorization"] || "";
                const cookieHeader = headers["cookie"] || "";
                const parseCookies = (cookieStr) => {
                    return (cookieStr || "")
                        .split(";")
                        .map((v) => v.trim())
                        .filter(Boolean)
                        .reduce((acc, cur) => {
                        const idx = cur.indexOf("=");
                        if (idx > -1) {
                            const k = decodeURIComponent(cur.slice(0, idx).trim());
                            const val = decodeURIComponent(cur.slice(idx + 1).trim());
                            acc[k] = val;
                        }
                        return acc;
                    }, {});
                };
                const cookies = parseCookies(cookieHeader);
                const bearer = authHeader.startsWith("Bearer ")
                    ? authHeader.slice(7)
                    : undefined;
                const token = (socket.handshake.auth && socket.handshake.auth.token) ||
                    (typeof query.token === "string" ? query.token : undefined) ||
                    bearer ||
                    cookies["accessToken"] ||
                    cookies["access_token"] ||
                    cookies["jwt"] ||
                    cookies["token"] ||
                    (typeof headers["x-access-token"] === "string"
                        ? headers["x-access-token"]
                        : undefined);
                let uid = (socket.handshake.auth && socket.handshake.auth.userId) ||
                    (typeof query.userId === "string" || typeof query.userId === "number"
                        ? query.userId
                        : undefined);
                if (!uid && token) {
                    try {
                        const decoded = jwt.decode(token);
                        uid = (decoded === null || decoded === void 0 ? void 0 : decoded.userId) || (decoded === null || decoded === void 0 ? void 0 : decoded.sub) || undefined;
                    }
                    catch (_c) { }
                }
                // Debug summary (no secrets logged)
                try {
                    const dbg = {
                        hasAuthToken: Boolean((_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token),
                        hasQueryToken: typeof query.token === "string",
                        hasBearer: Boolean(bearer),
                        hasCookieAccessToken: Boolean(cookies["accessToken"] || cookies["access_token"] || cookies["jwt"] || cookies["token"]),
                        hasXAccessToken: typeof headers["x-access-token"] === "string",
                        providedUserId: Boolean(((_b = socket.handshake.auth) === null || _b === void 0 ? void 0 : _b.userId) || query.userId),
                    };
                    console.log("Socket handshake debug:", dbg);
                }
                catch (_d) { }
                if (uid) {
                    socket.data = socket.data || {};
                    socket.data.userId = uid;
                    (0, socket_1.bindSocketToUser)(socket, uid);
                    // Persist socketId for this user (best-effort, non-blocking)
                    (() => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const conn = yield mysql.createConnection(keys_1.default.database);
                            yield conn.execute(`UPDATE Users SET socketId = ? WHERE userId = ?`, [String(socket.id), uid]);
                            yield conn.end();
                        }
                        catch (_f) { }
                    }))();
                }
            }
            catch (_e) { }
            next();
        });
        // CORS: then the standard middleware to cover edge cases
        this.app.use(cors(corsOptions));
        this.app.options("*", cors(corsOptions));
        this.app.use(bodyParser.json({ limit: "50mb" }));
        this.app.use((0, express_1.urlencoded)({ extended: false }));
        this.routes();
        //  this.app.use(fileUpload)
    }
    config() {
        this.app.set("port", process.env.PORT || keys_1.default.port);
    }
    routes() {
        this.app.use((req, res, next) => {
            const { body, url } = req;
            if (typeof body === "string" && containsScriptOrMaliciousContent(body)) {
                return res.status(400).send("Request contains forbidden content.");
            }
            if (typeof body === "object" && body !== null) {
                const bodyString = JSON.stringify(body);
                if (containsScriptOrMaliciousContent(bodyString)) {
                    return res.status(400).send("Request contains forbidden content.");
                }
            }
            if (containsScriptOrMaliciousContent(url)) {
                return res.status(400).send("URL contains forbidden content.");
            }
            next();
        });
        this.io.on("connection", (socket) => {
            var _a;
            // Try to identify the user from the Socket.IO handshake
            const headers = socket.handshake.headers || {};
            const query = (socket.handshake.query || {});
            const authHeader = headers["authorization"] || "";
            const cookieHeader = headers["cookie"] || "";
            const parseCookies = (cookieStr) => {
                return cookieStr
                    .split(";")
                    .map((v) => v.trim())
                    .filter(Boolean)
                    .reduce((acc, cur) => {
                    const idx = cur.indexOf("=");
                    if (idx > -1) {
                        const k = decodeURIComponent(cur.slice(0, idx).trim());
                        const val = decodeURIComponent(cur.slice(idx + 1).trim());
                        acc[k] = val;
                    }
                    return acc;
                }, {});
            };
            const cookies = parseCookies(cookieHeader);
            const bearer = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7)
                : undefined;
            const token = (socket.handshake.auth && socket.handshake.auth.token) ||
                (typeof query.token === "string" ? query.token : undefined) ||
                bearer ||
                cookies["accessToken"] ||
                cookies["access_token"] ||
                cookies["jwt"] ||
                cookies["token"] ||
                (typeof headers["x-access-token"] === "string"
                    ? headers["x-access-token"]
                    : undefined);
            let identifiedUser = (socket.handshake.auth && socket.handshake.auth.userId) ||
                (typeof query.userId === "string" || typeof query.userId === "number"
                    ? query.userId
                    : undefined);
            if (!identifiedUser && token) {
                try {
                    const decoded = jwt.decode(token);
                    identifiedUser = (decoded === null || decoded === void 0 ? void 0 : decoded.userId) || (decoded === null || decoded === void 0 ? void 0 : decoded.sub) || undefined;
                    console.log(identifiedUser);
                }
                catch (_b) {
                    // ignore decode errors; we'll log as unknown
                }
            }
            const ip = socket.handshake.address || "unknown-ip";
            if (!identifiedUser && ((_a = socket.data) === null || _a === void 0 ? void 0 : _a.userId)) {
                identifiedUser = socket.data.userId;
            }
            console.log(`Socket connected: id=${socket.id}, user=${identifiedUser !== null && identifiedUser !== void 0 ? identifiedUser : "unknown"}, ip=${ip}`);
            if (identifiedUser) {
                try {
                    console.log("Online users snapshot:", (0, socket_1.getOnlineUsers)());
                }
                catch (_c) { }
            }
            // Example: Send a welcome message to the connected user
            socket.emit("message", "Welcome to the server!");
            socket.on("message", (data) => {
                this.io.emit("message", data);
            });
            // Handle your socket.io events here
            // Allow late identification from the client after connect
            socket.on("register", (data = {}) => {
                try {
                    const directId = data === null || data === void 0 ? void 0 : data.userId;
                    const tok = data === null || data === void 0 ? void 0 : data.token;
                    let uid = directId;
                    if (!uid && tok) {
                        try {
                            const decoded = jwt.decode(tok);
                            uid = (decoded === null || decoded === void 0 ? void 0 : decoded.userId) || (decoded === null || decoded === void 0 ? void 0 : decoded.sub);
                        }
                        catch (_a) { }
                    }
                    if (uid) {
                        (0, socket_1.bindSocketToUser)(socket, uid);
                        identifiedUser = uid;
                        console.log(`Socket registered: id=${socket.id}, user=${identifiedUser}`);
                        try {
                            console.log("Online users snapshot:", (0, socket_1.getOnlineUsers)());
                        }
                        catch (_b) { }
                        // Persist socketId on late registration
                        (() => __awaiter(this, void 0, void 0, function* () {
                            try {
                                const conn = yield mysql.createConnection(keys_1.default.database);
                                yield conn.execute(`UPDATE Users SET socketId = ? WHERE userId = ?`, [String(socket.id), uid]);
                                yield conn.end();
                            }
                            catch (_d) { }
                        }))();
                    }
                    else {
                        console.log(`Socket register failed: id=${socket.id}`);
                    }
                }
                catch (_c) { }
            });
            socket.on("disconnect", () => {
                try {
                    (0, socket_1.unbindSocket)(socket);
                }
                catch (_a) { }
                console.log(`Socket disconnected: id=${socket.id}, user=${identifiedUser !== null && identifiedUser !== void 0 ? identifiedUser : "unknown"}`);
            });
        });
        this.app.use(WebsiteRoute_1.default);
        this.app.use(AuthenticateRoute_1.default);
        this.app.use(IndexRoute_1.default);
        this.app.use(CheckAccessRoute_1.checkAccessRoute);
        this.app.use(MainRoute_1.default);
        this.app.use(StructureRoute_1.default);
        this.app.use(RolesRoute_1.default);
        this.app.use(DocumentTypeRoute_1.default);
        this.app.use(DocumentAnswersRoute_1.default);
        this.app.use(UploadRoute_1.default);
        this.app.use(TasksRoute_1.default);
        this.app.use(GlobalRoutes_1.default);
        this.app.use(ActionsRoute_1.default);
        this.app.use(NotesRoutes_1.default);
        this.app.use(HistoryRoutes_1.default);
        this.app.use(DataTablesRoutes_1.default);
        this.app.use(SearchRoute_1.default);
        this.app.use(TaskTagDetailsRoute_1.default);
        this.app.use(UserIntrayRoute_1.default);
        this.app.use(AdminRolesManagerRoute_1.default);
        this.app.use(DocumentTypeRolesManagerRoute_1.default);
        this.app.use(InternalTagsRoute_1.default);
        this.app.use(ControlCenterRoute_1.default);
        this.app.use(DocumentObjectRoute_1.default);
        //Admin Routes
        this.app.use(AdminDocumentTypeRoutes_1.default);
        this.app.use(AdminDocumentTypeRolesRoute_1.default);
        this.app.use(AdminWorkflowRoute_1.default);
        this.app.use(AdminDataTableRoute_1.default);
        this.app.use(AdminFormRoutes_1.default);
        this.app.use(AdminControlCentersRoutes_1.default);
        this.app.use(AdminNewsletterRoute_1.default);
        this.app.use(AdminOptionsDataRoute_1.default);
        this.app.use(AdminDocumentTagRoute_1.default);
        this.app.use(ProfileSettingsRoutes_1.default);
        this.app.use(SocketRoutes_1.default);
        // this.app.get("/socket.io", (req, res) => {
        //   console.log("connected to my server");
        // });
        // this.app.use(
        //   express.static(
        //     path.join(__dirname, "../../panel.gradwalk.us/public_html")
        //   )
        // );
        // this.app.get("*", (req, res) => {
        //   res.sendFile(
        //     path.join(
        //       __dirname,
        //       "../../panel.gradwalk.us/public_html",
        //       "index.html"
        //     )
        //   );
        // });
    }
    start() {
        this.httpServer.listen(this.app.get("port"), () => {
            console.log("App Listening to the port", this.app.get("port"));
        });
    }
}
const server = new Server();
server.start();
function containsScriptOrMaliciousContent(str) {
    const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const urlPattern = /javascript:/i;
    return scriptPattern.test(str) || urlPattern.test(str);
}
exports.containsScriptOrMaliciousContent = containsScriptOrMaliciousContent;
//# sourceMappingURL=index.js.map