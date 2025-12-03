import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Manditory from "./Manditory ";
import Trigger from "./Trigger";
import Panel from "./Panel";
import OpenInNew from "@mui/icons-material/OpenInNew";
import NormalDropdown from "app/components/regularinputs/NormalDropdown";
import { Entity } from "app/types/User";
import { api } from "api/API";
import SelectionDropdown from "app/components/regularinputs/SelectionDropdown";
import CustomButton from "app/components/CustomButton ";
import { Clear } from "@mui/icons-material";
import TextInputField from "app/components/regularinputs/TextInpuField";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";

const visibilityOptions = [
  { id: "0", label: "Yes" },
  { id: "1", label: "No" },
];
const displayOptions = [
  { id: "vertical", label: "Vertical" },
  { id: "horizontal", label: "Horizontal" },
];
const columnOptions = [
  { id: "1", label: "1" },
  { id: "2", label: "2" },
];

interface Question {
  order: string;
  label: string;
  description: string;
  value?: string;
  type?: string;
  dropdownValue?: string;
  visible: string;
}

interface Group {
  name: string;
  repeated?: boolean;
  questions: Question[];
  display?: string;
}

interface Section {
  sectionName: string;
  selectedGroups: Group[];
  columns?: string;
}
type TriggerRow = {
  triggerType: any;
  condition: "Equal" | "Greater" | "Less";
  value: string;
  actions: any[];
};

interface SectionDetailsProps {
  handleQuestionVisibilityChange: (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    value: string
  ) => void;

  handleValidationChange: (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    validation: any
  ) => void;

  handleTriggerChange: (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    triggerObject: any
  ) => void;

  data?: any;
  sections: Section[];
  selectedSectionIndex: number | null;
  selectedGroupIndex: number | null;
  selectedQuestionIndex: number | null;
  handleSectionNameChange: (sectionIdx: number, name: string) => void;
  handleGroupNameChange: (
    sectionIdx: number,
    groupIdx: number,
    name: string
  ) => void;
  handleGroupRepeatToggle: (
    sectionIdx: number,
    groupIdx: number,
    value: boolean
  ) => void;
  handleQuestionLabelChange: (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    value: string
  ) => void;
  handleQuestionDescriptionChange: (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    value: string
  ) => void;
  handleQuestionDefaultValueChange: (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    value: string
  ) => void;

  handleQuestionDropDownChange: (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    value: string
  ) => void;
  handleSectionColumnsChange: (sectionIdx: number, columns: string) => void;
  handleGroupDisplayChange: (
    sectionIdx: number,
    groupIdx: number,
    value: string
  ) => void;

  onChange?: (triggers: any[]) => void;

  handleSelections?: (
    sectionIdx: number,
    groupIdx: number,
    questionIdx: number,
    value: string
  ) => void;
}

