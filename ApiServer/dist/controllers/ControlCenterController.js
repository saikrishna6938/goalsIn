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
exports.controCenterController = exports.getOutstandingUsers = exports.getOutstandingApplicationTasks = exports.getOutstandingTasks = exports.getApplicationsByUsers = exports.getApplicationsByGroup = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
const dashboard_1 = require("../helpers/dashboard/dashboard");
const UpdateOutStandingTasks_1 = require("../helpers/ControlCenters/UpdateOutStandingTasks");
class ControlCenterController {
    GetEntityTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entity, controlCenterId } = req.body;
            if (!controlCenterId) {
                return res.status(400).json({
                    status: false,
                    message: "controlCenterId is required",
                });
            }
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                // Load JSON structure from DB
                const [rows] = yield connection.execute(`SELECT jsonObject FROM ControlCenters WHERE controlCenterId = ?`, [controlCenterId]);
                if (!Array.isArray(rows) || rows.length === 0) {
                    return res.status(404).json({
                        status: false,
                        message: "ControlCenter not found",
                    });
                }
                let jsonStructure;
                try {
                    //@ts-ignore
                    jsonStructure = JSON.parse(rows[0].jsonObject);
                }
                catch (e) {
                    return res.status(500).json({
                        status: false,
                        message: "Invalid JSON format in ControlCenter",
                    });
                }
                let dashboardSummary = undefined;
                // Fetch entity-related data
                switch (jsonStructure.type) {
                    case controlCenterTypes.APPLICATIONS_GROUP:
                        dashboardSummary = yield getApplicationsByGroup(connection, entity, jsonStructure);
                        break;
                    case controlCenterTypes.APPLICATIONS_USERS:
                        dashboardSummary = yield getApplicationsByUsers(connection, entity, jsonStructure);
                        break;
                    case controlCenterTypes.OUTSTANDING_TASKS:
                        dashboardSummary = yield getOutstandingTasks(connection, entity, jsonStructure);
                        break;
                    case controlCenterTypes.OUTSTANDING_APPLICATION_TASKS:
                        dashboardSummary = yield getOutstandingApplicationTasks(connection, entity, jsonStructure);
                        break;
                    case controlCenterTypes.OUTSTANDING_USERS:
                        dashboardSummary = yield getOutstandingUsers(connection, entity, jsonStructure);
                        break;
                    default:
                        break;
                }
                if (res) {
                    res.json({
                        status: true,
                        message: "Success",
                        data: dashboardSummary,
                    });
                }
                else {
                    res.json({ status: false, message: "No tasks found", data: "" });
                }
            }
            catch (error) {
                console.error("Error in GetEntityTasks:", error);
                res.json({ status: false, message: "Failed to get object" });
            }
            finally {
                yield connection.end();
            }
        });
    }
}
function getApplicationsByGroup(connection, entity, jsonStructure) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = yield (0, dashboard_1.getTasksByEntity)(connection, entity);
        const filteredTasks = tasks.filter((task) => Number(task.groupTypeId) === 2);
        if (filteredTasks.length === 0) {
            return false;
        }
        const pieChartData = (0, dashboard_1.getDocumentGroupCounts)(filteredTasks);
        const types = (0, dashboard_1.getDocumentTypeNames)(filteredTasks);
        const stateCounts = (0, dashboard_1.getDocumentStateCounts)(filteredTasks);
        const tasksSummary = (0, dashboard_1.getTaskSummary)(filteredTasks);
        const dashboardSummary = (0, UpdateOutStandingTasks_1.updateDashboardJson)(jsonStructure, pieChartData, types, stateCounts, tasksSummary);
        return dashboardSummary;
    });
}
exports.getApplicationsByGroup = getApplicationsByGroup;
function getApplicationsByUsers(connection, entity, jsonStructure) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = yield (0, dashboard_1.getTasksByEntity)(connection, entity);
        const filteredTasks = tasks.filter((task) => Number(task.groupTypeId) === 2);
        if (filteredTasks.length === 0) {
            return false;
        }
        const pieChartData = (0, dashboard_1.getDocumentGroupCounts)(filteredTasks);
        const states = (0, dashboard_1.getDocumentStateCounts)(filteredTasks);
        const users = (0, dashboard_1.getUserIdNameList)(filteredTasks);
        const tasksSummary = (0, dashboard_1.getTaskSummary)(filteredTasks);
        const dashboardSummary = (0, UpdateOutStandingTasks_1.updateDashboardJson)(jsonStructure, pieChartData, states, users, tasksSummary);
        return dashboardSummary;
    });
}
exports.getApplicationsByUsers = getApplicationsByUsers;
function getOutstandingTasks(connection, entity, jsonStructure) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = yield (0, dashboard_1.getTasksByEntity)(connection, entity);
        const filteredTasks = tasks.filter((task) => {
            const groupType = Number(task.groupTypeId);
            return groupType === 1 || groupType === 3;
        });
        if (filteredTasks.length === 0) {
            return false;
        }
        const pieChartData = (0, dashboard_1.getDocumentGroupCounts)(filteredTasks);
        const types = (0, dashboard_1.getDocumentTypeNames)(filteredTasks);
        const stateCounts = (0, dashboard_1.getDocumentStateCounts)(filteredTasks);
        const tasksSummary = (0, dashboard_1.getTaskSummary)(filteredTasks);
        const dashboardSummary = (0, UpdateOutStandingTasks_1.updateDashboardJson)(jsonStructure, pieChartData, types, stateCounts, tasksSummary);
        return dashboardSummary;
    });
}
exports.getOutstandingTasks = getOutstandingTasks;
function getOutstandingApplicationTasks(connection, entity, jsonStructure) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = yield (0, dashboard_1.getTasksByEntity)(connection, entity);
        const filteredTasks = tasks.filter((task) => Number(task.groupTypeId) === 2);
        if (filteredTasks.length === 0) {
            return false;
        }
        const pieChartData = (0, dashboard_1.getDocumentGroupCounts)(filteredTasks);
        const types = (0, dashboard_1.getDocumentTypeNames)(filteredTasks);
        const stateCounts = (0, dashboard_1.getDocumentStateCounts)(filteredTasks);
        const tasksSummary = (0, dashboard_1.getTaskSummary)(filteredTasks);
        const dashboardSummary = (0, UpdateOutStandingTasks_1.updateDashboardJson)(jsonStructure, pieChartData, types, stateCounts, tasksSummary);
        return dashboardSummary;
    });
}
exports.getOutstandingApplicationTasks = getOutstandingApplicationTasks;
function getOutstandingUsers(connection, entity, jsonStructure) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = yield (0, dashboard_1.getTasksByEntity)(connection, entity);
        const filteredTasks = tasks.filter((task) => {
            const groupType = Number(task.groupTypeId);
            return groupType === 1 || groupType === 3;
        });
        if (filteredTasks.length === 0) {
            return false;
        }
        const pieChartData = (0, dashboard_1.getDocumentGroupCounts)(filteredTasks);
        const states = (0, dashboard_1.getDocumentStateCounts)(filteredTasks);
        const users = (0, dashboard_1.getUserIdNameList)(filteredTasks);
        const tasksSummary = (0, dashboard_1.getTaskSummary)(filteredTasks);
        const dashboardSummary = (0, UpdateOutStandingTasks_1.updateDashboardJson)(jsonStructure, pieChartData, states, users, tasksSummary);
        return dashboardSummary;
    });
}
exports.getOutstandingUsers = getOutstandingUsers;
exports.controCenterController = new ControlCenterController();
var controlCenterTypes;
(function (controlCenterTypes) {
    controlCenterTypes[controlCenterTypes["APPLICATIONS_GROUP"] = 0] = "APPLICATIONS_GROUP";
    controlCenterTypes[controlCenterTypes["APPLICATIONS_USERS"] = 1] = "APPLICATIONS_USERS";
    controlCenterTypes[controlCenterTypes["OUTSTANDING_TASKS"] = 2] = "OUTSTANDING_TASKS";
    controlCenterTypes[controlCenterTypes["OUTSTANDING_USERS"] = 3] = "OUTSTANDING_USERS";
    controlCenterTypes[controlCenterTypes["OUTSTANDING_APPLICATION_TASKS"] = 4] = "OUTSTANDING_APPLICATION_TASKS";
})(controlCenterTypes || (controlCenterTypes = {}));
//# sourceMappingURL=ControlCenterController.js.map