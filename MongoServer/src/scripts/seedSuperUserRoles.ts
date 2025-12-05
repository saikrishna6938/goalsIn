import { getMongoDb, closeMongo } from "../config/mongo";
import type { SuperUserRoles } from "../types/jotbox";

const seedData: SuperUserRoles[] = [
  {
    superUserRoleId: 1,
    userId: 1,
    userRoleNameId: 1,
    updatedDate: new Date("2024-12-21T13:52:12Z") as any,
  },
];

const seedSuperUserRoles = async () => {
  const db = await getMongoDb();
  const collection = db.collection<SuperUserRoles>("SuperUserRoles");
  console.log(`Upserting ${seedData.length} SuperUserRoles documents...`);
  for (const doc of seedData) {
    await collection.updateOne({ superUserRoleId: doc.superUserRoleId }, { $set: doc }, { upsert: true });
  }
  console.log("SuperUserRoles seeding complete.");
};

seedSuperUserRoles()
  .catch((error) => {
    console.error("Failed to seed SuperUserRoles", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeMongo();
  });
