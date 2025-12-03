"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeMongo = exports.getMongoDb = exports.getMongoClient = void 0;
const mongodb_1 = require("mongodb");
const env_1 = require("./env");
let client = null;
const getMongoClient = async () => {
    if (client) {
        return client;
    }
    client = new mongodb_1.MongoClient(env_1.appConfig.mongoUri, {
        monitorCommands: false,
    });
    await client.connect();
    return client;
};
exports.getMongoClient = getMongoClient;
const getMongoDb = async () => {
    const mongoClient = await (0, exports.getMongoClient)();
    return mongoClient.db(env_1.appConfig.database);
};
exports.getMongoDb = getMongoDb;
const closeMongo = async () => {
    if (client) {
        await client.close();
        client = null;
    }
};
exports.closeMongo = closeMongo;
