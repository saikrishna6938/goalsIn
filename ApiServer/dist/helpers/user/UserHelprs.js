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
exports.fetchUserSettings = exports.getUsersByUserIds = exports.getSettingNamesBySubProfileId = exports.getRoleTypesFromUserRoles = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../keys"));
function getRoleTypesFromUserRoles(connection, userRoles) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const roleIds = userRoles.split(",").map((roleId) => parseInt(roleId, 10));
        const placeholders = Array.from({ length: roleIds.length }, () => "?").join(",");
        const [rolesResult] = yield connection.execute(`SELECT GROUP_CONCAT(roles) as rolesString FROM Roles WHERE roleId IN (${placeholders})`, roleIds);
        const rolesString = ((_a = rolesResult[0]) === null || _a === void 0 ? void 0 : _a.rolesString) || "";
        const rolesIds = rolesString.split(",").map((roleId) => parseInt(roleId, 10));
        const roleTypeIds = rolesIds.map((roleTypeId) => parseInt(roleTypeId, 10));
        const roleTypePlaceholders = Array.from({ length: roleTypeIds.length }, () => "?").join(",");
        const [roleTypes] = yield connection.execute(`SELECT roleTypeId,roleTypeName FROM RoleTypes WHERE roleTypeId IN (${roleTypePlaceholders})`, roleTypeIds);
        // Extract the role type names from the result
        //@ts-ignore
        //const roleTypeNames = roleTypes.map((roleType: any) => roleType.roleTypeName);
        return roleTypes;
    });
}
exports.getRoleTypesFromUserRoles = getRoleTypesFromUserRoles;
const pool = mysql.createPool(keys_1.default.database);
function getSettingNamesBySubProfileId(subProfileId, db = pool) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
    SELECT DISTINCT ust.Name
    FROM SubProfileSettings AS sps
    INNER JOIN UserSettingsTypes AS ust ON ust.Id = sps.SettingId
    WHERE sps.subProfileId = ?
    ORDER BY ust.Name ASC
  `;
        const [rows] = yield db.query(sql, [subProfileId]);
        return rows.map((r) => r.Name);
    });
}
exports.getSettingNamesBySubProfileId = getSettingNamesBySubProfileId;
function getUsersByUserIds(connection, userIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const placeholders = userIds.map(() => "?").join(",");
        const query = `
    SELECT userId, userFirstName, userLastName, userEmail,roles,entities
    FROM Users
    WHERE userId IN (${placeholders})
  `;
        const [result] = yield connection.execute(query, userIds);
        return result;
    });
}
exports.getUsersByUserIds = getUsersByUserIds;
const fetchUserSettings = (connection, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (isNaN(userId)) {
            throw new Error("Invalid userId");
        }
        const [settings] = yield connection.execute(`
      SELECT  ust.Id 
      FROM UserSettingsTypes ust
      INNER JOIN SubProfileSettings sps ON ust.Id = sps.SettingId
      INNER JOIN UserSubProfileTypes uspt ON sps.subProfileId = uspt.subProfileId
      WHERE uspt.userId = ?
      `, [userId]);
        return settings.map((s) => s.Id);
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to fetch user settings");
    }
});
exports.fetchUserSettings = fetchUserSettings;
//# sourceMappingURL=UserHelprs.js.map