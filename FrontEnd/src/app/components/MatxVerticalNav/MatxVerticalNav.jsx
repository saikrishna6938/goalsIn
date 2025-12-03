import { Box, ButtonBase, Icon, styled } from "@mui/material";
import { Themecolors } from "api/Colors";
import useSettings from "app/hooks/useSettings";
import React, { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { Paragraph, Span } from "../Typography";
import MatxVerticalNavExpansionPanel from "./MatxVerticalNavExpansionPanel";
import { MatxNavItem } from "./MatxNavItem";
import appStore from "../../mobxStore/AppStore";

const ListLabel = styled(Paragraph)(({ theme, mode }) => ({
  fontSize: "12px",
  marginTop: "20px",
  marginLeft: "15px",
  marginBottom: "10px",
  textTransform: "uppercase",
  display: mode === "compact" && "none",
  color: Themecolors.S_text2,
}));

const ExtAndIntCommon = {
  display: "flex",
  overflow: "hidden",
  borderRadius: "6px",
  height: 44,
  whiteSpace: "pre",
  marginBottom: "8px",
  textDecoration: "none",
  justifyContent: "space-between",
  transition: "all 150ms ease-in",
  color: Themecolors.S_text1,
  fontWeight: 500,
  border: "1px solid transparent",
  "&:hover": {
    background: Themecolors.S_hover,
    color: Themecolors.S_text1,
    borderColor: Themecolors.S_border,
  },
  "&.compactNavItem": {
    overflow: "hidden",
    justifyContent: "center !important",
  },
  "& .icon": {
    fontSize: "18px",
    verticalAlign: "middle",
  },
};
const ExternalLink = styled("a")(() => ({
  ...ExtAndIntCommon,
}));

export const InternalLink = styled(Box)(() => ({
  "& a, & .navStatic": {
    ...ExtAndIntCommon,
    padding: "0.5rem 1rem",
    "&:hover": {
      border: `1px solid ${Themecolors.S_border}`,
    },
  },
  "& .navStatic": {
    cursor: "pointer",
  },
  "& .navItemSelectedActive, & .navItemActive": {
    border: `1px solid ${Themecolors.S_border}`,
    color: Themecolors.S_text1,
    background: Themecolors.S_active,
    "&:hover": {
      border: `1px solid ${Themecolors.S_border}`,
    },
  },
}));

export const StyledText = styled(Span)(({ mode }) => ({
  fontSize: "0.875rem",
  paddingLeft: "0.8rem",
  display: mode === "compact" && "none",
  color: Themecolors.S_text1,
}));

export const BulletIcon = styled("div")(({ theme }) => ({
  padding: "2px",
  marginLeft: "24px",
  marginRight: "8px",
  overflow: "hidden",
  borderRadius: "300px",
  background: Themecolors.S_border,
}));

export const BadgeValue = styled("div")(() => ({
  padding: "1px 8px",
  overflow: "hidden",
  borderRadius: "300px",
}));

const MatxVerticalNav = ({ items }) => {
  const { settings } = useSettings();
  const { mode } = settings.layout1Settings.leftSidebar;

  const [selectedItem, setSelectedItem] = React.useState(null);
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const getNavLinkStyles = (isActive, hasPath) => ({
    color: Themecolors.S_text1,
    background: isActive && hasPath ? Themecolors.S_active : "transparent",
    fontWeight: isActive && hasPath ? 600 : 500,
  });

  const renderLevels = (data) => {
    return data.map((item, index) => {
      if (item.type === "label")
        return (
          <ListLabel
            key={`${item.lable}-${index}`}
            mode={mode}
            className="sidenavHoverShow"
          >
            {item.label}
          </ListLabel>
        );

      if (item.children) {
        return (
          <MatxVerticalNavExpansionPanel
            mode={mode}
            item={item}
            key={`${item.lable}-${index}`}
          >
            {renderLevels(item.children)}
          </MatxVerticalNavExpansionPanel>
        );
      } else if (item.name === "Select Entity") {
        return (
          <MatxNavItem
            item={item}
            onClick={() => {
              appStore.setShowEntityDialog(true);
            }}
            index={index}
            mode={mode}
            key={`${item.lable}-${index}`}
          />
        );
      } else if (item.type === "extLink") {
        return (
          <ExternalLink
            key={`${item.lable}-${index}`}
            href={item.path}
            className={`${mode === "compact" && "compactNavItem"}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ButtonBase key={item.name} name="child" sx={{ width: "100%" }}>
              {(() => {
                if (item.icon) {
                  return <Icon className="icon">{item.icon}</Icon>;
                } else {
                  return (
                    <span className="item-icon icon-text">{item.iconText}</span>
                  );
                }
              })()}
              <StyledText mode={mode} className="sidenavHoverShow">
                {item.name}
              </StyledText>
              <Box mx="auto"></Box>
              {item.badge && <BadgeValue>{item.badge.value}</BadgeValue>}
            </ButtonBase>
          </ExternalLink>
        );
      } else {
        return (
          <InternalLink key={`${item.lable}-${index}`}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive && Boolean(item.path) && item === selectedItem
                  ? `navItemActive navItemSelectedActive ${
                      mode === "compact" ? "compactNavItem" : ""
                    }`
                  : `${mode === "compact" ? "compactNavItem" : ""}`
              }
              onClick={() => handleItemClick(item)}
              style={({ isActive }) =>
                getNavLinkStyles(isActive, Boolean(item.path))
              }
            >
              <ButtonBase key={item.name} name="child" sx={{ width: "100%" }}>
                {item?.icon ? (
                  <Icon className="icon" sx={{ width: 36 }}>
                    {item.icon}
                  </Icon>
                ) : (
                  <Fragment>
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
                  </Fragment>
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
              </ButtonBase>
            </NavLink>
          </InternalLink>
        );
      }
    });
  };

  return <div className="navigation">{renderLevels(items)}</div>;
};

export default React.memo(MatxVerticalNav);
