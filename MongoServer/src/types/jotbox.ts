/* Auto-generated from jotbox.sql. Do not edit manually. */
/* Run `npm run generate-types` to refresh. */

export interface Actions {
  actionId: number; // `actionId` int(11) NOT NULL
  documentStateId?: number; // `documentStateId` int(11) DEFAULT NULL
  actionName: string; // `actionName` varchar(255) NOT NULL
  actionDescription?: string; // `actionDescription` text DEFAULT NULL
  actionCreatedDate?: Date | string; // `actionCreatedDate` timestamp NOT NULL DEFAULT current_timestamp()
  actionUpdatedDate?: Date | string; // `actionUpdatedDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  optionId: number; // `optionId` int(100) NOT NULL
}

export interface ActionStateTransitions {
  transitionId: number; // `transitionId` int(11) NOT NULL
  actionId: number; // `actionId` int(11) NOT NULL
  fromStateId?: number; // `fromStateId` int(11) DEFAULT NULL
  toStateId: number; // `toStateId` int(11) NOT NULL
}

export interface ControlCenters {
  controlCenterId: number; // `controlCenterId` int(11) NOT NULL
  name: string; // `name` varchar(255) NOT NULL
  description?: string; // `description` text DEFAULT NULL
  jsonObject?: unknown; // `jsonObject` longtext DEFAULT NULL
  created?: Date | string; // `created` datetime NOT NULL DEFAULT current_timestamp()
  updated?: Date | string; // `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  enabled?: boolean; // `enabled` tinyint(1) NOT NULL DEFAULT 1
}

export interface DataTables {
  tableId: number; // `tableId` int(11) NOT NULL
  tableName: string; // `tableName` varchar(255) NOT NULL
  fields: string; // `fields` text NOT NULL
}

export interface DocumentGroup {
  documentGroupId: number; // `documentGroupId` int(11) NOT NULL
  documentGroupName?: string; // `documentGroupName` varchar(255) DEFAULT NULL
  documentGroupDescription?: string; // `documentGroupDescription` varchar(255) DEFAULT NULL
  dataTableId: number; // `dataTableId` int(11) NOT NULL
  groupTypeId?: number; // `groupTypeId` int(11) DEFAULT 1
}

export interface DocumentGroupType {
  groupTypeId: number; // `groupTypeId` int(11) NOT NULL
  groupTypeName: string; // `groupTypeName` varchar(255) NOT NULL
}

export interface DocumentStates {
  documentStateId: number; // `documentStateId` int(11) NOT NULL
  documentStateName: string; // `documentStateName` varchar(255) NOT NULL
  documentStateDescription?: string; // `documentStateDescription` text DEFAULT NULL
  documentStateCreatedDate?: Date | string; // `documentStateCreatedDate` timestamp NOT NULL DEFAULT current_timestamp()
  documentStateUpdatedDate?: Date | string; // `documentStateUpdatedDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  WorkflowID?: number; // `WorkflowID` int(11) DEFAULT NULL
  steps?: number; // `steps` int(11) DEFAULT NULL
}

export interface DocumentStatesApprovers {
  documentStatesApproversId: number; // `documentStatesApproversId` int(11) NOT NULL
  documentStatesId: number; // `documentStatesId` int(11) NOT NULL
  roleNameId: number; // `roleNameId` int(11) NOT NULL
}

export interface DocumentTagAnswers {
  documentTagAnswersId: number; // `documentTagAnswersId` int(11) NOT NULL
  documentTagAnswersObject: unknown; // `documentTagAnswersObject` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`documentTagAnswersObject`))
  created?: Date | string; // `created` datetime DEFAULT current_timestamp()
  updated?: Date | string; // `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
  taskId: number; // `taskId` int(11) NOT NULL
  uploadId: string; // `uploadId` text NOT NULL
}

export interface DocumentTagObject {
  documentTagObjectId: number; // `documentTagObjectId` int(11) NOT NULL
  name: string; // `name` varchar(255) NOT NULL
  description?: string; // `description` text DEFAULT NULL
  updated?: Date | string; // `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
  created?: Date | string; // `created` datetime DEFAULT current_timestamp()
  documentTagObject: unknown; // `documentTagObject` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`documentTagObject`))
}

