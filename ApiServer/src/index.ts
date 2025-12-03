import bodyParser = require("body-parser");
import cookieParser = require("cookie-parser");
import cors = require("cors");
import { Application, urlencoded } from "express";
import express = require("express");
import IndexRoute from "./routes/IndexRoute";
import MainRoute from "./routes/MainRoute";
import { checkAccessRoute } from "./routes/CheckAccessRoute";
import AuthenticateRoute from "./routes/AuthenticateRoute";
import StructureRoute from "./routes/StructureRoute";
import RolesRoute from "./routes/RolesRoute";
import DocumentTypeRoute from "./routes/DocumentTypeRoute";
import keys from "./keys";
import DocumentAnswersRoute from "./routes/DocumentAnswersRoute";
import DocumentTypeRolesManagerRoute from "./routes/DocumentTypeRolesManagerRoute";
import UploadRoute from "./routes/UploadRoute";
import TasksRoute from "./routes/TasksRoute";
import GlobalRoutes from "./routes/GlobalRoutes";
import ActionsRoute from "./routes/ActionsRoute";
import NotesRoutes from "./routes/NotesRoutes";
import HistoryRoutes from "./routes/HistoryRoutes";
import ControlCenterRoutes from "./routes/ControlCenterRoute";
import DataTablesRoutes from "./routes/DataTablesRoutes";
import SearchRoute from "./routes/SearchRoute";
import UserIntrayRoute from "./routes/UserIntrayRoute";
import http = require("http"); // Add the http module
import * as socketIo from "socket.io";
import TaskTagDetailsRoute from "./routes/TaskTagDetailsRoute";
import WebsiteRoute from "./routes/WebsiteRoute";
import AdminRolesManagerRoute from "./routes/AdminRolesManagerRoute";
import InternalTagsRoute from "./routes/InternalTagsRoute";
import AdminDocumentTypeRoute from "./routes/Admin/AdminDocumentTypeRoutes";
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
import DocumentObjectRoute from "./routes/DocumentObjectRoute";

import path from "path";
import {
  setIo,
  userRoom,
  bindSocketToUser,
  unbindSocket,
  getOnlineUsers,
} from "./socket";
import * as mysql from "mysql2/promise";
import * as jwt from "jsonwebtoken";
class Server {
  public app: Application;
  private httpServer: http.Server; // Add an HTTP server
  private io: socketIo.Server; // Add a socket.io server
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

