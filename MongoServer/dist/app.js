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
app.use((req, res) => {
    res.status(404).json({ status: "not_found", path: req.path });
});
exports.default = app;