export interface DocumentType {
  documentTypeId: number; // `documentTypeId` int(11) NOT NULL
  documentTypeName?: string; // `documentTypeName` varchar(255) DEFAULT NULL
  documentTypeDescription?: string; // `documentTypeDescription` varchar(255) DEFAULT NULL
  documentTypeObjectId?: number; // `documentTypeObjectId` int(11) DEFAULT NULL
  tableName?: string; // `tableName` text DEFAULT NULL
  documentGroupId: number; // `documentGroupId` int(11) NOT NULL
  documentTagObjectId?: number; // `documentTagObjectId` int(11) DEFAULT NULL
  documentTypeRoles: string; // `documentTypeRoles` varchar(255) NOT NULL
  documentTypeTableId?: number; // `documentTypeTableId` int(100) NOT NULL DEFAULT 0
  enabled?: number; // `enabled` int(10) NOT NULL DEFAULT 1
}

export interface DocumentTypeAnswers {
  documentTypeAnswersId: number; // `documentTypeAnswersId` bigint(20) UNSIGNED NOT NULL
  documentTypeId: number; // `documentTypeId` int(11) NOT NULL
  userId: number; // `userId` int(11) NOT NULL
  documentTypeAnswersObject: unknown; // `documentTypeAnswersObject` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`documentTypeAnswersObject`))
  createdDate?: Date | string; // `createdDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  updatedDate?: Date | string; // `updatedDate` timestamp NOT NULL DEFAULT current_timestamp()
}

export interface DocumentTypeObject {
  documentTypeObjectId: number; // `documentTypeObjectId` int(11) NOT NULL
  name: string; // `name` varchar(200) NOT NULL
  description: string; // `description` text NOT NULL
  created?: Date | string; // `created` datetime NOT NULL DEFAULT current_timestamp()
  updated?: Date | string; // `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  documentTypeObject?: unknown; // `documentTypeObject` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documentTypeObject`))
}

export interface Fields {
  fieldTypeId: number; // `fieldTypeId` int(11) NOT NULL
  fieldTypeName?: string; // `fieldTypeName` varchar(255) DEFAULT NULL
}

export interface GermanyUniversities {
  Id: number; // `Id` int(11) NOT NULL
  UniversityName?: string; // `UniversityName` varchar(255) DEFAULT NULL
  DegreeAccepted_15yr?: string; // `DegreeAccepted_15yr` varchar(50) DEFAULT NULL
  PortalORDirect?: string; // `PortalORDirect` varchar(50) DEFAULT NULL
  ProgramLevel?: string; // `ProgramLevel` varchar(50) DEFAULT NULL
  Concentration?: string; // `Concentration` varchar(100) DEFAULT NULL
  PrivateORPublic?: string; // `PrivateORPublic` varchar(50) DEFAULT NULL
  Location?: string; // `Location` varchar(100) DEFAULT NULL
  DurationInMonths?: string; // `DurationInMonths` varchar(50) DEFAULT NULL
  ProgramName?: string; // `ProgramName` varchar(255) DEFAULT NULL
  Currency?: string; // `Currency` varchar(50) DEFAULT NULL
  ApplicationFee?: string; // `ApplicationFee` varchar(50) DEFAULT NULL
  InitialDeposit?: string; // `InitialDeposit` varchar(50) DEFAULT NULL
  TuitionFee?: string; // `TuitionFee` varchar(50) DEFAULT NULL
  LastQualificationScoreInPercentage?: string; // `LastQualificationScoreInPercentage` varchar(50) DEFAULT NULL
  GRE?: string; // `GRE` varchar(50) DEFAULT NULL
  IELTS?: string; // `IELTS` varchar(50) DEFAULT NULL
  IELTSNBLT?: string; // `IELTSNBLT` varchar(50) DEFAULT NULL
  TOEFL?: string; // `TOEFL` varchar(50) DEFAULT NULL
  TOEFLNBLT?: string; // `TOEFLNBLT` varchar(50) DEFAULT NULL
  Duolingo?: string; // `Duolingo` varchar(50) DEFAULT NULL
  DuolingoNBLT?: string; // `DuolingoNBLT` varchar(50) DEFAULT NULL
  PTE?: string; // `PTE` varchar(50) DEFAULT NULL
  PTENBLT?: string; // `PTENBLT` varchar(50) DEFAULT NULL
  BACKLOGS?: string; // `BACKLOGS` varchar(50) DEFAULT NULL
  MOIAccepted?: string; // `MOIAccepted` varchar(50) DEFAULT NULL
  WESRequired?: string; // `WESRequired` varchar(50) DEFAULT NULL
  Deadlines?: string; // `Deadlines` varchar(255) DEFAULT NULL
}

