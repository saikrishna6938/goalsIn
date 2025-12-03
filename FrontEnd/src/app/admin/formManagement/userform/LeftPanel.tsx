import React from "react";
import { Box, Typography, IconButton, styled, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Themecolors } from "api/Colors";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

const StyledButton = styled(Button)(({ theme }) => ({
  height: "1.5em",
  width: "auto",
  mb: 2,
  border: "1px solid black",
  borderRadius: 0,
  backgroundColor: "#fafafa",
  color: "black",
  "&:hover": {
    backgroundImage: "f5f5f5",
    borderColor: "black",
  },
}));

interface LeftPanelProps {
  handleSectionUpdate: (updatedSections: any[]) => void;
  Data: any;
  sections: any[];
  isSelected: any;
  selectionSelected?: boolean;
  selectedSectionIndex: number;
  handleBoxClick: () => void;
  handleAddNew: () => void;
  onSelectSection: (index: number) => void;
  handleDeleteSection: (index: number) => void;
  handleAddGroup: (sectionIndex: number) => void;
  handleDeleteGroup: (sectionIndex: number, groupIndex: number) => void;
  handleAddQuestion: (
    sectionIndex: number,
    groupIndex: number,
    e: React.MouseEvent
  ) => void;
  handleDeleteQuestion: (
    sectionIndex: number,
    groupIndex: number,
    qIdx: number
  ) => void;
  onSelectGroup: (sectionIndex: number, groupIndex: number) => void;
  onSelectQuestion: (
    sectionIndex: number,
    groupIndex: number,
    questionIndex: number
  ) => void;
  getTypeLabel: (type: string) => string;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  handleSectionUpdate,
  selectionSelected,
  Data,
  sections,
  isSelected,
  selectedSectionIndex,
  handleBoxClick,
  handleAddNew,
  onSelectSection,
  handleDeleteSection,
  handleAddGroup,
  handleDeleteGroup,
  handleAddQuestion,
  handleDeleteQuestion,
  onSelectGroup,
  onSelectQuestion,
  getTypeLabel,
}) => {
  const [draggedItem, setDraggedItem] = React.useState<{
    sectionIndex: number;
    groupIndex: number;
    questionIndex: number;
  } | null>(null);

  const [draggedGroup, setDraggedGroup] = React.useState<{
    sectionIndex: number;
    groupIndex: number;
  } | null>(null);

  const moveGroup = (
    sectionIdx: number,
    fromGroupIdx: number,
    toGroupIdx: number
  ) => {
    const updatedSections = [...sections];
    const groups = updatedSections[sectionIdx].selectedGroups;

    const [moved] = groups.splice(fromGroupIdx, 1);
    groups.splice(toGroupIdx, 0, moved);

    handleSectionUpdate(updatedSections);
    onSelectGroup(sectionIdx, toGroupIdx);
  };

  const moveQuestionBetweenGroups = (
    sectionIdx: number,
    fromGroupIdx: number,
    toGroupIdx: number,
    fromQuestionIdx: number,
    toQuestionIdx: number
  ) => {
    if (fromGroupIdx === toGroupIdx && fromQuestionIdx === toQuestionIdx)
      return;

    const updatedSections = [...sections];
    const fromQuestions =
      updatedSections[sectionIdx].selectedGroups[fromGroupIdx].questions;
    const toQuestions =
      updatedSections[sectionIdx].selectedGroups[toGroupIdx].questions;

    const [moved] = fromQuestions.splice(fromQuestionIdx, 1);
    toQuestions.splice(toQuestionIdx, 0, moved);

    handleSectionUpdate(updatedSections);
    onSelectQuestion(sectionIdx, toGroupIdx, toQuestionIdx);
  };

  const moveQuestion = (
    sectionIdx: number,
    groupIdx: number,
    fromIdx: number,
    toIdx: number
  ) => {
    if (fromIdx === toIdx) return;

    const updatedSections = [...sections];
    const questions =
      updatedSections[sectionIdx].selectedGroups[groupIdx].questions;

    const [moved] = questions.splice(fromIdx, 1);
    questions.splice(toIdx, 0, moved);

    handleSectionUpdate(updatedSections);
    onSelectQuestion(sectionIdx, groupIdx, toIdx);
  };

  return (
    <Box
      onClick={handleBoxClick}
      sx={{
        width: "30%",
        border: selectionSelected
          ? `2px dashed ${Themecolors.Button1}`
          : "1px solid #ccc",
        padding: 1,
        cursor: "pointer",
      }}
    >
      <Typography sx={{ fontSize: "1.3em", fontWeight: "bold", mb: 1 }}>
        {Data?.name}
      </Typography>
      <StyledButton onClick={handleAddNew} sx={{ ml: "10px" }}>
        Add Section
      </StyledButton>
      <Box
        sx={{
          mt: 2,
          overflowY: "auto",
          height: "90%",
          padding: 1,
        }}
      >
        {sections.length > 0 ? (
          sections.map((section, sectionIndex) => (
            <Box
              key={sectionIndex}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSection(sectionIndex);
              }}
              sx={{
                mb: 3,
                border:
                  isSelected.sectionIndex === sectionIndex &&
                  isSelected.groupIndex === null
                    ? `2px dashed ${Themecolors.Button1}`
                    : "1px solid #ccc",
                padding: 2,
                cursor: "pointer",
                backgroundColor:
                  selectedSectionIndex === sectionIndex
                    ? "#f0f8ff"
                    : "transparent",
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.2em",
                  fontWeight: "bold",
                  mb: 2,
                  textTransform: "capitalize",
                  cursor: "pointer",
                }}
              >
                {section.sectionName}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSection(sectionIndex);
                  }}
                  size="small"
                  sx={{ float: "right" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Typography>

              <StyledButton
                onClick={(event) => {
                  event.stopPropagation();
                  handleAddGroup(sectionIndex);
                }}
              >
                Add Group
              </StyledButton>

              {section.selectedGroups?.map((group: any, groupIndex: number) => (
                <Box
                  key={groupIndex}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggedGroup({ sectionIndex, groupIndex });
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggedItem) return;

                    if (
                      draggedGroup &&
                      draggedGroup.sectionIndex === sectionIndex
                    ) {
                      moveGroup(
                        sectionIndex,
                        draggedGroup.groupIndex,
                        groupIndex
                      );
                      setDraggedGroup(null);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGroup(sectionIndex, groupIndex);
                  }}
                  sx={{
                    padding: 1,
                    mb: 1,
                    mt: 1,
                    border:
                      isSelected.sectionIndex === sectionIndex &&
                      isSelected.groupIndex === groupIndex &&
                      isSelected.questionIndex === null
                        ? `2px dashed ${Themecolors.Button1}`
                        : "1px dashed #ccc",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      mb: 1,
                    }}
                  >
                    {isSelected.sectionIndex === sectionIndex &&
                      isSelected.groupIndex === groupIndex && (
                        <DragIndicatorIcon
                          sx={{ color: "#ccc", cursor: "grab", mr: 1 }}
                          fontSize="small"
                        />
                      )}
                    {group.name}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(sectionIndex, groupIndex);
                      }}
                      size="small"
                      sx={{ float: "right" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Typography>
                  <StyledButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddQuestion(sectionIndex, groupIndex, e);
                    }}
                  >
                    Add Question
                  </StyledButton>

                  {group.questions.length === 0 ? (
                    <Box
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (
                          draggedItem &&
                          draggedItem.sectionIndex === sectionIndex
                        ) {
                          moveQuestionBetweenGroups(
                            sectionIndex,
                            draggedItem.groupIndex,
                            groupIndex,
                            draggedItem.questionIndex,
                            0
                          );
                          setDraggedItem(null);
                        }
                      }}
                      sx={{
                        border: "1px dashed #ccc",
                        borderRadius: "6px",
                        padding: "8px",
                        mt: 1,
                        color: "gray",
                        fontStyle: "italic",
                      }}
                    >
                      No questions available
                    </Box>
                  ) : (
                    group.questions.map((q: any, qIdx: number) => (
                      <Box
                        key={qIdx}
                        draggable
                        onDragStart={(e) => {
                          setDraggedItem({
                            sectionIndex,
                            groupIndex,
                            questionIndex: qIdx,
                          });
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (
                            draggedItem &&
                            draggedItem.sectionIndex === sectionIndex
                          ) {
                            if (draggedItem.groupIndex === groupIndex) {
                              moveQuestion(
                                sectionIndex,
                                groupIndex,
                                draggedItem.questionIndex,
                                qIdx
                              );
                            } else {
                              moveQuestionBetweenGroups(
                                sectionIndex,
                                draggedItem.groupIndex,
                                groupIndex,
                                draggedItem.questionIndex,
                                qIdx
                              );
                            }
                            setDraggedItem(null);
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectQuestion(sectionIndex, groupIndex, qIdx);
                        }}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border:
                            isSelected.sectionIndex === sectionIndex &&
                            isSelected.groupIndex === groupIndex &&
                            isSelected.questionIndex === qIdx
                              ? `3px dashed ${Themecolors.Button1}`
                              : "1px dashed #ccc",
                          borderRadius: "6px",
                          padding: "8px",
                          mt: 1,
                          cursor: "pointer",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            {isSelected.sectionIndex === sectionIndex &&
                              isSelected.groupIndex === groupIndex &&
                              isSelected.questionIndex === qIdx && (
                                <DragIndicatorIcon
                                  sx={{ color: "#ccc", cursor: "grab" }}
                                  fontSize="small"
                                />
                              )}
                            <Box
                              sx={{
                                display: "inline-flex",
                                flexWrap: "nowrap",
                                alignItems: "center",
                                gap: 1,
                                minWidth: 0, // allows children to shrink
                                flex: 1, // take remaining space
                              }}
                            >
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "16%",
                                  bgcolor: "#757575",
                                  color: "#ffffff",
                                  fontWeight: "bold",
                                  fontSize: "0.8em",
                                  padding: "3px 7px",
                                }}
                              >
                                {q?.order}
                              </Box>
                              <Typography
                                sx={{
                                  fontWeight: "bold",
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                  overflowWrap: "anywhere",
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                {q.label}
                              </Typography>
                            </Box>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontSize={"11px"}
                            >
                              [{getTypeLabel(q.type)}]
                            </Typography>
                          </Box>

                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestion(
                                sectionIndex,
                                groupIndex,
                                qIdx
                              );
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              ))}
            </Box>
          ))
        ) : (
          <Typography>No sections available</Typography>
        )}
      </Box>
    </Box>
  );
};

export default LeftPanel;
