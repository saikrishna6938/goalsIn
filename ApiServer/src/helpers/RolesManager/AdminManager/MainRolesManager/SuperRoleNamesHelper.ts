import { Connection } from "mysql2/promise";
import { SuperRoleNameTable } from "../../../../objects/Roles/roles";
import { generateSQLQuery } from "../../../generic/SqlQueryCreator";

// Interface for SuperRoleName
interface SuperRoleName {
  roleNameId?: number; // Optional for new entries
  roleTypeId: number; // Foreign key referencing SuperRoleTypes
  roleName: string; // Name of the role
  roleNameDescription: string | null; // Description of the role name (nullable)
}

// Function to get all role names
export async function getSuperRoleNames(
  connection: Connection
): Promise<SuperRoleName[]> {
  const query = `SELECT * FROM SuperRoleNames`;
  const [rows] = await connection.execute(query);
  return rows as SuperRoleName[];
}

// Function to insert a new role name
export async function insertSuperRoleName(
  connection: Connection,
  body: SuperRoleName
): Promise<void> {
  const query = `
        INSERT INTO SuperRoleNames (roleTypeId, roleName, roleNameDescription)
        VALUES (?, ?, ?)
    `;
  const { roleTypeId, roleName, roleNameDescription } = body;

  // Validate required fields
  if (!roleTypeId || !roleName) {
    throw new Error(
      "roleTypeId and roleName are required to insert a role name"
    );
  }

  await connection.execute(query, [
    roleTypeId,
    roleName,
    roleNameDescription || null,
  ]);
}

// Function to delete a role name by ID
export async function deleteSuperRoleName(
  connection: Connection,
  roleNameId: number
): Promise<void> {
  const query = `DELETE FROM SuperRoleNames WHERE roleNameId = ?`;

  // Validate required ID
  if (!roleNameId) {
    throw new Error("roleNameId is required to delete a role name");
  }

  await connection.execute(query, [roleNameId]);
}

// Function to update a role name
export async function updateSuperRoleName(
  connection: Connection,
  body: SuperRoleName
): Promise<void> {
  // Validate required fields
  if (!body.roleNameId) {
    throw new Error("roleNameId is required for updating a role name");
  }

  // Dynamically generate the query
  const updateQuery = generateSQLQuery(
    "UPDATE",
    "SuperRoleNames",
    body,
    SuperRoleNameTable,
    `roleNameId = ?`,
    "roleNameId"
  );

  // Dynamically collect values for placeholders
  const values = Object.keys(body)
    .filter((key) => key !== "roleNameId" && body[key] !== undefined) // Exclude `roleNameId` from SET
    .map((key) => body[key]);

  values.push(body.roleNameId); // Add `roleNameId` for WHERE condition
  // Execute the query
  await connection.execute(updateQuery, values);
}
