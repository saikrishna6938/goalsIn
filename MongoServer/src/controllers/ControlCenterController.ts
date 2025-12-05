import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type { ControlCenters } from "../types/jotbox";

class ControlCenterController {
  GetEntityTasks = async (req: Request, res: Response) => {
    try {
      const controlCenterId = Number(req.body?.controlCenterId);
      if (!Number.isFinite(controlCenterId) || controlCenterId <= 0) {
        return res.status(400).json({ status: false, message: "controlCenterId is required" });
      }
      const db = await getMongoDb();
      const doc = await db
        .collection<ControlCenters>("ControlCenters")
        .findOne({ controlCenterId }, { projection: { _id: 0 } });
      if (!doc) {
        return res.status(404).json({ status: false, message: "ControlCenter not found" });
      }
      let jsonObject = doc.jsonObject;
      if (typeof jsonObject === "string") {
        try {
          jsonObject = JSON.parse(jsonObject);
        } catch {}
      }
      return res.json({
        status: true,
        message: "Success",
        data: {
          controlCenterId,
          name: doc.name,
          description: doc.description,
          jsonObject,
        },
      });
    } catch (error) {
      console.error("GetEntityTasks error", error);
      return res.json({ status: false, message: "Failed to get object" });
    }
  };
}

export const controCenterController = new ControlCenterController();
