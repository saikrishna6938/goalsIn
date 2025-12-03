import * as mysql from "mysql2/promise";

export async function getCurrentDocumentStateActions(
  connection: mysql.Connection,
  documentStateId: number
) {
  // Fetch state details using only documentStateId
  const [stateDetails] = await connection.execute(
    "SELECT * FROM DocumentStates WHERE documentStateId = ?",
    [documentStateId]
  );

  // Fetch document actions related to the state
  const query = `
        SELECT 
          A.*, 
          OD.options
        FROM 
          Actions A
        LEFT JOIN 
          OptionsData OD ON A.optionId = OD.optionId
        WHERE 
          A.documentStateId = ? 
      `;

  const [documentActions] = await connection.execute(query, [documentStateId]);

  // Return the combined result
  return [
    { stateDetails: stateDetails, documentActions: documentActions },
  ] as any;
}
export async function getDocumentGroups(connection: mysql.Connection) {
  const [groups] = await connection.execute("SELECT * from DocumentGroup");

  return [{ documentGroups: groups }] as any;
}
