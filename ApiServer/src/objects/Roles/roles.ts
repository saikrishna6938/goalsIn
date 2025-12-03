export interface SuperRoleType {
  roleTypeId: number;
  roleTypeName: string;
  roleTypeDescription: string | null;
  updatedDate: Date;
}

export interface SuperRoleName {
  roleNameId?: number;
  roleTypeId: number;
  roleName: string;
  roleNameDescription: string | null;
}

export interface SuperUserRole {
  superUserRoleId?: number;
  userId: number;
  userRoleNameId: number;
  updatedDate?: Date;
}

export const SuperRoleNameTable = {
  roleNameId: "number",
  roleTypeId: "number",
  roleName: "string",
  roleNameDescription: "string",
};

export const SuperUserRolesTable = {
  superUserRoleId: "number",
  userId: "number",
  userRoleNameId: "number",
  updatedDate: "Date",
};
