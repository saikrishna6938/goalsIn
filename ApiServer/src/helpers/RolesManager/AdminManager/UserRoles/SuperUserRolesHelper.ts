import { Connection } from "mysql2/promise";
import { generateSQLQuery } from "../../../generic/SqlQueryCreator";
import { SuperUserRolesTable } from "../../../../objects/Roles/roles";

// Interface for SuperUserRoles
interface SuperUserRole {
  superUserRoleId?: number; // Optional for new entries
  userId: number; // Foreign key referencing Users
  userRoleNameId: number; // Foreign key referencing SuperRoleNames
  updatedDate?: Date; // Auto-managed by the database
}

// Insert a new SuperUserRole
export async function insertSuperUserRole(
  connection: Connection,
  body: SuperUserRole
): Promise<void> {
  const insertQuery = generateSQLQuery(
    "INSERT",
    "SuperUserRoles",
    body,
    SuperUserRolesTable
  );

  const { userId, userRoleNameId } = body;

  if (!userId || !userRoleNameId) {
    throw new Error(
      "userId and userRoleNameId are required for inserting a SuperUserRole"
    );
  }

  await connection.execute(insertQuery, [userId, userRoleNameId]);
}

// Update an existing SuperUserRole
export async function updateSuperUserRole(
  connection: Connection,
  body: SuperUserRole
): Promise<void> {
  // Dynamically collect values for placeholders
  const values = Object.keys(body)
    .filter((key) => key !== "superUserRoleId" && body[key] !== undefined) // Exclude `superUserRoleId` from SET
    .map((key) => body[key]);

  values.push(body.superUserRoleId);
  if (!body.superUserRoleId) {
    throw new Error("superUserRoleId is required for updating a SuperUserRole");
  }
  const updateQuery = generateSQLQuery(
    "UPDATE",
    "SuperUserRoles",
    body,
    SuperUserRolesTable,
    `superUserRoleId = ?`,
    "superUserRoleId"
  );
  await connection.execute(updateQuery, values);
}

// Delete a SuperUserRole
export async function deleteSuperUserRole(
  connection: Connection,
  superUserRoleId: number
): Promise<void> {
  const deleteQuery = generateSQLQuery(
    "DELETE",
    "SuperUserRoles",
    {},
    {
      superUserRoleId: "number",
    },
    `superUserRoleId = ?`
  );

  if (!superUserRoleId) {
    throw new Error("superUserRoleId is required for deleting a SuperUserRole");
  }

  await connection.execute(deleteQuery, [superUserRoleId]);
}

// Get all SuperUserRoles or by condition
export async function getSuperUserRoles(
  connection: Connection,
  condition?: string
): Promise<SuperUserRole[]> {
  const selectQuery = generateSQLQuery(
    "SELECT",
    "SuperUserRoles",
    {},
    SuperUserRolesTable,
    condition
  );

  const [rows] = await connection.execute(selectQuery);
  return rows as SuperUserRole[];
}

export async function updateMultipleSuperUserRoles(
  connection: Connection,
  body: SuperUserRole[]
): Promise<void> {
  const updatePromises = body.map((role) => {
    if (!role.superUserRoleId) {
      throw new Error("Each role must have a superUserRoleId for updating");
    }

    const updateQuery = generateSQLQuery(
      "UPDATE",
      "SuperUserRoles",
      role,
      {
        userId: "number",
        userRoleNameId: "number",
      },
      `superUserRoleId = ?`,
      "superUserRoleId"
    );

    const { userId, userRoleNameId, superUserRoleId } = role;

    return connection.execute(updateQuery, [
      userId,
      userRoleNameId,
      superUserRoleId,
    ]);
  });

  await Promise.all(updatePromises); // Wait for all update operations to complete
}

export async function insertMultipleSuperUserRoles(
  connection: Connection,
  body: SuperUserRole[]
): Promise<void> {
  const insertQuery = generateSQLQuery(
    "INSERT",
    "SuperUserRoles",
    body[0], // Use the first object to generate the query
    {
      userId: "number",
      userRoleNameId: "number",
    }
  );

  const insertValues = body.map((role) => {
    if (!role.userId || !role.userRoleNameId) {
      throw new Error(
        "Each role must have userId and userRoleNameId for inserting"
      );
    }
    return [role.userId, role.userRoleNameId];
  });

  const insertPromises = insertValues.map((values) =>
    connection.execute(insertQuery, values)
  );

  await Promise.all(insertPromises); // Wait for all insert operations to complete
}

export async function deleteMultipleSuperUserRoles(
  connection: Connection,
  ids: number[]
): Promise<void> {
  const deleteQuery = generateSQLQuery(
    "DELETE",
    "SuperUserRoles",
    {},
    {
      superUserRoleId: "number",
    },
    `superUserRoleId = ?`
  );

  const deletePromises = ids.map((id) => {
    if (!id) {
      throw new Error("Each ID must be valid for deletion");
    }
    return connection.execute(deleteQuery, [id]);
  });

  await Promise.all(deletePromises); // Wait for all delete operations to complete
}
