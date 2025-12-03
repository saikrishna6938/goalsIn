import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Typography,
  TextField,
  MenuItem,
  Menu,
  styled,
  Switch,
  Tooltip,
} from "@mui/material";
import { Themecolors } from "api/Colors";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";
import createEmptyDocumentTemplatefrom from "./EmptyForm";
import SelectionManager from "./Selections";
import RenderQuestionFields from "./RenderQuestionFields";
import QuestionTypeMenuItems from "./QuestionTypeMenuItems";
import LeftPanel from "./LeftPanel";
import { CopyAll } from "@mui/icons-material";
import formEditStore from "./EditFormStore";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";

interface Props {
  Data: any;
  onReload?: () => void;
  onClose?: () => void;
}

const getTypeLabel = (type: string): string => {
  switch (type) {
    case "1":
      return "TextBox";
    case "2":
      return "DescriptionBox";
    case "3":
      return "Checkbox";
    case "4":
      return "RadioButton";
    case "5":
      return "UploadButton";
    case "6":
      return "NumericBox";
    case "7":
      return "CurrencyBox";
    case "8":
      return "Dropdown";
    case "9":
      return "Date";
    case "10":
      return "Document Tag";
    case "11":
      return "HtmlContainer";
    default:
      return "Unknown";
  }
};

