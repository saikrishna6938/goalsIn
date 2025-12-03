import React from "react";
import { Tabs, Tab, AppBar, Theme } from "@mui/material";
import styled from "@emotion/styled";
import { HeaderBox } from "app/appComponents/HeaderBox";
import { Themecolors } from "api/Colors";

interface TabBarProps {
  value: number;
  onChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
  tabs: string[];
}
const StyledAppBar = styled(AppBar)({
  height: 50,
  justifyContent: "flex-start",
  alignItems: "center",
});

const StyledTab = styled(Tab)({
  fontSize: "1rem",
  textTransform: "none",
  height: 50,
  margin: "0 12px", // A bit of horizontal margin for spacing.
  color: Themecolors.T_bg2,
  "&.Mui-selected": { color: Themecolors.T_bg1 },
});
const TabBar: React.FC<TabBarProps> = ({ value, onChange, tabs }) => {
  return (
    <HeaderBox style={{ height: "60px", padding: 0 }}>
      <Tabs
        value={value}
        onChange={onChange}
        variant={"scrollable"}
        sx={{
          flex: 1,
          width: "100%",
          "& .MuiTabs-scrollButtons": {
            display: "flex",
            transition: "border 0.3s, background-color 0.3s",
            "&:hover": {
              color: "#ffab40",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            },
            "&.Mui-disabled": {
              color: "#ffab40",

              opacity: 0.5,
              "&:hover": {
                backgroundColor: "transparent",
              },
            },
          },
        }}
      >
        {tabs.map((tabLabel, index) => (
          <StyledTab key={index} label={tabLabel} />
        ))}
      </Tabs>
    </HeaderBox>
  );
};

export default TabBar;
