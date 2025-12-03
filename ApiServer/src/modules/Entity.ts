export interface Entity {
  entityId: number;
  entityName: string;
  entityLocation: string;
  entityPhone: string;
  entityDescription: string;
  userRoleNameId: number;
  RefCode: string;
}

export const EntitySqlObject =
  "entityId, entityName, entityLocation, entityPhone, entityDescription";

export const createEntityQuery = (query: string, body: Entity) => {
  const userObject = EntitySqlObject.split(",");
  const length = Object.entries(body).length;
  Object.entries(body).map((k, i) => {
    if (k[0] !== "entityId") {
      query += ` ${k[0]} = '${k[1]}' `;
      if (i !== length - 1) query += ", ";
    }
  });
  return query;
};
