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
exports.structureController = void 0;
const Entity_1 = require("../modules/Entity");
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
class StructureController {
    addEntity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const entity = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`INSERT INTO Structure ( entityName, entityLocation, entityPhone, entityDescription,userRoleNameId,RefCode)
        VALUES (?, ?, ?, ?, ?, ?)`, [
                    entity.entityName,
                    entity.entityLocation,
                    entity.entityPhone,
                    entity.entityDescription,
                    entity.userRoleNameId,
                    entity.RefCode,
                ]);
                res.json({ success: true, message: "Entity details added successfully" });
            }
            catch (error) {
                console.log(error);
                res
                    .status(500)
                    .json({ success: false, message: "Failed to add entity details" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getEntities(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`SELECT * FROM Structure`);
                res.json({
                    success: true,
                    message: "Success",
                    entities: result,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to get entities" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    updateEntity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const entityId = req.params.entityId;
                const updatedEntity = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                let query = `UPDATE Structure SET `;
                query = (0, Entity_1.createEntityQuery)(query, req.body);
                query += ` WHERE entityId=${entityId}`;
                const [result] = yield connection.execute(query);
                res.json({
                    success: true,
                    message: "Entity details updated successfully",
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to update entity details" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getEntity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const entityId = req.params.entityId;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`SELECT * FROM Structure WHERE entityId = ?`, [entityId]);
                //@ts-ignore
                if (result.length > 0)
                    res.json({ success: true, message: "Success", entity: result[0] });
                else
                    res.json({ success: true, message: "No Entities found", entity: {} });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to delete entity" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    deleteEntity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const entityId = req.params.entityId;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`DELETE FROM Structure WHERE entityId = ?`, [entityId]);
                res.json({ success: true, message: "Entity deleted successfully" });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to delete entity" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
}
exports.structureController = new StructureController();
//# sourceMappingURL=StructureController.js.map