export interface History {
  historyId: number; // `historyId` int(100) NOT NULL
  historyTypeId?: number; // `historyTypeId` int(11) DEFAULT NULL
  historyUserId?: number; // `historyUserId` int(11) DEFAULT NULL
  historyCreatedDate?: Date | string; // `historyCreatedDate` datetime DEFAULT NULL
  historyTaskId?: number; // `historyTaskId` int(11) DEFAULT NULL
}

export interface HistoryTypes {
  historyTypeId: number; // `historyTypeId` int(11) NOT NULL
  historyTypeName: string; // `historyTypeName` varchar(255) NOT NULL
}

export interface Newsletters {
  newsletterId: number; // `newsletterId` int(11) NOT NULL
  newsletterTypeId: number; // `newsletterTypeId` int(11) NOT NULL
  newsletterName: string; // `newsletterName` varchar(299) NOT NULL
  newsletterDescription: string; // `newsletterDescription` text NOT NULL
}

export interface NewsletterType {
  typeId: number; // `typeId` int(11) NOT NULL
  typeName: string; // `typeName` varchar(299) NOT NULL
  typeDescription: string; // `typeDescription` text NOT NULL
}

export interface Notes {
  noteId: number; // `noteId` int(11) NOT NULL
  noteCreated?: Date | string; // `noteCreated` datetime DEFAULT current_timestamp()
  noteUserId?: number; // `noteUserId` int(11) DEFAULT NULL
  noteComment?: string; // `noteComment` text DEFAULT NULL
  noteTypeId?: number; // `noteTypeId` int(11) DEFAULT NULL
  noteMentions?: string; // `noteMentions` text DEFAULT NULL
  noteTaskId?: number; // `noteTaskId` int(11) DEFAULT NULL
}

export interface NotesType {
  noteTypeId: number; // `noteTypeId` int(11) NOT NULL
  noteName: string; // `noteName` varchar(255) NOT NULL
  noteTypeDescription?: string; // `noteTypeDescription` text DEFAULT NULL
}

export interface NotesViews {
  notes_view_id: number; // `notes_view_id` int(100) NOT NULL
  notes_id: number; // `notes_id` int(100) NOT NULL
  user_id: number; // `user_id` int(100) NOT NULL
  seen?: number; // `seen` int(10) NOT NULL DEFAULT 0
}

export interface OptionsData {
  optionId: number; // `optionId` int(100) NOT NULL
  optionName: string; // `optionName` varchar(100) NOT NULL
  options: unknown; // `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`))
}

export interface Roles {
  roleId: number; // `roleId` int(11) NOT NULL
  roleTypeId: number; // `roleTypeId` int(11) NOT NULL
  roleName: string; // `roleName` varchar(255) NOT NULL
  roleDescription: string; // `roleDescription` varchar(255) NOT NULL
  entities?: string; // `entities` text NOT NULL DEFAULT '1'
  roles: string; // `roles` varchar(100) NOT NULL
}

export interface RoleTypes {
  roleTypeId: number; // `roleTypeId` int(11) NOT NULL
  roleTypeName: string; // `roleTypeName` varchar(255) NOT NULL
  roleTypeDescription: string; // `roleTypeDescription` varchar(255) NOT NULL
}

