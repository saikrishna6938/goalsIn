"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEntityQuery = exports.EntitySqlObject = void 0;
exports.EntitySqlObject = "entityId, entityName, entityLocation, entityPhone, entityDescription";
const createEntityQuery = (query, body) => {
    const userObject = exports.EntitySqlObject.split(",");
    const length = Object.entries(body).length;
    Object.entries(body).map((k, i) => {
        if (k[0] !== "entityId") {
            query += ` ${k[0]} = '${k[1]}' `;
            if (i !== length - 1)
                query += ", ";
        }
    });
    return query;
};
exports.createEntityQuery = createEntityQuery;
//# sourceMappingURL=Entity.js.map