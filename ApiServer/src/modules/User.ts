export interface User {
  userId: number;
  userName: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userImage: string;
  userAddress: string;
  userServerEmail: string;
  userPhoneOne: string;
  userPhoneTow: string;
  userLastLogin: Date;
  userCreated: Date;
  userEnabled: boolean;
  userLocked: boolean;
  userType: number;
  entities: string;
}

export const UserSqlObject =
  "userId, userName, userEmail, userFirstName, userLastName, userImage, userAddress, userServerEmail, userPhoneOne, userPhoneTwo, userLastLogin, userCreated, userEnabled, userLocked, userType, lastNotesSeen";

export interface UserFix {
  userId: number;
  createdDatetime: Date;
  expireDatetime: Date;
  urlText: string;
}

export function buildUserWhere(
  baseQuery: string,
  body: Record<string, any>,
  allowed?: string[]
): { query: string; values: any[] } {
  // Never allow password in filters
  const disallowed = new Set<string>(["userPassword"]);
  const useWhitelist = Array.isArray(allowed) && allowed.length > 0;

  const where: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (disallowed.has(key)) continue;
    if (useWhitelist && !allowed!.includes(key)) continue;
    if (value === undefined || value === null || value === "") continue;

    // For simple equality filters; extend here if you need LIKE/range/etc.
    where.push(`${key} = ?`);
    values.push(value);
  }

  const clause = where.length ? where.join(" AND ") : "1=1";
  return { query: baseQuery + clause, values };
}

export function createUserQuery(baseQuery: string, body: any) {
  let updateStatements: string[] = [];
  let values: any[] = [];

  // Loop over each property in the body
  for (const [key, value] of Object.entries(body)) {
    // Skip userId as it is used in the WHERE clause
    if (key !== "userId") {
      // Add to the update statements
      updateStatements.push(`${key}=?`);
      // Also push the value to the values array
      values.push(value);
    }
  }

  // Return the modified query and the values array
  return { query: baseQuery + updateStatements.join(", "), values };
}

export const updateUserQuery = (query: string, body: User) => {
  const userObject = UserSqlObject.split(",");
  const length = Object.entries(body).length;
  Object.entries(body).map((k, i) => {
    query += ` ${k[0]} = '${k[1]}' `;
    if (i !== length - 1) query += ", ";
  });
  return query;
};