export interface States {
  stateId: number; // `stateId` int(11) NOT NULL
  stateName: string; // `stateName` varchar(255) NOT NULL
  stateCreate?: Date | string; // `stateCreate` timestamp NOT NULL DEFAULT current_timestamp()
  stateUpdate?: Date | string; // `stateUpdate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  stateDescription?: string; // `stateDescription` text DEFAULT NULL
}

export interface Structure {
  entityId: number; // `entityId` int(11) NOT NULL
  entityName: string; // `entityName` varchar(255) NOT NULL
  entityLocation: string; // `entityLocation` varchar(255) NOT NULL
  entityPhone: string; // `entityPhone` varchar(255) NOT NULL
  entityDescription?: string; // `entityDescription` text DEFAULT NULL
  userRoleNameId?: number; // `userRoleNameId` int(11) DEFAULT NULL
  RefCode: string; // `RefCode` varchar(10) NOT NULL
}

export interface StructureOptionValues {
  id: number; // `id` int(11) NOT NULL
  entityId: number; // `entityId` int(11) NOT NULL
  optionId: number; // `optionId` int(11) NOT NULL
  selectedOptionId: number; // `selectedOptionId` int(11) NOT NULL
  valueLabel: string; // `valueLabel` varchar(255) NOT NULL
  notes?: string; // `notes` text DEFAULT NULL
}

export interface SubProfileSettings {
  profileSettingsId: number; // `profileSettingsId` int(11) NOT NULL
  SettingId: number; // `SettingId` int(11) NOT NULL
  subProfileId: number; // `subProfileId` int(11) NOT NULL
  dataTypeId: number; // `dataTypeId` int(11) NOT NULL
  value: number; // `value` int(11) NOT NULL
}

export interface SubProfileTypes {
  subProfileId: number; // `subProfileId` int(11) NOT NULL
  subProfileName: string; // `subProfileName` varchar(255) NOT NULL
}

export interface Subscriptions {
  Id: number; // `Id` int(11) NOT NULL
  Name: string; // `Name` varchar(100) NOT NULL
  Email: string; // `Email` varchar(100) NOT NULL
  CreatedDate?: Date | string; // `CreatedDate` timestamp NULL DEFAULT current_timestamp()
}

export interface SuperDocumentTypeRoles {
  documentTypeRoleId: number; // `documentTypeRoleId` int(11) NOT NULL
  documentTypeId: number; // `documentTypeId` int(11) NOT NULL
  roleNameId: number; // `roleNameId` int(11) NOT NULL
  documentSecurity: string; // `documentSecurity` varchar(50) NOT NULL
}

export interface SuperRoleNames {
  roleNameId: number; // `roleNameId` int(11) NOT NULL
  roleTypeId: number; // `roleTypeId` int(11) NOT NULL
  roleName: string; // `roleName` varchar(100) NOT NULL
  roleNameDescription?: string; // `roleNameDescription` text DEFAULT NULL
}

export interface SuperRoleTypes {
  roleTypeId: number; // `roleTypeId` int(11) NOT NULL
  roleTypeName: string; // `roleTypeName` varchar(100) NOT NULL
  roleTypeDescription?: string; // `roleTypeDescription` text DEFAULT NULL
  updatedDate?: Date | string; // `updatedDate` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
}

export interface SuperUserRoles {
  superUserRoleId: number; // `superUserRoleId` int(11) NOT NULL
  userId: number; // `userId` int(11) NOT NULL
  userRoleNameId: number; // `userRoleNameId` int(11) NOT NULL
  updatedDate?: Date | string; // `updatedDate` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
}

export interface TaskEntities {
  id: number; // `id` int(11) NOT NULL
  taskEntityId: number; // `taskEntityId` int(11) NOT NULL
  taskId: number; // `taskId` int(11) NOT NULL
}

