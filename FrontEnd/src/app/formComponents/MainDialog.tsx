// MainDialog.tsx

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  styled,
  Box,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SelectionDropdown from "app/components/regularinputs/SelectionDropdown";

interface DocumentType {
  documentGroupName: any;
  documentTypeId?: number;
  documentTypeName: string;
  documentTypeDescription: string;
  documentGroupId: number;
  documentTypeTableId: number;
}
interface MainDialogProps {
  onClose: () => void;
  onOutsideClick: () => void;
  dialogTitle: string;
  dialogDescription: string;
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  entityDocuments?: any[];
  filteredDocumentGroup?: (filteredDocs: any[]) => void;
  showLocationFilter?: boolean;
}

const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  position: "relative",
  padding: "5px 24px",
  "& .MuiTypography-root": {
    // marginBottom: theme.spacing(1),
  },
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(-1),
  top: theme.spacing(-0.6),
  color: theme.palette.grey[500],
}));

const MainDialog: React.FC<MainDialogProps> = ({
  onClose,
  onOutsideClick,
  dialogTitle,
  dialogDescription,
  children,
  width = "95vw",
  height = "95vh",
  minWidth = "800px",
  minHeight = "450px",
  entityDocuments,
  filteredDocumentGroup,
  showLocationFilter = true,
}) => {
  const [groupedDocuments, setGroupedDocuments] = useState<
    Map<string, DocumentType[]>
  >(new Map());
  const [selectedDocumentName, SetSelectedDocumentName] = useState(null);

  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<
    number | null
  >(null);

  const handleChange = (event: any) => {
    const selectedValue = event.target.value;
    SetSelectedDocumentName(selectedValue);
    const selectedDoc = groupedDocuments.get(selectedValue);
    if (selectedDoc && selectedDoc.length > 0) {
      const documentGroupId = selectedDoc[0].documentGroupId;
      setSelectedDocumentTypeId(documentGroupId);
    }
  };

  useEffect(() => {
    if (showLocationFilter) {
      filteredDocumentGroup && filteredDocumentGroup([]);
    }
  }, [showLocationFilter, filteredDocumentGroup]);

  useEffect(() => {
    if (selectedDocumentTypeId) {
      const filterType = entityDocuments.filter(
        (doc) => doc.documentGroupId === selectedDocumentTypeId
      );
      filteredDocumentGroup(filterType);
    }
  }, [entityDocuments, selectedDocumentTypeId]);

  // Group documents by documentGroupName using Map
  useEffect(() => {
    if (entityDocuments) {
      const actionMap: Map<string, DocumentType[]> = new Map();
      entityDocuments.forEach((doc) => {
        const groupName = doc.documentGroupName;
        // Check if the group already exists in the Map, if not, create it
        if (!actionMap.has(groupName)) {
          actionMap.set(groupName, []);
        }
        // Add the document to the correct group in the Map
        actionMap.get(groupName)?.push(doc);
      });
      // Set the grouped documents state with the Map
      setGroupedDocuments(actionMap);
    }
  }, [entityDocuments]);

  return (
    <Dialog
      open={true}
      onClose={(event, reason) => {
        if (reason === "backdropClick") {
          onOutsideClick();
        } else {
          onClose();
        }
      }}
      maxWidth={"xl"}
      PaperProps={{
        style: {
          width: width,
          height: height,
          minWidth: minWidth,
          minHeight: minHeight,
          padding: "3px 10px",
          maxWidth: "80vw !important",
        },
      }}
    >
      <CustomDialogTitle>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography variant="h6" sx={{ flex: 1 }}>
            {dialogTitle}
            <Typography variant="body1">{dialogDescription}</Typography>
          </Typography>
          {showLocationFilter && (
            <Box sx={{ width: "300px", height: "100%", mr: 2 }}>
              <SelectionDropdown
                label="Select Location"
                options={Array.from(groupedDocuments.keys()).map((g) => ({
                  id: g,
                  label: g,
                }))}
                value={selectedDocumentName || ""}
                onChange={(val: any) =>
                  handleChange({ target: { value: val } } as React.ChangeEvent<{
                    value: unknown;
                  }>)
                }
                optionValueKey="id"
                optionLabelKey="label"
                fullWidth
              />
            </Box>
          )}
        </Box>
      </CustomDialogTitle>
      <DialogContent dividers sx={{ padding: "0.3em" }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default MainDialog;
