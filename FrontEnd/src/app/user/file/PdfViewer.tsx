import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import Loading from "app/components/Loading";
import "./TextLayer.css";
import "./AnnotationLayer.css";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import HighlightColorPicker from "./HighlightColorPicker";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import RefreshIcon from "@mui/icons-material/Refresh";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import NoteIcon from "@mui/icons-material/Note";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import NoteOutlinedIcon from "@mui/icons-material/NoteOutlined";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

interface PdfViewerProps {
  file: string;
}

interface Highlight {
  pageNumber: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  color: string;
}

interface TextAnnotation {
  pageNumber: number;
  xPercent: number;
  yPercent: number;
  text: string;
  isEditing?: boolean;
  id: string;
}

interface ContextMenuPosition {
  top: number;
  left: number;
  pageNumber?: number;
  xPercent?: number;
  yPercent?: number;
}

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
  "&:hover": {
    backgroundColor: "transparent",
    color: "inherit",
  },
  paddingLeft: "6px",
  paddingRight: "6px",
}));

const IconWithTooltip = ({
  title,
  onClick,
  children,
  size = "small",
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
}) => (
  <Tooltip title={title}>
    <StyledIconButton size={size} onClick={onClick}>
      {children}
    </StyledIconButton>
  </Tooltip>
);

const AnnotationTextArea: React.FC<{
  annotation: TextAnnotation;
  onSave: (text: string) => void;
  onCancel: () => void;
}> = ({ annotation, onSave, onCancel }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(annotation.text);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.selectionStart = textAreaRef.current.value.length;
      textAreaRef.current.selectionEnd = textAreaRef.current.value.length;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleSave = () => {
    onSave(text);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: `${annotation.xPercent}%`,
        top: `${annotation.yPercent}%`,
        width: "250px",
        zIndex: 10,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        border: "1px dashed #1976d2",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={textAreaRef}
        value={text}
        placeholder="Type your note here..."
        style={{
          width: "100%",
          height: "80px",
          border: "none",
          background: "transparent",
          resize: "none",
          fontSize: "14px",
          fontFamily: "inherit",
          outline: "none",
          padding: "8px",
          boxSizing: "border-box",
        }}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "4px 8px",
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "rgba(0, 0, 0, 0.02)",
        }}
      >
        <Tooltip title="Cancel">
          <IconButton
            size="small"
            onClick={handleCancel}
            sx={{ color: "error.main" }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Save">
          <IconButton
            size="small"
            onClick={handleSave}
            sx={{ color: "success.main" }}
          >
            <SaveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </div>
  );
};