export interface Tasks {
  taskId: number; // `taskId` int(11) NOT NULL
  taskName?: string; // `taskName` varchar(255) DEFAULT NULL
  documentTypeAnswersId?: number; // `documentTypeAnswersId` int(11) DEFAULT NULL
  documentTypeId?: number; // `documentTypeId` int(11) DEFAULT NULL
  userId?: number; // `userId` int(11) DEFAULT NULL
  createdDate?: Date | string; // `createdDate` timestamp NOT NULL DEFAULT current_timestamp()
  updatedDate?: Date | string; // `updatedDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  attachments?: unknown; // `attachments` longtext DEFAULT NULL
  documentStateId?: number; // `documentStateId` int(11) DEFAULT 1
  taskTableId?: number; // `taskTableId` int(100) NOT NULL DEFAULT -1
  taskTagId?: number; // `taskTagId` int(100) NOT NULL DEFAULT -1
  taskUsers: string; // `taskUsers` varchar(100) NOT NULL
}

export interface TaskTagDetails {
  taskTagDetailsId: number; // `taskTagDetailsId` int(10) NOT NULL
  taskTagDetailsName: string; // `taskTagDetailsName` varchar(100) NOT NULL
  taskTagDetailsDescription: string; // `taskTagDetailsDescription` text NOT NULL
  taskTagDetailsData: string; // `taskTagDetailsData` text NOT NULL
  taskTagTableId: number; // `taskTagTableId` int(100) NOT NULL
}

export interface TaskWorkflow {
  taskWorkflowId: number; // `taskWorkflowId` int(100) NOT NULL
  taskId: number; // `taskId` int(100) NOT NULL
  taskSelectedOption: string; // `taskSelectedOption` varchar(300) NOT NULL
  taskNote: string; // `taskNote` text NOT NULL
  taskWorkflowDate?: Date | string; // `taskWorkflowDate` datetime NOT NULL DEFAULT current_timestamp()
  taskUserId: number; // `taskUserId` int(100) NOT NULL
  taskActionId: number; // `taskActionId` int(100) NOT NULL
}

export interface UkTable {
  Id: number; // `Id` int(11) NOT NULL
  UniversityName?: string; // `UniversityName` varchar(100) DEFAULT NULL
  DegreeAccepted?: string; // `DegreeAccepted` varchar(50) DEFAULT NULL
  PortalOrDirect?: string; // `PortalOrDirect` varchar(50) DEFAULT NULL
  LevelOfStudy?: string; // `LevelOfStudy` varchar(50) DEFAULT NULL
  Duration?: string; // `Duration` varchar(50) DEFAULT NULL
  Location?: string; // `Location` varchar(50) DEFAULT NULL
  Campus?: string; // `Campus` varchar(50) DEFAULT NULL
  Currency?: string; // `Currency` varchar(50) DEFAULT NULL
  AppFeeWaiverAvailable?: string; // `AppFeeWaiverAvailable` varchar(50) DEFAULT NULL
  InitialDeposit?: string; // `InitialDeposit` varchar(50) DEFAULT NULL
  Scholarship?: string; // `Scholarship` varchar(50) DEFAULT NULL
  ProgramName?: string; // `ProgramName` varchar(300) DEFAULT NULL
  WithoutMaths?: string; // `WithoutMaths` varchar(50) DEFAULT NULL
  TuitionFeePerYear?: string; // `TuitionFeePerYear` varchar(50) DEFAULT NULL
  GPAoutOf4?: string; // `GPAoutOf4` varchar(50) DEFAULT NULL
  GREorGMATorSATorACT?: string; // `GREorGMATorSATorACT` varchar(50) DEFAULT NULL
  IELTS?: string; // `IELTS` varchar(50) DEFAULT NULL
  IELTSNBLT?: string; // `IELTSNBLT` varchar(50) DEFAULT NULL
  TOEFL?: string; // `TOEFL` varchar(50) DEFAULT NULL
  TOEFLNBLT?: string; // `TOEFLNBLT` varchar(50) DEFAULT NULL
  DUOLINGO?: string; // `DUOLINGO` varchar(50) DEFAULT NULL
  DuolingoNBLT?: string; // `DuolingoNBLT` varchar(50) DEFAULT NULL
  PTE?: string; // `PTE` varchar(50) DEFAULT NULL
  PTENBLT?: string; // `PTENBLT` varchar(50) DEFAULT NULL
  BACKLOGS?: string; // `BACKLOGS` varchar(50) DEFAULT NULL
  IELTSWaiverScoreCBSE?: string; // `IELTSWaiverScoreCBSE` varchar(200) DEFAULT NULL
  IELTSWaiverScoreState?: string; // `IELTSWaiverScoreState` varchar(200) DEFAULT NULL
  MOIAccepted?: string; // `MOIAccepted` varchar(50) DEFAULT NULL
  MOICondition?: string; // `MOICondition` varchar(50) DEFAULT NULL
  EnglishWaiverGAPAccepted?: string; // `EnglishWaiverGAPAccepted` varchar(50) DEFAULT NULL
  Intakes?: string; // `Intakes` varchar(50) DEFAULT NULL
  IntakeDeadLines?: string; // `IntakeDeadLines` varchar(50) DEFAULT NULL
}

