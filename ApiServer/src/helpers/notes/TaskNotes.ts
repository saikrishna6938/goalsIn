import * as mysql from "mysql2/promise";
export async function getUserNotes(
  connection: mysql.Connection,
  userId: number
) {
  const [result] = await connection.execute(
    "SELECT N.*, NV.notes_view_id AS id,NV.seen, T.taskName FROM NotesViews NV INNER JOIN Notes N ON N.noteId = NV.notes_id LEFT JOIN Tasks T ON T.taskId = N.noteTaskId WHERE NV.user_id = ? AND NV.seen = '0'",
    [userId]
  );

  return result as any;
}

export async function insertNotesView(
  connection: mysql.Connection,
  users: any[],
  lastInsertId: number
): Promise<any> {
  let query =
    "INSERT INTO `NotesViews` (`notes_view_id`, `notes_id`, `user_id`, `seen`) VALUES ";

  const values = users
    .map((id) => `(NULL, '${lastInsertId}', '${id}', '0')`)
    .join(", ");

  query += values;
  if (users.length > 0) {
    const [res] = await connection.execute(query);
    return res as any;
  }
}

interface UpdateResult {
  affectedRows: number;
  // Add other properties you expect in the result
}

export async function updateMarkAsRead(
  connection: mysql.Connection,
  userId: number
): Promise<UpdateResult> {
  try {
    const [result] = await connection.execute(
      "UPDATE NotesViews SET seen = '1' WHERE user_Id = ?",
      [userId]
    );
    return result as UpdateResult;
  } catch (error) {
    throw new Error("Failed to mark as read");
  }
}