const PdfViewer: React.FC<PdfViewerProps> = ({ file }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [scaleOption, setScaleOption] = useState<string>("fit-height");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const zoomOptions = [0.5, 0.75, 1, 1.25, 1.5];
  const fitOptions = ["fit-height", "fit-width"];

  const [highlightActive, setHighlightActive] = useState(false);
  const [highlightColor, setHighlightColor] = useState("#FFFF00");
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [undoStack, setUndoStack] = useState<Highlight[][]>([]);
  const [redoStack, setRedoStack] = useState<Highlight[][]>([]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(
    null
  );
  const [selectedText, setSelectedText] = useState<string>("");
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(
    null
  );

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    pageRefs.current = new Array(numPages);
  };

  const handleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (containerRef.current && containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    const listener = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);

  const handleScaleChange = (e: SelectChangeEvent<string>) => {
    setScaleOption(e.target.value);
  };

  const handlePageChange = (e: SelectChangeEvent<number>) => {
    const value = Number(e.target.value);
    setCurrentPage(value);
    const el = pageRefs.current[value - 1];
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop, behavior: "smooth" });
    }
  };

  const handleDownload = () => {
    const mimePart = file.split(";")[0];
    const mimeType = mimePart.split(":")[1];
    const [type, subtype] = mimeType.split("/");
    const filename = `${type}.${subtype}`;

    const link = document.createElement("a");
    link.href = file;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
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

  const handleZoomIn = () => {
    if (fitOptions.includes(scaleOption)) {
      setScaleOption("1");
    } else {
      const currentIndex = zoomOptions.indexOf(Number(scaleOption));
      const nextIndex = Math.min(currentIndex + 1, zoomOptions.length - 1);
      setScaleOption(String(zoomOptions[nextIndex]));
    }
  };

  const handleZoomOut = () => {
    if (fitOptions.includes(scaleOption)) {
      setScaleOption("1");
    } else {
      const currentIndex = zoomOptions.indexOf(Number(scaleOption));
      const nextIndex = Math.max(currentIndex - 1, 0);
      setScaleOption(String(zoomOptions[nextIndex]));
    }
  };

  const toggleHighlight = () => {
    setHighlightActive(!highlightActive);
  };

  const handleColorSelect = (color: string) => {
    setHighlightColor(color);
  };

  const handleTextSelection = (pageNumber: number) => {
    if (!highlightActive) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();

    const pageElement = pageRefs.current[pageNumber - 1];
    if (!pageElement) return;

    const pageRect = pageElement.getBoundingClientRect();

    pushUndoState();

    Array.from(rects).forEach((r) => {
      const xPercent = ((r.left - pageRect.left) / pageRect.width) * 100;
      const yPercent = ((r.top - pageRect.top) / pageRect.height) * 100;
      const widthPercent = (r.width / pageRect.width) * 100;
      const heightPercent = (r.height / pageRect.height) * 100;

      setHighlights((prev) => [
        ...prev,
        {
          pageNumber,
          xPercent,
          yPercent,
          widthPercent,
          heightPercent,
          color: highlightColor,
        },
      ]);
    });

    selection.removeAllRanges();
  };

  const pushUndoState = () => {
    setUndoStack((prev) => [...prev, [...highlights]]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((r) => [...r, [...highlights]]);
    setHighlights(prev);
  };
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((u) => [...u, [...highlights]]);
    setHighlights(next);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";
    setSelectedText(selectedText);

    let pageNumber = 1;
    let xPercent = 0;
    let yPercent = 0;

    for (let i = 0; i < pageRefs.current.length; i++) {
      const pageElement = pageRefs.current[i];
      if (pageElement && pageElement.contains(event.target as Node)) {
        pageNumber = i + 1;
        const pageRect = pageElement.getBoundingClientRect();
        xPercent = ((event.clientX - pageRect.left) / pageRect.width) * 100;
        yPercent = ((event.clientY - pageRect.top) / pageRect.height) * 100;
        break;
      }
    }

    setContextMenu({
      top: event.clientY,
      left: event.clientX,
      pageNumber,
      xPercent,
      yPercent,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAddText = () => {
    if (contextMenu) {
      const newAnnotation: TextAnnotation = {
        pageNumber: contextMenu.pageNumber || 1,
        xPercent: contextMenu.xPercent || 0,
        yPercent: contextMenu.yPercent || 0,
        text: "",
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      setTextAnnotations([...textAnnotations, newAnnotation]);
      setEditingAnnotationId(newAnnotation.id);
    }
    handleCloseContextMenu();
  };

  const handleEditTextAnnotation = (annotationId: string) => {
    setEditingAnnotationId(annotationId);
  };

  const handleSaveTextAnnotation = (annotationId: string, text: string) => {
    const updatedAnnotations = textAnnotations.map((anno) => {
      if (anno.id === annotationId) {
        return { ...anno, text };
      }
      return anno;
    });

    const filteredAnnotations = updatedAnnotations.filter(
      (anno) => anno.text.trim() !== ""
    );

    setTextAnnotations(filteredAnnotations);
    setEditingAnnotationId(null);
  };

  const handleCancelTextAnnotation = (annotationId: string) => {
    const annotation = textAnnotations.find((a) => a.id === annotationId);

    if (annotation && annotation.text.trim() === "") {
      const filteredAnnotations = textAnnotations.filter(
        (anno) => anno.id !== annotationId
      );
      setTextAnnotations(filteredAnnotations);
    }
    setEditingAnnotationId(null);
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
      onContextMenu={handleContextMenu}
    >
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.top, left: contextMenu.left }
            : undefined
        }
        onClick={(e) => e.preventDefault()}
      >
        <MenuItem onClick={handleRefresh}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Refresh</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAddText}>
          <ListItemIcon>
            <TextFieldsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Comments</ListItemText>
        </MenuItem>
      </Menu>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          px: 1,
          py: 0.5,
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "background.paper",
        }}
      >
        <StyledBox onClick={() => setShowThumbnails(!showThumbnails)}>
          <IconWithTooltip title="Show Thumbnails">
            <ViewSidebarIcon fontSize="small" />
          </IconWithTooltip>
        </StyledBox>

        <StyledBox sx={{ mr: "auto" }}>
          <IconWithTooltip title="Highlight Text" onClick={toggleHighlight}>
            <BorderColorIcon
              fontSize="small"
              sx={{
                color: highlightActive ? highlightColor : "inherit",
              }}
            />
          </IconWithTooltip>
        </StyledBox>

        {(undoStack.length > 0 || redoStack.length > 0) && (
          <ZoomControlBox>
            <IconWithTooltip title="Undo" onClick={handleUndo}>
              <UndoIcon fontSize="small" />
            </IconWithTooltip>
            <Box
              sx={{
                width: "1px",
                height: "20px",
                backgroundColor: "#ccc",
                mx: 0.5,
              }}
            />
            <IconWithTooltip title="Redo" onClick={handleRedo}>
              <RedoIcon fontSize="small" />
            </IconWithTooltip>
          </ZoomControlBox>
        )}

        {numPages > 0 && (
          <Select
            size="small"
            value={currentPage}
            onChange={handlePageChange}
            sx={{ mr: 1 }}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>{`Page ${i + 1}`}</MenuItem>
            ))}
          </Select>
        )}
        <Select
          size="small"
          value={scaleOption}
          onChange={handleScaleChange}
          sx={{ mr: 1 }}
        >
          <MenuItem value="fit-height">Fit Height</MenuItem>
          <MenuItem value="fit-width">Fit Width</MenuItem>
          {zoomOptions.map((s) => (
            <MenuItem key={s} value={String(s)}>{`${Math.round(
              s * 100
            )}%`}</MenuItem>
          ))}
        </Select>
        <ZoomControlBox>
          <IconWithTooltip title="Zoom Out" onClick={handleZoomOut}>
            <ZoomOutIcon fontSize="small" />
          </IconWithTooltip>

          <Box
            sx={{
              width: "1px",
              height: "20px",
              backgroundColor: "#ccc",
              mx: 0.5,
            }}
          />

          <IconWithTooltip title="Zoom In" onClick={handleZoomIn}>
            <ZoomInIcon fontSize="small" />
          </IconWithTooltip>
        </ZoomControlBox>
        <StyledBox onClick={handleDownload}>
          <IconWithTooltip title="Download PDF">
            <DownloadIcon fontSize="small" />
          </IconWithTooltip>
        </StyledBox>

        <StyledBox onClick={handlePrint}>
          <Tooltip title="Print PDF">
            <StyledIconButton>
              <PrintIcon fontSize="small" />
            </StyledIconButton>
          </Tooltip>
        </StyledBox>

        <Tooltip title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
          <IconButton
            size="small"
            onClick={handleFullScreen}
            sx={{
              p: 0.5,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            {isFullscreen ? (
              <FullscreenExitIcon fontSize="inherit" />
            ) : (
              <FullscreenIcon fontSize="inherit" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
      {highlightActive && (
        <Box
          sx={{
            display: "flex",
            px: 1,
            py: 1,
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "background.paper",
          }}
        >
          <HighlightColorPicker
            selectedColor={highlightColor}
            onSelectColor={handleColorSelect}
          />
        </Box>
      )}

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {showThumbnails && (
          <Box
            sx={{
              width: 200,
              borderRight: "1px solid #e0e0e0",
              overflowY: "auto",
              backgroundColor: "background.paper",
              p: 1,
            }}
          >
            <Document file={file}>
              {Array.from({ length: numPages }, (_, i) => (
                <Box key={`thumb_${i + 1}`} sx={{ mb: 2, textAlign: "center" }}>
                  <Box
                    onClick={() => {
                      const el = pageRefs.current[i];
                      if (el && scrollRef.current) {
                        scrollRef.current.scrollTo({
                          top: el.offsetTop,
                          behavior: "smooth",
                        });
                        setCurrentPage(i + 1);
                      }
                    }}
                    sx={{
                      cursor: "pointer",
                      border:
                        currentPage === i + 1
                          ? "2px solid #1976d2"
                          : "1px solid #ccc",
                      borderRadius: 1,
                      overflow: "hidden",
                      display: "inline-block",
                    }}
                  >
                    <Page
                      pageNumber={i + 1}
                      width={140}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  </Box>
                  <Box
                    sx={{
                      fontSize: "12px",
                      color: "black",
                      fontWeight: "650",
                    }}
                  >
                    {i + 1}
                  </Box>
                </Box>
              ))}
            </Document>
          </Box>
        )}
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages), (_el, index) => {
              const props: any = {};
              if (scaleOption === "fit-width") {
                props.width = scrollRef.current?.clientWidth;
              } else if (scaleOption === "fit-height") {
                props.height = window.innerHeight;
              } else {
                props.scale = Number(scaleOption);
              }
              return (
                <div
                  key={`page_${index + 1}`}
                  ref={(el) => (pageRefs.current[index] = el)}
                  style={{ marginBottom: "16px", position: "relative" }}
                  onMouseUp={() => handleTextSelection(index + 1)}
                >
                  <Page
                    pageNumber={index + 1}
                    renderAnnotationLayer
                    renderTextLayer
                    {...props}
                  />
                  {highlights
                    .filter((h) => h.pageNumber === index + 1)
                    .map((h, i) => (
                      <div
                        key={i}
                        style={{
                          position: "absolute",
                          left: `${h.xPercent}%`,
                          top: `${h.yPercent}%`,
                          width: `${h.widthPercent}%`,
                          height: `${h.heightPercent}%`,
                          backgroundColor: h.color,
                          opacity: 0.4,
                          pointerEvents: "none",
                        }}
                      />
                    ))}

                  {textAnnotations
                    .filter((t) => t.pageNumber === index + 1)
                    .map((t) => (
                      <div
                        key={t.id}
                        style={{
                          position: "absolute",
                          left: `${t.xPercent}%`,
                          top: `${t.yPercent}%`,
                          backgroundColor: "transparent",
                          padding: "2px",
                          borderRadius: "3px",
                          border: "none",
                          fontSize: "14px",
                          cursor: "pointer",
                          zIndex: 10,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTextAnnotation(t.id);
                        }}
                      >
                        {editingAnnotationId === t.id ? (
                          <AnnotationTextArea
                            annotation={t}
                            onSave={(text) =>
                              handleSaveTextAnnotation(t.id, text)
                            }
                            onCancel={() => handleCancelTextAnnotation(t.id)}
                          />
                        ) : (
                          t.text.trim() !== "" && (
                            <Tooltip title={t.text} arrow>
                              <NoteOutlinedIcon
                                sx={{
                                  color: "primary.main",
                                  border: "2px solid currentColor",
                                  borderRadius: "50%",
                                  padding: "2px",
                                  backgroundColor: "transparent",
                                  zIndex: 10,
                                  fontSize: "26px",
                                }}
                              />
                            </Tooltip>
                          )
                        )}
                      </div>
                    ))}
                </div>
              );
            })}
          </Document>
        </Box>
      </Box>
    </Box>
  );
};

export default PdfViewer;