export interface UploadFiles {
  uploadId: number; // `uploadId` int(11) NOT NULL
  uploadName?: string; // `uploadName` varchar(255) DEFAULT NULL
  uploadedDate?: Date | string; // `uploadedDate` datetime DEFAULT current_timestamp()
  fileData?: unknown; // `fileData` longtext DEFAULT NULL
  fileName: string; // `fileName` varchar(200) NOT NULL
  fileType: string; // `fileType` varchar(200) NOT NULL
  fileSize: number; // `fileSize` int(10) NOT NULL
}

export interface UsaFinal {
  Id: number; // `Id` int(11) NOT NULL
  UniversityName?: string; // `UniversityName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  "15yrDegreeAccepted"?: string; // `15yrDegreeAccepted` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  PortalOrDirect?: string; // `PortalOrDirect` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  LevelOfStudy?: string; // `LevelOfStudy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  Duration?: string; // `Duration` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  PrivateOrPublic?: string; // `PrivateOrPublic` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  Location?: string; // `Location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  Campus?: string; // `Campus` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  Currency?: string; // `Currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  ApplicationFee?: string; // `ApplicationFee` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  I20DepositFee?: string; // `I20DepositFee` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  Scholarship?: string; // `Scholarship` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  Concentration?: string; // `Concentration` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  ProgramName?: string; // `ProgramName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  TuitionFeePerSemester?: string; // `TuitionFeePerSemester` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  TuitionFeePerYear?: string; // `TuitionFeePerYear` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  TuitionFeePerCourse?: string; // `TuitionFeePerCourse` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  Credits?: string; // `Credits` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  PerCreditRate?: string; // `PerCreditRate` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  GPAoutOf4?: string; // `GPAoutOf4` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  GREorGMATorSATorACT?: string; // `GREorGMATorSATorACT` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  IELTS?: string; // `IELTS` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  IELTSNBLT?: string; // `IELTSNBLT` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  TOEFL?: string; // `TOEFL` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  TOEFLNBLT?: string; // `TOEFLNBLT` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  DUOLINGO?: string; // `DUOLINGO` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  DuolingoNBLT?: string; // `DuolingoNBLT` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  PTE?: string; // `PTE` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  PTENBLT?: string; // `PTENBLT` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  BACKLOGS?: string; // `BACKLOGS` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  MOIAccepted?: string; // `MOIAccepted` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  WESRequired?: string; // `WESRequired` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  Intakes?: string; // `Intakes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  Deadlines?: string; // `Deadlines` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
  InsertName?: string; // `InsertName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
}

export interface UserActions {
  userActionId: number; // `userActionId` int(11) NOT NULL
  actionId: number; // `actionId` int(11) NOT NULL
  userType: number; // `userType` int(10) NOT NULL
  actionTaskId: number; // `actionTaskId` int(100) NOT NULL
}

export interface UserDetails {
  userDetailsId: number; // `userDetailsId` int(11) NOT NULL
  avatar?: unknown; // `avatar` longtext DEFAULT NULL
  preferences?: unknown; // `preferences` longtext DEFAULT NULL
}

