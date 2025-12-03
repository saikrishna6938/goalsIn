"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserQuery = exports.createUserQuery = exports.buildUserWhere = exports.UserSqlObject = void 0;
exports.UserSqlObject = "userId, userName, userEmail, userFirstName, userLastName, userImage, userAddress, userServerEmail, userPhoneOne, userPhoneTwo, userLastLogin, userCreated, userEnabled, userLocked, userType, lastNotesSeen";
function buildUserWhere(baseQuery, body, allowed) {
    // Never allow password in filters
    const disallowed = new Set(["userPassword"]);
    const useWhitelist = Array.isArray(allowed) && allowed.length > 0;
    const where = [];
    const values = [];
    for (const [key, value] of Object.entries(body)) {
        if (disallowed.has(key))
            continue;
        if (useWhitelist && !allowed.includes(key))
            continue;
        if (value === undefined || value === null || value === "")
            continue;
        // For simple equality filters; extend here if you need LIKE/range/etc.
        where.push(`${key} = ?`);
        values.push(value);
    }
    const clause = where.length ? where.join(" AND ") : "1=1";
    return { query: baseQuery + clause, values };
}
exports.buildUserWhere = buildUserWhere;
function createUserQuery(baseQuery, body) {
    let updateStatements = [];
    let values = [];
    // Loop over each property in the body
    for (const [key, value] of Object.entries(body)) {
        // Skip userId as it is used in the WHERE clause
        if (key !== "userId") {
            // Add to the update statements
            updateStatements.push(`${key}=?`);
            // Also push the value to the values array
            values.push(value);
        }
    }
    // Return the modified query and the values array
    return { query: baseQuery + updateStatements.join(", "), values };
}
exports.createUserQuery = createUserQuery;
const updateUserQuery = (query, body) => {
    const userObject = exports.UserSqlObject.split(",");
    const length = Object.entries(body).length;
    Object.entries(body).map((k, i) => {
        query += ` ${k[0]} = '${k[1]}' `;
        if (i !== length - 1)
            query += ", ";
    });
    return query;
};
exports.updateUserQuery = updateUserQuery;
//# sourceMappingURL=User.js.map