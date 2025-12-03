"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentGroups = exports.getCurrentDocumentStateActions = void 0;
function getCurrentDocumentStateActions(connection, documentStateId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch state details using only documentStateId
        const [stateDetails] = yield connection.execute("SELECT * FROM DocumentStates WHERE documentStateId = ?", [documentStateId]);
        // Fetch document actions related to the state
        const query = `
        SELECT 
          A.*, 
          OD.options
        FROM 
          Actions A
        LEFT JOIN 
          OptionsData OD ON A.optionId = OD.optionId
        WHERE 
          A.documentStateId = ? 
      `;
        const [documentActions] = yield connection.execute(query, [documentStateId]);
        // Return the combined result
        return [
            { stateDetails: stateDetails, documentActions: documentActions },
        ];
    });
}
exports.getCurrentDocumentStateActions = getCurrentDocumentStateActions;
function getDocumentGroups(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const [groups] = yield connection.execute("SELECT * from DocumentGroup");
        return [{ documentGroups: groups }];
    });
}
exports.getDocumentGroups = getDocumentGroups;
//# sourceMappingURL=DocumentTypeHelpers.js.map