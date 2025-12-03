import React, { useState, useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialSize?: number | string;
  minSize?: number;
  direction?: "vertical" | "horizontal";
  showLeft?: boolean;
  showRight?: boolean;
}

export const SplitView: React.FC<SplitViewProps> = ({
  left,
  right,
  initialSize = "50%",
  minSize = 600,
  direction = "vertical",
  showLeft = true,
  showRight = true,
}) => {
  const { palette } = useTheme();
  const [primarySize, setPrimarySize] = useState<number | string>(initialSize);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = () => {
    setIsResizing(true);
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    if (direction === "vertical") {
      setPrimarySize(e.clientX - containerRect.left);
    } else {
      setPrimarySize(e.clientY - containerRect.top);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.userSelect = "";
  };

  useEffect(() => {
    // window.addEventListener("mousemove", handleMouseMove);
    // window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const splitterStyle =
    direction === "vertical"
      ? {
          cursor: "ew-resize",
          marginRight: "5px",
          marginLeft: "10px",
          width: "2px", // Slightly wider for easier interaction
          background: palette.action.disabled, // Neutral background
          borderTop: "1px solid #fefefe", // Subtle border for better visual separation
          borderBottom: "1px solid #fefefe",
          transition: "background-color 0.2s", // Smooth transition for hover effect
          "&:hover": {
            background: "#bbb", // Darker on hover for feedback
          },
        }
      : {
          cursor: "ns-resize",
          height: "12px", // Slightly taller for easier interaction
          background: "#efefef",
          borderLeft: "1px solid #fefefe",
          borderRight: "1px solid #fefefe",
          boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
          transition: "background-color 0.2s",
          "&:hover": {
            background: "#bbb",
          },
        };

  const leftPanelStyle = {
    width: direction === "vertical" ? primarySize : "100%",
    height: direction === "horizontal" ? primarySize : "100%",
    minWidth: direction === "vertical" ? minSize : undefined,
    minHeight: direction === "horizontal" ? minSize : undefined,
    visibility: !showLeft ? "hidden" : "visible",
    display: showRight && !showLeft ? "none" : "block", // Hide left panel if showRight is true and showLeft is false
  };

  const splitterVisibility = {
    display: showRight && !showLeft ? "none" : "flex", // Hide splitter if showRight is true and showLeft is false
  };

  return (
    <Box
      ref={containerRef}
      display="flex"
      height="100%"
      width="100%"
      flexDirection={direction === "vertical" ? "row" : "column"}
    >
      <Box
        sx={{
          width: direction === "vertical" ? primarySize : "100%",
          height: direction === "horizontal" ? primarySize : "100%",
          minWidth: direction === "vertical" ? `${minSize}px` : undefined,
          minHeight: direction === "horizontal" ? `${minSize}px` : undefined,
          visibility: !showLeft ? "hidden" : "visible",
          display: showRight && !showLeft ? "none" : "block", // Hide left panel if showRight is true and showLeft is false
        }}
      >
        {left}
      </Box>

      <Box
        sx={{
          ...splitterStyle,
          display: showRight && !showLeft ? "none" : "flex", // Hide splitter if showRight is true and showLeft is false
        }}
        {...splitterVisibility}
        onMouseDown={handleMouseDown}
        onMouseOver={() =>
          (document.body.style.cursor =
            direction === "vertical" ? "ew-resize" : "ns-resize")
        }
        onMouseOut={() => (document.body.style.cursor = "default")}
      >
        <Box
          width={direction === "vertical" ? "1px" : "100%"}
          height={direction === "horizontal" ? "1px" : "100%"}
          bgcolor="grey"
          m={direction === "vertical" ? "0 5px" : "5px 0"}
        />
      </Box>

      <Box
        flexGrow={1}
        height="100%"
        width="100%"
        visibility={!showRight ? "hidden" : "visible"}
      >
        {right}
      </Box>
    </Box>
  );
};
