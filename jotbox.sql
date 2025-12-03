-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 02, 2025 at 08:28 PM
-- Server version: 10.3.35-MariaDB
-- PHP Version: 7.2.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jotbox`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `ActionStateTransitions`
--

CREATE TABLE `ActionStateTransitions` (
  `transitionId` int(11) NOT NULL,
  `actionId` int(11) NOT NULL,
  `fromStateId` int(11) DEFAULT NULL,
  `toStateId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `enabled` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `DataTables`
--

CREATE TABLE `DataTables` (
  `tableId` int(11) NOT NULL,
  `tableName` varchar(255) NOT NULL,
  `fields` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentGroupType`
--

CREATE TABLE `DocumentGroupType` (
  `groupTypeId` int(11) NOT NULL,
  `groupTypeName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `DocumentGroupType`
--

INSERT INTO `DocumentGroupType` (`groupTypeId`, `groupTypeName`) VALUES
(1, 'Index'),
(2, 'Apply'),
(3, 'Create');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `DocumentStatesApprovers`
--

CREATE TABLE `DocumentStatesApprovers` (
  `documentStatesApproversId` int(11) NOT NULL,
  `documentStatesId` int(11) NOT NULL,
  `roleNameId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `uploadId` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `DocumentType`
--

INSERT INTO `DocumentType` (`documentTypeId`, `documentTypeName`, `documentTypeDescription`, `documentTypeObjectId`, `tableName`, `documentGroupId`, `documentTagObjectId`, `documentTypeRoles`, `documentTypeTableId`, `enabled`) VALUES
(9, 'Spring 2025 (Jan-Feb)', 'Spring 2025 (Jan-Feb)', 49, 'UsaFinal', 4, NULL, '2,3,5,6', 13, 1),
(10, 'Summer 2025 (Mar-Apr)', 'Summer 2025 (Mar-Apr)', 5, 'UsaFinal', 4, NULL, '2,3,5,6', 13, 1),
(11, 'Fall 2025 (Aug-Sep)', 'Fall 2025 (Aug-Sep)', 5, 'UsaFinal', 4, 16, '2,3,5,6', 13, 1),
(12, 'Autumn (September - October) 2025', 'Autumn(September/October)2025', 5, 'UkTable', 7, 16, '2,3,5,6', 14, 1),
(13, 'Summer 2025 (May - June)', 'Summer 2025 (May/June)', 5, 'UkTable', 7, 16, '2,3,5,6', 14, 1),
(14, 'Winter 2025 (January - February)', 'Winter 2025 (January/February)', 5, 'UkTable', 7, 5, '2,3,5,6', 14, 1),
(15, 'Winter Intake (September - October) 2025', 'Winter Intake (September - October) 2025', 5, 'GermanyUniversities', 8, 5, '2,3,5,6', 15, 1),
(16, 'Summer 2025 (May - June)', 'Summer 2025 (May/June)', 5, 'GermanyUniversities', 8, 5, '2,3,5,6', 15, 1),
(44, 'Leave_request ', 'Leave Request Form', 10, 'None', 9, 16, '', 1, 1),
(47, 'SupplierInvoice', 'Supplier Invoice', 1, 'None', 10, 17, '', 1, 1);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `Fields`
--

CREATE TABLE `Fields` (
  `fieldTypeId` int(11) NOT NULL,
  `fieldTypeName` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `HistoryTypes`
--

CREATE TABLE `HistoryTypes` (
  `historyTypeId` int(11) NOT NULL,
  `historyTypeName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `Newsletters`
--

CREATE TABLE `Newsletters` (
  `newsletterId` int(11) NOT NULL,
  `newsletterTypeId` int(11) NOT NULL,
  `newsletterName` varchar(299) NOT NULL,
  `newsletterDescription` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `NewsletterType`
--

CREATE TABLE `NewsletterType` (
  `typeId` int(11) NOT NULL,
  `typeName` varchar(299) NOT NULL,
  `typeDescription` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `NotesType`
--

CREATE TABLE `NotesType` (
  `noteTypeId` int(11) NOT NULL,
  `noteName` varchar(255) NOT NULL,
  `noteTypeDescription` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `NotesViews`
--

CREATE TABLE `NotesViews` (
  `notes_view_id` int(100) NOT NULL,
  `notes_id` int(100) NOT NULL,
  `user_id` int(100) NOT NULL,
  `seen` int(10) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `OptionsData`
--

CREATE TABLE `OptionsData` (
  `optionId` int(100) NOT NULL,
  `optionName` varchar(100) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `RoleTypes`
--

CREATE TABLE `RoleTypes` (
  `roleTypeId` int(11) NOT NULL,
  `roleTypeName` varchar(255) NOT NULL,
  `roleTypeDescription` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `RoleTypes`
--

INSERT INTO `RoleTypes` (`roleTypeId`, `roleTypeName`, `roleTypeDescription`) VALUES
(1, 'Admin', 'Administrator role'),
(2, 'Job', 'Job Role'),
(3, 'Entity Admin', 'Entity Admin'),
(4, 'Default', 'Default Role'),
(5, 'ProfileProcessing', 'User profile managing'),
(6, 'Tasks Processing Manager', 'Tasks Processing'),
(7, 'UK Process Role', 'UK Process Role'),
(8, 'USA Process Role', 'USA Process Role');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Structure`
--

INSERT INTO `Structure` (`entityId`, `entityName`, `entityLocation`, `entityPhone`, `entityDescription`, `userRoleNameId`, `RefCode`) VALUES
(1, 'NxtStep Head Office', 'Panjagutta', '12345', 'Nxtstep Panjagutta Branch', 1, 'PANJ'),
(3, 'NxtStep KukatPally ', 'KukatPally', '+1234567890', 'Nxtstep Kukatpally Branch', 2, 'KUKP'),
(8, 'ABC Study Abroad', 'Hyderabad', '8143624597', 'ABC Study Abroad', 32, 'ABCSA'),
(9, 'Admit Center Overseas', 'Hyderabad', '77022 48173', 'Admit Center Overseas', 33, 'ADMITCO'),
(10, 'Admitworld', '', '', 'Admitworld', 34, 'ADMITWO'),
(11, 'Aerial overseas', 'Aerial overseas', '', 'Aerial overseas', 35, 'AERIAL'),
(12, 'Afly Consultancy', 'Afly Consultancy', '', 'Afly Consultancy', 36, 'AFLYC'),
(13, 'Anil Consultancy', 'Anil Consultancy', '', 'Anil Consultancy', 37, 'ANILC'),
(14, 'Anitha Pandey', 'Anitha Pandey', '', 'Anitha Pandey', 38, 'ANITP'),
(15, 'Apple Academy', 'Apple Academy', '', 'Apple Academy', 39, 'APPLEA'),
(16, 'Apply guru', 'Apply guru', '', 'Apply guru', 40, 'APPLYG'),
(17, 'Apply Overseas', 'Apply Overseas', '', 'Apply Overseas', 41, 'APPLYO'),
(18, 'Applyglobe admissions', '', 'Applyglobe admissions', 'Applyglobe admissions', 42, 'APPLYGA'),
(19, 'AVs Overseas', 'AVs Overseas', '', 'AVs Overseas', 43, 'AVSO'),
(20, 'Baanvi overseas', 'Baanvi overseas', '', 'Baanvi overseas', 44, 'BAANVO'),
(21, 'Basic consultancy', '', 'Basic consultancy', 'Basic consultancy', 45, 'BASICC'),
(22, 'Basic consultancy', '', 'Basic consultancy', 'Basic consultancy', 45, 'BASICC'),
(23, 'Beyond Overseas', 'Beyond Overseas', '', 'Beyond Overseas', 46, 'BEYONDO'),
(24, 'Bridge Overseas', 'Bridge Overseas', '', 'Bridge Overseas', 47, 'BRIDGEO'),
(25, 'Bright Overseas(Chandigarh)', 'Bright Overseas(Chandigarh)', '', 'Bright Overseas(Chandigarh)', 48, 'BRIGHTOC'),
(26, 'Caliber', 'Caliber', '', 'Caliber', 49, 'CALIBER'),
(27, 'Career Bridge', 'Career Bridge', '', 'Career Bridge', 50, 'CAREERB'),
(28, 'Career Wings', 'Career Wings', '', 'Career Wings', 51, 'CAREERW'),
(29, 'Cloud overseas', 'Cloud overseas', '', 'Cloud overseas', 52, 'CLOUDO'),
(30, 'Credo visas', '', 'Credo visas', 'Credo visas', 53, 'CREDOV'),
(31, 'CS OVERSEAS', 'CS OVERSEAS', '', 'CS OVERSEAS', 54, 'CSOVER'),
(32, 'Dchos', 'Dchos', '', 'Dchos', 55, 'DCHOS'),
(33, 'Dhanalaxmi Overseas', 'Dhanalaxmi Overseas', '', 'Dhanalaxmi Overseas', 56, 'DHANAO'),
(34, 'Dwij', 'Dwij', '', 'Dwij', 57, 'DWIJO'),
(35, 'Edmium', 'Edmium', '', 'Edmium', 58, 'EDMIUM'),
(36, 'EDO Map', 'EDO Map', '', 'EDO Map', 59, 'EDOMAP'),
(37, 'Edu2Tek', 'Edu2Tek', '', 'Edu2Tek', 60, 'EDUTEK'),
(38, 'Educonnect Overseas', 'Educonnect Overseas', '', 'Educonnect Overseas', 61, 'EDUCONNO'),
(39, 'Elixir consultancy', 'Elixir consultancy', '', 'Elixir consultancy', 62, 'ELIXIR'),
(40, 'Emerge imigration', 'Emerge imigration', '', 'Emerge imigration', 63, 'EMERGEI'),
(41, 'Enlight World Visas', 'Enlight World Visas', '', 'Enlight World Visas', 64, 'ENLWVO'),
(42, 'Enlighten Abroad', 'Enlighten Abroad', '', 'Enlighten Abroad', 65, 'ENLAO'),
(43, 'Falcon Overseas', 'Falcon Overseas', '', 'Falcon Overseas', 66, 'FALCONO'),
(44, 'Fly hats', 'Fly hats', '', 'Fly hats', 67, 'FLYHATO'),
(45, 'Fly Learning', 'Fly Learning', '', 'Fly Learning', 68, 'FLYLO'),
(46, 'Fly2overseas', 'Fly2overseas', '', 'Fly2overseas', 69, 'FLYOVER'),
(47, 'Flying bee global', 'Flying bee global', '', 'Flying bee global', 70, 'FLYBEEG'),
(48, 'Formulahub', 'Formulahub', '', 'Formulahub', 71, 'FORMLO'),
(49, 'Global Navigator', 'Global Navigator', '', 'Global Navigator', 72, 'GLONAVO'),
(50, 'Global Six Sigma', 'Global Six Sigma', '', 'Global Six Sigma', 73, 'GLOSIXO'),
(51, 'Global Vision Overseas', 'Global Vision Overseas', '', 'Global Vision Overseas', 74, 'GLOVIO'),
(52, 'Govardhan', 'Govardhan', '', 'Govardhan', 75, 'GOVARO'),
(53, 'Goway Abroad', 'Goway Abroad', '', 'Goway Abroad', 76, 'GOWAYO'),
(54, 'Gowise consultancy', 'Gowise consultancy', '', 'Gowise consultancy', 77, 'GOWISEO'),
(55, 'Grad Ed Overseas', 'Grad Ed Overseas', '', 'Grad Ed Overseas', 78, 'GRADEO'),
(56, 'Gummadi', 'Gummadi', '', 'Gummadi', 79, 'GUMMAO'),
(57, 'I20 Abroad', 'I20 Abroad', '', 'I20 Abroad', 80, 'IABROO'),
(58, 'I20 Services Overseas', 'I20 Services Overseas', '', 'I20 Services Overseas', 81, 'ISERVO'),
(59, 'Immense consultancy', 'immense consultancy', '', 'immense consultancy', 82, 'IMMCON'),
(60, 'Inspire Services', 'Inspire Services', '', 'Inspire Services', 83, 'INSSERO'),
(61, 'Iyra Consultancy', 'Iyra Consultancy', '', 'Iyra Consultancy', 84, 'IYRACO'),
(62, 'Jaspire', 'Jaspire', '', 'Jaspire', 85, 'JASPIREO'),
(63, 'Kaur immigration', 'Kaur immigration', '', 'Kaur immigration', 86, 'KAURIO'),
(64, 'Kiyaan', 'Kiyaan', '', 'Kiyaan', 87, 'KIYAANO'),
(65, 'KP Overseas', 'KP Overseas', '', 'KP Overseas', 88, 'KPOVERS'),
(66, 'KP solutions', 'KP solutions', '', 'KP solutions', 89, 'KPSOLO'),
(67, 'KSP', 'KSP', '', 'KSP', 90, 'KSPOVER'),
(68, 'KVN Overseas', 'KVN Overseas', '', 'KVN Overseas', 91, 'KVNOVER'),
(69, 'Mapping overseas', 'Mapping overseas', '', 'Mapping overseas', 92, 'MAPPOVER'),
(70, 'Margh Overseas', 'Margh Overseas', '', 'Margh Overseas', 93, 'MARGHO'),
(71, 'Mouli Overseas', 'Mouli Overseas', '', 'Mouli Overseas', 94, 'MOURLIO'),
(72, 'MR Global', 'MR Global', '', 'MR Global', 95, 'MRGLOBO'),
(73, 'Mudassir', 'Mudassir', '', 'Mudassir', 96, 'MUDASS'),
(74, 'Navigator', 'Navigator', '', 'Navigator', 97, 'NAVIGO'),
(75, 'Nex Global', 'Nex Global', '', 'Nex Global', 98, 'NEXGLOBO'),
(76, 'Nex Rise', 'Nex Rise', '', 'Nex Rise', 99, 'NEXRISEO'),
(77, 'Next Plan', 'Next Plan', '', 'Next Plan', 100, 'NEXTPLANO'),
(78, 'One Step', 'One Step', '', 'One Step', 101, 'ONESTO'),
(79, 'Option Overseas', 'Option Overseas', '', 'Option Overseas', 102, 'OPTIONO'),
(80, 'Orangeway Consultancy', 'Orangeway Consultancy', '', 'Orangeway Consultancy', 103, 'ORANGEO'),
(100, 'Education Ways', 'Hyderabad', '', 'education ways', 968, 'EDUWAY'),
(101, 'Swamy Consultancy', 'Hyderabad', '', 'swamy', 969, 'SWAMY'),
(102, 'Visa masters', 'Hyderabad', '', 'visa masters', 970, ''),
(103, 'Vaishnav overseas', 'Hyderabad', '', 'Vaishnav overseas', 971, 'VAIOVER'),
(104, 'Carrer Consultant', 'Hyderabad', '', 'carrer consultant', 980, 'CARERC'),
(105, 'VISA TREE', 'Via Tree', '', 'Visa Tree', 981, 'VISAT'),
(106, 'Global Trek', 'Hyderabad', '', 'Global Trek', 982, 'GLOBTR'),
(107, 'Vidhya n Videsh', 'Hyderabad', '', 'Vidhya n Videsh', 983, 'VINDNV'),
(108, 'Strategy Overseas', 'Hyderabad', '', 'Strategy Overseas', 984, 'STRAOV'),
(109, 'Kwik Overseas', 'Dlisuknagar', '6304022052', 'Kwik Overseas (Owner vamshi)', 1009, 'KWIKOS');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `SubProfileSettings`
--

INSERT INTO `SubProfileSettings` (`profileSettingsId`, `SettingId`, `subProfileId`, `dataTypeId`, `value`) VALUES
(1, 3, 1, 2, 1),
(2, 2, 3, 2, 1),
(3, 1, 3, 2, 1),
(5, 1, 3, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `SubProfileTypes`
--

CREATE TABLE `SubProfileTypes` (
  `subProfileId` int(11) NOT NULL,
  `subProfileName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `SubProfileTypes`
--

INSERT INTO `SubProfileTypes` (`subProfileId`, `subProfileName`) VALUES
(1, 'DefaultProfile'),
(2, 'StandardProfile'),
(3, 'PowerUser');

-- --------------------------------------------------------

--
-- Table structure for table `Subscriptions`
--

CREATE TABLE `Subscriptions` (
  `Id` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `CreatedDate` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `SuperDocumentTypeRoles`
--

CREATE TABLE `SuperDocumentTypeRoles` (
  `documentTypeRoleId` int(11) NOT NULL,
  `documentTypeId` int(11) NOT NULL,
  `roleNameId` int(11) NOT NULL,
  `documentSecurity` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `SuperDocumentTypeRoles`
--

INSERT INTO `SuperDocumentTypeRoles` (`documentTypeRoleId`, `documentTypeId`, `roleNameId`, `documentSecurity`) VALUES
(2, 11, 3, '1,2,3,4,5,6'),
(4, 10, 3, '1,2,3,4,5,6'),
(9, 12, 4, '1,2,3,4,5,6'),
(10, 13, 4, '1,2,3,4,5,6'),
(11, 14, 4, '1,2,3,4,5,6'),
(12, 12, 27, '4'),
(13, 10, 27, '4'),
(14, 11, 27, '4'),
(16, 13, 27, '4'),
(17, 14, 27, '4'),
(18, 15, 28, '1,2,3,4,5,6'),
(19, 16, 28, '1,2,3,4,5,6'),
(20, 15, 26, '4'),
(21, 16, 26, '4'),
(145, 9, 3, '1'),
(181, 47, 11, '1'),
(182, 44, 3, '1'),
(183, 44, 4, '1'),
(184, 47, 3, '1'),
(185, 47, 4, '1');

-- --------------------------------------------------------

--
-- Table structure for table `SuperRoleNames`
--

CREATE TABLE `SuperRoleNames` (
  `roleNameId` int(11) NOT NULL,
  `roleTypeId` int(11) NOT NULL,
  `roleName` varchar(100) NOT NULL,
  `roleNameDescription` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `SuperRoleNames`
--

INSERT INTO `SuperRoleNames` (`roleNameId`, `roleTypeId`, `roleName`, `roleNameDescription`) VALUES
(1, 5, 'Panjagutta_PR', 'Main Branch'),
(2, 5, 'Kukatpally_PR', 'Kukatpally Branch'),
(3, 1, 'USA_Process_JR', 'USA Process Job Role'),
(4, 1, 'UK_Process_JR', 'UK Process Job Role'),
(5, 4, 'USA-Process_PANJ_AR', 'USA Process Approval Role'),
(6, 4, 'UK-Process_PANJ_AR', 'UK Process Approval Role'),
(7, 3, 'USA-Process_PANJ_SR', 'USA Process Security Role'),
(8, 3, 'UK-Process_PANJ_SR', 'UK Process Security Role'),
(10, 1, 'DilshukNagar_PR', 'DLSNR Property Role'),
(11, 1, 'Director of Finance_JR', 'Director of Finance Security Role'),
(12, 4, 'Director of Finance_PANJ_AR', 'Director of Finance Approver role'),
(13, 3, 'Director of Finance_PANJ_SR', 'Director of Finance'),
(14, 4, 'USA-Process_KUKP_AR', 'USA Process Approval Role'),
(15, 4, 'UK-Process_KUKP_AR', 'UK Process Approval Role'),
(16, 3, 'USA-Process_KUKP_SR', 'USA Process Security Role'),
(17, 3, 'UK-Process_KUKP_SR', 'UK Process Security Role'),
(18, 4, 'Director of Finance_KUKP_AR', 'Director of Finance Approver role'),
(19, 3, 'Director of Finance_KUKP_SR', 'Director of Finance'),
(20, 4, 'USA-Process_DLSN_AR', 'USA Process Approval Role'),
(21, 4, 'UK-Process_DLSN_AR', 'UK Process Approval Role'),
(22, 3, 'USA-Process_DLSN_SR', 'USA Process Security Role'),
(23, 3, 'UK-Process_DLSN_SR', 'UK Process Security Role'),
(24, 4, 'Director of Finance_DLSN_AR', 'Director of Finance Approver role'),
(25, 3, 'Director of Finance_DLSN_SR', 'Director of Finance'),
(26, 2, 'StudentAccess_JR', 'Student Access'),
(27, 2, 'StudentAccess_SR', 'Student Access Security Role'),
(28, 1, 'GER_Process_JR', 'Germany Process Job Role'),
(29, 3, 'GER_Process_SR', 'Security Role'),
(30, 4, 'GER_Process_AR', 'Approval Role'),
(32, 5, 'ABCStudyAbroad_PR', 'ABC Study Abroad'),
(33, 5, 'AdmitCenterOverseas_PR', 'Admit Center Overseas'),
(34, 5, 'Admitworld_PR', 'Admitworld'),
(35, 5, 'Aerialoverseas_PR', 'Aerial overseas'),
(36, 5, 'AflyConsultancy_PR', 'Afly Consultancy'),
(37, 5, 'AnilConsultancy_PR', 'Anil Consultancy'),
(38, 5, 'AnithaPandey_PR', 'Anitha Pandey'),
(39, 5, 'AppleAcademy_PR', 'Apple Academy'),
(40, 5, 'Applyguru_PR', 'Apply guru'),
(41, 5, 'ApplyOverseas_PR', 'Apply Overseas'),
(42, 5, 'Applyglobeadmissions_PR', 'Applyglobe admissions'),
(43, 5, 'AVsOverseas_PR', 'AVs Overseas'),
(44, 5, 'Baanvioverseas_PR', 'Baanvi overseas'),
(45, 5, 'Basicconsultancy_PR', 'Basic consultancy'),
(46, 5, 'BeyondOverseas_PR', 'Beyond Overseas'),
(47, 5, 'BridgeOverseas_PR', 'Bridge Overseas'),
(48, 5, 'BrightOverseasChandigarh_PR', 'Bright Overseas(Chandigarh)'),
(49, 5, 'Caliber_PR', 'Caliber'),
(50, 5, 'CareerBridge_PR', 'Career Bridge'),
(51, 5, 'CareerWings_PR', 'Career Wings'),
(52, 5, 'Cloudoverseas_PR', 'Cloud overseas'),
(53, 5, 'Credovisases_PR', 'Credo visas'),
(54, 5, 'CSOVERSEAS_PR', 'CS OVERSEAS'),
(55, 5, 'Dchos_PR', 'Dchos'),
(56, 5, 'DhanalaxmiOverseas_PR', 'Dhanalaxmi Overseas'),
(57, 5, 'Dwij_PR', 'Dwij'),
(58, 5, 'Edmium_PR', 'Edmium'),
(59, 5, 'EDOMap_PR', 'EDO Map'),
(60, 5, 'Edu2Tek_PR', 'Edu2Tek'),
(61, 5, 'EduconnectOverseas_PR', 'Educonnect Overseas'),
(62, 5, 'Elixirconsultancy_PR', 'Elixir consultancy'),
(63, 5, 'Emergeimigration_PR', 'Emerge imigration'),
(64, 5, 'EnlightWorldVisas_PR', 'Enlight World Visas'),
(65, 5, 'EnlightenAbroad_PR', 'Enlighten Abroad'),
(66, 5, 'FalconOverseas_PR', 'Falcon Overseas'),
(67, 5, 'Flyhats_PR', 'Fly hats'),
(68, 5, 'FlyLearning_PR', 'Fly Learning'),
(69, 5, 'Fly2overseas_PR', 'Fly2overseas'),
(70, 5, 'flyingbeeglobal_PR', 'flying bee global'),
(71, 5, 'Formulahub_PR', 'Formulahub'),
(72, 5, 'GlobalNavigator_PR', 'Global Navigator'),
(73, 5, 'GlobalSixSigma_PR', 'Global Six Sigma'),
(74, 5, 'GlobalVisionOverseas_PR', 'Global Vision Overseas'),
(75, 5, 'Govardhan_PR', 'Govardhan'),
(76, 5, 'GowayAbroad_PR', 'Goway Abroad'),
(77, 5, 'Gowiseconsultancy_PR', 'Gowise consultancy'),
(78, 5, 'GradEdOverseas_PR', 'Grad Ed Overseas'),
(79, 5, 'Gummadi_PR', 'Gummadi'),
(80, 5, 'I20Abroad_PR', 'I20 Abroad'),
(81, 5, 'I20ServicesOverseas_PR', 'I20 Services Overseas'),
(82, 5, 'immenseconsultancy_PR', 'immense consultancy'),
(83, 5, 'InspireServices_PR', 'Inspire Services'),
(84, 5, 'IyraConsultancy_PR', 'Iyra Consultancy'),
(85, 5, 'Jaspire_PR', 'Jaspire'),
(86, 5, 'Kaurimmigration_PR', 'Kaur immigration'),
(87, 5, 'Kiyaan_PR', 'Kiyaan'),
(88, 5, 'KPOverseas_PR', 'KP Overseas'),
(89, 5, 'KPsolutions_PR', 'KP solutions'),
(90, 5, 'KSP_PR', 'KSP'),
(91, 5, 'KVNOverseas_PR', 'KVN Overseas'),
(92, 5, 'Mappingoverseas_PR', 'Mapping overseas'),
(93, 5, 'MarghOverseas_PR', 'Margh Overseas'),
(94, 5, 'MouliOverseas_PR', 'Mouli Overseas'),
(95, 5, 'MRGlobal_PR', 'MR Global'),
(96, 5, 'Mudassir_PR', 'Mudassir'),
(97, 5, 'Navigator_PR', 'Navigator'),
(98, 5, 'NexGlobal_PR', 'Nex Global'),
(99, 5, 'NexRise_PR', 'Nex Rise'),
(100, 5, 'NextPlan_PR', 'Next Plan'),
(101, 5, 'OneStep_PR', 'One Step'),
(102, 5, 'OptionOverseas_PR', 'Option Overseas'),
(103, 5, 'OrangewayConsultancy_PR', 'Orangeway Consultancy'),
(320, 1, 'ABCStudyAbroad_ABCSA_USA_JR', 'ABC Study Abroad'),
(321, 1, 'AdmitCenterOverseas_ADMITCO_USA_JR', 'Admit Center Overseas'),
(322, 1, 'Admitworld_ADMITWO_USA_JR', 'Admitworld'),
(323, 1, 'Aerialoverseas_AERIAL_USA_JR', 'Aerial overseas'),
(324, 1, 'AflyConsultancy_AFLYC_USA_JR', 'Afly Consultancy'),
(325, 1, 'AnilConsultancy_ANILC_USA_JR', 'Anil Consultancy'),
(326, 1, 'AnithaPandey_ANITP_USA_JR', 'Anitha Pandey'),
(327, 1, 'AppleAcademy_APPLEA_USA_JR', 'Apple Academy'),
(328, 1, 'Applyguru_APPLYG_USA_JR', 'Apply guru'),
(329, 1, 'ApplyOverseas_APPLYO_USA_JR', 'Apply Overseas'),
(330, 1, 'Applyglobeadmissions_APPLYGA_USA_JR', 'Applyglobe admissions'),
(331, 1, 'AVsOverseas_AVSO_USA_JR', 'AVs Overseas'),
(332, 1, 'Baanvioverseas_BAANVO_USA_JR', 'Baanvi overseas'),
(333, 1, 'Basicconsultancy_BASICC_USA_JR', 'Basic consultancy'),
(334, 1, 'BeyondOverseas_BEYONDO_USA_JR', 'Beyond Overseas'),
(335, 1, 'BridgeOverseas_BRIDGEO_USA_JR', 'Bridge Overseas'),
(336, 1, 'BrightOverseasChandigarh_BRIGHTOC_USA_JR', 'Bright Overseas(Chandigarh)'),
(337, 1, 'Caliber_CALIBER_USA_JR', 'Caliber'),
(338, 1, 'CareerBridge_CAREERB_USA_JR', 'Career Bridge'),
(339, 1, 'CareerWings_CAREERW_USA_JR', 'Career Wings'),
(340, 1, 'Cloudoverseas_CLOUDO_USA_JR', 'Cloud overseas'),
(341, 1, 'Credovisases_CREDOV_USA_JR', 'Credo visas'),
(342, 1, 'CSOVERSEAS_CSOVER_USA_JR', 'CS OVERSEAS'),
(343, 1, 'Dchos_DCHOS_USA_JR', 'Dchos'),
(344, 1, 'DhanalaxmiOverseas_DHANAO_USA_JR', 'Dhanalaxmi Overseas'),
(345, 1, 'Dwij_DWIJO_USA_JR', 'Dwij'),
(346, 1, 'Edmium_EDMIUM_USA_JR', 'Edmium'),
(347, 1, 'EDOMap_EDOMAP_USA_JR', 'EDO Map'),
(348, 1, 'Edu2Tek_EDUTEK_USA_JR', 'Edu2Tek'),
(349, 1, 'EduconnectOverseas_EDUCONNO_USA_JR', 'Educonnect Overseas'),
(350, 1, 'Elixirconsultancy_ELIXIR_USA_JR', 'Elixir consultancy'),
(351, 1, 'Emergeimigration_EMERGEI_USA_JR', 'Emerge imigration'),
(352, 1, 'EnlightWorldVisas_ENLWVO_USA_JR', 'Enlight World Visas'),
(353, 1, 'EnlightenAbroad_ENLAO_USA_JR', 'Enlighten Abroad'),
(354, 1, 'FalconOverseas_FALCONO_USA_JR', 'Falcon Overseas'),
(355, 1, 'Flyhats_FLYHATO_USA_JR', 'Fly hats'),
(356, 1, 'FlyLearning_FLYLO_USA_JR', 'Fly Learning'),
(357, 1, 'Fly2overseas_FLYOVER_USA_JR', 'Fly2overseas'),
(358, 1, 'Flyingbeeglobal_FLYBEEG_USA_JR', 'Flying bee global'),
(359, 1, 'Formulahub_FORMLO_USA_JR', 'Formulahub'),
(360, 1, 'GlobalNavigator_GLONAVO_USA_JR', 'Global Navigator'),
(361, 1, 'GlobalSixSigma_GLOSIXO_USA_JR', 'Global Six Sigma'),
(362, 1, 'GlobalVisionOverseas_GLOVIO_USA_JR', 'Global Vision Overseas'),
(363, 1, 'Govardhan_GOVARO_USA_JR', 'Govardhan'),
(364, 1, 'GowayAbroad_GOWAYO_USA_JR', 'Goway Abroad'),
(365, 1, 'Gowiseconsultancy_GOWISEO_USA_JR', 'Gowise consultancy'),
(366, 1, 'GradEdOverseas_GRADEO_USA_JR', 'Grad Ed Overseas'),
(367, 1, 'Gummadi_GUMMAO_USA_JR', 'Gummadi'),
(368, 1, 'I20Abroad_IABROO_USA_JR', 'I20 Abroad'),
(369, 1, 'I20ServicesOverseas_ISERVO_USA_JR', 'I20 Services Overseas'),
(370, 1, 'Immenseconsultancy_IMMCON_USA_JR', 'Immense consultancy'),
(371, 1, 'InspireServices_INSSERO_USA_JR', 'Inspire Services'),
(372, 1, 'IyraConsultancy_IYRACO_USA_JR', 'Iyra Consultancy'),
(373, 1, 'Jaspire_JASPIREO_USA_JR', 'Jaspire'),
(374, 1, 'Kaurimmigration_KAURIO_USA_JR', 'Kaur immigration'),
(375, 1, 'Kiyaan_KIYAANO_USA_JR', 'Kiyaan'),
(376, 1, 'KPOverseas_KPOVERS_USA_JR', 'KP Overseas'),
(377, 1, 'KPsolutions_KPSOLO_USA_JR', 'KP solutions'),
(378, 1, 'KSP_KSPOVER_USA_JR', 'KSP'),
(379, 1, 'KVNOverseas_KVNOVER_USA_JR', 'KVN Overseas'),
(380, 1, 'Mappingoverseas_MAPPOVER_USA_JR', 'Mapping overseas'),
(381, 1, 'MarghOverseas_MARGHO_USA_JR', 'Margh Overseas'),
(382, 1, 'MouliOverseas_MOURLIO_USA_JR', 'Mouli Overseas'),
(383, 1, 'MRGlobal_MRGLOBO_USA_JR', 'MR Global'),
(384, 1, 'Mudassir_MUDASS_USA_JR', 'Mudassir'),
(385, 1, 'Navigator_NAVIGO_USA_JR', 'Navigator'),
(386, 1, 'NexGlobal_NEXGLOBO_USA_JR', 'Nex Global'),
(387, 1, 'NexRise_NEXRISEO_USA_JR', 'Nex Rise'),
(388, 1, 'NextPlan_NEXTPLANO_USA_JR', 'Next Plan'),
(389, 1, 'OneStep_ONESTO_USA_JR', 'One Step'),
(390, 1, 'OptionOverseas_OPTIONO_USA_JR', 'Option Overseas'),
(391, 1, 'OrangewayConsultancy_ORANGEO_USA_JR', 'Orangeway Consultancy'),
(392, 1, 'ABCStudyAbroad_ABCSA_UK_JR', 'ABC Study Abroad'),
(393, 1, 'AdmitCenterOverseas_ADMITCO_UK_JR', 'Admit Center Overseas'),
(394, 1, 'Admitworld_ADMITWO_UK_JR', 'Admitworld'),
(395, 1, 'Aerialoverseas_AERIAL_UK_JR', 'Aerial overseas'),
(396, 1, 'AflyConsultancy_AFLYC_UK_JR', 'Afly Consultancy'),
(397, 1, 'AnilConsultancy_ANILC_UK_JR', 'Anil Consultancy'),
(398, 1, 'AnithaPandey_ANITP_UK_JR', 'Anitha Pandey'),
(399, 1, 'AppleAcademy_APPLEA_UK_JR', 'Apple Academy'),
(400, 1, 'Applyguru_APPLYG_UK_JR', 'Apply guru'),
(401, 1, 'ApplyOverseas_APPLYO_UK_JR', 'Apply Overseas'),
(402, 1, 'Applyglobeadmissions_APPLYGA_UK_JR', 'Applyglobe admissions'),
(403, 1, 'AVsOverseas_AVSO_UK_JR', 'AVs Overseas'),
(404, 1, 'Baanvioverseas_BAANVO_UK_JR', 'Baanvi overseas'),
(405, 1, 'Basicconsultancy_BASICC_UK_JR', 'Basic consultancy'),
(406, 1, 'BeyondOverseas_BEYONDO_UK_JR', 'Beyond Overseas'),
(407, 1, 'BridgeOverseas_BRIDGEO_UK_JR', 'Bridge Overseas'),
(408, 1, 'BrightOverseasChandigarh_BRIGHTOC_UK_JR', 'Bright Overseas(Chandigarh)'),
(409, 1, 'Caliber_CALIBER_UK_JR', 'Caliber'),
(410, 1, 'CareerBridge_CAREERB_UK_JR', 'Career Bridge'),
(411, 1, 'CareerWings_CAREERW_UK_JR', 'Career Wings'),
(412, 1, 'Cloudoverseas_CLOUDO_UK_JR', 'Cloud overseas'),
(413, 1, 'Credovisases_CREDOV_UK_JR', 'Credo visas'),
(414, 1, 'CSOVERSEAS_CSOVER_UK_JR', 'CS OVERSEAS'),
(415, 1, 'Dchos_DCHOS_UK_JR', 'Dchos'),
(416, 1, 'DhanalaxmiOverseas_DHANAO_UK_JR', 'Dhanalaxmi Overseas'),
(417, 1, 'Dwij_DWIJO_UK_JR', 'Dwij'),
(418, 1, 'Edmium_EDMIUM_UK_JR', 'Edmium'),
(419, 1, 'EDOMap_EDOMAP_UK_JR', 'EDO Map'),
(420, 1, 'Edu2Tek_EDUTEK_UK_JR', 'Edu2Tek'),
(421, 1, 'EduconnectOverseas_EDUCONNO_UK_JR', 'Educonnect Overseas'),
(422, 1, 'Elixirconsultancy_ELIXIR_UK_JR', 'Elixir consultancy'),
(423, 1, 'Emergeimigration_EMERGEI_UK_JR', 'Emerge imigration'),
(424, 1, 'EnlightWorldVisas_ENLWVO_UK_JR', 'Enlight World Visas'),
(425, 1, 'EnlightenAbroad_ENLAO_UK_JR', 'Enlighten Abroad'),
(426, 1, 'FalconOverseas_FALCONO_UK_JR', 'Falcon Overseas'),
(427, 1, 'Flyhats_FLYHATO_UK_JR', 'Fly hats'),
(428, 1, 'FlyLearning_FLYLO_UK_JR', 'Fly Learning'),
(429, 1, 'Fly2overseas_FLYOVER_UK_JR', 'Fly2overseas'),
(430, 1, 'Flyingbeeglobal_FLYBEEG_UK_JR', 'Flying bee global'),
(431, 1, 'Formulahub_FORMLO_UK_JR', 'Formulahub'),
(432, 1, 'GlobalNavigator_GLONAVO_UK_JR', 'Global Navigator'),
(433, 1, 'GlobalSixSigma_GLOSIXO_UK_JR', 'Global Six Sigma'),
(434, 1, 'GlobalVisionOverseas_GLOVIO_UK_JR', 'Global Vision Overseas'),
(435, 1, 'Govardhan_GOVARO_UK_JR', 'Govardhan'),
(436, 1, 'GowayAbroad_GOWAYO_UK_JR', 'Goway Abroad'),
(437, 1, 'Gowiseconsultancy_GOWISEO_UK_JR', 'Gowise consultancy'),
(438, 1, 'GradEdOverseas_GRADEO_UK_JR', 'Grad Ed Overseas'),
(439, 1, 'Gummadi_GUMMAO_UK_JR', 'Gummadi'),
(440, 1, 'I20Abroad_IABROO_UK_JR', 'I20 Abroad'),
(441, 1, 'I20ServicesOverseas_ISERVO_UK_JR', 'I20 Services Overseas'),
(442, 1, 'Immenseconsultancy_IMMCON_UK_JR', 'Immense consultancy'),
(443, 1, 'InspireServices_INSSERO_UK_JR', 'Inspire Services'),
(444, 1, 'IyraConsultancy_IYRACO_UK_JR', 'Iyra Consultancy'),
(445, 1, 'Jaspire_JASPIREO_UK_JR', 'Jaspire'),
(446, 1, 'Kaurimmigration_KAURIO_UK_JR', 'Kaur immigration'),
(447, 1, 'Kiyaan_KIYAANO_UK_JR', 'Kiyaan'),
(448, 1, 'KPOverseas_KPOVERS_UK_JR', 'KP Overseas'),
(449, 1, 'KPsolutions_KPSOLO_UK_JR', 'KP solutions'),
(450, 1, 'KSP_KSPOVER_UK_JR', 'KSP'),
(451, 1, 'KVNOverseas_KVNOVER_UK_JR', 'KVN Overseas'),
(452, 1, 'Mappingoverseas_MAPPOVER_UK_JR', 'Mapping overseas'),
(453, 1, 'MarghOverseas_MARGHO_UK_JR', 'Margh Overseas'),
(454, 1, 'MouliOverseas_MOURLIO_UK_JR', 'Mouli Overseas'),
(455, 1, 'MRGlobal_MRGLOBO_UK_JR', 'MR Global'),
(456, 1, 'Mudassir_MUDASS_UK_JR', 'Mudassir'),
(457, 1, 'Navigator_NAVIGO_UK_JR', 'Navigator'),
(458, 1, 'NexGlobal_NEXGLOBO_UK_JR', 'Nex Global'),
(459, 1, 'NexRise_NEXRISEO_UK_JR', 'Nex Rise'),
(460, 1, 'NextPlan_NEXTPLANO_UK_JR', 'Next Plan'),
(461, 1, 'OneStep_ONESTO_UK_JR', 'One Step'),
(462, 1, 'OptionOverseas_OPTIONO_UK_JR', 'Option Overseas'),
(463, 1, 'OrangewayConsultancy_ORANGEO_UK_JR', 'Orangeway Consultancy'),
(464, 1, 'ABCStudyAbroad_ABCSA_GER_JR', 'ABC Study Abroad'),
(465, 1, 'AdmitCenterOverseas_ADMITCO_GER_JR', 'Admit Center Overseas'),
(466, 1, 'Admitworld_ADMITWO_GER_JR', 'Admitworld'),
(467, 1, 'Aerialoverseas_AERIAL_GER_JR', 'Aerial overseas'),
(468, 1, 'AflyConsultancy_AFLYC_GER_JR', 'Afly Consultancy'),
(469, 1, 'AnilConsultancy_ANILC_GER_JR', 'Anil Consultancy'),
(470, 1, 'AnithaPandey_ANITP_GER_JR', 'Anitha Pandey'),
(471, 1, 'AppleAcademy_APPLEA_GER_JR', 'Apple Academy'),
(472, 1, 'Applyguru_APPLYG_GER_JR', 'Apply guru'),
(473, 1, 'ApplyOverseas_APPLYO_GER_JR', 'Apply Overseas'),
(474, 1, 'Applyglobeadmissions_APPLYGA_GER_JR', 'Applyglobe admissions'),
(475, 1, 'AVsOverseas_AVSO_GER_JR', 'AVs Overseas'),
(476, 1, 'Baanvioverseas_BAANVO_GER_JR', 'Baanvi overseas'),
(477, 1, 'Basicconsultancy_BASICC_GER_JR', 'Basic consultancy'),
(478, 1, 'BeyondOverseas_BEYONDO_GER_JR', 'Beyond Overseas'),
(479, 1, 'BridgeOverseas_BRIDGEO_GER_JR', 'Bridge Overseas'),
(480, 1, 'BrightOverseasChandigarh_BRIGHTOC_GER_JR', 'Bright Overseas(Chandigarh)'),
(481, 1, 'Caliber_CALIBER_GER_JR', 'Caliber'),
(482, 1, 'CareerBridge_CAREERB_GER_JR', 'Career Bridge'),
(483, 1, 'CareerWings_CAREERW_GER_JR', 'Career Wings'),
(484, 1, 'Cloudoverseas_CLOUDO_GER_JR', 'Cloud overseas'),
(485, 1, 'Credovisases_CREDOV_GER_JR', 'Credo visas'),
(486, 1, 'CSOVERSEAS_CSOVER_GER_JR', 'CS OVERSEAS'),
(487, 1, 'Dchos_DCHOS_GER_JR', 'Dchos'),
(488, 1, 'DhanalaxmiOverseas_DHANAO_GER_JR', 'Dhanalaxmi Overseas'),
(489, 1, 'Dwij_DWIJO_GER_JR', 'Dwij'),
(490, 1, 'Edmium_EDMIUM_GER_JR', 'Edmium'),
(491, 1, 'EDOMap_EDOMAP_GER_JR', 'EDO Map'),
(492, 1, 'Edu2Tek_EDUTEK_GER_JR', 'Edu2Tek'),
(493, 1, 'EduconnectOverseas_EDUCONNO_GER_JR', 'Educonnect Overseas'),
(494, 1, 'Elixirconsultancy_ELIXIR_GER_JR', 'Elixir consultancy'),
(495, 1, 'Emergeimigration_EMERGEI_GER_JR', 'Emerge imigration'),
(496, 1, 'EnlightWorldVisas_ENLWVO_GER_JR', 'Enlight World Visas'),
(497, 1, 'EnlightenAbroad_ENLAO_GER_JR', 'Enlighten Abroad'),
(498, 1, 'FalconOverseas_FALCONO_GER_JR', 'Falcon Overseas'),
(499, 1, 'Flyhats_FLYHATO_GER_JR', 'Fly hats'),
(500, 1, 'FlyLearning_FLYLO_GER_JR', 'Fly Learning'),
(501, 1, 'Fly2overseas_FLYOVER_GER_JR', 'Fly2overseas'),
(502, 1, 'Flyingbeeglobal_FLYBEEG_GER_JR', 'Flying bee global'),
(503, 1, 'Formulahub_FORMLO_GER_JR', 'Formulahub'),
(504, 1, 'GlobalNavigator_GLONAVO_GER_JR', 'Global Navigator'),
(505, 1, 'GlobalSixSigma_GLOSIXO_GER_JR', 'Global Six Sigma'),
(506, 1, 'GlobalVisionOverseas_GLOVIO_GER_JR', 'Global Vision Overseas'),
(507, 1, 'Govardhan_GOVARO_GER_JR', 'Govardhan'),
(508, 1, 'GowayAbroad_GOWAYO_GER_JR', 'Goway Abroad'),
(509, 1, 'Gowiseconsultancy_GOWISEO_GER_JR', 'Gowise consultancy'),
(510, 1, 'GradEdOverseas_GRADEO_GER_JR', 'Grad Ed Overseas'),
(511, 1, 'Gummadi_GUMMAO_GER_JR', 'Gummadi'),
(512, 1, 'I20Abroad_IABROO_GER_JR', 'I20 Abroad'),
(513, 1, 'I20ServicesOverseas_ISERVO_GER_JR', 'I20 Services Overseas'),
(514, 1, 'Immenseconsultancy_IMMCON_GER_JR', 'Immense consultancy'),
(515, 1, 'InspireServices_INSSERO_GER_JR', 'Inspire Services'),
(516, 1, 'IyraConsultancy_IYRACO_GER_JR', 'Iyra Consultancy'),
(517, 1, 'Jaspire_JASPIREO_GER_JR', 'Jaspire'),
(518, 1, 'Kaurimmigration_KAURIO_GER_JR', 'Kaur immigration'),
(519, 1, 'Kiyaan_KIYAANO_GER_JR', 'Kiyaan'),
(520, 1, 'KPOverseas_KPOVERS_GER_JR', 'KP Overseas'),
(521, 1, 'KPsolutions_KPSOLO_GER_JR', 'KP solutions'),
(522, 1, 'KSP_KSPOVER_GER_JR', 'KSP'),
(523, 1, 'KVNOverseas_KVNOVER_GER_JR', 'KVN Overseas'),
(524, 1, 'Mappingoverseas_MAPPOVER_GER_JR', 'Mapping overseas'),
(525, 1, 'MarghOverseas_MARGHO_GER_JR', 'Margh Overseas'),
(526, 1, 'MouliOverseas_MOURLIO_GER_JR', 'Mouli Overseas'),
(527, 1, 'MRGlobal_MRGLOBO_GER_JR', 'MR Global'),
(528, 1, 'Mudassir_MUDASS_GER_JR', 'Mudassir'),
(529, 1, 'Navigator_NAVIGO_GER_JR', 'Navigator'),
(530, 1, 'NexGlobal_NEXGLOBO_GER_JR', 'Nex Global'),
(531, 1, 'NexRise_NEXRISEO_GER_JR', 'Nex Rise'),
(532, 1, 'NextPlan_NEXTPLANO_GER_JR', 'Next Plan'),
(533, 1, 'OneStep_ONESTO_GER_JR', 'One Step'),
(534, 1, 'OptionOverseas_OPTIONO_GER_JR', 'Option Overseas'),
(535, 1, 'OrangewayConsultancy_ORANGEO_GER_JR', 'Orangeway Consultancy'),
(536, 3, 'ABCStudyAbroad_ABCSA_USA_SR', 'ABC Study Abroad'),
(537, 3, 'AdmitCenterOverseas_ADMITCO_USA_SR', 'Admit Center Overseas'),
(538, 3, 'Admitworld_ADMITWO_USA_SR', 'Admitworld'),
(539, 3, 'Aerialoverseas_AERIAL_USA_SR', 'Aerial overseas'),
(540, 3, 'AflyConsultancy_AFLYC_USA_SR', 'Afly Consultancy'),
(541, 3, 'AnilConsultancy_ANILC_USA_SR', 'Anil Consultancy'),
(542, 3, 'AnithaPandey_ANITP_USA_SR', 'Anitha Pandey'),
(543, 3, 'AppleAcademy_APPLEA_USA_SR', 'Apple Academy'),
(544, 3, 'Applyguru_APPLYG_USA_SR', 'Apply guru'),
(545, 3, 'ApplyOverseas_APPLYO_USA_SR', 'Apply Overseas'),
(546, 3, 'Applyglobeadmissions_APPLYGA_USA_SR', 'Applyglobe admissions'),
(547, 3, 'AVsOverseas_AVSO_USA_SR', 'AVs Overseas'),
(548, 3, 'Baanvioverseas_BAANVO_USA_SR', 'Baanvi overseas'),
(549, 3, 'Basicconsultancy_BASICC_USA_SR', 'Basic consultancy'),
(550, 3, 'BeyondOverseas_BEYONDO_USA_SR', 'Beyond Overseas'),
(551, 3, 'BridgeOverseas_BRIDGEO_USA_SR', 'Bridge Overseas'),
(552, 3, 'BrightOverseasChandigarh_BRIGHTOC_USA_SR', 'Bright Overseas(Chandigarh)'),
(553, 3, 'Caliber_CALIBER_USA_SR', 'Caliber'),
(554, 3, 'CareerBridge_CAREERB_USA_SR', 'Career Bridge'),
(555, 3, 'CareerWings_CAREERW_USA_SR', 'Career Wings'),
(556, 3, 'Cloudoverseas_CLOUDO_USA_SR', 'Cloud overseas'),
(557, 3, 'Credovisases_CREDOV_USA_SR', 'Credo visas'),
(558, 3, 'CSOVERSEAS_CSOVER_USA_SR', 'CS OVERSEAS'),
(559, 3, 'Dchos_DCHOS_USA_SR', 'Dchos'),
(560, 3, 'DhanalaxmiOverseas_DHANAO_USA_SR', 'Dhanalaxmi Overseas'),
(561, 3, 'Dwij_DWIJO_USA_SR', 'Dwij'),
(562, 3, 'Edmium_EDMIUM_USA_SR', 'Edmium'),
(563, 3, 'EDOMap_EDOMAP_USA_SR', 'EDO Map'),
(564, 3, 'Edu2Tek_EDUTEK_USA_SR', 'Edu2Tek'),
(565, 3, 'EduconnectOverseas_EDUCONNO_USA_SR', 'Educonnect Overseas'),
(566, 3, 'Elixirconsultancy_ELIXIR_USA_SR', 'Elixir consultancy'),
(567, 3, 'Emergeimigration_EMERGEI_USA_SR', 'Emerge imigration'),
(568, 3, 'EnlightWorldVisas_ENLWVO_USA_SR', 'Enlight World Visas'),
(569, 3, 'EnlightenAbroad_ENLAO_USA_SR', 'Enlighten Abroad'),
(570, 3, 'FalconOverseas_FALCONO_USA_SR', 'Falcon Overseas'),
(571, 3, 'Flyhats_FLYHATO_USA_SR', 'Fly hats'),
(572, 3, 'FlyLearning_FLYLO_USA_SR', 'Fly Learning'),
(573, 3, 'Fly2overseas_FLYOVER_USA_SR', 'Fly2overseas'),
(574, 3, 'Flyingbeeglobal_FLYBEEG_USA_SR', 'Flying bee global'),
(575, 3, 'Formulahub_FORMLO_USA_SR', 'Formulahub'),
(576, 3, 'GlobalNavigator_GLONAVO_USA_SR', 'Global Navigator'),
(577, 3, 'GlobalSixSigma_GLOSIXO_USA_SR', 'Global Six Sigma'),
(578, 3, 'GlobalVisionOverseas_GLOVIO_USA_SR', 'Global Vision Overseas'),
(579, 3, 'Govardhan_GOVARO_USA_SR', 'Govardhan'),
(580, 3, 'GowayAbroad_GOWAYO_USA_SR', 'Goway Abroad'),
(581, 3, 'Gowiseconsultancy_GOWISEO_USA_SR', 'Gowise consultancy'),
(582, 3, 'GradEdOverseas_GRADEO_USA_SR', 'Grad Ed Overseas'),
(583, 3, 'Gummadi_GUMMAO_USA_SR', 'Gummadi'),
(584, 3, 'I20Abroad_IABROO_USA_SR', 'I20 Abroad'),
(585, 3, 'I20ServicesOverseas_ISERVO_USA_SR', 'I20 Services Overseas'),
(586, 3, 'Immenseconsultancy_IMMCON_USA_SR', 'Immense consultancy'),
(587, 3, 'InspireServices_INSSERO_USA_SR', 'Inspire Services'),
(588, 3, 'IyraConsultancy_IYRACO_USA_SR', 'Iyra Consultancy'),
(589, 3, 'Jaspire_JASPIREO_USA_SR', 'Jaspire'),
(590, 3, 'Kaurimmigration_KAURIO_USA_SR', 'Kaur immigration'),
(591, 3, 'Kiyaan_KIYAANO_USA_SR', 'Kiyaan'),
(592, 3, 'KPOverseas_KPOVERS_USA_SR', 'KP Overseas'),
(593, 3, 'KPsolutions_KPSOLO_USA_SR', 'KP solutions'),
(594, 3, 'KSP_KSPOVER_USA_SR', 'KSP'),
(595, 3, 'KVNOverseas_KVNOVER_USA_SR', 'KVN Overseas'),
(596, 3, 'Mappingoverseas_MAPPOVER_USA_SR', 'Mapping overseas'),
(597, 3, 'MarghOverseas_MARGHO_USA_SR', 'Margh Overseas'),
(598, 3, 'MouliOverseas_MOURLIO_USA_SR', 'Mouli Overseas'),
(599, 3, 'MRGlobal_MRGLOBO_USA_SR', 'MR Global'),
(600, 3, 'Mudassir_MUDASS_USA_SR', 'Mudassir'),
(601, 3, 'Navigator_NAVIGO_USA_SR', 'Navigator'),
(602, 3, 'NexGlobal_NEXGLOBO_USA_SR', 'Nex Global'),
(603, 3, 'NexRise_NEXRISEO_USA_SR', 'Nex Rise'),
(604, 3, 'NextPlan_NEXTPLANO_USA_SR', 'Next Plan'),
(605, 3, 'OneStep_ONESTO_USA_SR', 'One Step'),
(606, 3, 'OptionOverseas_OPTIONO_USA_SR', 'Option Overseas'),
(607, 3, 'OrangewayConsultancy_ORANGEO_USA_SR', 'Orangeway Consultancy'),
(608, 3, 'ABCStudyAbroad_ABCSA_UK_SR', 'ABC Study Abroad'),
(609, 3, 'AdmitCenterOverseas_ADMITCO_UK_SR', 'Admit Center Overseas'),
(610, 3, 'Admitworld_ADMITWO_UK_SR', 'Admitworld'),
(611, 3, 'Aerialoverseas_AERIAL_UK_SR', 'Aerial overseas'),
(612, 3, 'AflyConsultancy_AFLYC_UK_SR', 'Afly Consultancy'),
(613, 3, 'AnilConsultancy_ANILC_UK_SR', 'Anil Consultancy'),
(614, 3, 'AnithaPandey_ANITP_UK_SR', 'Anitha Pandey'),
(615, 3, 'AppleAcademy_APPLEA_UK_SR', 'Apple Academy'),
(616, 3, 'Applyguru_APPLYG_UK_SR', 'Apply guru'),
(617, 3, 'ApplyOverseas_APPLYO_UK_SR', 'Apply Overseas'),
(618, 3, 'Applyglobeadmissions_APPLYGA_UK_SR', 'Applyglobe admissions'),
(619, 3, 'AVsOverseas_AVSO_UK_SR', 'AVs Overseas'),
(620, 3, 'Baanvioverseas_BAANVO_UK_SR', 'Baanvi overseas'),
(621, 3, 'Basicconsultancy_BASICC_UK_SR', 'Basic consultancy'),
(622, 3, 'BeyondOverseas_BEYONDO_UK_SR', 'Beyond Overseas'),
(623, 3, 'BridgeOverseas_BRIDGEO_UK_SR', 'Bridge Overseas'),
(624, 3, 'BrightOverseasChandigarh_BRIGHTOC_UK_SR', 'Bright Overseas(Chandigarh)'),
(625, 3, 'Caliber_CALIBER_UK_SR', 'Caliber'),
(626, 3, 'CareerBridge_CAREERB_UK_SR', 'Career Bridge'),
(627, 3, 'CareerWings_CAREERW_UK_SR', 'Career Wings'),
(628, 3, 'Cloudoverseas_CLOUDO_UK_SR', 'Cloud overseas'),
(629, 3, 'Credovisases_CREDOV_UK_SR', 'Credo visas'),
(630, 3, 'CSOVERSEAS_CSOVER_UK_SR', 'CS OVERSEAS'),
(631, 3, 'Dchos_DCHOS_UK_SR', 'Dchos'),
(632, 3, 'DhanalaxmiOverseas_DHANAO_UK_SR', 'Dhanalaxmi Overseas'),
(633, 3, 'Dwij_DWIJO_UK_SR', 'Dwij'),
(634, 3, 'Edmium_EDMIUM_UK_SR', 'Edmium'),
(635, 3, 'EDOMap_EDOMAP_UK_SR', 'EDO Map'),
(636, 3, 'Edu2Tek_EDUTEK_UK_SR', 'Edu2Tek'),
(637, 3, 'EduconnectOverseas_EDUCONNO_UK_SR', 'Educonnect Overseas'),
(638, 3, 'Elixirconsultancy_ELIXIR_UK_SR', 'Elixir consultancy'),
(639, 3, 'Emergeimigration_EMERGEI_UK_SR', 'Emerge imigration'),
(640, 3, 'EnlightWorldVisas_ENLWVO_UK_SR', 'Enlight World Visas'),
(641, 3, 'EnlightenAbroad_ENLAO_UK_SR', 'Enlighten Abroad'),
(642, 3, 'FalconOverseas_FALCONO_UK_SR', 'Falcon Overseas'),
(643, 3, 'Flyhats_FLYHATO_UK_SR', 'Fly hats'),
(644, 3, 'FlyLearning_FLYLO_UK_SR', 'Fly Learning'),
(645, 3, 'Fly2overseas_FLYOVER_UK_SR', 'Fly2overseas'),
(646, 3, 'Flyingbeeglobal_FLYBEEG_UK_SR', 'Flying bee global'),
(647, 3, 'Formulahub_FORMLO_UK_SR', 'Formulahub'),
(648, 3, 'GlobalNavigator_GLONAVO_UK_SR', 'Global Navigator'),
(649, 3, 'GlobalSixSigma_GLOSIXO_UK_SR', 'Global Six Sigma'),
(650, 3, 'GlobalVisionOverseas_GLOVIO_UK_SR', 'Global Vision Overseas'),
(651, 3, 'Govardhan_GOVARO_UK_SR', 'Govardhan'),
(652, 3, 'GowayAbroad_GOWAYO_UK_SR', 'Goway Abroad'),
(653, 3, 'Gowiseconsultancy_GOWISEO_UK_SR', 'Gowise consultancy'),
(654, 3, 'GradEdOverseas_GRADEO_UK_SR', 'Grad Ed Overseas'),
(655, 3, 'Gummadi_GUMMAO_UK_SR', 'Gummadi'),
(656, 3, 'I20Abroad_IABROO_UK_SR', 'I20 Abroad'),
(657, 3, 'I20ServicesOverseas_ISERVO_UK_SR', 'I20 Services Overseas'),
(658, 3, 'Immenseconsultancy_IMMCON_UK_SR', 'Immense consultancy'),
(659, 3, 'InspireServices_INSSERO_UK_SR', 'Inspire Services'),
(660, 3, 'IyraConsultancy_IYRACO_UK_SR', 'Iyra Consultancy'),
(661, 3, 'Jaspire_JASPIREO_UK_SR', 'Jaspire'),
(662, 3, 'Kaurimmigration_KAURIO_UK_SR', 'Kaur immigration'),
(663, 3, 'Kiyaan_KIYAANO_UK_SR', 'Kiyaan'),
(664, 3, 'KPOverseas_KPOVERS_UK_SR', 'KP Overseas'),
(665, 3, 'KPsolutions_KPSOLO_UK_SR', 'KP solutions'),
(666, 3, 'KSP_KSPOVER_UK_SR', 'KSP'),
(667, 3, 'KVNOverseas_KVNOVER_UK_SR', 'KVN Overseas'),
(668, 3, 'Mappingoverseas_MAPPOVER_UK_SR', 'Mapping overseas'),
(669, 3, 'MarghOverseas_MARGHO_UK_SR', 'Margh Overseas'),
(670, 3, 'MouliOverseas_MOURLIO_UK_SR', 'Mouli Overseas'),
(671, 3, 'MRGlobal_MRGLOBO_UK_SR', 'MR Global'),
(672, 3, 'Mudassir_MUDASS_UK_SR', 'Mudassir'),
(673, 3, 'Navigator_NAVIGO_UK_SR', 'Navigator'),
(674, 3, 'NexGlobal_NEXGLOBO_UK_SR', 'Nex Global'),
(675, 3, 'NexRise_NEXRISEO_UK_SR', 'Nex Rise'),
(676, 3, 'NextPlan_NEXTPLANO_UK_SR', 'Next Plan'),
(677, 3, 'OneStep_ONESTO_UK_SR', 'One Step'),
(678, 3, 'OptionOverseas_OPTIONO_UK_SR', 'Option Overseas'),
(679, 3, 'OrangewayConsultancy_ORANGEO_UK_SR', 'Orangeway Consultancy'),
(680, 3, 'ABCStudyAbroad_ABCSA_GER_SR', 'ABC Study Abroad'),
(681, 3, 'AdmitCenterOverseas_ADMITCO_GER_SR', 'Admit Center Overseas'),
(682, 3, 'Admitworld_ADMITWO_GER_SR', 'Admitworld'),
(683, 3, 'Aerialoverseas_AERIAL_GER_SR', 'Aerial overseas'),
(684, 3, 'AflyConsultancy_AFLYC_GER_SR', 'Afly Consultancy'),
(685, 3, 'AnilConsultancy_ANILC_GER_SR', 'Anil Consultancy'),
(686, 3, 'AnithaPandey_ANITP_GER_SR', 'Anitha Pandey'),
(687, 3, 'AppleAcademy_APPLEA_GER_SR', 'Apple Academy'),
(688, 3, 'Applyguru_APPLYG_GER_SR', 'Apply guru'),
(689, 3, 'ApplyOverseas_APPLYO_GER_SR', 'Apply Overseas'),
(690, 3, 'Applyglobeadmissions_APPLYGA_GER_SR', 'Applyglobe admissions'),
(691, 3, 'AVsOverseas_AVSO_GER_SR', 'AVs Overseas'),
(692, 3, 'Baanvioverseas_BAANVO_GER_SR', 'Baanvi overseas'),
(693, 3, 'Basicconsultancy_BASICC_GER_SR', 'Basic consultancy'),
(694, 3, 'BeyondOverseas_BEYONDO_GER_SR', 'Beyond Overseas'),
(695, 3, 'BridgeOverseas_BRIDGEO_GER_SR', 'Bridge Overseas'),
(696, 3, 'BrightOverseasChandigarh_BRIGHTOC_GER_SR', 'Bright Overseas(Chandigarh)'),
(697, 3, 'Caliber_CALIBER_GER_SR', 'Caliber'),
(698, 3, 'CareerBridge_CAREERB_GER_SR', 'Career Bridge'),
(699, 3, 'CareerWings_CAREERW_GER_SR', 'Career Wings'),
(700, 3, 'Cloudoverseas_CLOUDO_GER_SR', 'Cloud overseas'),
(701, 3, 'Credovisases_CREDOV_GER_SR', 'Credo visas'),
(702, 3, 'CSOVERSEAS_CSOVER_GER_SR', 'CS OVERSEAS'),
(703, 3, 'Dchos_DCHOS_GER_SR', 'Dchos'),
(704, 3, 'DhanalaxmiOverseas_DHANAO_GER_SR', 'Dhanalaxmi Overseas'),
(705, 3, 'Dwij_DWIJO_GER_SR', 'Dwij'),
(706, 3, 'Edmium_EDMIUM_GER_SR', 'Edmium'),
(707, 3, 'EDOMap_EDOMAP_GER_SR', 'EDO Map'),
(708, 3, 'Edu2Tek_EDUTEK_GER_SR', 'Edu2Tek'),
(709, 3, 'EduconnectOverseas_EDUCONNO_GER_SR', 'Educonnect Overseas'),
(710, 3, 'Elixirconsultancy_ELIXIR_GER_SR', 'Elixir consultancy'),
(711, 3, 'Emergeimigration_EMERGEI_GER_SR', 'Emerge imigration'),
(712, 3, 'EnlightWorldVisas_ENLWVO_GER_SR', 'Enlight World Visas'),
(713, 3, 'EnlightenAbroad_ENLAO_GER_SR', 'Enlighten Abroad'),
(714, 3, 'FalconOverseas_FALCONO_GER_SR', 'Falcon Overseas'),
(715, 3, 'Flyhats_FLYHATO_GER_SR', 'Fly hats'),
(716, 3, 'FlyLearning_FLYLO_GER_SR', 'Fly Learning'),
(717, 3, 'Fly2overseas_FLYOVER_GER_SR', 'Fly2overseas'),
(718, 3, 'Flyingbeeglobal_FLYBEEG_GER_SR', 'Flying bee global'),
(719, 3, 'Formulahub_FORMLO_GER_SR', 'Formulahub'),
(720, 3, 'GlobalNavigator_GLONAVO_GER_SR', 'Global Navigator'),
(721, 3, 'GlobalSixSigma_GLOSIXO_GER_SR', 'Global Six Sigma'),
(722, 3, 'GlobalVisionOverseas_GLOVIO_GER_SR', 'Global Vision Overseas'),
(723, 3, 'Govardhan_GOVARO_GER_SR', 'Govardhan'),
(724, 3, 'GowayAbroad_GOWAYO_GER_SR', 'Goway Abroad'),
(725, 3, 'Gowiseconsultancy_GOWISEO_GER_SR', 'Gowise consultancy'),
(726, 3, 'GradEdOverseas_GRADEO_GER_SR', 'Grad Ed Overseas'),
(727, 3, 'Gummadi_GUMMAO_GER_SR', 'Gummadi'),
(728, 3, 'I20Abroad_IABROO_GER_SR', 'I20 Abroad'),
(729, 3, 'I20ServicesOverseas_ISERVO_GER_SR', 'I20 Services Overseas'),
(730, 3, 'Immenseconsultancy_IMMCON_GER_SR', 'Immense consultancy'),
(731, 3, 'InspireServices_INSSERO_GER_SR', 'Inspire Services'),
(732, 3, 'IyraConsultancy_IYRACO_GER_SR', 'Iyra Consultancy'),
(733, 3, 'Jaspire_JASPIREO_GER_SR', 'Jaspire'),
(734, 3, 'Kaurimmigration_KAURIO_GER_SR', 'Kaur immigration'),
(735, 3, 'Kiyaan_KIYAANO_GER_SR', 'Kiyaan'),
(736, 3, 'KPOverseas_KPOVERS_GER_SR', 'KP Overseas'),
(737, 3, 'KPsolutions_KPSOLO_GER_SR', 'KP solutions'),
(738, 3, 'KSP_KSPOVER_GER_SR', 'KSP'),
(739, 3, 'KVNOverseas_KVNOVER_GER_SR', 'KVN Overseas'),
(740, 3, 'Mappingoverseas_MAPPOVER_GER_SR', 'Mapping overseas'),
(741, 3, 'MarghOverseas_MARGHO_GER_SR', 'Margh Overseas'),
(742, 3, 'MouliOverseas_MOURLIO_GER_SR', 'Mouli Overseas'),
(743, 3, 'MRGlobal_MRGLOBO_GER_SR', 'MR Global'),
(744, 3, 'Mudassir_MUDASS_GER_SR', 'Mudassir'),
(745, 3, 'Navigator_NAVIGO_GER_SR', 'Navigator'),
(746, 3, 'NexGlobal_NEXGLOBO_GER_SR', 'Nex Global'),
(747, 3, 'NexRise_NEXRISEO_GER_SR', 'Nex Rise'),
(748, 3, 'NextPlan_NEXTPLANO_GER_SR', 'Next Plan'),
(749, 3, 'OneStep_ONESTO_GER_SR', 'One Step'),
(750, 3, 'OptionOverseas_OPTIONO_GER_SR', 'Option Overseas'),
(751, 3, 'OrangewayConsultancy_ORANGEO_GER_SR', 'Orangeway Consultancy'),
(752, 4, 'ABCStudyAbroad_ABCSA_USA_AR', 'ABC Study Abroad'),
(753, 4, 'AdmitCenterOverseas_ADMITCO_USA_AR', 'Admit Center Overseas'),
(754, 4, 'Admitworld_ADMITWO_USA_AR', 'Admitworld'),
(755, 4, 'Aerialoverseas_AERIAL_USA_AR', 'Aerial overseas'),
(756, 4, 'AflyConsultancy_AFLYC_USA_AR', 'Afly Consultancy'),
(757, 4, 'AnilConsultancy_ANILC_USA_AR', 'Anil Consultancy'),
(758, 4, 'AnithaPandey_ANITP_USA_AR', 'Anitha Pandey'),
(759, 4, 'AppleAcademy_APPLEA_USA_AR', 'Apple Academy'),
(760, 4, 'Applyguru_APPLYG_USA_AR', 'Apply guru'),
(761, 4, 'ApplyOverseas_APPLYO_USA_AR', 'Apply Overseas'),
(762, 4, 'Applyglobeadmissions_APPLYGA_USA_AR', 'Applyglobe admissions'),
(763, 4, 'AVsOverseas_AVSO_USA_AR', 'AVs Overseas'),
(764, 4, 'Baanvioverseas_BAANVO_USA_AR', 'Baanvi overseas'),
(765, 4, 'Basicconsultancy_BASICC_USA_AR', 'Basic consultancy'),
(766, 4, 'BeyondOverseas_BEYONDO_USA_AR', 'Beyond Overseas'),
(767, 4, 'BridgeOverseas_BRIDGEO_USA_AR', 'Bridge Overseas'),
(768, 4, 'BrightOverseasChandigarh_BRIGHTOC_USA_AR', 'Bright Overseas(Chandigarh)'),
(769, 4, 'Caliber_CALIBER_USA_AR', 'Caliber'),
(770, 4, 'CareerBridge_CAREERB_USA_AR', 'Career Bridge'),
(771, 4, 'CareerWings_CAREERW_USA_AR', 'Career Wings'),
(772, 4, 'Cloudoverseas_CLOUDO_USA_AR', 'Cloud overseas'),
(773, 4, 'Credovisases_CREDOV_USA_AR', 'Credo visas'),
(774, 4, 'CSOVERSEAS_CSOVER_USA_AR', 'CS OVERSEAS'),
(775, 4, 'Dchos_DCHOS_USA_AR', 'Dchos'),
(776, 4, 'DhanalaxmiOverseas_DHANAO_USA_AR', 'Dhanalaxmi Overseas'),
(777, 4, 'Dwij_DWIJO_USA_AR', 'Dwij'),
(778, 4, 'Edmium_EDMIUM_USA_AR', 'Edmium'),
(779, 4, 'EDOMap_EDOMAP_USA_AR', 'EDO Map'),
(780, 4, 'Edu2Tek_EDUTEK_USA_AR', 'Edu2Tek'),
(781, 4, 'EduconnectOverseas_EDUCONNO_USA_AR', 'Educonnect Overseas'),
(782, 4, 'Elixirconsultancy_ELIXIR_USA_AR', 'Elixir consultancy'),
(783, 4, 'Emergeimigration_EMERGEI_USA_AR', 'Emerge imigration'),
(784, 4, 'EnlightWorldVisas_ENLWVO_USA_AR', 'Enlight World Visas'),
(785, 4, 'EnlightenAbroad_ENLAO_USA_AR', 'Enlighten Abroad'),
(786, 4, 'FalconOverseas_FALCONO_USA_AR', 'Falcon Overseas'),
(787, 4, 'Flyhats_FLYHATO_USA_AR', 'Fly hats'),
(788, 4, 'FlyLearning_FLYLO_USA_AR', 'Fly Learning'),
(789, 4, 'Fly2overseas_FLYOVER_USA_AR', 'Fly2overseas'),
(790, 4, 'Flyingbeeglobal_FLYBEEG_USA_AR', 'Flying bee global'),
(791, 4, 'Formulahub_FORMLO_USA_AR', 'Formulahub'),
(792, 4, 'GlobalNavigator_GLONAVO_USA_AR', 'Global Navigator'),
(793, 4, 'GlobalSixSigma_GLOSIXO_USA_AR', 'Global Six Sigma'),
(794, 4, 'GlobalVisionOverseas_GLOVIO_USA_AR', 'Global Vision Overseas'),
(795, 4, 'Govardhan_GOVARO_USA_AR', 'Govardhan'),
(796, 4, 'GowayAbroad_GOWAYO_USA_AR', 'Goway Abroad'),
(797, 4, 'Gowiseconsultancy_GOWISEO_USA_AR', 'Gowise consultancy'),
(798, 4, 'GradEdOverseas_GRADEO_USA_AR', 'Grad Ed Overseas'),
(799, 4, 'Gummadi_GUMMAO_USA_AR', 'Gummadi'),
(800, 4, 'I20Abroad_IABROO_USA_AR', 'I20 Abroad'),
(801, 4, 'I20ServicesOverseas_ISERVO_USA_AR', 'I20 Services Overseas'),
(802, 4, 'Immenseconsultancy_IMMCON_USA_AR', 'Immense consultancy'),
(803, 4, 'InspireServices_INSSERO_USA_AR', 'Inspire Services'),
(804, 4, 'IyraConsultancy_IYRACO_USA_AR', 'Iyra Consultancy'),
(805, 4, 'Jaspire_JASPIREO_USA_AR', 'Jaspire'),
(806, 4, 'Kaurimmigration_KAURIO_USA_AR', 'Kaur immigration'),
(807, 4, 'Kiyaan_KIYAANO_USA_AR', 'Kiyaan'),
(808, 4, 'KPOverseas_KPOVERS_USA_AR', 'KP Overseas'),
(809, 4, 'KPsolutions_KPSOLO_USA_AR', 'KP solutions'),
(810, 4, 'KSP_KSPOVER_USA_AR', 'KSP'),
(811, 4, 'KVNOverseas_KVNOVER_USA_AR', 'KVN Overseas'),
(812, 4, 'Mappingoverseas_MAPPOVER_USA_AR', 'Mapping overseas'),
(813, 4, 'MarghOverseas_MARGHO_USA_AR', 'Margh Overseas'),
(814, 4, 'MouliOverseas_MOURLIO_USA_AR', 'Mouli Overseas'),
(815, 4, 'MRGlobal_MRGLOBO_USA_AR', 'MR Global'),
(816, 4, 'Mudassir_MUDASS_USA_AR', 'Mudassir'),
(817, 4, 'Navigator_NAVIGO_USA_AR', 'Navigator'),
(818, 4, 'NexGlobal_NEXGLOBO_USA_AR', 'Nex Global'),
(819, 4, 'NexRise_NEXRISEO_USA_AR', 'Nex Rise'),
(820, 4, 'NextPlan_NEXTPLANO_USA_AR', 'Next Plan'),
(821, 4, 'OneStep_ONESTO_USA_AR', 'One Step'),
(822, 4, 'OptionOverseas_OPTIONO_USA_AR', 'Option Overseas'),
(823, 4, 'OrangewayConsultancy_ORANGEO_USA_AR', 'Orangeway Consultancy'),
(824, 4, 'ABCStudyAbroad_ABCSA_UK_AR', 'ABC Study Abroad'),
(825, 4, 'AdmitCenterOverseas_ADMITCO_UK_AR', 'Admit Center Overseas'),
(826, 4, 'Admitworld_ADMITWO_UK_AR', 'Admitworld'),
(827, 4, 'Aerialoverseas_AERIAL_UK_AR', 'Aerial overseas'),
(828, 4, 'AflyConsultancy_AFLYC_UK_AR', 'Afly Consultancy'),
(829, 4, 'AnilConsultancy_ANILC_UK_AR', 'Anil Consultancy'),
(830, 4, 'AnithaPandey_ANITP_UK_AR', 'Anitha Pandey'),
(831, 4, 'AppleAcademy_APPLEA_UK_AR', 'Apple Academy'),
(832, 4, 'Applyguru_APPLYG_UK_AR', 'Apply guru'),
(833, 4, 'ApplyOverseas_APPLYO_UK_AR', 'Apply Overseas'),
(834, 4, 'Applyglobeadmissions_APPLYGA_UK_AR', 'Applyglobe admissions'),
(835, 4, 'AVsOverseas_AVSO_UK_AR', 'AVs Overseas'),
(836, 4, 'Baanvioverseas_BAANVO_UK_AR', 'Baanvi overseas'),
(837, 4, 'Basicconsultancy_BASICC_UK_AR', 'Basic consultancy'),
(838, 4, 'BeyondOverseas_BEYONDO_UK_AR', 'Beyond Overseas'),
(839, 4, 'BridgeOverseas_BRIDGEO_UK_AR', 'Bridge Overseas'),
(840, 4, 'BrightOverseasChandigarh_BRIGHTOC_UK_AR', 'Bright Overseas(Chandigarh)'),
(841, 4, 'Caliber_CALIBER_UK_AR', 'Caliber'),
(842, 4, 'CareerBridge_CAREERB_UK_AR', 'Career Bridge'),
(843, 4, 'CareerWings_CAREERW_UK_AR', 'Career Wings'),
(844, 4, 'Cloudoverseas_CLOUDO_UK_AR', 'Cloud overseas'),
(845, 4, 'Credovisases_CREDOV_UK_AR', 'Credo visas'),
(846, 4, 'CSOVERSEAS_CSOVER_UK_AR', 'CS OVERSEAS'),
(847, 4, 'Dchos_DCHOS_UK_AR', 'Dchos'),
(848, 4, 'DhanalaxmiOverseas_DHANAO_UK_AR', 'Dhanalaxmi Overseas'),
(849, 4, 'Dwij_DWIJO_UK_AR', 'Dwij'),
(850, 4, 'Edmium_EDMIUM_UK_AR', 'Edmium'),
(851, 4, 'EDOMap_EDOMAP_UK_AR', 'EDO Map'),
(852, 4, 'Edu2Tek_EDUTEK_UK_AR', 'Edu2Tek'),
(853, 4, 'EduconnectOverseas_EDUCONNO_UK_AR', 'Educonnect Overseas'),
(854, 4, 'Elixirconsultancy_ELIXIR_UK_AR', 'Elixir consultancy'),
(855, 4, 'Emergeimigration_EMERGEI_UK_AR', 'Emerge imigration'),
(856, 4, 'EnlightWorldVisas_ENLWVO_UK_AR', 'Enlight World Visas'),
(857, 4, 'EnlightenAbroad_ENLAO_UK_AR', 'Enlighten Abroad'),
(858, 4, 'FalconOverseas_FALCONO_UK_AR', 'Falcon Overseas'),
(859, 4, 'Flyhats_FLYHATO_UK_AR', 'Fly hats'),
(860, 4, 'FlyLearning_FLYLO_UK_AR', 'Fly Learning'),
(861, 4, 'Fly2overseas_FLYOVER_UK_AR', 'Fly2overseas'),
(862, 4, 'Flyingbeeglobal_FLYBEEG_UK_AR', 'Flying bee global'),
(863, 4, 'Formulahub_FORMLO_UK_AR', 'Formulahub'),
(864, 4, 'GlobalNavigator_GLONAVO_UK_AR', 'Global Navigator'),
(865, 4, 'GlobalSixSigma_GLOSIXO_UK_AR', 'Global Six Sigma'),
(866, 4, 'GlobalVisionOverseas_GLOVIO_UK_AR', 'Global Vision Overseas'),
(867, 4, 'Govardhan_GOVARO_UK_AR', 'Govardhan'),
(868, 4, 'GowayAbroad_GOWAYO_UK_AR', 'Goway Abroad'),
(869, 4, 'Gowiseconsultancy_GOWISEO_UK_AR', 'Gowise consultancy'),
(870, 4, 'GradEdOverseas_GRADEO_UK_AR', 'Grad Ed Overseas'),
(871, 4, 'Gummadi_GUMMAO_UK_AR', 'Gummadi'),
(872, 4, 'I20Abroad_IABROO_UK_AR', 'I20 Abroad'),
(873, 4, 'I20ServicesOverseas_ISERVO_UK_AR', 'I20 Services Overseas'),
(874, 4, 'Immenseconsultancy_IMMCON_UK_AR', 'Immense consultancy'),
(875, 4, 'InspireServices_INSSERO_UK_AR', 'Inspire Services'),
(876, 4, 'IyraConsultancy_IYRACO_UK_AR', 'Iyra Consultancy'),
(877, 4, 'Jaspire_JASPIREO_UK_AR', 'Jaspire'),
(878, 4, 'Kaurimmigration_KAURIO_UK_AR', 'Kaur immigration'),
(879, 4, 'Kiyaan_KIYAANO_UK_AR', 'Kiyaan'),
(880, 4, 'KPOverseas_KPOVERS_UK_AR', 'KP Overseas'),
(881, 4, 'KPsolutions_KPSOLO_UK_AR', 'KP solutions'),
(882, 4, 'KSP_KSPOVER_UK_AR', 'KSP'),
(883, 4, 'KVNOverseas_KVNOVER_UK_AR', 'KVN Overseas'),
(884, 4, 'Mappingoverseas_MAPPOVER_UK_AR', 'Mapping overseas'),
(885, 4, 'MarghOverseas_MARGHO_UK_AR', 'Margh Overseas'),
(886, 4, 'MouliOverseas_MOURLIO_UK_AR', 'Mouli Overseas'),
(887, 4, 'MRGlobal_MRGLOBO_UK_AR', 'MR Global'),
(888, 4, 'Mudassir_MUDASS_UK_AR', 'Mudassir'),
(889, 4, 'Navigator_NAVIGO_UK_AR', 'Navigator'),
(890, 4, 'NexGlobal_NEXGLOBO_UK_AR', 'Nex Global'),
(891, 4, 'NexRise_NEXRISEO_UK_AR', 'Nex Rise'),
(892, 4, 'NextPlan_NEXTPLANO_UK_AR', 'Next Plan'),
(893, 4, 'OneStep_ONESTO_UK_AR', 'One Step'),
(894, 4, 'OptionOverseas_OPTIONO_UK_AR', 'Option Overseas'),
(895, 4, 'OrangewayConsultancy_ORANGEO_UK_AR', 'Orangeway Consultancy'),
(896, 4, 'ABCStudyAbroad_ABCSA_GER_AR', 'ABC Study Abroad'),
(897, 4, 'AdmitCenterOverseas_ADMITCO_GER_AR', 'Admit Center Overseas'),
(898, 4, 'Admitworld_ADMITWO_GER_AR', 'Admitworld'),
(899, 4, 'Aerialoverseas_AERIAL_GER_AR', 'Aerial overseas'),
(900, 4, 'AflyConsultancy_AFLYC_GER_AR', 'Afly Consultancy'),
(901, 4, 'AnilConsultancy_ANILC_GER_AR', 'Anil Consultancy'),
(902, 4, 'AnithaPandey_ANITP_GER_AR', 'Anitha Pandey'),
(903, 4, 'AppleAcademy_APPLEA_GER_AR', 'Apple Academy'),
(904, 4, 'Applyguru_APPLYG_GER_AR', 'Apply guru'),
(905, 4, 'ApplyOverseas_APPLYO_GER_AR', 'Apply Overseas'),
(906, 4, 'Applyglobeadmissions_APPLYGA_GER_AR', 'Applyglobe admissions'),
(907, 4, 'AVsOverseas_AVSO_GER_AR', 'AVs Overseas'),
(908, 4, 'Baanvioverseas_BAANVO_GER_AR', 'Baanvi overseas'),
(909, 4, 'Basicconsultancy_BASICC_GER_AR', 'Basic consultancy'),
(910, 4, 'BeyondOverseas_BEYONDO_GER_AR', 'Beyond Overseas'),
(911, 4, 'BridgeOverseas_BRIDGEO_GER_AR', 'Bridge Overseas'),
(912, 4, 'BrightOverseasChandigarh_BRIGHTOC_GER_AR', 'Bright Overseas(Chandigarh)'),
(913, 4, 'Caliber_CALIBER_GER_AR', 'Caliber'),
(914, 4, 'CareerBridge_CAREERB_GER_AR', 'Career Bridge'),
(915, 4, 'CareerWings_CAREERW_GER_AR', 'Career Wings'),
(916, 4, 'Cloudoverseas_CLOUDO_GER_AR', 'Cloud overseas'),
(917, 4, 'Credovisases_CREDOV_GER_AR', 'Credo visas'),
(918, 4, 'CSOVERSEAS_CSOVER_GER_AR', 'CS OVERSEAS'),
(919, 4, 'Dchos_DCHOS_GER_AR', 'Dchos'),
(920, 4, 'DhanalaxmiOverseas_DHANAO_GER_AR', 'Dhanalaxmi Overseas'),
(921, 4, 'Dwij_DWIJO_GER_AR', 'Dwij'),
(922, 4, 'Edmium_EDMIUM_GER_AR', 'Edmium'),
(923, 4, 'EDOMap_EDOMAP_GER_AR', 'EDO Map'),
(924, 4, 'Edu2Tek_EDUTEK_GER_AR', 'Edu2Tek'),
(925, 4, 'EduconnectOverseas_EDUCONNO_GER_AR', 'Educonnect Overseas'),
(926, 4, 'Elixirconsultancy_ELIXIR_GER_AR', 'Elixir consultancy'),
(927, 4, 'Emergeimigration_EMERGEI_GER_AR', 'Emerge imigration'),
(928, 4, 'EnlightWorldVisas_ENLWVO_GER_AR', 'Enlight World Visas'),
(929, 4, 'EnlightenAbroad_ENLAO_GER_AR', 'Enlighten Abroad'),
(930, 4, 'FalconOverseas_FALCONO_GER_AR', 'Falcon Overseas'),
(931, 4, 'Flyhats_FLYHATO_GER_AR', 'Fly hats'),
(932, 4, 'FlyLearning_FLYLO_GER_AR', 'Fly Learning'),
(933, 4, 'Fly2overseas_FLYOVER_GER_AR', 'Fly2overseas'),
(934, 4, 'Flyingbeeglobal_FLYBEEG_GER_AR', 'Flying bee global'),
(935, 4, 'Formulahub_FORMLO_GER_AR', 'Formulahub'),
(936, 4, 'GlobalNavigator_GLONAVO_GER_AR', 'Global Navigator'),
(937, 4, 'GlobalSixSigma_GLOSIXO_GER_AR', 'Global Six Sigma'),
(938, 4, 'GlobalVisionOverseas_GLOVIO_GER_AR', 'Global Vision Overseas'),
(939, 4, 'Govardhan_GOVARO_GER_AR', 'Govardhan'),
(940, 4, 'GowayAbroad_GOWAYO_GER_AR', 'Goway Abroad'),
(941, 4, 'Gowiseconsultancy_GOWISEO_GER_AR', 'Gowise consultancy'),
(942, 4, 'GradEdOverseas_GRADEO_GER_AR', 'Grad Ed Overseas'),
(943, 4, 'Gummadi_GUMMAO_GER_AR', 'Gummadi'),
(944, 4, 'I20Abroad_IABROO_GER_AR', 'I20 Abroad'),
(945, 4, 'I20ServicesOverseas_ISERVO_GER_AR', 'I20 Services Overseas'),
(946, 4, 'Immenseconsultancy_IMMCON_GER_AR', 'Immense consultancy'),
(947, 4, 'InspireServices_INSSERO_GER_AR', 'Inspire Services'),
(948, 4, 'IyraConsultancy_IYRACO_GER_AR', 'Iyra Consultancy'),
(949, 4, 'Jaspire_JASPIREO_GER_AR', 'Jaspire'),
(950, 4, 'Kaurimmigration_KAURIO_GER_AR', 'Kaur immigration'),
(951, 4, 'Kiyaan_KIYAANO_GER_AR', 'Kiyaan'),
(952, 4, 'KPOverseas_KPOVERS_GER_AR', 'KP Overseas'),
(953, 4, 'KPsolutions_KPSOLO_GER_AR', 'KP solutions'),
(954, 4, 'KSP_KSPOVER_GER_AR', 'KSP'),
(955, 4, 'KVNOverseas_KVNOVER_GER_AR', 'KVN Overseas'),
(956, 4, 'Mappingoverseas_MAPPOVER_GER_AR', 'Mapping overseas'),
(957, 4, 'MarghOverseas_MARGHO_GER_AR', 'Margh Overseas'),
(958, 4, 'MouliOverseas_MOURLIO_GER_AR', 'Mouli Overseas'),
(959, 4, 'MRGlobal_MRGLOBO_GER_AR', 'MR Global'),
(960, 4, 'Mudassir_MUDASS_GER_AR', 'Mudassir'),
(961, 4, 'Navigator_NAVIGO_GER_AR', 'Navigator'),
(962, 4, 'NexGlobal_NEXGLOBO_GER_AR', 'Nex Global'),
(963, 4, 'NexRise_NEXRISEO_GER_AR', 'Nex Rise'),
(964, 4, 'NextPlan_NEXTPLANO_GER_AR', 'Next Plan'),
(965, 4, 'OneStep_ONESTO_GER_AR', 'One Step'),
(966, 4, 'OptionOverseas_OPTIONO_GER_AR', 'Option Overseas'),
(967, 4, 'OrangewayConsultancy_ORANGEO_GER_AR', 'Orangeway Consultancy'),
(968, 5, 'EducationWays_PR', 'Education Ways'),
(969, 5, 'SwamyConsultancy_PR', 'Swamy Consultancy'),
(970, 5, 'VisaMasters_PR', 'Visa Masters'),
(971, 5, 'VaishnavOverseas_PR', 'Vaishnav overseas'),
(972, 4, 'VaishnavOverseas_USA_AR', 'Vaishnav overseas'),
(973, 4, 'VisaMasters_USA_AR', 'Visa Masters'),
(974, 4, 'SwamyConsultancy_USA_AR', 'Swamy Consultancy'),
(975, 4, 'EducationWays_USA_AR', 'Education Ways'),
(976, 3, 'EducationWays_USA_SR', 'Education Ways'),
(977, 3, 'SwamyConsultancy_USA_SR', 'Swamy Consultancy'),
(978, 3, 'VisaMasters_USA_SR', 'Visa Masters'),
(979, 3, 'VaishnavOverseas_USA_SR', 'Vaishnav overseas'),
(980, 5, 'CarrerConsultant_PR', 'carrer consultant'),
(981, 5, 'VisaTree_PR', 'visa tree'),
(982, 5, 'GlobalTrek_PR', 'global trek'),
(983, 5, 'VidhyaNvidesh_PR', 'Vidhya videsh'),
(984, 5, 'StrategyOverseas_PR', 'Strategy Overseas'),
(985, 3, 'StrategyOverseas_SR', 'Strategy Overseas'),
(986, 3, 'VidhyaNvidesh_SR', 'Vidhya videsh'),
(987, 3, 'GlobalTrek_SR', 'global trek'),
(988, 3, 'VisaTree_SR', 'visa tree'),
(989, 3, 'CarrerConsultant_SR', 'carrer consultant'),
(990, 4, 'CarrerConsultant_AR', 'carrer consultant'),
(991, 4, 'VisaTree_AR', 'visa tree'),
(992, 4, 'GlobalTrek_AR', 'global trek'),
(993, 4, 'VidhyaNvidesh_AR', 'Vidhya videsh'),
(994, 4, 'StrategyOverseas_AR', 'Strategy Overseas'),
(1006, 1, 'HR_MANAGER_JR', 'MANAGER'),
(1007, 4, 'HR_MANAGER_AR', 'Aproval ROLE'),
(1008, 1, 'leave_request_role', 'Leave request'),
(1009, 5, 'Kwik_Overseas_PR', 'Kwik Overseas'),
(1010, 3, 'Kwik_Overseas_USA_SR', 'kwik overseas usa security role'),
(1011, 1, 'Kwik_Overseas_USA_AR', 'Kwik Overseas USA Approval role'),
(1012, 5, 'UAT_TESTING_PR', 'FOR TESTING'),
(1013, 5, 'UAT_TESTING2_PR', 'TESTING2'),
(1015, 5, 'test main 123', 'test main 123');

-- --------------------------------------------------------

--
-- Table structure for table `SuperRoleTypes`
--

CREATE TABLE `SuperRoleTypes` (
  `roleTypeId` int(11) NOT NULL,
  `roleTypeName` varchar(100) NOT NULL,
  `roleTypeDescription` text DEFAULT NULL,
  `updatedDate` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `SuperRoleTypes`
--

INSERT INTO `SuperRoleTypes` (`roleTypeId`, `roleTypeName`, `roleTypeDescription`, `updatedDate`) VALUES
(1, 'Job Role', 'A role associated with job functions', '2024-12-14 11:11:13'),
(2, 'Default Role', 'A default role assigned to new users', '2024-12-14 11:11:13'),
(3, 'Security Role', 'A role for managing security permissions', '2024-12-14 11:11:13'),
(4, 'Approval Role', 'A role for handling approvals in workflows', '2024-12-14 11:11:13'),
(5, 'Property Role', 'A role for managing properties or assets', '2024-12-14 11:11:13');

-- --------------------------------------------------------

--
-- Table structure for table `SuperUserRoles`
--

CREATE TABLE `SuperUserRoles` (
  `superUserRoleId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `userRoleNameId` int(11) NOT NULL,
  `updatedDate` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `SuperUserRoles`
--

INSERT INTO `SuperUserRoles` (`superUserRoleId`, `userId`, `userRoleNameId`, `updatedDate`) VALUES
(12, 312, 1, '2024-12-21 13:52:12'),
(13, 312, 2, '2024-12-21 13:52:12'),
(15, 313, 1, '2024-12-21 14:02:59'),
(16, 313, 2, '2024-12-21 14:02:59'),
(18, 313, 11, '2024-12-21 14:03:20'),
(23, 313, 13, '2024-12-21 14:03:54'),
(25, 313, 24, '2024-12-21 14:29:02'),
(26, 313, 25, '2024-12-21 14:29:02'),
(27, 313, 18, '2024-12-21 14:29:02'),
(28, 313, 19, '2024-12-21 14:29:02'),
(29, 313, 12, '2024-12-21 14:29:02'),
(30, 314, 11, '2024-12-21 14:03:20'),
(31, 314, 13, '2024-12-21 14:03:54'),
(32, 314, 24, '2024-12-21 14:29:02'),
(33, 314, 25, '2024-12-21 14:29:02'),
(34, 314, 18, '2024-12-21 14:29:02'),
(35, 314, 19, '2024-12-21 14:29:02'),
(36, 314, 12, '2024-12-21 14:29:02'),
(38, 314, 2, '2024-12-21 14:32:36'),
(40, 314, 1, '2024-12-21 14:33:47'),
(58, 314, 3, '2024-12-31 15:10:30'),
(60, 314, 16, '2025-01-13 15:27:05'),
(61, 314, 22, '2025-01-13 15:27:17'),
(63, 313, 16, '2025-01-13 15:29:14'),
(64, 313, 22, '2025-01-13 15:29:14'),
(65, 313, 3, '2025-01-13 15:30:19'),
(66, 313, 4, '2025-01-13 15:30:19'),
(67, 314, 23, '2025-01-13 15:30:52'),
(70, 315, 1, '2025-01-13 15:38:25'),
(71, 315, 3, '2025-01-13 15:38:25'),
(72, 315, 5, '2025-01-13 15:38:25'),
(79, 326, 1, '2025-01-13 15:46:12'),
(80, 327, 1, '2025-01-13 15:48:33'),
(81, 327, 4, '2025-01-13 15:48:53'),
(82, 327, 6, '2025-01-13 15:48:53'),
(84, 328, 1, '2025-01-13 15:49:41'),
(87, 329, 4, '2025-01-13 15:52:16'),
(88, 329, 3, '2025-01-13 15:52:16'),
(89, 329, 20, '2025-01-13 15:52:16'),
(90, 329, 21, '2025-01-13 15:52:16'),
(91, 329, 22, '2025-01-13 15:52:16'),
(92, 329, 23, '2025-01-13 15:52:16'),
(95, 331, 3, '2025-01-13 15:56:08'),
(96, 331, 4, '2025-01-13 15:56:08'),
(97, 331, 22, '2025-01-13 15:56:08'),
(98, 331, 23, '2025-01-13 15:56:08'),
(99, 333, 2, '2025-01-13 16:03:08'),
(100, 333, 14, '2025-01-13 16:03:46'),
(101, 333, 15, '2025-01-13 16:03:46'),
(102, 333, 16, '2025-01-13 16:03:46'),
(103, 333, 17, '2025-01-13 16:03:46'),
(104, 333, 3, '2025-01-13 16:03:46'),
(105, 333, 4, '2025-01-13 16:03:46'),
(106, 334, 2, '2025-01-13 16:04:32'),
(107, 334, 3, '2025-01-13 16:05:05'),
(108, 334, 4, '2025-01-13 16:05:05'),
(109, 334, 17, '2025-01-13 16:05:05'),
(110, 334, 16, '2025-01-13 16:05:05'),
(111, 335, 2, '2025-01-13 16:05:49'),
(112, 335, 3, '2025-01-13 16:06:18'),
(113, 335, 4, '2025-01-13 16:06:18'),
(114, 335, 14, '2025-01-13 16:06:18'),
(115, 335, 15, '2025-01-13 16:06:18'),
(116, 335, 16, '2025-01-13 16:06:18'),
(117, 335, 17, '2025-01-13 16:06:18'),
(118, 336, 1, '2025-01-13 16:12:41'),
(120, 336, 27, '2025-01-13 11:45:35'),
(121, 337, 1, '2025-01-15 10:01:19'),
(122, 338, 1, '2025-01-15 10:18:42'),
(123, 339, 1, '2025-01-15 11:17:39'),
(124, 340, 1, '2025-01-15 11:54:30'),
(125, 341, 1, '2025-01-16 05:36:58'),
(126, 342, 1, '2025-01-16 06:46:47'),
(128, 344, 1, '2025-01-21 10:27:22'),
(129, 345, 1, '2025-01-30 12:16:12'),
(130, 346, 1, '2025-01-31 05:48:09'),
(131, 347, 1, '2025-01-31 06:30:37'),
(132, 348, 1, '2025-01-31 07:20:17'),
(133, 349, 1, '2025-01-31 09:58:19'),
(134, 350, 1, '2025-02-01 05:08:40'),
(135, 326, 28, '2025-02-01 14:32:14'),
(136, 326, 29, '2025-02-01 14:32:14'),
(137, 326, 30, '2025-02-01 14:32:14'),
(138, 351, 1, '2025-02-01 10:44:01'),
(139, 352, 1, '2025-02-08 05:49:33'),
(140, 353, 1, '2025-02-10 07:45:51'),
(141, 338, 26, '2025-02-11 08:20:40'),
(142, 338, 27, '2025-02-11 08:20:40'),
(146, 354, 66, '2025-03-03 11:30:01'),
(148, 354, 354, '2025-03-03 11:30:01'),
(149, 354, 570, '2025-03-03 11:30:01'),
(150, 354, 786, '2025-03-03 11:30:01'),
(151, 355, 1, '2025-03-04 07:44:12'),
(152, 314, 4, '2025-03-07 05:50:01'),
(153, 314, 28, '2025-03-07 05:50:01'),
(155, 354, 93, '2025-03-08 06:15:42'),
(156, 354, 381, '2025-03-08 06:15:42'),
(157, 354, 453, '2025-03-08 06:15:42'),
(158, 354, 525, '2025-03-08 06:15:42'),
(159, 354, 597, '2025-03-08 06:15:42'),
(160, 354, 669, '2025-03-08 06:15:42'),
(161, 354, 741, '2025-03-08 06:15:42'),
(162, 354, 813, '2025-03-08 06:15:42'),
(163, 354, 885, '2025-03-08 06:15:42'),
(164, 354, 957, '2025-03-08 06:15:42'),
(165, 354, 60, '2025-03-08 06:15:42'),
(166, 354, 348, '2025-03-08 06:15:42'),
(167, 354, 420, '2025-03-08 06:15:42'),
(168, 354, 492, '2025-03-08 06:15:42'),
(169, 354, 564, '2025-03-08 06:15:42'),
(170, 354, 636, '2025-03-08 06:15:42'),
(171, 354, 708, '2025-03-08 06:15:42'),
(172, 354, 780, '2025-03-08 06:15:42'),
(173, 354, 852, '2025-03-08 06:15:42'),
(174, 354, 924, '2025-03-08 06:15:42'),
(175, 354, 83, '2025-03-08 06:15:42'),
(176, 354, 371, '2025-03-08 06:15:42'),
(177, 354, 443, '2025-03-08 06:15:42'),
(178, 354, 515, '2025-03-08 06:15:42'),
(179, 354, 587, '2025-03-08 06:15:42'),
(180, 354, 659, '2025-03-08 06:15:42'),
(181, 354, 731, '2025-03-08 06:15:42'),
(182, 354, 803, '2025-03-08 06:15:42'),
(183, 354, 875, '2025-03-08 06:15:42'),
(184, 354, 947, '2025-03-08 06:15:42'),
(185, 354, 85, '2025-03-08 06:15:42'),
(186, 354, 373, '2025-03-08 06:15:42'),
(187, 354, 445, '2025-03-08 06:15:42'),
(188, 354, 517, '2025-03-08 06:15:42'),
(189, 354, 589, '2025-03-08 06:15:42'),
(190, 354, 661, '2025-03-08 06:15:42'),
(191, 354, 733, '2025-03-08 06:15:42'),
(192, 354, 805, '2025-03-08 06:15:42'),
(193, 354, 877, '2025-03-08 06:15:42'),
(194, 354, 949, '2025-03-08 06:15:42'),
(195, 354, 3, '2025-03-08 06:15:42'),
(196, 354, 4, '2025-03-08 06:15:42'),
(197, 356, 66, '2025-03-08 10:10:28'),
(198, 358, 66, '2025-03-10 12:56:01'),
(199, 359, 66, '2025-03-10 13:06:44'),
(200, 360, 66, '2025-03-11 04:08:32'),
(201, 362, 66, '2025-03-11 04:14:01'),
(202, 363, 66, '2025-03-11 04:21:45'),
(203, 364, 66, '2025-03-11 04:59:55'),
(204, 365, 93, '2025-03-11 05:01:48'),
(205, 366, 60, '2025-03-12 05:02:26'),
(206, 367, 66, '2025-03-19 05:35:48'),
(207, 343, 3, '2025-03-21 04:50:19'),
(208, 343, 4, '2025-03-21 04:50:19'),
(211, 343, 22, '2025-03-21 04:50:53'),
(213, 343, 23, '2025-03-21 04:50:53'),
(220, 374, 66, '2025-03-28 06:29:23'),
(229, 383, 1, '2025-04-04 11:17:48'),
(237, 392, 1, '2025-04-07 05:20:26'),
(240, 395, 1, '2025-04-08 04:46:31'),
(241, 396, 1, '2025-04-08 05:46:58'),
(242, 397, 1, '2025-04-08 05:58:43'),
(243, 399, 1, '2025-04-08 06:26:31'),
(244, 400, 1, '2025-04-08 06:46:38'),
(245, 401, 1, '2025-04-08 06:51:15'),
(246, 402, 1, '2025-04-08 06:56:17'),
(247, 403, 1, '2025-04-08 06:58:10'),
(248, 404, 1, '2025-04-08 07:05:40'),
(249, 405, 1, '2025-04-08 07:15:56'),
(250, 406, 1, '2025-04-08 09:35:39'),
(251, 409, 1, '2025-04-09 10:48:51'),
(252, 412, 1, '2025-04-09 12:58:47'),
(256, 413, 855, '2025-04-14 06:25:39'),
(257, 413, 639, '2025-04-14 06:25:39'),
(258, 413, 567, '2025-04-14 06:25:39'),
(259, 413, 63, '2025-04-14 06:26:38'),
(260, 413, 783, '2025-04-14 06:26:38'),
(265, 413, 607, '2025-04-14 06:26:38'),
(267, 413, 823, '2025-04-14 06:26:38'),
(274, 413, 103, '2025-04-14 06:26:51'),
(276, 413, 679, '2025-04-14 06:26:51'),
(278, 413, 895, '2025-04-14 06:26:51'),
(279, 413, 3, '2025-04-14 06:26:51'),
(280, 413, 4, '2025-04-14 06:26:51'),
(282, 414, 83, '2025-04-14 06:30:51'),
(283, 414, 587, '2025-04-14 06:30:51'),
(285, 414, 875, '2025-04-14 06:30:51'),
(291, 414, 659, '2025-04-14 06:31:08'),
(292, 414, 4, '2025-04-14 06:31:08'),
(293, 414, 3, '2025-04-14 06:31:08'),
(296, 414, 803, '2025-04-14 06:31:51'),
(301, 414, 80, '2025-04-14 06:31:51'),
(302, 414, 584, '2025-04-14 06:31:51'),
(303, 414, 800, '2025-04-14 06:31:51'),
(304, 414, 872, '2025-04-14 06:31:51'),
(305, 414, 656, '2025-04-14 06:31:51'),
(333, 416, 66, '2025-05-02 05:27:55'),
(334, 418, 83, '2025-05-02 05:55:49'),
(335, 419, 83, '2025-05-02 06:02:37'),
(336, 420, 83, '2025-05-02 06:59:19'),
(337, 421, 83, '2025-05-02 07:31:16'),
(338, 422, 83, '2025-05-02 07:32:25'),
(339, 354, 59, '2025-05-02 08:47:52'),
(340, 354, 779, '2025-05-02 08:47:52'),
(341, 354, 563, '2025-05-02 08:47:52'),
(342, 354, 98, '2025-05-02 08:49:39'),
(343, 354, 818, '2025-05-02 08:49:39'),
(344, 354, 602, '2025-05-02 08:49:39'),
(345, 354, 65, '2025-05-02 08:50:56'),
(346, 354, 785, '2025-05-02 08:50:56'),
(347, 354, 569, '2025-05-02 08:50:56'),
(348, 354, 76, '2025-05-02 08:51:17'),
(349, 354, 580, '2025-05-02 08:51:17'),
(350, 354, 796, '2025-05-02 08:51:17'),
(351, 354, 55, '2025-05-02 09:00:08'),
(352, 354, 775, '2025-05-02 09:00:08'),
(353, 354, 559, '2025-05-02 09:00:08'),
(354, 354, 68, '2025-05-02 09:00:29'),
(355, 354, 572, '2025-05-02 09:00:29'),
(356, 354, 788, '2025-05-02 09:00:29'),
(357, 354, 46, '2025-05-02 09:00:56'),
(358, 354, 550, '2025-05-02 09:00:56'),
(359, 354, 766, '2025-05-02 09:00:56'),
(360, 423, 98, '2025-05-02 09:48:54'),
(362, 414, 70, '2025-05-02 10:01:20'),
(363, 414, 790, '2025-05-02 10:01:21'),
(364, 414, 574, '2025-05-02 10:01:21'),
(365, 414, 85, '2025-05-02 10:02:34'),
(366, 414, 805, '2025-05-02 10:02:34'),
(367, 414, 589, '2025-05-02 10:02:34'),
(368, 414, 81, '2025-05-02 10:02:34'),
(369, 414, 585, '2025-05-02 10:02:34'),
(370, 414, 801, '2025-05-02 10:02:34'),
(371, 414, 84, '2025-05-02 10:03:01'),
(372, 414, 588, '2025-05-02 10:03:01'),
(373, 414, 804, '2025-05-02 10:03:01'),
(374, 414, 52, '2025-05-02 10:03:26'),
(375, 414, 556, '2025-05-02 10:03:26'),
(376, 414, 772, '2025-05-02 10:03:26'),
(377, 414, 77, '2025-05-02 10:04:16'),
(378, 414, 581, '2025-05-02 10:04:16'),
(379, 414, 797, '2025-05-02 10:04:16'),
(380, 414, 50, '2025-05-02 10:05:00'),
(381, 414, 554, '2025-05-02 10:05:00'),
(382, 414, 770, '2025-05-02 10:05:00'),
(383, 424, 1, '2025-05-02 10:32:36'),
(384, 414, 968, '2025-05-02 14:52:44'),
(385, 414, 975, '2025-05-02 14:52:44'),
(386, 414, 969, '2025-05-02 14:53:00'),
(387, 414, 974, '2025-05-02 14:53:00'),
(388, 414, 977, '2025-05-02 14:53:00'),
(389, 414, 976, '2025-05-02 14:53:08'),
(390, 414, 970, '2025-05-02 14:53:20'),
(391, 414, 973, '2025-05-02 14:53:20'),
(392, 414, 978, '2025-05-02 14:53:20'),
(393, 414, 971, '2025-05-02 14:53:29'),
(394, 414, 972, '2025-05-02 14:53:29'),
(395, 414, 979, '2025-05-02 14:53:29'),
(396, 354, 981, '2025-05-03 05:16:37'),
(397, 354, 988, '2025-05-03 05:16:37'),
(398, 354, 991, '2025-05-03 05:16:37'),
(399, 354, 982, '2025-05-03 05:16:55'),
(400, 354, 987, '2025-05-03 05:16:55'),
(401, 354, 992, '2025-05-03 05:16:55'),
(402, 354, 983, '2025-05-03 05:17:05'),
(403, 354, 986, '2025-05-03 05:17:05'),
(404, 354, 993, '2025-05-03 05:17:05'),
(405, 354, 984, '2025-05-03 05:17:14'),
(406, 354, 985, '2025-05-03 05:17:14'),
(407, 354, 994, '2025-05-03 05:17:14'),
(408, 354, 980, '2025-05-03 05:17:28'),
(409, 354, 989, '2025-05-03 05:17:28'),
(410, 354, 990, '2025-05-03 05:17:28'),
(411, 427, 969, '2025-05-03 07:17:37'),
(412, 428, 969, '2025-05-03 07:19:31'),
(413, 429, 969, '2025-05-03 07:22:41'),
(414, 430, 969, '2025-05-03 07:23:46'),
(415, 431, 969, '2025-05-03 07:26:07'),
(416, 432, 969, '2025-05-03 07:30:23'),
(417, 434, 968, '2025-05-03 07:39:58'),
(418, 435, 968, '2025-05-03 07:41:15'),
(419, 436, 968, '2025-05-03 07:47:12'),
(420, 437, 968, '2025-05-03 07:52:54'),
(421, 438, 84, '2025-05-03 09:10:51'),
(422, 439, 81, '2025-05-03 09:13:03'),
(423, 440, 81, '2025-05-03 09:14:23'),
(424, 441, 81, '2025-05-03 09:15:16'),
(425, 442, 968, '2025-05-03 09:23:07'),
(426, 443, 968, '2025-05-03 09:24:42'),
(427, 444, 968, '2025-05-03 09:25:57'),
(428, 445, 968, '2025-05-03 09:27:06'),
(429, 446, 968, '2025-05-03 09:28:49'),
(430, 447, 968, '2025-05-03 09:42:40'),
(431, 448, 968, '2025-05-03 09:47:24'),
(432, 449, 968, '2025-05-03 09:49:57'),
(433, 450, 968, '2025-05-03 09:54:01'),
(436, 451, 968, '2025-05-03 10:04:14'),
(437, 452, 1, '2025-05-09 12:12:32'),
(438, 327, 8, '2025-05-10 04:17:44'),
(439, 314, 1008, '2025-05-10 15:17:34'),
(440, 424, 26, '2025-05-18 12:09:11'),
(441, 424, 27, '2025-05-18 12:09:11'),
(442, 343, 1, '2025-05-26 10:29:53'),
(443, 315, 7, '2025-06-04 22:08:49'),
(444, 314, 1008, '2024-12-21 14:29:02'),
(445, 453, 1, '2025-08-26 14:48:50'),
(446, 457, 1, '2025-09-05 12:33:40');

-- --------------------------------------------------------

--
-- Table structure for table `TaskEntities`
--

CREATE TABLE `TaskEntities` (
  `id` int(11) NOT NULL,
  `taskEntityId` int(11) NOT NULL,
  `taskId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `UsaFinal`
--

CREATE TABLE `UsaFinal` (
  `Id` int(11) NOT NULL,
  `UniversityName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `15yrDegreeAccepted` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PortalOrDirect` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `LevelOfStudy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Duration` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PrivateOrPublic` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Campus` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ApplicationFee` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `I20DepositFee` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Scholarship` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Concentration` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ProgramName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TuitionFeePerSemester` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TuitionFeePerYear` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TuitionFeePerCourse` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Credits` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PerCreditRate` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `GPAoutOf4` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `GREorGMATorSATorACT` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IELTS` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IELTSNBLT` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TOEFL` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TOEFLNBLT` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DUOLINGO` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DuolingoNBLT` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PTE` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PTENBLT` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `BACKLOGS` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MOIAccepted` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `WESRequired` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Intakes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Deadlines` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `InsertName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `userDetails`
--

CREATE TABLE `userDetails` (
  `userDetailsId` int(11) NOT NULL,
  `avatar` longtext DEFAULT NULL,
  `preferences` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `UserDocumentsPermission`
--

CREATE TABLE `UserDocumentsPermission` (
  `userDocumentPermissionId` int(10) NOT NULL,
  `userType` int(10) NOT NULL,
  `documentTypeId` int(10) NOT NULL,
  `submissions` int(10) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `UserFix`
--

CREATE TABLE `UserFix` (
  `userId` int(11) NOT NULL,
  `createdDatetime` datetime DEFAULT NULL,
  `expireDatetime` datetime DEFAULT NULL,
  `urlText` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `UserPermissions`
--

CREATE TABLE `UserPermissions` (
  `Id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `UserPermissions`
--

INSERT INTO `UserPermissions` (`Id`, `name`) VALUES
(1, 'Edit'),
(2, 'Delete'),
(3, 'Create'),
(4, 'View'),
(5, 'Action'),
(6, 'Attachment');

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `userId` int(11) NOT NULL,
  `userName` varchar(255) NOT NULL,
  `userEmail` varchar(255) NOT NULL,
  `userPassword` varchar(255) NOT NULL,
  `userFirstName` varchar(255) NOT NULL,
  `userLastName` varchar(255) NOT NULL,
  `socketId` int(200) NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `UserSettingsTypes`
--

CREATE TABLE `UserSettingsTypes` (
  `Id` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `UserSettingsTypes`
--

INSERT INTO `UserSettingsTypes` (`Id`, `Name`) VALUES
(1, 'SearchSettings'),
(2, 'InternalTagUpdate'),
(3, 'DocumentTagDetails');

-- --------------------------------------------------------

--
-- Table structure for table `UserSubProfileTypes`
--

CREATE TABLE `UserSubProfileTypes` (
  `userSubProfileId` int(11) NOT NULL,
  `subProfileId` int(11) NOT NULL,
  `userId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `UserSubProfileTypes`
--

INSERT INTO `UserSubProfileTypes` (`userSubProfileId`, `subProfileId`, `userId`) VALUES
(37, 1, 409),
(47, 3, 313),
(48, 3, 347),
(49, 2, 315),
(50, 2, 327),
(51, 2, 326),
(52, 2, 328);

-- --------------------------------------------------------

--
-- Table structure for table `UserTypes`
--

CREATE TABLE `UserTypes` (
  `userTypeId` int(10) NOT NULL,
  `userTypeName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `UserTypes`
--

INSERT INTO `UserTypes` (`userTypeId`, `userTypeName`) VALUES
(1, 'Admin'),
(2, 'Default'),
(3, 'Job'),
(4, 'Entity Admin'),
(5, 'Super Admin');

-- --------------------------------------------------------

--
-- Table structure for table `Workflow`
--

CREATE TABLE `Workflow` (
  `WorkflowID` int(11) NOT NULL,
  `WorkflowName` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `WorkflowDocumentTypes`
--

CREATE TABLE `WorkflowDocumentTypes` (
  `workflowDocumentTypeID` int(11) NOT NULL,
  `workflowID` int(11) NOT NULL,
  `DocumentTypeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  ADD KEY `taskId` (`taskId`);

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
-- AUTO_INCREMENT for table `DocumentGroup`
--
ALTER TABLE `DocumentGroup`
  MODIFY `documentGroupId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DocumentGroupType`
--
ALTER TABLE `DocumentGroupType`
  MODIFY `groupTypeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `documentTypeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

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
  MODIFY `roleTypeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `States`
--
ALTER TABLE `States`
  MODIFY `stateId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Structure`
--
ALTER TABLE `Structure`
  MODIFY `entityId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `StructureOptionValues`
--
ALTER TABLE `StructureOptionValues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SubProfileSettings`
--
ALTER TABLE `SubProfileSettings`
  MODIFY `profileSettingsId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `SubProfileTypes`
--
ALTER TABLE `SubProfileTypes`
  MODIFY `subProfileId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Subscriptions`
--
ALTER TABLE `Subscriptions`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SuperDocumentTypeRoles`
--
ALTER TABLE `SuperDocumentTypeRoles`
  MODIFY `documentTypeRoleId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=186;

--
-- AUTO_INCREMENT for table `SuperRoleNames`
--
ALTER TABLE `SuperRoleNames`
  MODIFY `roleNameId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1016;

--
-- AUTO_INCREMENT for table `SuperRoleTypes`
--
ALTER TABLE `SuperRoleTypes`
  MODIFY `roleTypeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `SuperUserRoles`
--
ALTER TABLE `SuperUserRoles`
  MODIFY `superUserRoleId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=447;

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
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UserSettingsTypes`
--
ALTER TABLE `UserSettingsTypes`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `UserSubProfileTypes`
--
ALTER TABLE `UserSubProfileTypes`
  MODIFY `userSubProfileId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `UserTypes`
--
ALTER TABLE `UserTypes`
  MODIFY `userTypeId` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  ADD CONSTRAINT `documenttaganswers_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `Tasks` (`taskId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `DocumentType`
--
ALTER TABLE `DocumentType`
  ADD CONSTRAINT `fk_documentTagObjectId` FOREIGN KEY (`documentTagObjectId`) REFERENCES `DocumentTagObject` (`documentTagObjectId`) ON DELETE CASCADE ON UPDATE CASCADE;

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
