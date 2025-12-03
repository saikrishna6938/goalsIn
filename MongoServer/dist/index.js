"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const mongo_1 = require("./config/mongo");
const startServer = async () => {
    try {
        await (0, mongo_1.getMongoClient)();
        app_1.default.listen(env_1.appConfig.port, () => {
            console.log(`Mongo API server listening on port ${env_1.appConfig.port}`);
        });
    }
    catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};
startServer();
