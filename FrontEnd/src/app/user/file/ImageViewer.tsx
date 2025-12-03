import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateRight as RotateRightIcon,
  RotateLeft as RotateLeftIcon,
  Flip as FlipIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { Print as PrintIcon } from "@mui/icons-material";

const StyledBox = styled(Box)(({ theme }) => ({
  border: "1px solid #ccc",
  borderRadius: "4px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: 1,
  "&:hover": {
    border: "1px solid black",
    backgroundColor: "transparent",
  },
  height: "100%",
  marginRight: theme.spacing(1),
}));

const ZoomControlBox = styled(Box)(({ theme }) => ({
  border: "1px solid #ccc",
  borderRadius: "4px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "4px",
  "&:hover": {
    border: "1px solid black",
    backgroundColor: "transparent",
  },
  height: "100%",
  marginRight: theme.spacing(1),
}));

const StyledIconButton = styled(IconButton)(() => ({
  "&:hover": { backgroundColor: "transparent", color: "inherit" },
  paddingLeft: "6px",
  paddingRight: "6px",
}));

const IconWithTooltip = ({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <Tooltip title={title}>
    <StyledIconButton size="small" onClick={onClick}>
      {children}
    </StyledIconButton>
  </Tooltip>
);

interface ImageViewerProps {
  file: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ file }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [scaleOption, setScaleOption] = useState<string>("fit-width");
  const zoomOptions = [0.5, 0.75, 1, 1.25, 1.5];

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleRotateRight = () => setRotation((r) => r + 90);
  const handleRotateLeft = () => setRotation((r) => r - 90);
  const handleFlipH = () => setFlipH((f) => !f);
  const handleFlipV = () => setFlipV((f) => !f);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setScaleOption("fit-width");
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen();
  };

  useEffect(() => {
    const listener = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file;
    link.download = "image.png";
    link.click();
  };

  const handleScaleChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setScaleOption(value);

    if (value === "fit-width" && containerRef.current && imageRef.current) {
      const containerWidth = containerRef.current.clientWidth - 32;
      const imgWidth = imageRef.current.naturalWidth;
      setZoom(containerWidth / imgWidth);
    } else if (
      value === "fit-height" &&
      containerRef.current &&
      imageRef.current
    ) {
      const containerHeight = containerRef.current.clientHeight - 32;
      const imgHeight = imageRef.current.naturalHeight;
      setZoom(containerHeight / imgHeight);
    } else {
      setZoom(parseFloat(value));
    }
  };

  const handlePrint = async () => {
    try {
      const blob = await fetch(file).then((res) => res.blob());
      const blobUrl = URL.createObjectURL(blob);

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
      iframe.src = blobUrl;

      iframe.onload = () => {
        iframe.contentWindow?.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();

          iframe.contentWindow?.addEventListener("afterprint", () => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(blobUrl);
          });
        }, 300);
      };
    } catch (error) {
      console.error("Printing failed:", error);
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1,
          py: 0.5,
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "background.paper",
          zIndex: 10,
        }}
      >
        <StyledBox>
          <IconWithTooltip title="Rotate Left" onClick={handleRotateLeft}>
            <RotateLeftIcon fontSize="small" />
          </IconWithTooltip>
          <IconWithTooltip title="Rotate Right" onClick={handleRotateRight}>
            <RotateRightIcon fontSize="small" />
          </IconWithTooltip>
          <IconWithTooltip title="Flip Horizontal" onClick={handleFlipH}>
            <FlipIcon fontSize="small" />
          </IconWithTooltip>
          <IconWithTooltip title="Reset" onClick={handleReset}>
            <RefreshIcon fontSize="small" />
          </IconWithTooltip>
        </StyledBox>
        <ZoomControlBox>
          <IconWithTooltip title="Zoom Out" onClick={handleZoomOut}>
            <ZoomOutIcon fontSize="small" />
          </IconWithTooltip>
          <IconWithTooltip title="Zoom In" onClick={handleZoomIn}>
            <ZoomInIcon fontSize="small" />
          </IconWithTooltip>
        </ZoomControlBox>
        <Select
          size="small"
          value={scaleOption}
          onChange={handleScaleChange}
          sx={{
            ml: 1,
            mr: 2,
            height: "100%",
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              paddingTop: 0,
              paddingBottom: 0,
            },
          }}
        >
          <MenuItem value="fit-height">Fit Height</MenuItem>
          <MenuItem value="fit-width">Fit Width</MenuItem>
          {zoomOptions.map((s) => (
            <MenuItem key={s} value={String(s)}>
              {`${Math.round(s * 100)}%`}
            </MenuItem>
          ))}
        </Select>

        <StyledBox onClick={handlePrint} sx={{ ml: "auto" }}>
          <Tooltip title="Print PDF">
            <StyledIconButton>
              <PrintIcon fontSize="small" />
            </StyledIconButton>
          </Tooltip>
        </StyledBox>
        <StyledBox>
          <IconWithTooltip title="Download" onClick={handleDownload}>
            <DownloadIcon fontSize="small" />
          </IconWithTooltip>
        </StyledBox>
        <StyledBox>
          <IconWithTooltip
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <FullscreenExitIcon fontSize="small" />
            ) : (
              <FullscreenIcon fontSize="small" />
            )}
          </IconWithTooltip>
        </StyledBox>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          justifyContent: "center",
          p: 1,
        }}
      >
        <Box
          sx={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            width: "50%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: `
          rotate(${rotation}deg)
          scaleX(${flipH ? -1 : 1})
          scaleY(${flipV ? -1 : 1})
        `,
              transformOrigin: "center center",
              width: "100%",
            }}
          >
            <img
              ref={imageRef}
              src={file}
              alt="content"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
                marginBottom: "10px",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ImageViewer;
