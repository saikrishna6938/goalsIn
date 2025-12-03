import { CssBaseline } from "@mui/material";
import { useRoutes } from "react-router-dom";
import { MatxTheme } from "./components";
import { AuthProvider } from "./contexts/JWTAuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { getRoutes } from "./routes";
import "../fake-db";
import { useLocation } from "react-router-dom";
import { observer } from "mobx-react";
import { api } from "../api/API";
import Loading from "./components/MatxLoading";
import ErrorBoundary from "../api/ErrorBoundary";
import GlobalToast from "app/formComponents/GlobalToast";

const App = observer(() => {
  const location = useLocation();
  const currentPath = location.pathname;
  const routes = getRoutes(currentPath);
  const content = useRoutes(routes);

  const bodyStyle = {
    height: "100vh",
    margin: "auto",
  };

  const webkitStyles = `
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-thumb {
      background-color: #d5d7db;
      border-radius: 6px;
    }

    ::-webkit-scrollbar-track {
      background-color: #f1f1f1;
    }
  `;
  return (
    <SettingsProvider>
      <AuthProvider>
        <MatxTheme>
          <CssBaseline />
          <style>{webkitStyles}</style>
          <div style={bodyStyle}>
            {content} <GlobalToast />
          </div>
        </MatxTheme>
      </AuthProvider>
    </SettingsProvider>
  );
});

export default App;
