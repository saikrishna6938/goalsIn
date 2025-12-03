import * as React from "react";
import { Box, ButtonBase, Icon } from "@mui/material";
import { NavLink } from "react-router-dom";
import { Themecolors } from "api/Colors";
import {
  BadgeValue,
  BulletIcon,
  InternalLink,
  StyledText,
} from "./MatxVerticalNav";

export const MatxNavItem = ({ item, onClick, index, mode }) => {
  const hasPath = Boolean(item.path);

  const renderContent = () => (
    <>
      {item?.icon ? (
        <Icon className="icon" sx={{ width: 36 }}>{item.icon}</Icon>
      ) : (
        <React.Fragment>
          <BulletIcon
            className={`nav-bullet`}
            sx={{ display: mode === "compact" && "none" }}
          />
          <Box
            className="nav-bullet-text"
            sx={{
              ml: "20px",
              fontSize: "11px",
              display: mode !== "compact" && "none",
            }}
          >
            {item.iconText}
          </Box>
        </React.Fragment>
      )}
      <StyledText mode={mode} className="sidenavHoverShow">
        {item.name}
      </StyledText>

      <Box mx="auto" />

      {item.badge && (
        <BadgeValue className="sidenavHoverShow">
          {item.badge.value}
        </BadgeValue>
      )}
    </>
  );

  if (!hasPath) {
    return (
      <InternalLink key={index}>
        <ButtonBase
          className={`navStatic ${mode === "compact" ? "compactNavItem" : ""}`}
          onClick={onClick}
          name="child"
          sx={{ width: "100%" }}
        >
          {renderContent()}
        </ButtonBase>
      </InternalLink>
    );
  }

  return (
    <InternalLink key={index}>
      <NavLink
        to={item.path}
        onClick={onClick}
        className={({ isActive }) =>
          hasPath && isActive
            ? `navItemActive ${mode === "compact" ? "compactNavItem" : ""}`
            : `${mode === "compact" ? "compactNavItem" : ""}`
        }
        style={({ isActive }) => ({
          color: Themecolors.S_text1,
          border: hasPath && isActive
            ? `1px solid ${Themecolors.S_border}`
            : "1px solid transparent",
          background: hasPath && isActive ? Themecolors.S_active : "transparent",
          fontWeight: hasPath && isActive ? 600 : 500,
        })}
      >
        <ButtonBase name="child" sx={{ width: "100%" }}>
          {renderContent()}
        </ButtonBase>
      </NavLink>
    </InternalLink>
  );
};
