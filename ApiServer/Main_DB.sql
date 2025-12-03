-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 09, 2025 at 01:33 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.0.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Main_DB`
--

-- --------------------------------------------------------

--
-- Table structure for table `Actions`
--

CREATE TABLE `Actions` (
  `actionId` int(11) NOT NULL,
  `documentStateId` int(11) DEFAULT NULL,
  `actionName` varchar(255) NOT NULL,
  `actionDescription` text DEFAULT NULL,
  `actionCreatedDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `actionUpdatedDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `optionId` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ActionStateTransitions`
--

CREATE TABLE `ActionStateTransitions` (
  `transitionId` int(11) NOT NULL,
  `actionId` int(11) NOT NULL,
  `fromStateId` int(11) DEFAULT NULL,
  `toStateId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ControlCenters`
--

CREATE TABLE `ControlCenters` (
  `controlCenterId` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `jsonObject` longtext DEFAULT NULL,
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `indexType` int(10) NOT NULL DEFAULT 1,
  `enabled` tinyint(1) NOT NULL DEFAULT 1
) ;

-- --------------------------------------------------------

--
-- Table structure for table `DataTables`
--

CREATE TABLE `DataTables` (
  `tableId` int(11) NOT NULL,
  `tableName` varchar(255) NOT NULL,
  `fields` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DataTypes`
--

CREATE TABLE `DataTypes` (
  `Id` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Type` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentGroup`
--

CREATE TABLE `DocumentGroup` (
  `documentGroupId` int(11) NOT NULL,
  `documentGroupName` varchar(255) DEFAULT NULL,
  `documentGroupDescription` varchar(255) DEFAULT NULL,
  `dataTableId` int(11) NOT NULL,
  `groupTypeId` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentGroupType`
--

CREATE TABLE `DocumentGroupType` (
  `groupTypeId` int(11) NOT NULL,
  `groupTypeName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentStates`
--

CREATE TABLE `DocumentStates` (
  `documentStateId` int(11) NOT NULL,
  `documentStateName` varchar(255) NOT NULL,
  `documentStateDescription` text DEFAULT NULL,
  `documentStateCreatedDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `documentStateUpdatedDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `WorkflowID` int(11) DEFAULT NULL,
  `steps` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentStatesApprovers`
--

CREATE TABLE `DocumentStatesApprovers` (
  `documentStatesApproversId` int(11) NOT NULL,
  `documentStatesId` int(11) NOT NULL,
  `roleNameId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentTagAnswers`
--

CREATE TABLE `DocumentTagAnswers` (
  `documentTagAnswersId` int(11) NOT NULL,
  `documentTagAnswersObject` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`documentTagAnswersObject`)),
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `taskId` int(11) NOT NULL,
  `uploadId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentTagObject`
--

CREATE TABLE `DocumentTagObject` (
  `documentTagObjectId` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created` datetime DEFAULT current_timestamp(),
  `documentTagObject` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`documentTagObject`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentType`
--

CREATE TABLE `DocumentType` (
  `documentTypeId` int(11) NOT NULL,
  `documentTypeName` varchar(255) DEFAULT NULL,
  `documentTypeDescription` varchar(255) DEFAULT NULL,
  `documentTypeObjectId` int(11) DEFAULT NULL,
  `tableName` text DEFAULT NULL,
  `documentGroupId` int(11) NOT NULL,
  `documentTagObjectId` int(11) DEFAULT NULL,
  `documentTypeRoles` varchar(255) NOT NULL,
  `documentTypeTableId` int(100) NOT NULL DEFAULT 0,
  `enabled` int(10) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentTypeAnswers`
--

CREATE TABLE `DocumentTypeAnswers` (
  `documentTypeAnswersId` bigint(20) UNSIGNED NOT NULL,
  `documentTypeId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `documentTypeAnswersObject` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`documentTypeAnswersObject`)),
  `createdDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updatedDate` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentTypeObject`
--

CREATE TABLE `DocumentTypeObject` (
  `documentTypeObjectId` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `documentTypeObject` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documentTypeObject`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentTypeRoles`
--

CREATE TABLE `DocumentTypeRoles` (
  `documentTypeRolesId` int(11) NOT NULL,
  `documentTypeId` int(11) DEFAULT NULL,
  `documentTypeRoleId` int(11) DEFAULT NULL,
  `permissions` varchar(100) NOT NULL,
  `roleNameId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Fields`
--

CREATE TABLE `Fields` (
  `fieldTypeId` int(11) NOT NULL,
  `fieldTypeName` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `GermanyUniversities`
--

CREATE TABLE `GermanyUniversities` (
  `Id` int(11) NOT NULL,
  `UniversityName` varchar(255) DEFAULT NULL,
  `DegreeAccepted_15yr` varchar(50) DEFAULT NULL,
  `PortalORDirect` varchar(50) DEFAULT NULL,
  `ProgramLevel` varchar(50) DEFAULT NULL,
  `Concentration` varchar(100) DEFAULT NULL,
  `PrivateORPublic` varchar(50) DEFAULT NULL,
  `Location` varchar(100) DEFAULT NULL,
  `DurationInMonths` varchar(50) DEFAULT NULL,
  `ProgramName` varchar(255) DEFAULT NULL,
  `Currency` varchar(50) DEFAULT NULL,
  `ApplicationFee` varchar(50) DEFAULT NULL,
  `InitialDeposit` varchar(50) DEFAULT NULL,
  `TuitionFee` varchar(50) DEFAULT NULL,
  `LastQualificationScoreInPercentage` varchar(50) DEFAULT NULL,
  `GRE` varchar(50) DEFAULT NULL,
  `IELTS` varchar(50) DEFAULT NULL,
  `IELTSNBLT` varchar(50) DEFAULT NULL,
  `TOEFL` varchar(50) DEFAULT NULL,
  `TOEFLNBLT` varchar(50) DEFAULT NULL,
  `Duolingo` varchar(50) DEFAULT NULL,
  `DuolingoNBLT` varchar(50) DEFAULT NULL,
  `PTE` varchar(50) DEFAULT NULL,
  `PTENBLT` varchar(50) DEFAULT NULL,
  `BACKLOGS` varchar(50) DEFAULT NULL,
  `MOIAccepted` varchar(50) DEFAULT NULL,
  `WESRequired` varchar(50) DEFAULT NULL,
  `Deadlines` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `History`
--

CREATE TABLE `History` (
  `historyId` int(100) NOT NULL,
  `historyTypeId` int(11) DEFAULT NULL,
  `historyUserId` int(11) DEFAULT NULL,
  `historyCreatedDate` datetime DEFAULT NULL,
  `historyTaskId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `HistoryTypes`
--

CREATE TABLE `HistoryTypes` (
  `historyTypeId` int(11) NOT NULL,
  `historyTypeName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Newsletters`
--

CREATE TABLE `Newsletters` (
  `newsletterId` int(11) NOT NULL,
  `newsletterTypeId` int(11) NOT NULL,
  `newsletterName` varchar(299) NOT NULL,
  `newsletterDescription` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `NewsletterType`
--

CREATE TABLE `NewsletterType` (
  `typeId` int(11) NOT NULL,
  `typeName` varchar(299) NOT NULL,
  `typeDescription` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Notes`
--

CREATE TABLE `Notes` (
  `noteId` int(11) NOT NULL,
  `noteCreated` datetime DEFAULT current_timestamp(),
  `noteUserId` int(11) DEFAULT NULL,
  `noteComment` text DEFAULT NULL,
  `noteTypeId` int(11) DEFAULT NULL,
  `noteMentions` text DEFAULT NULL,
  `noteTaskId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `NotesType`
--

CREATE TABLE `NotesType` (
  `noteTypeId` int(11) NOT NULL,
  `noteName` varchar(255) NOT NULL,
  `noteTypeDescription` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `NotesViews`
--

CREATE TABLE `NotesViews` (
  `notes_view_id` int(100) NOT NULL,
  `notes_id` int(100) NOT NULL,
  `user_id` int(100) NOT NULL,
  `seen` int(10) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `OptionsData`
--

CREATE TABLE `OptionsData` (
  `optionId` int(100) NOT NULL,
  `optionName` varchar(100) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Roles`
--

CREATE TABLE `Roles` (
  `roleId` int(11) NOT NULL,
  `roleTypeId` int(11) NOT NULL,
  `roleName` varchar(255) NOT NULL,
  `roleDescription` varchar(255) NOT NULL,
  `entities` text NOT NULL DEFAULT '1',
  `roles` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `RoleTypes`
--

CREATE TABLE `RoleTypes` (
  `roleTypeId` int(11) NOT NULL,
  `roleTypeName` varchar(255) NOT NULL,
  `roleTypeDescription` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `States`
--

CREATE TABLE `States` (
  `stateId` int(11) NOT NULL,
  `stateName` varchar(255) NOT NULL,
  `stateCreate` timestamp NOT NULL DEFAULT current_timestamp(),
  `stateUpdate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `stateDescription` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Structure`
--

CREATE TABLE `Structure` (
  `entityId` int(11) NOT NULL,
  `entityName` varchar(255) NOT NULL,
  `entityLocation` varchar(255) NOT NULL,
  `entityPhone` varchar(255) NOT NULL,
  `entityDescription` text DEFAULT NULL,
  `userRoleNameId` int(11) DEFAULT NULL,
  `RefCode` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `StructureOptionValues`
--

CREATE TABLE `StructureOptionValues` (
  `id` int(11) NOT NULL,
  `entityId` int(11) NOT NULL,
  `optionId` int(11) NOT NULL,
  `selectedOptionId` int(11) NOT NULL,
  `valueLabel` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SubProfileSettings`
--

CREATE TABLE `SubProfileSettings` (
  `profileSettingsId` int(11) NOT NULL,
  `SettingId` int(11) NOT NULL,
  `subProfileId` int(11) NOT NULL,
  `dataTypeId` int(11) NOT NULL,
  `value` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SubProfileTypes`
--

CREATE TABLE `SubProfileTypes` (
  `subProfileId` int(11) NOT NULL,
  `subProfileName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Subscriptions`
--

CREATE TABLE `Subscriptions` (
  `Id` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `CreatedDate` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SuperDocumentTypeRoles`
--

CREATE TABLE `SuperDocumentTypeRoles` (
  `documentTypeRoleId` int(11) NOT NULL,
  `documentTypeId` int(11) NOT NULL,
  `roleNameId` int(11) NOT NULL,
  `documentSecurity` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SuperRoleNames`
--

CREATE TABLE `SuperRoleNames` (
  `roleNameId` int(11) NOT NULL,
  `roleTypeId` int(11) NOT NULL,
  `roleName` varchar(100) NOT NULL,
  `roleNameDescription` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SuperRoleTypes`
--

CREATE TABLE `SuperRoleTypes` (
  `roleTypeId` int(11) NOT NULL,
  `roleTypeName` varchar(100) NOT NULL,
  `roleTypeDescription` text DEFAULT NULL,
  `updatedDate` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SuperUserRoles`
--

CREATE TABLE `SuperUserRoles` (
  `superUserRoleId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `userRoleNameId` int(11) NOT NULL,
  `updatedDate` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TaskEntities`
--

CREATE TABLE `TaskEntities` (
  `id` int(11) NOT NULL,
  `taskEntityId` int(11) NOT NULL,
  `taskId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Tasks`
--

CREATE TABLE `Tasks` (
  `taskId` int(11) NOT NULL,
  `taskName` varchar(255) DEFAULT NULL,
  `documentTypeAnswersId` int(11) DEFAULT NULL,
  `documentTypeId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `attachments` longtext DEFAULT NULL,
  `documentStateId` int(11) DEFAULT 1,
  `taskTableId` int(100) NOT NULL DEFAULT -1,
  `taskTagId` int(100) NOT NULL DEFAULT -1,
  `taskUsers` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TaskTagDetails`
--

CREATE TABLE `TaskTagDetails` (
  `taskTagDetailsId` int(10) NOT NULL,
  `taskTagDetailsName` varchar(100) NOT NULL,
  `taskTagDetailsDescription` text NOT NULL,
  `taskTagDetailsData` text NOT NULL,
  `taskTagTableId` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TaskWorkflow`
--

CREATE TABLE `TaskWorkflow` (
  `taskWorkflowId` int(100) NOT NULL,
  `taskId` int(100) NOT NULL,
  `taskSelectedOption` varchar(300) NOT NULL,
  `taskNote` text NOT NULL,
  `taskWorkflowDate` datetime NOT NULL DEFAULT current_timestamp(),
  `taskUserId` int(100) NOT NULL,
  `taskActionId` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TestTable2`
--

CREATE TABLE `TestTable2` (
  `id` int(11) NOT NULL,
  `name` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `age` text DEFAULT NULL,
  `__EMPTY` text DEFAULT NULL,
  `__EMPTY_1` text DEFAULT NULL,
  `__EMPTY_2` text DEFAULT NULL,
  `__EMPTY_3` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TestTable3`
--

CREATE TABLE `TestTable3` (
  `id` int(11) NOT NULL,
  `name` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `age` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TestTable4`
--

CREATE TABLE `TestTable4` (
  `id` int(11) NOT NULL,
  `name` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `age` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UkTable`
--

CREATE TABLE `UkTable` (
  `Id` int(11) NOT NULL,
  `UniversityName` varchar(100) DEFAULT NULL,
  `DegreeAccepted` varchar(50) DEFAULT NULL,
  `PortalOrDirect` varchar(50) DEFAULT NULL,
  `LevelOfStudy` varchar(50) DEFAULT NULL,
  `Duration` varchar(50) DEFAULT NULL,
  `Location` varchar(50) DEFAULT NULL,
  `Campus` varchar(50) DEFAULT NULL,
  `Currency` varchar(50) DEFAULT NULL,
  `AppFeeWaiverAvailable` varchar(50) DEFAULT NULL,
  `InitialDeposit` varchar(50) DEFAULT NULL,
  `Scholarship` varchar(50) DEFAULT NULL,
  `ProgramName` varchar(300) DEFAULT NULL,
  `WithoutMaths` varchar(50) DEFAULT NULL,
  `TuitionFeePerYear` varchar(50) DEFAULT NULL,
  `GPAoutOf4` varchar(50) DEFAULT NULL,
  `GREorGMATorSATorACT` varchar(50) DEFAULT NULL,
  `IELTS` varchar(50) DEFAULT NULL,
  `IELTSNBLT` varchar(50) DEFAULT NULL,
  `TOEFL` varchar(50) DEFAULT NULL,
  `TOEFLNBLT` varchar(50) DEFAULT NULL,
  `DUOLINGO` varchar(50) DEFAULT NULL,
  `DuolingoNBLT` varchar(50) DEFAULT NULL,
  `PTE` varchar(50) DEFAULT NULL,
  `PTENBLT` varchar(50) DEFAULT NULL,
  `BACKLOGS` varchar(50) DEFAULT NULL,
  `IELTSWaiverScoreCBSE` varchar(200) DEFAULT NULL,
  `IELTSWaiverScoreState` varchar(200) DEFAULT NULL,
  `MOIAccepted` varchar(50) DEFAULT NULL,
  `MOICondition` varchar(50) DEFAULT NULL,
  `EnglishWaiverGAPAccepted` varchar(50) DEFAULT NULL,
  `Intakes` varchar(50) DEFAULT NULL,
  `IntakeDeadLines` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UploadFiles`
--

CREATE TABLE `UploadFiles` (
  `uploadId` int(11) NOT NULL,
  `uploadName` varchar(255) DEFAULT NULL,
  `uploadedDate` datetime DEFAULT current_timestamp(),
  `fileData` longtext DEFAULT NULL,
  `fileName` varchar(200) NOT NULL,
  `fileType` varchar(200) NOT NULL,
  `fileSize` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UsaFinal`
--

CREATE TABLE `UsaFinal` (
  `Id` int(11) NOT NULL,
  `UniversityName` varchar(255) DEFAULT NULL,
  `15yrDegreeAccepted` varchar(10) DEFAULT NULL,
  `PortalOrDirect` varchar(255) DEFAULT NULL,
  `LevelOfStudy` varchar(255) DEFAULT NULL,
  `Duration` varchar(50) DEFAULT NULL,
  `PrivateOrPublic` varchar(50) DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `Campus` varchar(255) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `ApplicationFee` varchar(50) DEFAULT NULL,
  `I20DepositFee` varchar(100) DEFAULT NULL,
  `Scholarship` varchar(255) DEFAULT NULL,
  `Concentration` varchar(255) DEFAULT NULL,
  `ProgramName` varchar(255) DEFAULT NULL,
  `TuitionFeePerSemester` varchar(100) DEFAULT NULL,
  `TuitionFeePerYear` varchar(100) DEFAULT NULL,
  `TuitionFeePerCourse` varchar(100) DEFAULT NULL,
  `Credits` varchar(50) DEFAULT NULL,
  `PerCreditRate` varchar(100) DEFAULT NULL,
  `GPAoutOf4` varchar(100) DEFAULT NULL,
  `GREorGMATorSATorACT` varchar(255) DEFAULT NULL,
  `IELTS` varchar(50) DEFAULT NULL,
  `IELTSNBLT` varchar(50) DEFAULT NULL,
  `TOEFL` varchar(50) DEFAULT NULL,
  `TOEFLNBLT` varchar(50) DEFAULT NULL,
  `DUOLINGO` varchar(50) DEFAULT NULL,
  `DuolingoNBLT` varchar(50) DEFAULT NULL,
  `PTE` varchar(100) DEFAULT NULL,
  `PTENBLT` varchar(50) DEFAULT NULL,
  `BACKLOGS` varchar(50) DEFAULT NULL,
  `MOIAccepted` varchar(50) DEFAULT NULL,
  `WESRequired` varchar(50) DEFAULT NULL,
  `Intakes` varchar(255) DEFAULT NULL,
  `Deadlines` varchar(50) DEFAULT NULL,
  `InsertName` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userActions`
--

CREATE TABLE `userActions` (
  `userActionId` int(11) NOT NULL,
  `actionId` int(11) NOT NULL,
  `userType` int(10) NOT NULL,
  `actionTaskId` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userDetails`
--

CREATE TABLE `userDetails` (
  `userDetailsId` int(11) NOT NULL,
  `avatar` longtext DEFAULT NULL,
  `preferences` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserDocumentsPermission`
--

CREATE TABLE `UserDocumentsPermission` (
  `userDocumentPermissionId` int(10) NOT NULL,
  `userType` int(10) NOT NULL,
  `documentTypeId` int(10) NOT NULL,
  `submissions` int(10) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserFix`
--

CREATE TABLE `UserFix` (
  `userId` int(11) NOT NULL,
  `createdDatetime` datetime DEFAULT NULL,
  `expireDatetime` datetime DEFAULT NULL,
  `urlText` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserIntray`
--

CREATE TABLE `UserIntray` (
  `id` int(11) NOT NULL,
  `uploadId` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `intrayPath` varchar(255) DEFAULT NULL,
  `documentType` varchar(100) DEFAULT NULL,
  `dateTime` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserPermissions`
--

CREATE TABLE `UserPermissions` (
  `Id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `userId` int(11) NOT NULL,
  `socketId` int(200) NOT NULL,
  `userName` varchar(255) NOT NULL,
  `userEmail` varchar(255) NOT NULL,
  `userPassword` varchar(255) NOT NULL,
  `userFirstName` varchar(255) NOT NULL,
  `userLastName` varchar(255) NOT NULL,
  `userImage` varchar(255) DEFAULT NULL,
  `userAddress` varchar(255) DEFAULT NULL,
  `userServerEmail` varchar(255) DEFAULT NULL,
  `userPhoneOne` varchar(255) DEFAULT NULL,
  `userPhoneTwo` varchar(255) DEFAULT NULL,
  `userLastLogin` datetime DEFAULT NULL,
  `userCreated` datetime DEFAULT current_timestamp(),
  `userEnabled` tinyint(1) DEFAULT NULL,
  `userLocked` tinyint(1) DEFAULT NULL,
  `userType` int(11) DEFAULT 2,
  `roles` varchar(255) DEFAULT '4',
  `entities` varchar(255) NOT NULL DEFAULT '1',
  `lastNotesSeen` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserSettingsTypes`
--

CREATE TABLE `UserSettingsTypes` (
  `Id` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserSubProfileTypes`
--

CREATE TABLE `UserSubProfileTypes` (
  `userSubProfileId` int(11) NOT NULL,
  `subProfileId` int(11) NOT NULL,
  `userId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserTypes`
--

CREATE TABLE `UserTypes` (
  `userTypeId` int(10) NOT NULL,
  `userTypeName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ValidationsTable`
--

CREATE TABLE `ValidationsTable` (
  `id` int(11) NOT NULL,
  `name` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `age` text DEFAULT NULL,
  `__EMPTY` text DEFAULT NULL,
  `__EMPTY_1` text DEFAULT NULL,
  `__EMPTY_2` text DEFAULT NULL,
  `__EMPTY_3` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Workflow`
--

CREATE TABLE `Workflow` (
  `WorkflowID` int(11) NOT NULL,
  `WorkflowName` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `WorkflowDocumentTypes`
--

CREATE TABLE `WorkflowDocumentTypes` (
  `workflowDocumentTypeID` int(11) NOT NULL,
  `workflowID` int(11) NOT NULL,
  `DocumentTypeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Actions`
--
ALTER TABLE `Actions`
  ADD PRIMARY KEY (`actionId`),
  ADD KEY `documentStateId` (`documentStateId`);

--
-- Indexes for table `ActionStateTransitions`
--
ALTER TABLE `ActionStateTransitions`
  ADD PRIMARY KEY (`transitionId`),
  ADD KEY `actionId` (`actionId`),
  ADD KEY `fromStateId` (`fromStateId`),
  ADD KEY `toStateId` (`toStateId`);

--
-- Indexes for table `ControlCenters`
--
ALTER TABLE `ControlCenters`
  ADD PRIMARY KEY (`controlCenterId`);

--
-- Indexes for table `DataTables`
--
ALTER TABLE `DataTables`
  ADD PRIMARY KEY (`tableId`);

--
-- Indexes for table `DataTypes`
--
ALTER TABLE `DataTypes`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `DocumentGroup`
--
ALTER TABLE `DocumentGroup`
  ADD PRIMARY KEY (`documentGroupId`),
  ADD KEY `fk_groupTypeId` (`groupTypeId`);

--
-- Indexes for table `DocumentGroupType`
--
ALTER TABLE `DocumentGroupType`
  ADD PRIMARY KEY (`groupTypeId`);

--
-- Indexes for table `DocumentStates`
--
ALTER TABLE `DocumentStates`
  ADD PRIMARY KEY (`documentStateId`);

--
-- Indexes for table `DocumentStatesApprovers`
--
ALTER TABLE `DocumentStatesApprovers`
  ADD PRIMARY KEY (`documentStatesApproversId`),
  ADD KEY `documentStatesId` (`documentStatesId`),
  ADD KEY `roleNameId` (`roleNameId`);

--
-- Indexes for table `DocumentTagAnswers`
--
ALTER TABLE `DocumentTagAnswers`
  ADD PRIMARY KEY (`documentTagAnswersId`),
  ADD KEY `taskId` (`taskId`),
  ADD KEY `fk_uploadId` (`uploadId`);

--
-- Indexes for table `DocumentTagObject`
--
ALTER TABLE `DocumentTagObject`
  ADD PRIMARY KEY (`documentTagObjectId`);

--
-- Indexes for table `DocumentType`
--
ALTER TABLE `DocumentType`
  ADD UNIQUE KEY `documentTypeId` (`documentTypeId`) USING BTREE,
  ADD KEY `fk_documentTagObjectId` (`documentTagObjectId`);

--
-- Indexes for table `DocumentTypeAnswers`
--
ALTER TABLE `DocumentTypeAnswers`
  ADD PRIMARY KEY (`documentTypeAnswersId`);

--
-- Indexes for table `DocumentTypeObject`
--
ALTER TABLE `DocumentTypeObject`
  ADD PRIMARY KEY (`documentTypeObjectId`);

--
-- Indexes for table `DocumentTypeRoles`
--
ALTER TABLE `DocumentTypeRoles`
  ADD PRIMARY KEY (`documentTypeRolesId`),
  ADD KEY `documenttyperoles_ibfk_1` (`documentTypeId`);

--
-- Indexes for table `Fields`
--
ALTER TABLE `Fields`
  ADD PRIMARY KEY (`fieldTypeId`);

--
-- Indexes for table `GermanyUniversities`
--
ALTER TABLE `GermanyUniversities`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `History`
--
ALTER TABLE `History`
  ADD UNIQUE KEY `historyId` (`historyId`);

--
-- Indexes for table `HistoryTypes`
--
ALTER TABLE `HistoryTypes`
  ADD PRIMARY KEY (`historyTypeId`);

--
-- Indexes for table `Newsletters`
--
ALTER TABLE `Newsletters`
  ADD PRIMARY KEY (`newsletterId`),
  ADD KEY `fk_newsletter_type` (`newsletterTypeId`);

--
-- Indexes for table `NewsletterType`
--
ALTER TABLE `NewsletterType`
  ADD PRIMARY KEY (`typeId`);

--
-- Indexes for table `Notes`
--
ALTER TABLE `Notes`
  ADD UNIQUE KEY `noteId` (`noteId`);

--
-- Indexes for table `NotesType`
--
ALTER TABLE `NotesType`
  ADD PRIMARY KEY (`noteTypeId`);

--
-- Indexes for table `NotesViews`
--
ALTER TABLE `NotesViews`
  ADD UNIQUE KEY `notes_view_id` (`notes_view_id`);

--
-- Indexes for table `OptionsData`
--
ALTER TABLE `OptionsData`
  ADD UNIQUE KEY `optionId` (`optionId`);

--
-- Indexes for table `Roles`
--
ALTER TABLE `Roles`
  ADD PRIMARY KEY (`roleId`);

--
-- Indexes for table `RoleTypes`
--
ALTER TABLE `RoleTypes`
  ADD PRIMARY KEY (`roleTypeId`);

--
-- Indexes for table `States`
--
ALTER TABLE `States`
  ADD PRIMARY KEY (`stateId`);

--
-- Indexes for table `Structure`
--
ALTER TABLE `Structure`
  ADD PRIMARY KEY (`entityId`),
  ADD KEY `fk_userRoleNameId` (`userRoleNameId`) USING BTREE;

--
-- Indexes for table `StructureOptionValues`
--
ALTER TABLE `StructureOptionValues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `entityId` (`entityId`),
  ADD KEY `optionId` (`optionId`);

--
-- Indexes for table `SubProfileSettings`
--
ALTER TABLE `SubProfileSettings`
  ADD PRIMARY KEY (`profileSettingsId`),
  ADD KEY `SettingId` (`SettingId`),
  ADD KEY `subProfileId` (`subProfileId`),
  ADD KEY `fk_dataTypeId` (`dataTypeId`);

--
-- Indexes for table `SubProfileTypes`
--
ALTER TABLE `SubProfileTypes`
  ADD PRIMARY KEY (`subProfileId`);

--
-- Indexes for table `Subscriptions`
--
ALTER TABLE `Subscriptions`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `SuperDocumentTypeRoles`
--
ALTER TABLE `SuperDocumentTypeRoles`
  ADD PRIMARY KEY (`documentTypeRoleId`),
  ADD KEY `documentTypeId` (`documentTypeId`),
  ADD KEY `roleNameId` (`roleNameId`);

--
-- Indexes for table `SuperRoleNames`
--
ALTER TABLE `SuperRoleNames`
  ADD PRIMARY KEY (`roleNameId`),
  ADD KEY `roleTypeId` (`roleTypeId`);

--
-- Indexes for table `SuperRoleTypes`
--
ALTER TABLE `SuperRoleTypes`
  ADD PRIMARY KEY (`roleTypeId`);

--
-- Indexes for table `SuperUserRoles`
--
ALTER TABLE `SuperUserRoles`
  ADD PRIMARY KEY (`superUserRoleId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `userRoleNameId` (`userRoleNameId`);

--
-- Indexes for table `TaskEntities`
--
ALTER TABLE `TaskEntities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `taskEntityId` (`taskEntityId`),
  ADD KEY `taskId` (`taskId`);

--
-- Indexes for table `Tasks`
--
ALTER TABLE `Tasks`
  ADD PRIMARY KEY (`taskId`);

--
-- Indexes for table `TaskTagDetails`
--
ALTER TABLE `TaskTagDetails`
  ADD UNIQUE KEY `taskTagDetailsId` (`taskTagDetailsId`);

--
-- Indexes for table `TaskWorkflow`
--
ALTER TABLE `TaskWorkflow`
  ADD UNIQUE KEY `taskWorkflowId` (`taskWorkflowId`);

--
-- Indexes for table `TestTable2`
--
ALTER TABLE `TestTable2`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `TestTable3`
--
ALTER TABLE `TestTable3`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `TestTable4`
--
ALTER TABLE `TestTable4`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `UkTable`
--
ALTER TABLE `UkTable`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `UploadFiles`
--
ALTER TABLE `UploadFiles`
  ADD PRIMARY KEY (`uploadId`),
  ADD UNIQUE KEY `uploadName` (`uploadName`);

--
-- Indexes for table `UsaFinal`
--
ALTER TABLE `UsaFinal`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `userActions`
--
ALTER TABLE `userActions`
  ADD PRIMARY KEY (`userActionId`),
  ADD KEY `actionId` (`actionId`);

--
-- Indexes for table `userDetails`
--
ALTER TABLE `userDetails`
  ADD PRIMARY KEY (`userDetailsId`);

--
-- Indexes for table `UserDocumentsPermission`
--
ALTER TABLE `UserDocumentsPermission`
  ADD PRIMARY KEY (`userDocumentPermissionId`);

--
-- Indexes for table `UserFix`
--
ALTER TABLE `UserFix`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `UserIntray`
--
ALTER TABLE `UserIntray`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploadId` (`uploadId`);

--
-- Indexes for table `UserPermissions`
--
ALTER TABLE `UserPermissions`
  ADD UNIQUE KEY `Id` (`Id`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `userEmail` (`userEmail`),
  ADD UNIQUE KEY `userName` (`userName`);

--
-- Indexes for table `UserSettingsTypes`
--
ALTER TABLE `UserSettingsTypes`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `UserSubProfileTypes`
--
ALTER TABLE `UserSubProfileTypes`
  ADD PRIMARY KEY (`userSubProfileId`),
  ADD KEY `subProfileId` (`subProfileId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `UserTypes`
--
ALTER TABLE `UserTypes`
  ADD PRIMARY KEY (`userTypeId`);

--
-- Indexes for table `ValidationsTable`
--
ALTER TABLE `ValidationsTable`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Workflow`
--
ALTER TABLE `Workflow`
  ADD PRIMARY KEY (`WorkflowID`);

--
-- Indexes for table `WorkflowDocumentTypes`
--
ALTER TABLE `WorkflowDocumentTypes`
  ADD PRIMARY KEY (`workflowDocumentTypeID`),
  ADD KEY `workflowID` (`workflowID`),
  ADD KEY `DocumentTypeID` (`DocumentTypeID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Actions`
--
ALTER TABLE `Actions`
  MODIFY `actionId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ActionStateTransitions`
--
ALTER TABLE `ActionStateTransitions`
  MODIFY `transitionId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ControlCenters`
--
ALTER TABLE `ControlCenters`
  MODIFY `controlCenterId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DataTables`
--
ALTER TABLE `DataTables`
  MODIFY `tableId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DataTypes`
--
ALTER TABLE `DataTypes`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DocumentGroup`
--
ALTER TABLE `DocumentGroup`
  MODIFY `documentGroupId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DocumentGroupType`
--
ALTER TABLE `DocumentGroupType`
  MODIFY `groupTypeId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DocumentStates`
--
ALTER TABLE `DocumentStates`
  MODIFY `documentStateId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DocumentStatesApprovers`
--
ALTER TABLE `DocumentStatesApprovers`
  MODIFY `documentStatesApproversId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DocumentTagAnswers`
--
ALTER TABLE `DocumentTagAnswers`
  MODIFY `documentTagAnswersId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DocumentTagObject`
--
ALTER TABLE `DocumentTagObject`
  MODIFY `documentTagObjectId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DocumentType`
--
ALTER TABLE `DocumentType`
  MODIFY `documentTypeId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DocumentTypeAnswers`
--
ALTER TABLE `DocumentTypeAnswers`
  MODIFY `documentTypeAnswersId` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DocumentTypeObject`
--
ALTER TABLE `DocumentTypeObject`
  MODIFY `documentTypeObjectId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DocumentTypeRoles`
--
ALTER TABLE `DocumentTypeRoles`
  MODIFY `documentTypeRolesId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Fields`
--
ALTER TABLE `Fields`
  MODIFY `fieldTypeId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `GermanyUniversities`
--
ALTER TABLE `GermanyUniversities`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `History`
--
ALTER TABLE `History`
  MODIFY `historyId` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Newsletters`
--
ALTER TABLE `Newsletters`
  MODIFY `newsletterId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `NewsletterType`
--
ALTER TABLE `NewsletterType`
  MODIFY `typeId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Notes`
--
ALTER TABLE `Notes`
  MODIFY `noteId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `NotesType`
--
ALTER TABLE `NotesType`
  MODIFY `noteTypeId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `NotesViews`
--
ALTER TABLE `NotesViews`
  MODIFY `notes_view_id` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `OptionsData`
--
ALTER TABLE `OptionsData`
  MODIFY `optionId` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Roles`
--
ALTER TABLE `Roles`
  MODIFY `roleId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `RoleTypes`
--
ALTER TABLE `RoleTypes`
  MODIFY `roleTypeId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `States`
--
ALTER TABLE `States`
  MODIFY `stateId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Structure`
--
ALTER TABLE `Structure`
  MODIFY `entityId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `StructureOptionValues`
--
ALTER TABLE `StructureOptionValues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SubProfileSettings`
--
ALTER TABLE `SubProfileSettings`
  MODIFY `profileSettingsId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SubProfileTypes`
--
ALTER TABLE `SubProfileTypes`
  MODIFY `subProfileId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Subscriptions`
--
ALTER TABLE `Subscriptions`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SuperDocumentTypeRoles`
--
ALTER TABLE `SuperDocumentTypeRoles`
  MODIFY `documentTypeRoleId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SuperRoleNames`
--
ALTER TABLE `SuperRoleNames`
  MODIFY `roleNameId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SuperRoleTypes`
--
ALTER TABLE `SuperRoleTypes`
  MODIFY `roleTypeId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SuperUserRoles`
--
ALTER TABLE `SuperUserRoles`
  MODIFY `superUserRoleId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TaskEntities`
--
ALTER TABLE `TaskEntities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Tasks`
--
ALTER TABLE `Tasks`
  MODIFY `taskId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TaskTagDetails`
--
ALTER TABLE `TaskTagDetails`
  MODIFY `taskTagDetailsId` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TaskWorkflow`
--
ALTER TABLE `TaskWorkflow`
  MODIFY `taskWorkflowId` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TestTable2`
--
ALTER TABLE `TestTable2`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TestTable3`
--
ALTER TABLE `TestTable3`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TestTable4`
--
ALTER TABLE `TestTable4`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UkTable`
--
ALTER TABLE `UkTable`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UploadFiles`
--
ALTER TABLE `UploadFiles`
  MODIFY `uploadId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UsaFinal`
--
ALTER TABLE `UsaFinal`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userActions`
--
ALTER TABLE `userActions`
  MODIFY `userActionId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UserDocumentsPermission`
--
ALTER TABLE `UserDocumentsPermission`
  MODIFY `userDocumentPermissionId` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UserIntray`
--
ALTER TABLE `UserIntray`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UserPermissions`
--
ALTER TABLE `UserPermissions`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UserSettingsTypes`
--
ALTER TABLE `UserSettingsTypes`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UserSubProfileTypes`
--
ALTER TABLE `UserSubProfileTypes`
  MODIFY `userSubProfileId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UserTypes`
--
ALTER TABLE `UserTypes`
  MODIFY `userTypeId` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ValidationsTable`
--
ALTER TABLE `ValidationsTable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Workflow`
--
ALTER TABLE `Workflow`
  MODIFY `WorkflowID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `WorkflowDocumentTypes`
--
ALTER TABLE `WorkflowDocumentTypes`
  MODIFY `workflowDocumentTypeID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Actions`
--
ALTER TABLE `Actions`
  ADD CONSTRAINT `actions_ibfk_1` FOREIGN KEY (`documentStateId`) REFERENCES `DocumentStates` (`documentStateId`);

--
-- Constraints for table `ActionStateTransitions`
--
ALTER TABLE `ActionStateTransitions`
  ADD CONSTRAINT `actionstatetransitions_ibfk_1` FOREIGN KEY (`actionId`) REFERENCES `Actions` (`actionId`),
  ADD CONSTRAINT `actionstatetransitions_ibfk_2` FOREIGN KEY (`fromStateId`) REFERENCES `DocumentStates` (`documentStateId`),
  ADD CONSTRAINT `actionstatetransitions_ibfk_3` FOREIGN KEY (`toStateId`) REFERENCES `DocumentStates` (`documentStateId`);

--
-- Constraints for table `DocumentGroup`
--
ALTER TABLE `DocumentGroup`
  ADD CONSTRAINT `fk_groupTypeId` FOREIGN KEY (`groupTypeId`) REFERENCES `DocumentGroupType` (`groupTypeId`);

--
-- Constraints for table `DocumentStatesApprovers`
--
ALTER TABLE `DocumentStatesApprovers`
  ADD CONSTRAINT `documentstatesapprovers_ibfk_1` FOREIGN KEY (`documentStatesId`) REFERENCES `DocumentStates` (`documentStateId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `documentstatesapprovers_ibfk_2` FOREIGN KEY (`roleNameId`) REFERENCES `SuperRoleNames` (`roleNameId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `DocumentTagAnswers`
--
ALTER TABLE `DocumentTagAnswers`
  ADD CONSTRAINT `documenttaganswers_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `Tasks` (`taskId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `documenttaganswers_ibfk_2` FOREIGN KEY (`uploadId`) REFERENCES `UploadFiles` (`uploadId`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `DocumentType`
--
ALTER TABLE `DocumentType`
  ADD CONSTRAINT `fk_documentTagObjectId` FOREIGN KEY (`documentTagObjectId`) REFERENCES `DocumentTagObject` (`documentTagObjectId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `DocumentTypeRoles`
--
ALTER TABLE `DocumentTypeRoles`
  ADD CONSTRAINT `documenttyperoles_ibfk_1` FOREIGN KEY (`documentTypeId`) REFERENCES `DocumentType` (`documentTypeId`);

--
-- Constraints for table `Newsletters`
--
ALTER TABLE `Newsletters`
  ADD CONSTRAINT `fk_newsletter_type` FOREIGN KEY (`newsletterTypeId`) REFERENCES `NewsletterType` (`typeId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Structure`
--
ALTER TABLE `Structure`
  ADD CONSTRAINT `fk_roleNameId` FOREIGN KEY (`userRoleNameId`) REFERENCES `SuperRoleNames` (`roleNameId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `StructureOptionValues`
--
ALTER TABLE `StructureOptionValues`
  ADD CONSTRAINT `structureoptionvalues_ibfk_1` FOREIGN KEY (`entityId`) REFERENCES `Structure` (`entityId`) ON DELETE CASCADE,
  ADD CONSTRAINT `structureoptionvalues_ibfk_2` FOREIGN KEY (`optionId`) REFERENCES `OptionsData` (`optionId`) ON DELETE CASCADE;

--
-- Constraints for table `SubProfileSettings`
--
ALTER TABLE `SubProfileSettings`
  ADD CONSTRAINT `fk_dataTypeId` FOREIGN KEY (`dataTypeId`) REFERENCES `DataTypes` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `subprofilesettings_ibfk_1` FOREIGN KEY (`SettingId`) REFERENCES `UserSettingsTypes` (`Id`),
  ADD CONSTRAINT `subprofilesettings_ibfk_2` FOREIGN KEY (`subProfileId`) REFERENCES `SubProfileTypes` (`subProfileId`);

--
-- Constraints for table `SuperDocumentTypeRoles`
--
ALTER TABLE `SuperDocumentTypeRoles`
  ADD CONSTRAINT `superdocumenttyperoles_ibfk_1` FOREIGN KEY (`documentTypeId`) REFERENCES `DocumentType` (`documentTypeId`) ON DELETE CASCADE,
  ADD CONSTRAINT `superdocumenttyperoles_ibfk_2` FOREIGN KEY (`roleNameId`) REFERENCES `SuperRoleNames` (`roleNameId`) ON DELETE CASCADE;

--
-- Constraints for table `SuperRoleNames`
--
ALTER TABLE `SuperRoleNames`
  ADD CONSTRAINT `superrolenames_ibfk_1` FOREIGN KEY (`roleTypeId`) REFERENCES `SuperRoleTypes` (`roleTypeId`);

--
-- Constraints for table `SuperUserRoles`
--
ALTER TABLE `SuperUserRoles`
  ADD CONSTRAINT `superuserroles_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`userId`) ON DELETE CASCADE,
  ADD CONSTRAINT `superuserroles_ibfk_2` FOREIGN KEY (`userRoleNameId`) REFERENCES `SuperRoleNames` (`roleNameId`) ON DELETE CASCADE;

--
-- Constraints for table `TaskEntities`
--
ALTER TABLE `TaskEntities`
  ADD CONSTRAINT `taskentities_ibfk_1` FOREIGN KEY (`taskEntityId`) REFERENCES `Structure` (`entityId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taskentities_ibfk_2` FOREIGN KEY (`taskId`) REFERENCES `Tasks` (`taskId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `userActions`
--
ALTER TABLE `userActions`
  ADD CONSTRAINT `useractions_ibfk_1` FOREIGN KEY (`actionId`) REFERENCES `Actions` (`actionId`);

--
-- Constraints for table `userDetails`
--
ALTER TABLE `userDetails`
  ADD CONSTRAINT `fk_userDetails_user` FOREIGN KEY (`userDetailsId`) REFERENCES `Users` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `UserIntray`
--
ALTER TABLE `UserIntray`
  ADD CONSTRAINT `UserIntray_ibfk_1` FOREIGN KEY (`uploadId`) REFERENCES `UploadFiles` (`uploadId`);

--
-- Constraints for table `UserSubProfileTypes`
--
ALTER TABLE `UserSubProfileTypes`
  ADD CONSTRAINT `usersubprofiletypes_ibfk_1` FOREIGN KEY (`subProfileId`) REFERENCES `SubProfileTypes` (`subProfileId`),
  ADD CONSTRAINT `usersubprofiletypes_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `Users` (`userId`);

--
-- Constraints for table `WorkflowDocumentTypes`
--
ALTER TABLE `WorkflowDocumentTypes`
  ADD CONSTRAINT `workflowdocumenttypes_ibfk_1` FOREIGN KEY (`workflowID`) REFERENCES `Workflow` (`WorkflowID`),
  ADD CONSTRAINT `workflowdocumenttypes_ibfk_2` FOREIGN KEY (`DocumentTypeID`) REFERENCES `DocumentType` (`documentTypeId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
