import React from "react";
import {
  CssBaseline,
  LinearProgress,
  ThemeProvider,
  styled,
} from "@mui/material";
import useSettings from "app/hooks/useSettings";
import { Observer } from "mobx-react";
import appStore from "../../mobxStore/AppStore";

const TopLinearProgress = styled(LinearProgress)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  zIndex: theme.zIndex.appBar + 1,
  "& .MuiLinearProgress-bar": {
    backgroundColor: "#ffa726",
  },
}));

const MatxTheme = ({ children }) => {
  const { settings } = useSettings();
  let activeTheme = { ...settings.themes[settings.activeTheme] };

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Observer>{() => appStore.loading && <TopLinearProgress />}</Observer>
      {children}
    </ThemeProvider>
  );
};

export default MatxTheme;
