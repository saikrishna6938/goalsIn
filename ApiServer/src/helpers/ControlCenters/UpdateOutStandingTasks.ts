import fs from "fs";
import path from "path";

export function updateDashboardJson(
  jsonData: any,
  one: any[],
  two: any[],
  three: any[],
  four: any[]
): any {
  jsonData.rows.forEach((rowObj) => {
    rowObj.row.forEach((component) => {
      if (component.type === "pie" && component.number === "one") {
        component.data = one;
      } else if (component.type === "bar" && component.number === "two") {
        component.data = two;
      } else if (
        component.type === "data-grid" &&
        component.number === "three"
      ) {
        component.data = three;
      } else if (
        component.type === "data-grid" &&
        component.number === "four"
      ) {
        component.data = four;
      }
    });
  });

  return jsonData;
}
