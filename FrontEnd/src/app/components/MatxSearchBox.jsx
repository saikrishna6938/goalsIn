import { useState, Fragment } from "react";
import {
  Icon,
  IconButton,
  styled,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import {
  topBarHeight,
  sideNavWidth,
  sidenavCompactWidth,
} from "app/utils/constant";
import useSettings from "app/hooks/useSettings";
import { useNavigate } from "react-router-dom";
import { Themecolors } from "api/Colors";

const SearchContainer = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1200, // above app bar & topbar contents
  width: "100%",
  display: "flex",
  alignItems: "center",
  height: topBarHeight,
  background: Themecolors.Menu_bg, // keep consistent with header background
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[4],
  "&::placeholder": {
    color: theme.palette.text.primary,
  },
}));

const SearchInput = styled("input")(({ theme }) => ({
  flex: "1 1 auto",
  width: "auto",
  minWidth: 0,
  border: "none",
  outline: "none",
  fontSize: "0.9rem",
  paddingLeft: "20px",
  height: "calc(100% - 5px)",
  background: Themecolors.Menu_bg, // match header background
  color: theme.palette.text.primary,
  "&::placeholder": { color: theme.palette.text.primary },
}));

const MatxSearchBox = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { settings } = useSettings();
  const leftMode = settings?.layout1Settings?.leftSidebar?.mode || "full";
  const leftPad = isMobile
    ? 0
    : leftMode === "full"
    ? sideNavWidth
    : sidenavCompactWidth;
  const [open, setOpen] = useState(false);
  const [taskId, setTaskId] = useState(""); // numeric-only for direct task route
  const [query, setQuery] = useState(""); // raw text shown in input

  const toggle = () => {
    setOpen((prev) => !prev);
    setTaskId("");
    setQuery("");
  };

  const handlechange = (event) => {
    const value = event.target.value;
    const NumericValue = value.replace(/\D/g, "");
    setQuery(NumericValue);
    setTaskId(NumericValue);
  };

  const handleKey = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
    if (event.key === "Escape") {
      toggle();
    }
  };

  const handleSearch = () => {
    const trimmed = query.trim();
    setOpen(false);
    if (taskId) {
      navigate(`/user/task/${taskId}`);
    } else if (trimmed) {
      navigate(`/user/search?query=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <Box display="flex" alignItems="center">
      {!open && (
        <IconButton
          onClick={toggle}
          sx={{
            "&:hover": { backgroundImage: Themecolors.Manu_hv1 },
          }}
        >
          <Icon sx={{ color: Themecolors.Icons_blue }}>search</Icon>
        </IconButton>
      )}

      {open && (
        <Box
          display="flex"
          alignItems="center"
          sx={{
            width: "100%",
            background: Themecolors.Menu_bg,
            overflow: "hidden",
            px: 1,
          }}
        >
          <SearchInput
            type="text"
            placeholder="Search by Task Id..."
            autoFocus
            value={query}
            onChange={handlechange}
            onKeyDown={handleKey}
          />
          <IconButton onClick={toggle} sx={{ flexShrink: 0 }}>
            <Icon
              sx={{
                color: (theme) => theme.palette.text.primary,
              }}
            >
              close
            </Icon>
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default MatxSearchBox;
