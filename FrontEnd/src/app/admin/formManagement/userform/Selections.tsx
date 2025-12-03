import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  Modal,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CustomButton from "app/components/CustomButton ";
import EditIcon from "@mui/icons-material/Edit";
import TextInputField from "app/components/regularinputs/TextInpuField";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";

type Option = {
  id: string;
  name: string;
};

type Selection = {
  name: string;
  questions: any[];
  options: Option[];
};

type Item = {
  id: number;
  name: string;
  options: Option[];
};

interface SelectionProps {
  onSelectionsChange?: (
    selections: { questions: any[]; options: Option[] }[]
  ) => void;
  initialSelections?: Selection[];
  onDeleteOption?: (selectionName: string, optionId: string) => void;
}

const SelectionManager: React.FC<SelectionProps> = ({
  onSelectionsChange,
  initialSelections,
  onDeleteOption,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const cleanedItems = items.filter((item) => item.name?.trim());
    if (cleanedItems.length !== items.length) {
      setItems(cleanedItems);
    }
  }, [items]);

  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    if (initialSelections && initialSelections.length > 0) {
      const mappedItems: Item[] = initialSelections.map((sel, idx) => ({
        id: idx + 1,
        name: sel.name,
        options: sel.options || [],
      }));

      setItems(mappedItems);
      setNextId(mappedItems.length + 1);
      // setSelectedItemId(mappedItems[0].id);
    }
  }, [initialSelections]);

  // Add new selection with empty options
  const handleAdd = () => {
    if (!name.trim()) return;
    setItems([...items, { id: nextId, name, options: [] }]);
    setNextId(nextId + 1);
    setName("");
  };

  // Open modal to add option to selected selection
  const handleCreate = () => {
    setValueInput("");
    setOpenModal(true);
  };

  const handleSaveValue = () => {
    if (selectedItemId === null || !valueInput.trim()) return;

    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === selectedItemId
          ? {
              ...item,
              options: [
                ...item.options,
                { id: String(item.options.length + 1), name: valueInput },
              ],
            }
          : item
      );

      const selections = updated.map((item) => ({
        name: item.name,
        questions: [],
        options: item.options,
      }));

      // Pass selections to parent here:
      if (onSelectionsChange) {
        onSelectionsChange(selections);
      }

      return updated;
    });

    setOpenModal(false);
    setValueInput("");
  };

  const handleEdit = (optionId: string, optionName: string) => {
    setEditingOptionId(optionId);
    setValueInput(optionName);
    setOpenEditModal(true);
  };
  const handleSaveEditedValue = () => {
    if (!editingOptionId || !valueInput.trim() || selectedItemId === null)
      return;

    const updatedItems = items.map((item) =>
      item.id === selectedItemId
        ? {
            ...item,
            options: item.options.map((opt) =>
              opt.id === editingOptionId ? { ...opt, name: valueInput } : opt
            ),
          }
        : item
    );

    setItems(updatedItems);

    if (onSelectionsChange) {
      const selections = updatedItems.map((item) => ({
        name: item.name,
        questions: [],
        options: item.options,
      }));
      onSelectionsChange(selections);
    }

    setOpenEditModal(false);
    setEditingOptionId(null);
    setValueInput("");
  };

  return (
    <Box
      sx={{
        p: "5px",
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          border: "1px solid #ccc",
          p: "8px",
          width: "100%",
        }}
      >
        <Typography sx={{ fontWeight: "bold" }}>Add Selections</Typography>

        {/* Input + Add Button */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            flexShrink: 0,
            alignItems: "center",
          }}
        >
          <TextInputField
            label="Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <IconButton
            color="primary"
            onClick={handleAdd}
            size="small"
            sx={{
              border: "1px solid #ccc",
              width: 36,
              height: 36,
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            sx={{
              height: "1.5em",
              width: "auto",
              mb: 1,
              border: "1px solid black",
              borderRadius: 0,
              backgroundColor: "#fafafa",
              color: "black",
              "&:hover": {
                backgroundImage: "f5f5f5",
                borderColor: "black",
              },
            }}
            onClick={handleCreate}
            disabled={selectedItemId === null}
          >
            Add Option
          </Button>
        </Box>
        {/* Layout with list and details */}
        <Box
          sx={{
            overflow: "hidden",
            display: "flex",
            border: "1px solid #ccc",
            maxHeight: "200px",
          }}
        >
          {/* Left: List */}
          <Box
            sx={{
              width: "30%",
              overflow: "auto",
              padding: "5px",
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "1.1em",
                borderBottom: "1px solid #ccc",
              }}
            >
              Selection list
            </Typography>
            {items.length > 0 && (
              <List sx={{ height: "auto" }}>
                {items.map((item) => (
                  <ListItem
                    key={item.id}
                    divider
                    button
                    selected={selectedItemId === item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "#e3f2fd",
                      },
                    }}
                  >
                    {item.name}
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              display: { xs: "none", md: "block" },
              borderWidth: "1.5px",
              marginX: "5px",
              my: "1px",
            }}
          />
          {/* Right Panel */}
          {/* Right Panel */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden", // Prevent overflow bleed
            }}
          >
            {/* Options Table */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                minHeight: 0, // 💡 Important: enables scrolling inside flex
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  px: 2,
                  py: 1,
                  fontWeight: "bold",
                  borderBottom: "1px solid #ccc",
                  backgroundColor: "#f9f9f9",
                  flexShrink: 0,
                }}
              >
                <Box sx={{ flex: 1 }}>ID</Box>
                <Box sx={{ flex: 1 }}>Name</Box>
                <Box sx={{ flex: 1 }}>Option</Box>
              </Box>

              {items
                .find((item) => item.id === selectedItemId)
                ?.options.map((option) => (
                  <Box
                    key={option.id}
                    sx={{
                      display: "flex",
                      px: 2,
                      py: 1,
                      borderBottom: "1px solid #eee",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>{option.id}</Box>
                    <Box sx={{ flex: 1 }}>{option.name}</Box>
                    <Box sx={{ flex: 1, display: "flex", gap: 0.5 }}>
                      <IconButton
                        onClick={() => handleEdit(option.id, option.name)}
                        sx={{ width: 24, height: 24 }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>

                      <IconButton
                        onClick={() =>
                          onDeleteOption?.(
                            items.find((item) => item.id === selectedItemId)
                              ?.name || "",
                            option.id
                          )
                        }
                        sx={{ width: 24, height: 24 }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
            </Box>
          </Box>
        </Box>
      </Box>
      {/* Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            padding: "1em",
            borderRadius: "8px",
            width: "40%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6">Add Option</Typography>

          <TextInputField
            label="Option Name"
            variant="outlined"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <PrimaryButton
              label="Cancel"
              startIcon={<CancelIcon />}
              type="button"
              onClick={() => setOpenModal(false)}
            />
            <PrimaryButton
              label="Save"
              startIcon={<SaveIcon />}
              type="submit"
              onClick={handleSaveValue}
            />
          </Box>
        </Box>
      </Modal>
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            padding: "1em",
            borderRadius: "8px",
            width: "40%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6">Rename</Typography>
          <TextInputField
            label="Option Name"
            variant="outlined"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <PrimaryButton
              label="Cancel"
              startIcon={<CancelIcon />}
              type="button"
              onClick={() => setOpenEditModal(false)}
            />
            <PrimaryButton
              label="Save"
              startIcon={<SaveIcon />}
              type="submit"
              onClick={handleSaveEditedValue}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default SelectionManager;