export interface UserDocumentsPermission {
  userDocumentPermissionId: number; // `userDocumentPermissionId` int(10) NOT NULL
  userType: number; // `userType` int(10) NOT NULL
  documentTypeId: number; // `documentTypeId` int(10) NOT NULL
  submissions?: number; // `submissions` int(10) NOT NULL DEFAULT 0
}

export interface UserFix {
  userId: number; // `userId` int(11) NOT NULL
  createdDatetime?: Date | string; // `createdDatetime` datetime DEFAULT NULL
  expireDatetime?: Date | string; // `expireDatetime` datetime DEFAULT NULL
  urlText?: string; // `urlText` varchar(255) DEFAULT NULL
}

export interface UserIntray {
  id: number; // `id` int(11) NOT NULL
  uploadId: number; // `uploadId` int(11) NOT NULL
  userID: number; // `userID` int(11) NOT NULL
  intrayPath?: string; // `intrayPath` varchar(255) DEFAULT NULL
  documentType?: string; // `documentType` varchar(100) DEFAULT NULL
  dateTime?: Date | string; // `dateTime` datetime DEFAULT current_timestamp()
}

export interface UserPermissions {
  Id: number; // `Id` int(11) NOT NULL
  name?: string; // `name` varchar(255) DEFAULT NULL
}

export interface Users {
  userId: number; // `userId` int(11) NOT NULL
  userName: string; // `userName` varchar(255) NOT NULL
  userEmail: string; // `userEmail` varchar(255) NOT NULL
  userPassword: string; // `userPassword` varchar(255) NOT NULL
  userFirstName: string; // `userFirstName` varchar(255) NOT NULL
  userLastName: string; // `userLastName` varchar(255) NOT NULL
  socketId: number; // `socketId` int(200) NOT NULL
  userImage?: string; // `userImage` varchar(255) DEFAULT NULL
  userAddress?: string; // `userAddress` varchar(255) DEFAULT NULL
  userServerEmail?: string; // `userServerEmail` varchar(255) DEFAULT NULL
  userPhoneOne?: string; // `userPhoneOne` varchar(255) DEFAULT NULL
  userPhoneTwo?: string; // `userPhoneTwo` varchar(255) DEFAULT NULL
  userLastLogin?: Date | string; // `userLastLogin` datetime DEFAULT NULL
  userCreated?: Date | string; // `userCreated` datetime DEFAULT current_timestamp()
  userEnabled?: boolean; // `userEnabled` tinyint(1) DEFAULT NULL
  userLocked?: boolean; // `userLocked` tinyint(1) DEFAULT NULL
  userType?: number; // `userType` int(11) DEFAULT 2
  roles?: string; // `roles` varchar(255) DEFAULT '4'
  entities?: string; // `entities` varchar(255) NOT NULL DEFAULT '1'
  lastNotesSeen?: Date | string; // `lastNotesSeen` datetime NOT NULL DEFAULT current_timestamp()
}

export interface UserSettingsTypes {
  Id: number; // `Id` int(11) NOT NULL
  Name: string; // `Name` varchar(255) NOT NULL
}

export interface UserSubProfileTypes {
  userSubProfileId: number; // `userSubProfileId` int(11) NOT NULL
  subProfileId: number; // `subProfileId` int(11) NOT NULL
  userId: number; // `userId` int(11) NOT NULL
}

export interface UserTypes {
  userTypeId: number; // `userTypeId` int(10) NOT NULL
  userTypeName: string; // `userTypeName` varchar(100) NOT NULL
}

export interface Workflow {
  WorkflowID: number; // `WorkflowID` int(11) NOT NULL
  WorkflowName: string; // `WorkflowName` varchar(255) NOT NULL
  Description?: string; // `Description` text DEFAULT NULL
  CreatedAt?: Date | string; // `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
}

export interface WorkflowDocumentTypes {
  workflowDocumentTypeID: number; // `workflowDocumentTypeID` int(11) NOT NULL
  workflowID: number; // `workflowID` int(11) NOT NULL
  DocumentTypeID: number; // `DocumentTypeID` int(11) NOT NULL
}
