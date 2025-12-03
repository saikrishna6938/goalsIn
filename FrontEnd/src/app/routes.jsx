import { lazy } from "react";
import { Navigate, useNavigate, useNavigation } from "react-router-dom";
import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";
import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import materialRoutes from "app/views/material-kit/MaterialRoutes";
import ResetPassword from "./views/sessions/ResetPassword";
import UsersStore from "./user/userManagement/UsersStore";
import MainPageWrapper from "./MainPageWrapper";
import appStore from "./mobxStore/AppStore";
import { EntityProvider } from "./EntityProvider.tsx";
// session pages
const NotFound = Loadable(lazy(() => import("app/views/sessions/NotFound")));
const JwtLogin = Loadable(lazy(() => import("app/views/sessions/JwtLogin")));
const JwtRegister = Loadable(
  lazy(() => import("app/views/sessions/JwtRegister"))
);
const ForgotPassword = Loadable(
  lazy(() => import("app/views/sessions/ForgotPassword"))
);

// echart page
const AppEchart = Loadable(
  lazy(() => import("app/views/charts/echarts/AppEchart"))
);

// dashboard page
//const Analytics = Loadable(lazy(() => import("app/views/dashboard/Analytics")));

const Analytics = Loadable(lazy(() => import("app/user/dashboard/Dashboard")));
//Document Form Page
const DocumentFormPage = Loadable(lazy(() => import("app/user/DocumentForm")));
const TaskPanelPage = Loadable(lazy(() => import("app/user/tasks/TaskPanel")));
const MyTasksPage = Loadable(lazy(() => import("app/user/tasks/TasksPage")));
const UserManagementMain = Loadable(
  lazy(() => import("app/user/userManagement/UserManagementMain"))
);
const DocumentsViewPage = Loadable(
  lazy(() => import("app/user/documents/DocumentsView"))
);
const SomethingWentWrong = Loadable(
  lazy(() => import("api/SomethingWentWrong"))
);
const File = Loadable(lazy(() => import("app/user/file/File.tsx")));
const IndexPage = Loadable(lazy(() => import("app/user/file/IndexPage.tsx")));
const FormManagementMain = Loadable(
  lazy(() => import("app/admin/formManagement/FormManagementMain.tsx"))
);

const DocumentManagementMain = Loadable(
  lazy(() => import("app/admin/documentManagement/DocumentManagementMain.tsx"))
);
const DataTableManagement = Loadable(
  lazy(() => import("./admin/datatablemanagement/DataTableMain.tsx"))
);
const WorkflowManagement = Loadable(
  lazy(() => import("app/admin/workflowManagement/WorkflowManagement.tsx"))
);
const NewsLetters = Loadable(
  lazy(() => import("app/admin/newsletters/NewsLetters.tsx"))
);
const SearchFilter = Loadable(
  lazy(() => import("app/user/search/SearchFilter.tsx"))
);
const ApplicationSearch = Loadable(
  lazy(() => import("app/user/search/ApplicationSearch.tsx"))
);
const TasksSearch = Loadable(
  lazy(() => import("app/user/search/TasksSearch.tsx"))
);
const DashboardControls = Loadable(
  lazy(() => import("./user/controlcentral/DashboardControls.tsx"))
);
const DashboardControl = Loadable(
  lazy(() => import("../app/user/controlcentral/DashboardControl.tsx"))
);
const CreateForms = Loadable(
  lazy(() => import("./user/create/CreateForms.tsx"))
);
const DocReviewForm = Loadable(
  lazy(() => import("../app/user/create/DocReviewForm.tsx"))
);
const Structure = Loadable(
  lazy(() => import("./admin/structures/Structure.tsx"))
);
const Users = Loadable(lazy(() => import("app/user/userManagement/Users")));
const CreateUserRoles = Loadable(
  lazy(() => import("app/user/userManagement/CreateUserRoles"))
);
const RolesType = Loadable(
  lazy(() => import("app/user/userManagement/RolesType"))
);
const UserProfileType = Loadable(
  lazy(() => import("app/user/userManagement/UserProfileType"))
);

