import { generateJWTSecretKey } from "./utils/jwt.utils";

export default {
  database: {
    host: "localhost",
    database: "Main_DB",
    user: "root",
    password: "",
  },
  basePath: "/api/",
  refreshSecret: generateJWTSecretKey(100),
  port: 5200,
  appPath: "http://localhost:3000/",
  panelPath: "http://localhost:3000/",
  dashboardLink: "http://localhost:3000/session/signin",
  contactUsEmail: "info@gradwalk.us",
};

// export default {
//   database: {
//     host: "localhost",
//     database: "admin_gradwalk",
//     user: "admin_database",
//     password: "Passw)rd@6938",
//   },
//   basePath: "/api/",
//   refreshSecret: generateJWTSecretKey(100),
//   port: 5200,
//   appPath: "https://gradwalk.us/",
//   panelPath: "https://panel.gradwalk.us/",
//   dashboardLink: "http://panel.gradwalk.us/session/signin",
//   contactUsEmail: "info@gradwalk.us",
// };

// export default {
//   database: {
//     host: "localhost",
//     database: "jotbox",
//     user: "root",
//     password: "Mrunalini@6938",
//   },
//   basePath: "/api/",
//   refreshSecret: generateJWTSecretKey(100),
//   port: 5200,
//   appPath: "http://localhost:3000/",
//   panelPath: "http://localhost:3000/",
//   dashboardLink: "http://localhost:3000/session/signin",
//   contactUsEmail: "info@gradwalk.us",
// };