    const corsOptions: cors.CorsOptions = {
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
    setIo(this.io);

    this.app.use(cookieParser());
    this.config();

    // CORS: first, a conservative manual layer for reliability
    this.app.use((req, res, next) => {
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
      if (req.method === "OPTIONS") return res.sendStatus(204);
      next();
    });
    // Socket auth middleware: populate socket.data.userId and join room
    this.io.use((socket, next) => {
      try {
        const headers = socket.handshake.headers || {};
        const query = (socket.handshake.query || {}) as Record<string, any>;
        const authHeader = (headers["authorization"] as string) || "";
        const cookieHeader = (headers["cookie"] as string) || "";

        const parseCookies = (cookieStr: string): Record<string, string> => {
          return (cookieStr || "")
            .split(";")
            .map((v) => v.trim())
            .filter(Boolean)
            .reduce((acc: Record<string, string>, cur: string) => {
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
        const token =
          (socket.handshake.auth && (socket.handshake.auth as any).token) ||
          (typeof query.token === "string" ? query.token : undefined) ||
          bearer ||
          cookies["accessToken"] ||
          cookies["access_token"] ||
          cookies["jwt"] ||
          cookies["token"] ||
          (typeof headers["x-access-token"] === "string"
            ? (headers["x-access-token"] as string)
            : undefined);

        let uid: string | number | undefined =
          (socket.handshake.auth && (socket.handshake.auth as any).userId) ||
          (typeof query.userId === "string" || typeof query.userId === "number"
            ? (query.userId as any)
            : undefined);
        if (!uid && token) {
          try {
            const decoded: any = jwt.decode(token);
            uid = decoded?.userId || decoded?.sub || undefined;
          } catch {}
        }
        // Debug summary (no secrets logged)
        try {
          const dbg = {
            hasAuthToken: Boolean((socket.handshake.auth as any)?.token),
            hasQueryToken: typeof query.token === "string",
            hasBearer: Boolean(bearer),
            hasCookieAccessToken: Boolean(
              cookies["accessToken"] ||
                cookies["access_token"] ||
                cookies["jwt"] ||
                cookies["token"]
            ),
            hasXAccessToken: typeof headers["x-access-token"] === "string",
            providedUserId: Boolean(
              (socket.handshake.auth as any)?.userId || query.userId
            ),
          };
          console.log("Socket handshake debug:", dbg);
        } catch {}

        if (uid) {
          (socket as any).data = (socket as any).data || {};
          (socket as any).data.userId = uid;
          bindSocketToUser(socket, uid);
          // Persist socketId for this user (best-effort, non-blocking)
          (async () => {
            try {
              const conn = await mysql.createConnection(keys.database);
              await conn.execute(
                `UPDATE Users SET socketId = ? WHERE userId = ?`,
                [String(socket.id), uid]
              );
              await conn.end();
            } catch {}
          })();
        }
      } catch {}
      next();
    });

    // CORS: then the standard middleware to cover edge cases
    this.app.use(cors(corsOptions));
    this.app.options("*", cors(corsOptions));
    this.app.use(bodyParser.json({ limit: "50mb" }));
    this.app.use(urlencoded({ extended: false }));
    this.routes();

    //  this.app.use(fileUpload)
  }

  config(): void {
    this.app.set("port", process.env.PORT || keys.port);
  }

  routes(): void {
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
      // Try to identify the user from the Socket.IO handshake
      const headers = socket.handshake.headers || {};
      const query = (socket.handshake.query || {}) as Record<string, any>;
      const authHeader = (headers["authorization"] as string) || "";
      const cookieHeader = (headers["cookie"] as string) || "";

      const parseCookies = (cookieStr: string): Record<string, string> => {
        return cookieStr
          .split(";")
          .map((v) => v.trim())
          .filter(Boolean)
          .reduce((acc: Record<string, string>, cur: string) => {
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
      const token =
        (socket.handshake.auth && (socket.handshake.auth as any).token) ||
        (typeof query.token === "string" ? query.token : undefined) ||
        bearer ||
        cookies["accessToken"] ||
        cookies["access_token"] ||
        cookies["jwt"] ||
        cookies["token"] ||
        (typeof headers["x-access-token"] === "string"
          ? (headers["x-access-token"] as string)
          : undefined);

      let identifiedUser: string | number | undefined =
        (socket.handshake.auth && (socket.handshake.auth as any).userId) ||
        (typeof query.userId === "string" || typeof query.userId === "number"
          ? (query.userId as any)
          : undefined);

      if (!identifiedUser && token) {
        try {
          const decoded: any = jwt.decode(token);
          identifiedUser = decoded?.userId || decoded?.sub || undefined;
          console.log(identifiedUser);
        } catch {
          // ignore decode errors; we'll log as unknown
        }
      }

      const ip = socket.handshake.address || "unknown-ip";
      if (!identifiedUser && (socket as any).data?.userId) {
        identifiedUser = (socket as any).data.userId;
      }
      console.log(
        `Socket connected: id=${socket.id}, user=${
          identifiedUser ?? "unknown"
        }, ip=${ip}`
      );
      if (identifiedUser) {
        try {
          console.log("Online users snapshot:", getOnlineUsers());
        } catch {}
      }

      // Example: Send a welcome message to the connected user
      socket.emit("message", "Welcome to the server!");
      socket.on("message", (data) => {
        this.io.emit("message", data);
      });
      // Handle your socket.io events here
      // Allow late identification from the client after connect
      socket.on("register", (data: any = {}) => {
        try {
          const directId = data?.userId;
          const tok = data?.token;
          let uid: string | number | undefined = directId;
          if (!uid && tok) {
            try {
              const decoded: any = jwt.decode(tok);
              uid = decoded?.userId || decoded?.sub;
            } catch {}
          }
          if (uid) {
            bindSocketToUser(socket, uid);
            identifiedUser = uid;
            console.log(
              `Socket registered: id=${socket.id}, user=${identifiedUser}`
            );
            try {
              console.log("Online users snapshot:", getOnlineUsers());
            } catch {}
            // Persist socketId on late registration
            (async () => {
              try {
                const conn = await mysql.createConnection(keys.database);
                await conn.execute(
                  `UPDATE Users SET socketId = ? WHERE userId = ?`,
                  [String(socket.id), uid]
                );
                await conn.end();
              } catch {}
            })();
          } else {
            console.log(`Socket register failed: id=${socket.id}`);
          }
        } catch {}
      });
      socket.on("disconnect", () => {
        try {
          unbindSocket(socket);
        } catch {}
        console.log(
          `Socket disconnected: id=${socket.id}, user=${
            identifiedUser ?? "unknown"
          }`
        );
      });
    });
    this.app.use(WebsiteRoute);
    this.app.use(AuthenticateRoute);
    this.app.use(IndexRoute);

    this.app.use(checkAccessRoute);
    this.app.use(MainRoute);
    this.app.use(StructureRoute);
    this.app.use(RolesRoute);

    this.app.use(DocumentTypeRoute);

    this.app.use(DocumentAnswersRoute);

    this.app.use(UploadRoute);
    this.app.use(TasksRoute);
    this.app.use(GlobalRoutes); //3
    this.app.use(ActionsRoute);
    this.app.use(NotesRoutes);
    this.app.use(HistoryRoutes);
    this.app.use(DataTablesRoutes);
    this.app.use(SearchRoute);
    this.app.use(TaskTagDetailsRoute);
    this.app.use(UserIntrayRoute);
    this.app.use(AdminRolesManagerRoute);
    this.app.use(DocumentTypeRolesManagerRoute);
    this.app.use(InternalTagsRoute);
    this.app.use(ControlCenterRoutes);
    this.app.use(DocumentObjectRoute);

    //Admin Routes
    this.app.use(AdminDocumentTypeRoute);
    this.app.use(AdminDocumentTypeRolesRoute);
    this.app.use(AdminWorkflowRoutes);
    this.app.use(AdminDataTableRoute);
    this.app.use(AdminFormRoutes);
    this.app.use(AdminControlCenterRoutes);
    this.app.use(AdminNewsletterRoute);
    this.app.use(AdminOptionsDataRoute);
    this.app.use(AdminDocumentTagRoute);
    this.app.use(AdminUserSettingsTypesRoute);
    this.app.use(SocketRoutes);

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

export function containsScriptOrMaliciousContent(str: string): boolean {
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const urlPattern = /javascript:/i;
  return scriptPattern.test(str) || urlPattern.test(str);
}
