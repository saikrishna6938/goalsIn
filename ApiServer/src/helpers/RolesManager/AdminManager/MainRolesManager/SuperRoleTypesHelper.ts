import { Connection } from "mysql2/promise";

// TypeScript interface for SuperRoleType
interface SuperRoleType {
  roleTypeId?: number; // Optional for new records
  roleTypeName: string;
  roleTypeDescription: string | null;
  updatedDate?: Date; // Auto-managed by the database
}

// Function to get all role types
export async function getRoleTypes(
  connection: Connection
): Promise<SuperRoleType[]> {
  const query = `SELECT * FROM SuperRoleTypes`;
  const [rows] = await connection.execute(query);
  return rows as SuperRoleType[];
}

// Function to update a role type
export async function updateRoleType(
  connection: Connection,
  roleType: SuperRoleType
): Promise<void> {
  if (!roleType.roleTypeId) {
    throw new Error("roleTypeId is required for updating a role type");
  }

  const query = `
        UPDATE SuperRoleTypes
        SET roleTypeName = ?, roleTypeDescription = ?, updatedDate = NOW()
        WHERE roleTypeId = ?
    `;
  const { roleTypeName, roleTypeDescription, roleTypeId } = roleType;
  await connection.execute(query, [
    roleTypeName,
    roleTypeDescription,
    roleTypeId,
  ]);
}

// Function to delete a role type
export async function deleteRoleType(
  connection: Connection,
  roleTypeId: number
): Promise<void> {
  const query = `DELETE FROM SuperRoleTypes WHERE roleTypeId = ?`;
  await connection.execute(query, [roleTypeId]);
}

// Function to insert a new role type
export async function insertRoleType(
  connection: Connection,
  roleType: SuperRoleType
): Promise<void> {
  const query = `
        INSERT INTO SuperRoleTypes (roleTypeName, roleTypeDescription, updatedDate)
        VALUES (?, ?, NOW())
    `;
  const { roleTypeName, roleTypeDescription } = roleType;
  await connection.execute(query, [roleTypeName, roleTypeDescription]);
}
