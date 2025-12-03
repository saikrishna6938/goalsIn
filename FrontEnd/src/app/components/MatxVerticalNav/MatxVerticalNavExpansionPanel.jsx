import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonBase, Icon, Box, styled } from "@mui/material";
import { Themecolors } from "api/Colors";
import { useLocation } from "react-router-dom";
import clsx from "clsx";

const NavExpandRoot = styled("div")(({ theme }) => ({
  "& .expandIcon": {
    transition: "transform 0.3s cubic-bezier(0, 0, 0.2, 1) 0ms",
    transform: "rotate(90deg)",
  },
  "& .collapseIcon": {
    transition: "transform 0.3s cubic-bezier(0, 0, 0.2, 1) 0ms",
    transform: "rotate(0deg)",
  },
  "& .expansion-panel": {
    overflow: "hidden",
    transition: "max-height 0.3s cubic-bezier(0, 0, 0.2, 1)",
  },
  // Indent submenu items so they appear as children
  "& .submenu": {
    paddingLeft: theme.spacing(1.5),
  },
  "& .submenu a": {
    // additional nudge for nested links
    marginLeft: theme.spacing(0.5),
  },
  "& .highlight": {
    background: Themecolors.S_hover,
  },
  "&.compactNavItem": {
    width: 44,
    overflow: "hidden",
    justifyContent: "center !important",
    "& .itemText": { display: "none" },
    "& .itemIcon": { display: "none" },
  },
}));

const BaseButton = styled(ButtonBase)(({ theme }) => ({
  height: 44,
  width: "100%",
  whiteSpace: "pre",
  overflow: "hidden",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  marginBottom: "8px",
  display: "flex",
  border: "1px solid transparent",
  justifyContent: "space-between !important",
  color: Themecolors.S_text1,
  fontWeight: 500,
  fontSize: "1rem",
  "&:hover": {
    background: Themecolors.S_hover,
    color: Themecolors.S_text1,
    borderColor: Themecolors.S_border,
  },
  "&.open": {
    background: Themecolors.S_active,
    borderColor: Themecolors.S_border,
    color: Themecolors.S_text1,
    fontWeight: 600,
  },
  "& .icon": {
    width: 36,
    fontSize: "21px",
    verticalAlign: "middle",
  },
}));

const BulletIcon = styled("div")(({ theme }) => ({
  width: 4,
  height: 4,
  color: Themecolors.S_text1,
  overflow: "hidden",
  marginLeft: "20px",
  marginRight: "8px",
  borderRadius: "300px !important",
  background: Themecolors.S_border,
}));

const ItemText = styled("span")(() => ({
  fontSize: "0.875rem",
  paddingLeft: "0.8rem",
  verticalAlign: "middle",
  color: Themecolors.S_text1,
}));

const BadgeValue = styled("div")(() => ({
  padding: "1px 4px",
  overflow: "hidden",
  borderRadius: "300px",
}));

const MatxVerticalNavExpansionPanel = ({ item, children, mode }) => {
  const [collapsed, setCollapsed] = useState(true);
  const elementRef = useRef(null);
  const componentHeight = useRef(0);
  const { pathname } = useLocation();
  const { name, icon, iconText, badge } = item;

  const handleClick = () => {
    componentHeight.current = 0;
    calcaulateHeight(elementRef.current);
    setCollapsed(!collapsed);
  };

  const calcaulateHeight = useCallback((node) => {
    if (node.name !== "child") {
      for (let child of node.children) {
        calcaulateHeight(child);
      }
    }

    if (node.name === "child") componentHeight.current += node.scrollHeight;
    else componentHeight.current += 44; //here 44 is node height
    return;
  }, []);

  useEffect(() => {
    if (!elementRef) return;

    calcaulateHeight(elementRef.current);

    // OPEN DROPDOWN IF CHILD IS ACTIVE
    for (let child of elementRef.current.children) {
      if (child.getAttribute("href") === pathname) {
        setCollapsed(false);
      }
    }
  }, [pathname, calcaulateHeight]);

  return (
    <NavExpandRoot>
      <BaseButton
        className={clsx({
          "has-submenu compactNavItem": true,
          compactNavItem: mode === "compact",
          open: !collapsed,
        })}
        onClick={handleClick}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <div
            style={{
              position: "relative",
              left: mode === "compact" ? "-0.7em" : 0,
              marginRight: "2px",
            }}
          >
            {icon && <Icon className="icon">{icon}</Icon>}
          </div>
          {iconText && <BulletIcon />}
          <ItemText className="sidenavHoverShow">{name}</ItemText>
        </Box>

        {badge && (
          <BadgeValue className="sidenavHoverShow itemIcon">
            {badge.value}
          </BadgeValue>
        )}

        <div
          className={clsx({
            sidenavHoverShow: true,
            collapseIcon: collapsed,
            expandIcon: !collapsed,
          })}
        >
          <Icon fontSize="small" sx={{ verticalAlign: "middle" }}>
            chevron_right
          </Icon>
        </div>
      </BaseButton>

      <div
        ref={elementRef}
        className="expansion-panel submenu"
        style={
          collapsed
            ? { maxHeight: "0px" }
            : { maxHeight: componentHeight.current + "px" }
        }
      >
        {children}
      </div>
    </NavExpandRoot>
  );
};

export default MatxVerticalNavExpansionPanel;
