import { Request, Response } from "express";
import { getMongoDb } from "../../config/mongo";

const toTaskId = (raw: any): number => {
  const taskId = Number(raw);
  return Number.isFinite(taskId) && taskId > 0 ? taskId : -1;
};

const fetchGroupType = async (taskId: number) => {
  const db = await getMongoDb();
  const pipeline = [
    { $match: { taskId } },
    {
      $lookup: {
        from: "DocumentType",
        localField: "documentTypeId",
        foreignField: "documentTypeId",
        as: "documentType",
      },
    },
    { $unwind: { path: "$documentType", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "DocumentGroup",
        localField: "documentType.documentGroupId",
        foreignField: "documentGroupId",
        as: "documentGroup",
      },
    },
    { $unwind: { path: "$documentGroup", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "DocumentGroupType",
        localField: "documentGroup.groupTypeId",
        foreignField: "groupTypeId",
        as: "groupType",
      },
    },
    { $unwind: { path: "$groupType", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        groupIndexType: "$documentGroup.groupTypeId",
        groupTypeName: "$groupType.groupTypeName",
      },
    },
    { $limit: 1 },
  ];
  const doc = await db.collection("Tasks").aggregate(pipeline).next();
  return doc ?? { groupIndexType: null, groupTypeName: null };
};

export const getGroupIndexTypeByTaskId = async (req: Request, res: Response) => {
  try {
    const taskId = toTaskId((req.params as any)?.taskId ?? (req.body as any)?.taskId);
    if (taskId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid taskId" });
    }
    const info = await fetchGroupType(taskId);
    if (!info || (info.groupIndexType == null && !info.groupTypeName)) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    return res.json({
      success: true,
      data: {
        taskId,
        groupIndexType: info.groupIndexType ?? null,
        groupTypeName: info.groupTypeName ?? null,
      },
    });
  } catch (error) {
    console.error("getGroupIndexTypeByTaskId error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch groupIndexType",
      error: (error as Error).message,
    });
  }
};

export const getIndexName = async (taskIdRaw: any): Promise<string | null> => {
  const taskId = toTaskId(taskIdRaw);
  if (taskId <= 0) return null;
  try {
    const info = await fetchGroupType(taskId);
    return info?.groupTypeName ?? null;
  } catch (error) {
    console.error("getIndexName error:", error);
    return null;
  }
};

export const getIndexTypeAndName = async (
  taskIdRaw: any
): Promise<{ indexType: number | null; name: string | null } | null> => {
  const taskId = toTaskId(taskIdRaw);
  if (taskId <= 0) return null;
  try {
    const info = await fetchGroupType(taskId);
    if (!info) {
      return { indexType: null, name: null };
    }
    return {
      indexType: info.groupIndexType ?? null,
      name: info.groupTypeName ?? null,
    };
  } catch (error) {
    console.error("getIndexTypeAndName error:", error);
    return null;
  }
};
