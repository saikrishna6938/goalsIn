import { Request, Response } from "express";
import { Entity, createEntityQuery } from "../modules/Entity";
import * as mysql from "mysql2/promise";
import keys from "../keys";
import {
  getDocumentGroupCounts,
  getDocumentStateCounts,
  getDocumentTypeNames,
  getTasksByEntity,
  getTaskSummary,
  getUserIdNameList,
  getUserTaskCounts,
} from "../helpers/dashboard/dashboard";
import { updateDashboardJson } from "../helpers/ControlCenters/UpdateOutStandingTasks";

class ControlCenterController {
  async GetEntityTasks(req: Request, res: Response) {
    const { entity, controlCenterId } = req.body;

    if (!controlCenterId) {
      return res.status(400).json({
        status: false,
        message: "controlCenterId is required",
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      // Load JSON structure from DB
      const [rows] = await connection.execute(
        `SELECT jsonObject FROM ControlCenters WHERE controlCenterId = ?`,
        [controlCenterId]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({
          status: false,
          message: "ControlCenter not found",
        });
      }

      let jsonStructure: any;
      try {
        //@ts-ignore
        jsonStructure = JSON.parse(rows[0].jsonObject);
      } catch (e) {
        return res.status(500).json({
          status: false,
          message: "Invalid JSON format in ControlCenter",
        });
      }
      let dashboardSummary = undefined;
      // Fetch entity-related data
      switch (jsonStructure.type) {
        case controlCenterTypes.APPLICATIONS_GROUP:
          dashboardSummary = await getApplicationsByGroup(
            connection,
            entity,
            jsonStructure
          );
          break;
        case controlCenterTypes.APPLICATIONS_USERS:
          dashboardSummary = await getApplicationsByUsers(
            connection,
            entity,
            jsonStructure
          );
          break;
        case controlCenterTypes.OUTSTANDING_TASKS:
          dashboardSummary = await getOutstandingTasks(
            connection,
            entity,
            jsonStructure
          );
          break;
        case controlCenterTypes.OUTSTANDING_APPLICATION_TASKS:
          dashboardSummary = await getOutstandingApplicationTasks(
            connection,
            entity,
            jsonStructure
          );
          break;
        case controlCenterTypes.OUTSTANDING_USERS:
          dashboardSummary = await getOutstandingUsers(
            connection,
            entity,
            jsonStructure
          );
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
      } else {
        res.json({ status: false, message: "No tasks found", data: "" });
      }
    } catch (error) {
      console.error("Error in GetEntityTasks:", error);
      res.json({ status: false, message: "Failed to get object" });
    } finally {
      await connection.end();
    }
  }
}

export async function getApplicationsByGroup(
  connection,
  entity,
  jsonStructure
) {
  const tasks = await getTasksByEntity(connection, entity);
  const filteredTasks = tasks.filter((task) => Number(task.groupTypeId) === 2);

  if (filteredTasks.length === 0) {
    return false;
  }

  const pieChartData = getDocumentGroupCounts(filteredTasks);
  const types = getDocumentTypeNames(filteredTasks);
  const stateCounts = getDocumentStateCounts(filteredTasks);
  const tasksSummary = getTaskSummary(filteredTasks);

  const dashboardSummary = updateDashboardJson(
    jsonStructure,
    pieChartData,
    types,
    stateCounts,
    tasksSummary
  );
  return dashboardSummary;
}
export async function getApplicationsByUsers(
  connection,
  entity,
  jsonStructure
) {
  const tasks = await getTasksByEntity(connection, entity);
  const filteredTasks = tasks.filter((task) => Number(task.groupTypeId) === 2);

  if (filteredTasks.length === 0) {
    return false;
  }

  const pieChartData = getDocumentGroupCounts(filteredTasks);
  const states = getDocumentStateCounts(filteredTasks);
  const users = getUserIdNameList(filteredTasks);
  const tasksSummary = getTaskSummary(filteredTasks);

  const dashboardSummary = updateDashboardJson(
    jsonStructure,
    pieChartData,
    states,
    users,
    tasksSummary
  );
  return dashboardSummary;
}

export async function getOutstandingTasks(connection, entity, jsonStructure) {
  const tasks = await getTasksByEntity(connection, entity);
  const filteredTasks = tasks.filter((task) => {
    const groupType = Number(task.groupTypeId);
    return groupType === 1 || groupType === 3;
  });

  if (filteredTasks.length === 0) {
    return false;
  }

  const pieChartData = getDocumentGroupCounts(filteredTasks);
  const types = getDocumentTypeNames(filteredTasks);
  const stateCounts = getDocumentStateCounts(filteredTasks);
  const tasksSummary = getTaskSummary(filteredTasks);

  const dashboardSummary = updateDashboardJson(
    jsonStructure,
    pieChartData,
    types,
    stateCounts,
    tasksSummary
  );
  return dashboardSummary;
}

export async function getOutstandingApplicationTasks(
  connection,
  entity,
  jsonStructure
) {
  const tasks = await getTasksByEntity(connection, entity);
  const filteredTasks = tasks.filter((task) => Number(task.groupTypeId) === 2);

  if (filteredTasks.length === 0) {
    return false;
  }

  const pieChartData = getDocumentGroupCounts(filteredTasks);
  const types = getDocumentTypeNames(filteredTasks);
  const stateCounts = getDocumentStateCounts(filteredTasks);
  const tasksSummary = getTaskSummary(filteredTasks);

  const dashboardSummary = updateDashboardJson(
    jsonStructure,
    pieChartData,
    types,
    stateCounts,
    tasksSummary
  );
  return dashboardSummary;
}

export async function getOutstandingUsers(connection, entity, jsonStructure) {
  const tasks = await getTasksByEntity(connection, entity);
  const filteredTasks = tasks.filter((task) => {
    const groupType = Number(task.groupTypeId);
    return groupType === 1 || groupType === 3;
  });

  if (filteredTasks.length === 0) {
    return false;
  }

  const pieChartData = getDocumentGroupCounts(filteredTasks);
  const states = getDocumentStateCounts(filteredTasks);
  const users = getUserIdNameList(filteredTasks);
  const tasksSummary = getTaskSummary(filteredTasks);

  const dashboardSummary = updateDashboardJson(
    jsonStructure,
    pieChartData,
    states,
    users,
    tasksSummary
  );
  return dashboardSummary;
}

export const controCenterController: ControlCenterController =
  new ControlCenterController();

enum controlCenterTypes {
  APPLICATIONS_GROUP,
  APPLICATIONS_USERS,
  OUTSTANDING_TASKS,
  OUTSTANDING_USERS,
  OUTSTANDING_APPLICATION_TASKS,
}