// Split the path to extract the ID
export const getRoutes = (path) => {
  if (path == "/**") {
    appStore.setShowEntityDialog(true);
    path = "/";
  }
  const latestTasks = [
    { id: 1, name: "Task 1" },
    { id: 2, name: "Task 2" },
    { id: 3, name: "Task 3" },
    { id: 4, name: "Task 4" },
    { id: 5, name: "Task 5" },
  ];

  const oldestTasks = [
    { id: 96, name: "Task 96" },
    { id: 97, name: "Task 97" },
    { id: 98, name: "Task 98" },
    { id: 99, name: "Task 99" },
    { id: 100, name: "Task 100" },
  ];
  const routes = [
    {
      element: (
        <AuthGuard>
          <EntityProvider>
            <MatxLayout />
          </EntityProvider>
        </AuthGuard>
      ),
      children: [
        ...materialRoutes,
        // dashboard route
        {
          path: "/dashboard/default",
          element: (
            <MainPageWrapper
              children={
                <Analytics
                  latestTasks={latestTasks}
                  oldestTasks={oldestTasks}
                  totalTasks={100}
                />
              }
            />
          ),
          auth: authRoles.admin,
        },
        {
          path: `/user/document/:did`,
          element: <MainPageWrapper children={<DocumentFormPage />} />,
        },
        {
          path: `/user/documents`,
          element: <MainPageWrapper children={<DocumentsViewPage />} />,
        },
        // e-chart rooute
        {
          path: "/charts/echarts",
          element: <MainPageWrapper children={<AppEchart />} />,
          auth: authRoles.editor,
        },
        {
          path: "/user/task/:id",
          element: <MainPageWrapper children={<TaskPanelPage />} />,
        },
        {
          path: "/user/tasks:id",
          element: <MainPageWrapper children={<MyTasksPage />} />,
        },
        {
          path: "/user",
          element: <MainPageWrapper children={<UserManagementMain />} />,
          children: [
            { path: "users", element: <Users /> },
            { path: "user-roles", element: <CreateUserRoles /> },
            { path: "roles-type", element: <RolesType /> },
            { path: "user-profile", element: <UserProfileType /> },
          ],
        },
        {
          path: "/user/files",
          element: <MainPageWrapper children={<File />} />,
        },
        {
          path: "/user/index/:uploadId",
          element: <MainPageWrapper children={<IndexPage />} />,
        },
        {
          path: "/admin/form",
          element: <MainPageWrapper children={<FormManagementMain />} />,
        },
        {
          path: "/admin/document",
          element: <MainPageWrapper children={<DocumentManagementMain />} />,
        },
        {
          path: "/admin/data",
          element: <MainPageWrapper children={<DataTableManagement />} />,
        },
        {
          path: "/admin/workflow",
          element: <MainPageWrapper children={<WorkflowManagement />} />,
        },
        {
          path: "/admin/newsletters",
          element: <MainPageWrapper children={<NewsLetters />} />,
        },
        {
          path: "/user/tasks",
          element: <MainPageWrapper children={<MyTasksPage />} />,
        },
        {
          path: "/Error/SomethingWentWrong",
          element: <MainPageWrapper children={<SomethingWentWrong />} />,
        },
        {
          path: "/user/search",
          element: <MainPageWrapper children={<SearchFilter />} />,
        },
        {
          path: "/user/application-search",
          element: <MainPageWrapper children={<ApplicationSearch />} />,
        },
        {
          path: "/user/tasks-search",
          element: <MainPageWrapper children={<TasksSearch />} />,
        },
        {
          path: "/user/control_central",
          element: <MainPageWrapper children={<DashboardControls />} />,
        },
        {
          path: "/user/dashboard_control/:id",
          element: <MainPageWrapper children={<DashboardControl />} />,
        },
        {
          path: "/admin/create_forms",
          element: <MainPageWrapper children={<CreateForms />} />,
        },
        {
          path: "/user/forms/:id",
          element: <MainPageWrapper children={<DocReviewForm />} />,
        },
        {
          path: "/admin/structures",
          element: <MainPageWrapper children={<Structure />} />,
        },

        Structure,
      ],
    },

    // session pages route
    { path: "/session/404", element: <NotFound /> },
    { path: "/session/signin", element: <JwtLogin /> },
    { path: "/session/signup", element: <JwtRegister /> },
    { path: "/session/forgot-password", element: <ForgotPassword /> },
    { path: "/session/reset-password/:urlText", element: <ResetPassword /> },
    { path: "/", element: <Navigate to="dashboard/default" /> },
    { path: "*", element: <NotFound /> },
  ];
  return routes;
};