const EditForm: React.FC<Props> = ({ Data, onReload, onClose }) => {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<
    number | null
  >(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(
    null
  );
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<
    number | null
  >(null);

  const [questionMenuAnchorEl, setQuestionMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number | null>(
    null
  );
  const [isSelected, setIsSelected] = useState<{
    sectionIndex: number | null;
    groupIndex: number | null;
    questionIndex: number | null;
  }>({
    sectionIndex: null,
    groupIndex: null,
    questionIndex: null,
  });
  const [selectionSelected, setSelectionSelected] = useState<boolean>(false);
  const [localData, setLocalData] = useState(Data);
  const [showJSON, setShowJSON] = useState(false);
  const [storedata, SetStoredata] = useState<any>(null);

  useEffect(() => {
    const copied = formEditStore.getFormData();
    SetStoredata(JSON.parse(JSON.stringify(copied)));
  }, []);

  useEffect(() => {
    const template =
      Data?.documentTypeObject && Data.documentTypeObject.sections
        ? Data.documentTypeObject
        : createEmptyDocumentTemplatefrom();

    const transformedSections = template.sections.map((section: any) => {
      const sectionTriggers = section.triggers || {};
      const grouped = section.formDetails.map((group: any) => ({
        name: group.groupName,
        repeated: group.repeated ?? false,
        display: group.display,
        questions: group.form.map((q: any) => {
          const trigger = sectionTriggers[q.order];
          return {
            label: q.attributeName || "",
            description: q.attributeDescription || "",
            type: q.attributeType,
            value: section.initialValues?.[q.order] || "",
            attributeName: q.attributeName,
            dropdownValue: q.dropdownValue || "",
            order: q.order,
            visible:
              q.visible !== undefined && q.visible !== "" ? q.visible : "0",
            ...(q.triggers && { triggers: q.triggers }),
          };
        }),
      }));

      return {
        sectionName: section.sectionName,
        selectedGroups: grouped,
        validationSchema: section.validationSchema || {},
        triggers: section.triggers,
        columns: section.columns,
        initialValues: section.initialValues || {},
      };
    });
    setSections(transformedSections);
  }, [Data]);

  const onSelectSection = (sectionIndex: number) => {
    setSelectedSectionIndex(sectionIndex);
    setSelectedGroupIndex(null);
    setSelectedQuestionIndex(null);
    setIsSelected({ sectionIndex, groupIndex: null, questionIndex: null });
    setSelectionSelected(false);
  };

  const onSelectGroup = (sectionIndex: number, groupIndex: number) => {
    setSelectedSectionIndex(sectionIndex);
    setSelectedGroupIndex(groupIndex);
    setSelectedQuestionIndex(null);
    setIsSelected({ sectionIndex, groupIndex, questionIndex: null });
    setSelectionSelected(false);
  };

  const onSelectQuestion = (
    sectionIndex: number,
    groupIndex: number,
    questionIndex: number
  ) => {
    setSelectedSectionIndex(sectionIndex);
    setSelectedGroupIndex(groupIndex);
    setSelectedQuestionIndex(questionIndex);
    setIsSelected({ sectionIndex, groupIndex, questionIndex });
    setSelectionSelected(false);
  };

  const handleAddNew = () => {
    const newSection = {
      sectionName: `Section ${sections.length + 1}`,
      selectedGroups: [],
    };
    setSections((prevSections) => [...prevSections, newSection]);
  };

  const handleQuestionDescriptionChange = (
    sectionIndex: number,
    groupIndex: number,
    questionIndex: number,
    value: string
  ) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].selectedGroups[groupIndex].questions[
      questionIndex
    ].description = value;
    setSections(updatedSections);
  };

  const handleQuestionDropDownChange = (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    value: string
  ) => {
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      const question =
        updatedSections[sectionIdx].selectedGroups[groupIdx].questions[
          questionIdx
        ];
      question.dropdownValue = value;
      return updatedSections;
    });

    setLocalData((prevData: any) => {
      const questionOrder = Number(
        sections[sectionIdx].selectedGroups[groupIdx].questions[questionIdx]
          .order
      );

      const cleanedSelections = prevData.documentTypeObject.selections.map(
        (sel: any) => ({
          ...sel,
          questions: sel.questions.filter((q: number) => q !== questionOrder),
        })
      );

      const updatedSelections = cleanedSelections.map((selection: any) => {
        if (selection.name === value) {
          const existing = selection.questions || [];
          return {
            ...selection,
            questions: Array.from(new Set([...existing, questionOrder])),
          };
        }
        return selection;
      });

      return {
        ...prevData,
        documentTypeObject: {
          ...prevData.documentTypeObject,
          selections: updatedSelections,
        },
      };
    });
  };
  const handleSelections = (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    value: string
  ) => {
    if (!value.includes(":%")) return;

    const match = value.match(/^(\d+):(.*)$/);
    if (!match) return;

    const questionOrderStr = match[1];
    const optionValue = match[2].trim();
    const questionOrder = parseInt(questionOrderStr.trim());

    setLocalData((prevData: any) => {
      const prevSelections = prevData?.documentTypeObject?.selections || [];

      const updatedSelections = prevSelections.map((sel: any) => ({
        ...sel,
        questions:
          sel.questions?.filter((q: number) => q !== questionOrder) || [],
        options: sel.options,
      }));

      const newSelection = {
        questions: [questionOrder],
        options: [optionValue],
      };

      return {
        ...prevData,
        documentTypeObject: {
          ...prevData.documentTypeObject,
          selections: [...updatedSelections, newSelection],
        },
      };
    });

    setSections((prev) => [...prev]);
  };

  const handleQuestionDefaultValueChange = (
    sectionIndex,
    groupIndex,
    questionIndex,
    value
  ) => {
    const updatedSections = [...sections];
    const section = updatedSections[sectionIndex];
    const question =
      section.selectedGroups[groupIndex].questions[questionIndex];

    question.value = value;

    if (!section.initialValues) {
      section.initialValues = {};
    }
    section.initialValues[question.order.toString()] = value;

    setSections(updatedSections);
  };

  const handleAddGroup = (sectionIndex: number) => {
    const updatedSections = [...sections];
    if (!updatedSections[sectionIndex].selectedGroups) {
      updatedSections[sectionIndex].selectedGroups = [];
    }

    updatedSections[sectionIndex].selectedGroups.push({
      name: `Group ${updatedSections[sectionIndex].selectedGroups.length + 1}`,
      questions: [],
    });

    setSections(updatedSections);
  };

  const handleAddQuestion = (
    sectionIndex: number,
    groupIndex: number,
    event: React.MouseEvent<HTMLElement>
  ) => {
    setSelectedSectionIndex(sectionIndex);
    setCurrentGroupIndex(groupIndex);
    setQuestionMenuAnchorEl(event.currentTarget);
  };

  const handleSelectQuestionType = (type: string) => {
    if (currentGroupIndex !== null && selectedSectionIndex !== null) {
      const updatedSections = [...sections];
      let globalMaxOrder = 0;
      updatedSections.forEach((section) => {
        section.selectedGroups.forEach((group) => {
          group.questions.forEach((q: any) => {
            const orderNum = parseInt(q.order, 10);
            if (!isNaN(orderNum) && orderNum > globalMaxOrder) {
              globalMaxOrder = orderNum;
            }
          });
        });
      });
      const nextOrder = (globalMaxOrder + 1).toString();
      const group =
        updatedSections[selectedSectionIndex].selectedGroups[currentGroupIndex];
      group.questions.push({
        label: `Question ${nextOrder}`,
        description: "",
        type,
        value: "",
        order: nextOrder,
        attributeName: `attribute_${nextOrder}`,
        visible: "0",
      });
      setSections(updatedSections);
    }
    setQuestionMenuAnchorEl(null);
  };

  const reconstructOriginalSections = () => {
    return sections.map((section) => {
      const initialValues: Record<string, string> = {};
      section.selectedGroups.forEach((group) => {
        group.questions.forEach((question) => {
          initialValues[question.order] = question.value || "";
        });
      });

      const sortedInitialValues: Record<string, string> = {};
      Object.keys(initialValues)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((key) => {
          sortedInitialValues[key.toString()] = initialValues[key.toString()];
        });
      return {
        sectionName: section.sectionName,
        repeated: false,
        columns: section.columns,
        initialValues: section.initialValues,
        validationSchema: section.validationSchema,
        formDetails: section.selectedGroups.map((group) => ({
          groupName: group.name,
          repeated: group.repeated ?? false,
          display: group.display,
          form: group.questions.map((q) => ({
            order: q.order,
            attributeName: q.label,
            attributeDescription: q.description,
            attributeType: q.type,
            visible: q.visible,
            ...(q.triggers && { triggers: q.triggers }),
          })),
        })),
      };
    });
  };

  const handleValidationChange = (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    validation: { type: string; value: string }[]
  ) => {
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      const section = updatedSections[sectionIdx];
      if (!section) return prevSections;

      const group = section.selectedGroups?.[groupIdx];
      if (!group) return prevSections;

      const question = group.questions?.[questionIdx];
      if (!question) return prevSections;

      const questionOrder = question.order;
      if (questionOrder == null) return prevSections;

      if (!section.validationSchema) {
        section.validationSchema = {};
      }

      if (Array.isArray(validation) && validation.length > 0) {
        section.validationSchema[questionOrder] = validation;
      } else {
        delete section.validationSchema[questionOrder];
      }

      return updatedSections;
    });

    setLocalData((prev) => ({
      ...prev,
      documentTypeObject: {
        ...prev.documentTypeObject,
        sections: reconstructOriginalSections(),
      },
    }));
  };
  const handleQuestionVisibilityChange = (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    value: string
  ) => {
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      const section = updatedSections[sectionIdx];
      const question =
        section?.selectedGroups?.[groupIdx]?.questions?.[questionIdx];

      if (!question) return prevSections;
      question.visible = value;

      return updatedSections;
    });

    setLocalData((prev) => ({
      ...prev,
      documentTypeObject: {
        ...prev.documentTypeObject,
        sections: reconstructOriginalSections(),
      },
    }));
  };

  const handleTriggerChange = (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    triggerObject: any
  ) => {
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      const section = updatedSections[sectionIdx];
      const question =
        section?.selectedGroups?.[groupIdx]?.questions?.[questionIdx];
      if (!question) return prevSections;

      const order = question.order;
      if (order && triggerObject[order]) {
        question.triggers = triggerObject[order];
      }

      return updatedSections;
    });

    setLocalData((prev) => ({
      ...prev,
      documentTypeObject: {
        ...prev.documentTypeObject,
        sections: reconstructOriginalSections(),
      },
    }));
  };

  const handleSectionNameChange = (index: number, value: string) => {
    const updatedSections = [...sections];
    updatedSections[index].sectionName = value;
    setSections(updatedSections);
  };

  const handleGroupNameChange = (
    sectionIndex: number,
    groupIndex: number,
    value: string
  ) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].selectedGroups[groupIndex].name = value;
    setSections(updatedSections);
  };

  const handleGroupRepeatToggle = (
    sectionIndex: number,
    groupIndex: number,
    value: boolean
  ) => {
    const updated = [...sections];
    updated[sectionIndex].selectedGroups[groupIndex].repeated = value;
    setSections(updated);
  };

  const handleQuestionLabelChange = (
    sectionIndex: number,
    groupIndex: number,
    questionIndex: number,
    value: string
  ) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].selectedGroups[groupIndex].questions[
      questionIndex
    ].label = value;
    setSections(updatedSections);
  };

  const handleDeleteSection = (sectionIndex: number) => {
    const updated = [...sections];
    updated.splice(sectionIndex, 1);
    setSections(updated);
  };

  const handleDeleteGroup = (sectionIndex: number, groupIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].selectedGroups.splice(groupIndex, 1);
    setSections(updated);
  };

  const handleDeleteQuestion = (
    sectionIndex: number,
    groupIndex: number,
    questionIndex: number
  ) => {
    const updated = [...sections];
    const updateSelections = [
      ...(localData?.documentTypeObject?.selections || []),
    ];

    const question =
      updated[sectionIndex].selectedGroups[groupIndex].questions[questionIndex];

    const questionOrder = question?.order;

    // Delete entire question object
    updated[sectionIndex].selectedGroups[groupIndex].questions.splice(
      questionIndex,
      1
    );

    // Remove validationSchema inside object
    if (
      questionOrder &&
      updated[sectionIndex].validationSchema &&
      updated[sectionIndex].validationSchema[questionOrder]
    ) {
      delete updated[sectionIndex].validationSchema[questionOrder];
    }

    // Remove selections question
    if (questionOrder) {
      updateSelections.forEach((selection) => {
        selection.questions = selection.questions.filter(
          (q) => q !== parseInt(questionOrder)
        );
      });

      // Remove initialValues
      if (
        updated[sectionIndex].initialValues &&
        Object.prototype.hasOwnProperty.call(
          updated[sectionIndex].initialValues,
          questionOrder
        )
      ) {
        delete updated[sectionIndex].initialValues[questionOrder];
      }
    }

    setSections(updated);
  };

  const handleSave = async () => {
    const payload = {
      documentTypeObjectId: Data.documentTypeObjectId,
      documentTypeObject: JSON.stringify({
        ...Data.documentTypeObject,
        sections: reconstructOriginalSections(),
        selections: localData.documentTypeObject.selections,
      }),
    };
    try {
      const response = await api.put("administrator/forms", { body: payload });
      appStore.showToast(
        response.message,
        response.status ? "success" : "error"
      );
    } catch (err) {
      throw err;
    }

    onReload?.();
  };

  const handleBoxClick = () => {
    setSelectionSelected((prev) => !prev);
    setIsSelected({
      sectionIndex: null,
      groupIndex: null,
      questionIndex: null,
    });
  };

  const handleSelectionsChange = (
    newSelections: {
      name: string;
      questions: number[];
      options: { id: string; name: string }[];
    }[]
  ) => {
    setLocalData((prevData) => {
      const existingSelections = prevData?.documentTypeObject?.selections || [];

      // Merge: prevent duplicates based on `name` (you can customize this)
      const mergedSelections = [...existingSelections];

      newSelections.forEach((newSel) => {
        const existingIndex = mergedSelections.findIndex(
          (sel) => sel.name === newSel.name
        );

        if (existingIndex === -1) {
          // If it doesn't exist, add it
          mergedSelections.push(newSel);
        } else {
          // Optional: merge questions/options if needed
          const existingSel = mergedSelections[existingIndex];

          const uniqueQuestions = Array.from(
            new Set([...existingSel.questions, ...newSel.questions])
          );

          const uniqueOptions = Array.from(
            new Map(
              [...existingSel.options, ...newSel.options].map((opt) => [
                opt.id,
                opt,
              ])
            ).values()
          );

          mergedSelections[existingIndex] = {
            ...existingSel,
            questions: uniqueQuestions,
            options: uniqueOptions,
          };
        }
      });

      return {
        ...prevData,
        documentTypeObject: {
          ...prevData.documentTypeObject,
          selections: mergedSelections,
        },
      };
    });
  };

  const handleOptionDelete = (selectionName: string, optionId: string) => {
    const updatedLocalData = { ...localData };

    updatedLocalData.documentTypeObject = {
      ...localData.documentTypeObject,
      selections: localData.documentTypeObject.selections.map((selection) => {
        if (selection.name === selectionName) {
          return {
            ...selection,
            options: selection.options.filter((opt) => opt.id !== optionId),
          };
        }
        return selection;
      }),
    };

    setLocalData(updatedLocalData);
  };

  const handleSectionUpdate = (updatedSections: any[]) => {
    setLocalData((prevData: any) => ({
      ...prevData,
      sections: updatedSections,
    }));
  };

  const handleSectionColumnsChange = (sectionIdx: number, columns: string) => {
    setSections((prevSections) =>
      prevSections.map((section, idx) =>
        idx === sectionIdx ? { ...section, columns } : section
      )
    );
  };

  const handleGroupDisplayChange = (sectionIdx, groupIdx, value) => {
    const updatedSections = [...sections];
    updatedSections[sectionIdx].selectedGroups[groupIdx].display = value;
    setSections(updatedSections);
  };

  const handleCopyButtonClick = () => {
    if (!Data) {
      appStore.showToast("No form data available to copy.", "info");
      return;
    }
    const plainData = JSON.parse(JSON.stringify(Data));
    formEditStore.setFormData(plainData);
    SetStoredata(plainData);
    appStore.showToast("Form copied successfully!", "success");
  };

  const handlePaste = () => {
    if (!storedata) {
      appStore.showToast("No copied form data to paste.", "info");
      return;
    }

    const pastedData = JSON.parse(JSON.stringify(storedata));

    const template =
      pastedData?.documentTypeObject || createEmptyDocumentTemplatefrom();

    const transformedSections =
      template.sections?.map((section: any) => {
        const sectionTriggers = section.triggers || {};
        const grouped = section.formDetails?.map((group: any) => ({
          name: group.groupName,
          repeated: group.repeated ?? false,
          display: group.display,
          questions: group.form.map((q: any) => ({
            label: q.attributeName || "",
            description: q.attributeDescription || "",
            type: q.attributeType,
            value: section.initialValues?.[q.order] || "",
            attributeName: q.attributeName,
            dropdownValue: q.dropdownValue || "",
            order: q.order,
            visible:
              q.visible !== undefined && q.visible !== "" ? q.visible : "0",
            ...(q.triggers && { triggers: q.triggers }),
          })),
        }));

        return {
          sectionName: section.sectionName,
          selectedGroups: grouped,
          validationSchema: section.validationSchema || {},
          triggers: section.triggers,
          columns: section.columns,
          initialValues: section.initialValues || {},
        };
      }) || [];

    setSections(transformedSections);
    SetStoredata(null);
    formEditStore.clearFormData();
    appStore.showToast("Form pasted successfully..!", "success");
  };

  return (
    <Box sx={{ height: "100%", width: "100%", overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Left column */}
        <LeftPanel
          Data={Data}
          handleSectionUpdate={handleSectionUpdate}
          sections={sections}
          selectionSelected={selectionSelected}
          isSelected={isSelected}
          selectedSectionIndex={selectedSectionIndex}
          handleBoxClick={handleBoxClick}
          handleAddNew={handleAddNew}
          onSelectSection={onSelectSection}
          handleDeleteSection={handleDeleteSection}
          handleAddGroup={handleAddGroup}
          handleDeleteGroup={handleDeleteGroup}
          handleAddQuestion={handleAddQuestion}
          handleDeleteQuestion={handleDeleteQuestion}
          onSelectGroup={onSelectGroup}
          onSelectQuestion={onSelectQuestion}
          getTypeLabel={getTypeLabel}
        />
        <Divider orientation="vertical" flexItem sx={{ height: "100%" }} />
        {/* Right column */}
        <Box
          sx={{
            width: "70%",
            padding: "16px",
            height: "95%",
          }}
        >
          <Box
            sx={{
              justifyContent: "space-between",
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #ccc",
            }}
          >
            <Typography variant="h6">Properties</Typography>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography>Show JSON file</Typography>
              <Tooltip title="">
                <Switch
                  checked={showJSON}
                  onChange={(e) => setShowJSON(e.target.checked)}
                />
              </Tooltip>
              {storedata ? (
                <Tooltip title="Paste">
                  <IconButton onClick={handlePaste} sx={{ padding: "10px" }}>
                    <ContentPasteIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Copy">
                  <IconButton
                    onClick={handleCopyButtonClick}
                    sx={{ padding: "10px" }}
                  >
                    <CopyAll />
                  </IconButton>
                </Tooltip>
              )}
              <Button
                type="submit"
                style={{ marginRight: "15px" }}
                sx={{
                  height: "2em",
                  marginX: "1em",
                  borderColor: Themecolors.Button1,
                  backgroundColor: Themecolors.Button1,
                  color: Themecolors.Button2,
                  "&:hover": {
                    backgroundImage: Themecolors.B_hv1,
                    borderColor: Themecolors.Button1,
                  },
                }}
                onClick={handleSave}
              >
                Save
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: "flex", height: "100%", width: "100%" }}>
            {!selectionSelected ? (
              <Box
                sx={{
                  paddingLeft: 2,
                  overflowY: "auto",
                  height: "100%",
                  padding: 2,
                  borderRadius: "8px",
                  width: showJSON ? "50%" : "100%",
                }}
              >
                <RenderQuestionFields
                  handleSelections={handleSelections}
                  handleQuestionVisibilityChange={
                    handleQuestionVisibilityChange
                  }
                  handleGroupDisplayChange={handleGroupDisplayChange}
                  handleSectionColumnsChange={handleSectionColumnsChange}
                  handleValidationChange={handleValidationChange}
                  sections={sections}
                  selectedSectionIndex={selectedSectionIndex}
                  selectedGroupIndex={selectedGroupIndex}
                  selectedQuestionIndex={selectedQuestionIndex}
                  handleSectionNameChange={handleSectionNameChange}
                  handleGroupNameChange={handleGroupNameChange}
                  handleGroupRepeatToggle={handleGroupRepeatToggle}
                  handleQuestionLabelChange={handleQuestionLabelChange}
                  handleQuestionDescriptionChange={
                    handleQuestionDescriptionChange
                  }
                  handleQuestionDefaultValueChange={
                    handleQuestionDefaultValueChange
                  }
                  handleQuestionDropDownChange={handleQuestionDropDownChange}
                  data={localData}
                  handleTriggerChange={handleTriggerChange}
                />
              </Box>
            ) : (
              <Box sx={{ width: "60%" }}>
                <SelectionManager
                  onSelectionsChange={handleSelectionsChange}
                  initialSelections={
                    localData?.documentTypeObject?.selections || []
                  }
                  onDeleteOption={handleOptionDelete}
                />
              </Box>
            )}
            {showJSON && (
              <>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ height: "100%" }}
                />

                <Box
                  sx={{
                    flex: 1,
                    paddingLeft: 2,
                    overflowY: "auto",
                    height: "100%",
                    padding: 2,
                    borderRadius: "8px",
                  }}
                >
                  <Box>
                    <pre style={{ margin: 0 }}>
                      {JSON.stringify(
                        {
                          ...localData,
                          documentTypeObject: {
                            ...localData.documentTypeObject,
                            sections: reconstructOriginalSections(),
                          },
                        },
                        null,
                        2
                      )}
                    </pre>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
      <Menu
        anchorEl={questionMenuAnchorEl}
        open={Boolean(questionMenuAnchorEl)}
        onClose={() => setQuestionMenuAnchorEl(null)}
      >
        <QuestionTypeMenuItems onSelect={handleSelectQuestionType} />
      </Menu>
    </Box>
  );
};

export default EditForm;
