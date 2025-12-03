import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import appStore from "app/mobxStore/AppStore";
import { api } from "api/API";
import Loading from "app/components/Loading";
import dashboardStore from "./DashboardStore";
import { toJS } from "mobx";
import { IndexType } from "app/types/User";

interface DocumentType {
  documentGroupName: string;
  documentTypeId?: number;
  documentTypeName: string;
  documentTypeDescription: string;
  documentGroupId: number;
  documentTypeTableId: number;
}

interface GlobalFiltersProps {
  onEntityChange?: (entity: string) => void;
  onSetselctedId?: (id: number) => void;
  defaultPeriod?: string;
  defaultDocumentType?: string;
  defaultSelecteGroupdId: string;
  defaultSelectLocation: string;
  onSelectPeriod: any;
  onSelectDoc: any;
  defaulEntityId?: any;
}

const GlobalFilters: React.FC<GlobalFiltersProps> = ({
  onEntityChange,
  onSetselctedId,
  defaultPeriod,
  defaultDocumentType,
  defaultSelecteGroupdId,
  onSelectPeriod,
  onSelectDoc,
  defaultSelectLocation,
  defaulEntityId,
}) => {
  // console.log("dashboardStore.selectedEntity ", dashboardStore.selectedPeriod);
  const [entities, setEntities] = useState(dashboardStore.entities);
  const [dropEntity, setDropEntity] = useState(defaulEntityId || "");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    defaultPeriod || ""
  );
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [groupedDocuments, setGroupedDocuments] = useState<
    Map<string, DocumentType[]>
  >(new Map());
  const [selectedDocumentName, SetSelectedDocumentName] = useState(
    defaultSelectLocation || null
  );
  const [filteredDocumentGroup, setFilteredDocumentGruop] = useState<
    DocumentType[]
  >([]);
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<
    any | null
  >(defaultSelecteGroupdId || null);

  const [selectedDocumentTypeName, SetSelectedDocumentTypeName] = useState<
    any | null
  >(defaultDocumentType || null);

  const [periodOptions, setPeriodOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [loading, SetLoading] = useState(true);

  useEffect(() => {
    generatePeriodOptions();
  }, []);

  useEffect(() => {
    if (dashboardStore.documentType.length === 0) {
      fetchData();
    } else {
      setDocumentTypes(dashboardStore.documentType);
      SetLoading(false);
    }
  }, []);

  const generatePeriodOptions = () => {
    const options = [];
    const currentDate = new Date();
    const startYear = currentDate.getFullYear();
    const endYear = 2025;

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const formattedMonth = String(month).padStart(2, "0");
        const value = `${formattedMonth}${year}`;
        options.push({ label: value, value });
      }
    }
    dashboardStore.setSelectedPeriod(options);
    setPeriodOptions(options);
  };

  useEffect(() => {
    if (entities.length === 0) {
      api
        .get(`get-user-entities/${appStore.loginResponse.user[0].userId}`)
        .then((res) => {
          if (res.success) {
            setEntities(res.data ?? []);
            dashboardStore.setEntities(res.data ?? []);
          }
        });
    }
  }, [entities]);

  const fetchData = async () => {
    try {
      const response = await api.get(
        `user/document-types/${appStore.loginResponse.user[0].userId}/${IndexType.APPLY}`
      );
      if (response.data) {
        setDocumentTypes(response.data);
        dashboardStore.setDocumentType(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      SetLoading(false);
    }
  };

  useEffect(() => {
    const actionMap = new Map<string, DocumentType[]>();
    documentTypes.forEach((doc) => {
      const groupName = doc.documentGroupName;
      if (!actionMap.has(groupName)) {
        actionMap.set(groupName, []);
      }
      actionMap.get(groupName)?.push(doc);
    });
    setGroupedDocuments(actionMap);
  }, [documentTypes]);

  useEffect(() => {
    if (selectedDocumentTypeId) {
      const filterType = documentTypes.filter(
        (doc) => doc.documentGroupId === selectedDocumentTypeId
      );
      setFilteredDocumentGruop(filterType);
    } else {
      setFilteredDocumentGruop([]);
    }
  }, [documentTypes, selectedDocumentTypeId]);

  const handleEntityChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setDropEntity(value);
    // dashboardStore.setSelectedEntity(value);
    onEntityChange(value);
  };

  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedPeriod(value);
    onSelectPeriod(value);
  };

  const handleGroupChange = (event) => {
    const selectedValue = event.target.value;
    dashboardStore.setSelectedLocation(selectedValue);
    SetSelectedDocumentName(selectedValue);
    const selectedDocuments = groupedDocuments.get(selectedValue);

    if (selectedDocuments && selectedDocuments.length > 0) {
      const documentGroupId = selectedDocuments[0].documentGroupId;
      setSelectedDocumentTypeId(documentGroupId);
      onSetselctedId(documentGroupId);
    }
  };

  const FilterGroupData = filteredDocumentGroup
    .filter((doc) => doc.documentTypeName)
    .map((doc) => ({
      id: doc.documentTypeId,
      name: doc.documentTypeName,
      table: doc.documentTypeTableId,
    }));

  const handlevalue = (event) => {
    const selectedValue = event.target.value;
    SetSelectedDocumentTypeName(selectedValue);

    const selectedDocumentType = FilterGroupData.find(
      (doc) => doc.name === selectedValue
    );
    if (selectedDocumentType) {
      onSelectDoc(selectedDocumentType);
      dashboardStore.setSelectedDocumentObject(selectedDocumentType);
    }
  };

  return (
    <div style={{}}>
      <>
        {loading ? (
          <Box
            sx={{
              height: "50vh",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <Loading />
          </Box>
        ) : (
          <Box
            sx={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "5px",
            }}
          >
            {/* Entity Dropdown */}
            <Typography>Select Entity</Typography>
            <FormControl fullWidth margin="dense">
              <InputLabel
                sx={{
                  top: "-3px",
                  backgroundColor: "white",
                }}
              >
                Entity
              </InputLabel>{" "}
              <Select value={dropEntity} onChange={handleEntityChange}>
                {entities?.map((item, index) => (
                  <MenuItem key={index} value={item.entityId}>
                    {item.entityName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Period Dropdown */}
            <Typography>Select Period</Typography>
            <FormControl fullWidth margin="dense">
              <InputLabel sx={{ top: "-3px", backgroundColor: "white" }}>
                Period
              </InputLabel>
              <Select
                value={selectedPeriod}
                onChange={handlePeriodChange}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: "150px",
                      overflowY: "auto",
                    },
                  },
                }}
              >
                {periodOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* location Group Dropdown */}
            <Typography>Select Location</Typography>
            <FormControl fullWidth margin="dense">
              <InputLabel
                sx={{
                  top: "-3px",
                  backgroundColor: "white",
                }}
              >
                Document Group
              </InputLabel>
              <Select value={selectedDocumentName} onChange={handleGroupChange}>
                {Array.from(groupedDocuments.entries()).map(([groupName]) => (
                  <MenuItem key={groupName} value={groupName}>
                    {groupName}{" "}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Document Group Based on Location Dropdown */}
            {defaultDocumentType || selectedDocumentTypeId ? (
              FilterGroupData.length > 0 ? (
                <>
                  <Typography>Select Intake</Typography>
                  <FormControl fullWidth margin="dense">
                    <InputLabel
                      sx={{
                        top: "-3px",
                        backgroundColor: "white",
                      }}
                    >
                      Select Intake
                    </InputLabel>
                    <Select
                      value={selectedDocumentTypeName || ""}
                      label="Select Document"
                      onChange={handlevalue}
                    >
                      {FilterGroupData.map((item, index) => (
                        <MenuItem key={index} value={item.name}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <Box
                  sx={{
                    padding: "16px",
                    border: "1px solid #eeeeee",
                    borderRadius: "4px",
                    color: "#757575",
                    fontStyle: "italic",
                    mt: "8px",
                  }}
                >
                  No document names available.
                </Box>
              )
            ) : null}
          </Box>
        )}
      </>
    </div>
  );
};

export default GlobalFilters;
