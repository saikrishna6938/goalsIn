export interface User {
  userId?: number;
  userName?: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  userImage?: null | string;
  userAddress?: null | string;
  userServerEmail?: null | string;
  userPhoneOne?: null | string;
  userPhoneTwo?: null | string;
  userLastLogin?: null | string;
  userCreated?: null | string;
  userEnabled?: number;
  userLocked?: number;
  userType?: number;
  userPassword?: null | string;
  entities?: string;
  roles?: string;
}

interface TasksOntime {
  onTime: any[];
  critical: any[];
}
interface Navigation {
  name: string;
  path?: string;
  icon: string;
  children?: Navigation[];
}
interface DashboardCounts {
  [key: string]: number;
}
export interface LoginResponse {
  success: boolean;
  message: string;
  user: User[];
  accessToken: string;
  refreshToken: string;
  navigations: Navigation[];
  notes?: Note[];
  dashboardCounts: DashboardCounts;
  tasks: TasksOntime;
  pendingTasks: Map<string, Map<string, number[]>>;
  userSettings: UserSettingTypes[];
}
interface Note {
  id: number;
  noteComment: string;
  noteCreated: string;
  noteId: number;
  noteMentions: string;
  noteTaskId: number;
  noteTypeId: number;
  noteUserId: number;
  seen: number;
  taskName: string;
}

export const enum UserForm {
  index = 1,
  apply = 2,
}

export const enum Entity {
  Entity = 1,
  Options = 2,
}

export const enum UserTypes {
  ADMIN_USER = 1,
  DEFAULT_USER = 2,
  JOBS_USER = 3,
  ENTITY_ADMIN_USER = 4,
  SUPER_ADMIN_USER = 5,
}

export enum UserSettingTypes {
  SearchSettings = 1,
  InternalTagUpdate = 2,
  DocumentTagDetails = 3,
}

export const hasUserSettings = (
  userSettings: UserSettingTypes[],
  setting: number
): boolean => {
  return userSettings.some((u) => u === setting);
};

export enum IndexType {
  INDEX = 1,
  APPLY = 2,
  CREATE = 3,
}
