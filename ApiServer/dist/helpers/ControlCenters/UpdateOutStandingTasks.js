"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDashboardJson = void 0;
function updateDashboardJson(jsonData, one, two, three, four) {
    jsonData.rows.forEach((rowObj) => {
        rowObj.row.forEach((component) => {
            if (component.type === "pie" && component.number === "one") {
                component.data = one;
            }
            else if (component.type === "bar" && component.number === "two") {
                component.data = two;
            }
            else if (component.type === "data-grid" &&
                component.number === "three") {
                component.data = three;
            }
            else if (component.type === "data-grid" &&
                component.number === "four") {
                component.data = four;
            }
        });
    });
    return jsonData;
}
exports.updateDashboardJson = updateDashboardJson;
//# sourceMappingURL=UpdateOutStandingTasks.js.map