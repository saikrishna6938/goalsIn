import React, { useState, useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";

interface SplitProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
  direction?: "vertical" | "horizontal";
  showLeft?: boolean;
  showRight?: boolean;
}

export const Split: React.FC<SplitProps> = ({
  left,
  right,
  initialSize,
  minSize = 100,
  maxSize = 1000,
  direction = "vertical",
  showLeft = true,
  showRight = true,
}) => {
  const { palette } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [primarySize, setPrimarySize] = useState<number>(0);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const splitterSize = 2.5;

  const calculateInitialSize = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerSize = direction === "vertical" ? rect.width : rect.height;

    let newSize =
      typeof initialSize === "number"
        ? initialSize <= 1
          ? initialSize * containerSize
          : initialSize
        : containerSize / 2 - splitterSize / 2;

    // Clamp to min/max
    newSize = Math.max(
      minSize,
      Math.min(newSize, containerSize - splitterSize - minSize)
    );
    setPrimarySize(newSize);
  };

  useEffect(() => {
    calculateInitialSize();
    window.addEventListener("resize", calculateInitialSize);
    return () => window.removeEventListener("resize", calculateInitialSize);
  }, [initialSize, direction]);

  const handleMouseDown = () => {
    setIsResizing(true);
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let newSize =
      direction === "vertical" ? e.clientX - rect.left : e.clientY - rect.top;
    const containerSize = direction === "vertical" ? rect.width : rect.height;
    const maxAllowed = containerSize - splitterSize - minSize;

    newSize = Math.max(minSize, Math.min(newSize, maxAllowed));
    setPrimarySize(newSize);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.userSelect = "";
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const splitterStyle = {
    cursor: direction === "vertical" ? "ew-resize" : "ns-resize",
    background: palette.action.disabled,
    [direction === "vertical" ? "width" : "height"]: `${splitterSize}px`,
    flexShrink: 0,
    zIndex: 1,
    display: showLeft && showRight ? "block" : "none",
  };

  const leftPanelStyle = {
    flex: `0 0 ${primarySize}px`,
    overflow: "hidden",
    display: showLeft ? "block" : "none",
  };

  const rightPanelStyle = {
    flex: "1 1 auto",
    overflow: "hidden",
    display: showRight ? "block" : "none",
  };

  return (
    <Box
      ref={containerRef}
      display="flex"
      height="100%"
      width="100%"
      flexDirection={direction === "vertical" ? "row" : "column"}
    >
      <Box sx={leftPanelStyle}>{left}</Box>
      <Box sx={splitterStyle} onMouseDown={handleMouseDown} />
      <Box sx={rightPanelStyle}>{right}</Box>
    </Box>
  );
};
