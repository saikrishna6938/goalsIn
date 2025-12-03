"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUUID = void 0;
const getUUID = (name) => {
    const buffer = Buffer.from(name, "utf-8");
    const base64Text = buffer.toString("base64");
    return base64Text;
};
exports.getUUID = getUUID;
//# sourceMappingURL=appUtils.js.map