const RenderQuestionFields: React.FC<SectionDetailsProps> = ({
  handleQuestionVisibilityChange,
  onChange,
  handleGroupDisplayChange,
  handleValidationChange,
  handleTriggerChange,
  data,
  sections,
  selectedSectionIndex,
  selectedGroupIndex,
  selectedQuestionIndex,
  handleSectionNameChange,
  handleGroupNameChange,
  handleGroupRepeatToggle,
  handleQuestionLabelChange,
  handleQuestionDescriptionChange,
  handleQuestionDefaultValueChange,
  handleQuestionDropDownChange,
  handleSectionColumnsChange,
  handleSelections,
}) => {
  const [selectedDropdownValue, setSelectedDropdownValue] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectionType, setSelectionType] = useState<string>("");
  const entityOptions = [
    { id: Entity.Entity, label: "Entity" },
    { id: Entity.Options, label: "Options" },
  ];
  const [selectedEntity, setSelectedEntity] = useState<any>(1);
  const [optionData, setOptionData] = useState<any>([]);
  const [selectedOption, setSelectedOption] = useState<number | "">("");
  const [selectOption, setselectOption] = useState<any>("");
  const [option, SetOption] = useState([]);

  const question =
    selectedSectionIndex !== null &&
    selectedGroupIndex !== null &&
    selectedQuestionIndex !== null
      ? sections[selectedSectionIndex]?.selectedGroups[selectedGroupIndex]
          ?.questions[selectedQuestionIndex]
      : null;

  useEffect(() => {
    if (!question?.order || !data?.documentTypeObject?.selections) {
      setSelectionType("");
      return;
    }
    const matchedSelection = data.documentTypeObject.selections.find((s) =>
      s.questions?.includes(Number(question.order))
    );

    if (
      matchedSelection?.name &&
      matchedSelection.options?.every((opt) => typeof opt === "object")
    ) {
      setSelectionType("");
      return;
    }

    if (
      matchedSelection?.options?.[0] &&
      typeof matchedSelection.options[0] === "string"
    ) {
      const match = matchedSelection.options[0].match(/^%([^%]+)%/);
      if (match) {
        setSelectionType(match[1]);
        return;
      }
    }

    setSelectionType("");
  }, [question?.order, data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("administrator/options");
        SetOption(res.data);
      } catch (err) {
        throw err;
      }
    };
    fetchData();
  }, [question]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          "administrator/options/structure-values/values"
        );
        setOptionData(res.data);
      } catch (err) {
        console.error("Error fetching structure values:", err);
      }
    };

    fetchData();
  }, [question]);

  useEffect(() => {
    if (!question || !data?.documentTypeObject?.selections) return;

    const questionOrder = Number(question.order);

    const matchedSelection = data.documentTypeObject.selections.find(
      (sel: any) =>
        Array.isArray(sel.questions) && sel.questions.includes(questionOrder)
    );

    if (matchedSelection) {
      setSelectedDropdownValue(matchedSelection.name);
    } else {
      setSelectedDropdownValue(question.dropdownValue || "");
    }
  }, [question, data]);

  const handleModalClose = () => {
    setOpenAddModal(false);
    setSelectedOption("");
    setSelectedEntity(Entity.Entity);
  };

  const handleSave = () => {
    if (!selectedEntity || !question?.order) {
      console.warn("Entity or Question Order missing");
      return;
    }

    const entityLabel = entityOptions.find(
      (e) => e.id === selectedEntity
    )?.label;

    let optionValue = "";

    if (selectedEntity === Entity.Entity && selectedOption) {
      const optionLabel = optionData.find(
        (opt: any) => opt.id === selectedOption
      )?.valueLabel;

      if (!optionLabel) {
        console.warn("Option label not found for Entity");
        return;
      }

      optionValue = optionLabel;
    } else if (selectedEntity === Entity.Options && selectOption) {
      optionValue = String(selectOption);
    } else {
      console.warn("Option/Selection value missing");
      return;
    }

    const formattedValue = `${question.order}:%${entityLabel}%:%${optionValue}%`;

    handleSelections(
      selectedSectionIndex!,
      selectedGroupIndex!,
      selectedQuestionIndex!,
      formattedValue
    );

    handleModalClose();
  };

  if (selectedSectionIndex === null) {
    return <Typography variant="body1">No section selected</Typography>;
  }

  const section = sections[selectedSectionIndex];

  if (selectedGroupIndex === null) {
    return (
      <Box sx={{ padding: "16px" }}>
        <TextInputField
          sx={{ mb: 2 }}
          label="Section Name"
          variant="outlined"
          value={section?.sectionName}
          onChange={(e) =>
            handleSectionNameChange(selectedSectionIndex, e.target.value)
          }
          required
        />
        <SelectionDropdown
          label="Columns"
          options={columnOptions}
          value={section?.columns ?? ""}
          onChange={(val) =>
            handleSectionColumnsChange(selectedSectionIndex!, val)
          }
          optionValueKey="id"
          optionLabelKey="label"
          fullWidth
        />
      </Box>
    );
  }

  const group = section?.selectedGroups[selectedGroupIndex];

  if (selectedQuestionIndex === null) {
    return (
      <Box sx={{ padding: "16px" }}>
        <TextInputField
          label="Group Name"
          variant="outlined"
          value={group?.name}
          onChange={(e) =>
            handleGroupNameChange(
              selectedSectionIndex,
              selectedGroupIndex,
              e.target.value
            )
          }
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <Typography variant="body1">Repeat Group</Typography>
          <Switch
            checked={group?.repeated ?? false}
            onChange={(e) =>
              handleGroupRepeatToggle(
                selectedSectionIndex,
                selectedGroupIndex,
                e.target.checked
              )
            }
          />
        </Box>
        <SelectionDropdown
          label="Display"
          options={displayOptions}
          value={group?.display ?? ""}
          onChange={(val) =>
            handleGroupDisplayChange(
              selectedSectionIndex!,
              selectedGroupIndex!,
              val
            )
          }
          optionValueKey="id"
          optionLabelKey="label"
          fullWidth
        />
      </Box>
    );
  }

  const selectionOptions =
    (data?.documentTypeObject?.selections ?? [])
      .filter((selection) => selection.name)
      .map((selection) => ({
        id: selection.name,
        label: selection.name,
      })) || [];

  // Render question fields when question selected
  return (
    <>
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10%",
            bgcolor: "#757575",
            color: "#ffffff",
            fontWeight: "bold",
            fontSize: "0.8em",
            padding: "3px 10px",
            float: "right",
            mb: 1,
            mr: 2,
            mt: 1,
            width: "auto",
            height: "auto",
          }}
        >
          {question?.order}
        </Box>

        <Panel>
          <TextInputField
            label="Question"
            variant="outlined"
            value={question?.label}
            onChange={(e) =>
              handleQuestionLabelChange(
                selectedSectionIndex,
                selectedGroupIndex,
                selectedQuestionIndex,
                e.target.value
              )
            }
            sx={{ mb: 2 }}
          />
          <TextInputField
            label="Description"
            variant="outlined"
            value={question?.description}
            onChange={(e) =>
              handleQuestionDescriptionChange(
                selectedSectionIndex,
                selectedGroupIndex,
                selectedQuestionIndex,
                e.target.value
              )
            }
            sx={{ mb: 2 }}
          />
          {["1", "2", "3", "4", "5", "7", "8", "10", "11"].includes(
            question?.type
          ) && (
            <TextInputField
              label="Default Value"
              variant="outlined"
              value={question?.value || ""}
              onChange={(e) =>
                handleQuestionDefaultValueChange(
                  selectedSectionIndex!,
                  selectedGroupIndex!,
                  selectedQuestionIndex!,
                  e.target.value
                )
              }
              sx={{ mb: 2 }}
            />
          )}

          {question?.type === "6" && (
            <TextInputField
              type="number"
              label="Default Value"
              variant="outlined"
              value={question?.value || ""}
              onChange={(e) =>
                handleQuestionDefaultValueChange(
                  selectedSectionIndex!,
                  selectedGroupIndex!,
                  selectedQuestionIndex!,
                  e.target.value
                )
              }
              sx={{ mb: 2 }}
            />
          )}

          {question?.type === "9" && (
            <TextField
              type="date"
              label="Default Date"
              fullWidth
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              value={question?.value || ""}
              onChange={(e) =>
                handleQuestionDefaultValueChange(
                  selectedSectionIndex!,
                  selectedGroupIndex!,
                  selectedQuestionIndex!,
                  e.target.value
                )
              }
              sx={{ mb: 2 }}
            />
          )}

          {["1", "8", "3", "4"].includes(question?.type) && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                {selectionType ? (
                  <TextInputField
                    label="Selected Option"
                    variant="outlined"
                    value={selectionType}
                    readOnly
                  />
                ) : (
                  <SelectionDropdown
                    label="Select Option"
                    options={selectionOptions}
                    value={selectedDropdownValue || ""}
                    onChange={(val) => {
                      setSelectedDropdownValue(val as string);
                      handleQuestionDropDownChange(
                        selectedSectionIndex!,
                        selectedGroupIndex!,
                        selectedQuestionIndex!,
                        val
                      );
                    }}
                    optionValueKey="id"
                    optionLabelKey="label"
                    fullWidth
                  />
                )}
              </Box>

              <Tooltip title="Add">
                <IconButton onClick={() => setOpenAddModal(true)}>
                  <OpenInNew
                    sx={{ border: "1px solid #ccc", height: 35, width: 35 }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear">
                <IconButton
                  onClick={() => {
                    setSelectedDropdownValue("");
                    handleQuestionDropDownChange(
                      selectedSectionIndex!,
                      selectedGroupIndex!,
                      selectedQuestionIndex!,
                      ""
                    );
                  }}
                >
                  <Clear
                    sx={{ border: "1px solid #ccc", height: 35, width: 35 }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          <SelectionDropdown
            label="Visible"
            options={visibilityOptions}
            value={String(question?.visible) || ""}
            onChange={(val) =>
              handleQuestionVisibilityChange(
                selectedSectionIndex!,
                selectedGroupIndex!,
                selectedQuestionIndex!,
                val
              )
            }
            optionValueKey="id"
            optionLabelKey="label"
            fullWidth
          />
        </Panel>
        <Manditory
          data={data}
          questionIndex={selectedQuestionIndex!}
          questionOrder={question?.order}
          onValidationChange={(validation) => {
            handleValidationChange(
              selectedSectionIndex!,
              selectedGroupIndex!,
              selectedQuestionIndex!,
              validation[question.order]
            );
          }}
        />
        <Trigger
          data={data}
          questionIndex={selectedQuestionIndex!}
          questionOrder={question?.order}
          onTiggerData={(trigger) => {
            handleTriggerChange(
              selectedSectionIndex!,
              selectedGroupIndex!,
              selectedQuestionIndex!,
              trigger
            );
          }}
        />
      </Box>
      <Modal open={openAddModal} onClose={handleModalClose}>
        <Box
          sx={{
            width: 400,
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
            mx: "auto",
            mt: "15%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "1.2rem", fontWeight: "600" }}>
                Create Selections
              </Typography>
            </Box>
            <SelectionDropdown
              label=" Select Type"
              options={entityOptions.map(({ id, label }) => ({
                id,
                label,
              }))}
              value={selectedEntity || 1}
              onChange={(val: any) => setSelectedEntity(val)}
              optionValueKey="id"
              optionLabelKey="label"
            />
            {selectedEntity === 2 ? (
              <SelectionDropdown
                label=" Select Option"
                options={option.map(({ optionId, optionName }) => ({
                  id: optionId,
                  label: optionName,
                }))}
                value={selectOption}
                onChange={(val: any) => setselectOption(val)}
                optionValueKey="id"
                optionLabelKey="label"
              />
            ) : (
              <SelectionDropdown
                label=" Select Value"
                options={optionData.map(({ id, valueLabel }) => ({
                  id: id,
                  label: valueLabel,
                }))}
                value={selectedOption}
                onChange={(val: any) => setSelectedOption(val)}
                optionValueKey="id"
                optionLabelKey="label"
                rightSideIds={true}
              />
            )}
          </Box>
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              position: "sticky",
              bottom: 0,
              backgroundColor: "white",
              zIndex: 1,
            }}
          >
            <PrimaryButton
              label="Cancel"
              startIcon={<CancelIcon />}
              type="button"
              onClick={handleModalClose}
            />
            <PrimaryButton
              label="Submit"
              startIcon={<SaveIcon />}
              type="submit"
              onClick={handleSave}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default RenderQuestionFields;
