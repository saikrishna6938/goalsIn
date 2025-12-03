import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Typography,
  Box,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  Modal,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { styled } from "@mui/material/styles";
import { Themecolors, fonts } from "api/Colors";

import DataGrid from "app/formComponents/DataGrid";
import { convertIdToLowerCase } from "app/user/tasks/samples";
import { api } from "api/API";
import SearchFilters from "app/appComponents/SearchFilters";
import appStore from "app/mobxStore/AppStore";
import TaskTagDetails from "../TaskTagDetails";
import CloseIcon from "@mui/icons-material/Close";
import Loading from "app/components/Loading";
import ApplicationEdit from "./ApplicationEdit";
import { Label } from "@mui/icons-material";
import { hasUserSettings, UserSettingTypes } from "app/types/User";
import { IndexType } from "app/types/User";
import SelectionDropdown from "app/components/regularinputs/SelectionDropdown";

const StyledFieldContainer = styled(Box)(({ theme }) => ({
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  // Remove parent border and radius for a flat container
  border: "none",
  borderRadius: 0,
  padding: theme.spacing(1),
  margin: theme.spacing(0.5),
  maxHeight: "calc(100vh - 180px)",
  // Add bottom padding so the last panel isn't clipped when scrolled
  paddingBottom: theme.spacing(2),
}));

export const RightAlignedButton = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
});

interface FormData {
  documentTagType: string;
  selections: Array<{
    questions: number[];
    options: {
      id: string;
      name: string;
    }[];
  }>;
  filterOptions: number[];
  sections: {
    sectionName: string;
    initialValues: Record<string, string>;
    formDetails: {
      groupName: string;
      repeated: boolean;
      form: {
        order: string;
        attributeName: string;
        attributeDescription: string;
        attributeType: string;
      }[];
    }[];
  }[];
}

interface DocumentType {
  documentGroupName: any;
  documentTypeId?: number;
  documentTypeName: string;
  documentTypeDescription: string;
  documentGroupId: number;
  documentTypeTableId: number;
}

interface DynamicFormProps {
  data: FormData;
  selectedId: number;
  onApply: (tagId: number, tagName: string) => void;
  refreshGrid: boolean;
  documentTableId: number;
  Name?: string;
  userEmail?: string;
  userImage?: any;
}

const SearchFilter: React.FC<DynamicFormProps> = ({
  selectedId,
  onApply,
  refreshGrid,
  documentTableId,
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [values, setValues] = useState<any>({});
  const [fields, setFields] = useState([]);
  const [searchTags, setSearchTags] = useState([]);
  const [searchValues, setSearchValues] = useState([]);
  const [load, SetLoad] = useState(0);
  const [fieldsData, SetFieldsData] = useState([]);
  const [selectedDocumentTypeTableId, setSelectedDocumentTypeTableId] =
    useState<number | null>(null);
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<
    number | null
  >(null);
  const [selectedDocumentName, SetSelectedDocumentName] = useState(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [filteredDocumentGroup, setFilteredDocumentGruop] = useState<
    DocumentType[]
  >([]);
  const [selectedDocumentTypeName, SetSelectedDocumentTypeName] = useState<
    number | null
  >(null);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRow, SetSelectedRow] = useState();
  const userId = appStore.loginResponse.user[0].userId;
  const [groupedDocuments, setGroupedDocuments] = useState<
    Map<string, DocumentType[]>
  >(new Map());
  const [selectedEditRow, SetSelecteEditdRow] = useState<any>(null);

  const InternalTagUpdate = hasUserSettings(
    appStore.loginResponse.userSettings,
    UserSettingTypes.InternalTagUpdate
  );
  const [showSkeletonLoader, SetShowSkeletonLoader] = useState(false);

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

  const FilterGroupData = filteredDocumentGroup
    .filter((doc) => doc.documentTypeName)
    .map((doc) => ({
      id: doc.documentTypeId,
      name: doc.documentTypeName,
      table: doc.documentTypeTableId,
    }));

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    setSearchValues([]);
  }, [selectedId]);

  useEffect(() => {
    if (formValues) initdataGrid(formValues);
  }, [refreshGrid]);

  useEffect(() => {
    handleClick();
  }, []);

  const handleClick = async () => {
    try {
      const response = await api.get(
        `user/document-types/${appStore.loginResponse.user[0].userId}/${IndexType.APPLY}`
      );

      if (response.data) {
        setDocumentTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (selectedDocumentTypeTableId)
      api.get(`task/search-tags/${selectedDocumentTypeTableId}`).then((res) => {
        if (res.status) {
          setSearchTags(res.data);
        }
      });
  }, [selectedDocumentTypeTableId]);

  const initdataGrid = (values) => {
    if (values && Object.keys(values).length > 0) {
      SetShowSkeletonLoader(true);
    }
    api
      .post(`search-document-table`, {
        body: {
          documentTypeId: selectedDocumentTypeName,
          userId: userId,
          search: values,
        },
      })
      .then((res) => {
        if (res.data) {
          const values = convertIdToLowerCase(res.data);
          const columns = res.fields
            .filter((f) => f.isVisible === true)
            .map((v) => {
              const type = String(v.type).includes("Int") ? "number" : "string";
              let val = v.name;
              if (String(v.name).toLowerCase() === "id")
                val = val.toLowerCase();

              return { id: val, label: v.name, type: type };
            });
          setFields(columns);
          setSearchValues(values);
        }
        SetFieldsData(res.fields);
      })
      .finally(() => {
        SetShowSkeletonLoader(false);
      });
  };

  const handleSubmit = () => {
    let filteredValues = removeEmptyKeys(values);
    initdataGrid(filteredValues);
    setFormValues(filteredValues);
  };

  const clearAllFilters = () => {
    // SetSelectedDocumentName(null);
    setValues({});
    SetLoad((prv) => prv + 1);
    // setSelectedDocumentTypeId(null);
    // SetSelectedDocumentTypeName(null);
  };

  // Group documents by documentGroupName using Map
  useEffect(() => {
    if (documentTypes) {
      const actionMap: Map<string, DocumentType[]> = new Map();
      documentTypes.forEach((doc) => {
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
  }, [documentTypes]);

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    SetSelectedDocumentName(selectedValue);
    const selectedDocuments = groupedDocuments.get(selectedValue);

    if (selectedDocuments && selectedDocuments.length > 0) {
      const documentGroupId = selectedDocuments[0].documentGroupId;
      setSelectedDocumentTypeId(documentGroupId);
    } else {
      setSelectedDocumentTypeId(null);
    }
  };

  const handlevalue = (event) => {
    const selectedValue = event.target.value;
    SetSelectedDocumentTypeName(selectedValue);
    const selectedDocumentType = FilterGroupData.find(
      (doc) => doc.id === selectedValue
    );

    if (selectedDocumentType) {
      setSelectedDocumentTypeTableId(selectedDocumentType.table);
    } else {
      console.log("No matching document type found.");
    }
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setOpenEditModal(false);
    SetSelectedRow(null);
    SetSelecteEditdRow(null);
  };

  const handleSaveButtonClick = async () => {
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setOpenEditModal(null);
    SetSelecteEditdRow(null);
  };

  const handleViewClick = (tagId) => {
    const selected: any = searchValues.find((f) => f.id === tagId);
    setOpenModal(true);
    SetSelectedRow(selected.id);
  };

  const handleEditClick = (tagId) => {
    const selected: any = searchValues.find((f) => f.id === tagId);
    setOpenEditModal(true);
    SetSelectedRow(selected.id);
    SetSelecteEditdRow(selected);
  };

  const buttons = [
    {
      buttons: [
        {
          label: "View",
          onClick: handleViewClick,
        },
        ...(InternalTagUpdate
          ? [
              {
                label: "Edit",
                onClick: handleEditClick,
              },
            ]
          : []),
      ],
    },
  ];

  const renderSearchFields = () => {
    return (
      <div>
        <Box
          sx={{
            backgroundColor: "white",
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            // Removed outer border for cleaner look
          }}
        >
          <Box
            sx={{
              backgroundColor: isCollapsed ? "rgb(250 250 250)" : "",
            }}
          >
            {isCollapsed ? (
              <Tooltip title="Search Filters" arrow>
                <IconButton color="primary" onClick={toggleCollapse}>
                  <ChevronRightIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Box>
                <IconButton color="primary" onClick={toggleCollapse}>
                  <KeyboardArrowLeftIcon />
                </IconButton>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    fontFamily: fonts.poppins,
                  }}
                >
                  Search Filters
                </Typography>
              </Box>
            )}
          </Box>
          {!isCollapsed && (
            <Box overflow={"hidden"} sx={{ height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 0.5,
                  backgroundColor: "#f5f5f5",
                  mb: 1,
                }}
              >
                <Button
                  size="small"
                  variant={"outlined"}
                  onClick={clearAllFilters}
                  sx={{ height: 28 }}
                >
                  Clear Filter
                </Button>
                {searchTags.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="info"
                    onClick={() => {
                      handleSubmit();
                    }}
                    sx={{
                      borderColor: Themecolors.Button1,
                      backgroundColor: Themecolors.Button1,
                      color: Themecolors.Button2,
                      "&:hover": {
                        backgroundImage: Themecolors.B_hv1,
                        borderColor: Themecolors.Button1,
                        backgroundColor: Themecolors.Button1,
                      },
                    }}
                    disabled={Object.values(values).every((val) => val === "")}
                  >
                    Search
                  </Button>
                )}
              </Box>
              <Box
                sx={{
                  height: "100%",
                }}
              >
                <StyledFieldContainer key={"search-bar"}>
                  <Box
                    sx={{
                      border: "1px solid #eeeeee",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      boxShadow: "0 1.5px 3px rgba(0, 0, 0, 0.1)",
                      p: 1.5,
                    }}
                  >
                    <SelectionDropdown
                      label="Select Location"
                      options={Array.from(groupedDocuments.keys()).map((g) => ({
                        id: g,
                        label: g,
                      }))}
                      value={selectedDocumentName || ""}
                      onChange={(val) => {
                        handleChange({
                          target: { value: val },
                        } as React.ChangeEvent<{ value: unknown }>);
                      }}
                      optionValueKey="id"
                      optionLabelKey="label"
                      fullWidth
                    />
                    <Box sx={{ mt: 1.5 }}>
                      {selectedDocumentTypeId ? (
                        FilterGroupData.length > 0 ? (
                          <SelectionDropdown
                            label="Select Document"
                            options={FilterGroupData.map((item) => ({
                              id: item.id,
                              label: item.name,
                            }))}
                            value={selectedDocumentTypeName || ""}
                            onChange={(val) =>
                              handlevalue({
                                target: { value: val },
                              } as React.ChangeEvent<{ value: unknown }>)
                            }
                            optionValueKey="id"
                            optionLabelKey="label"
                            fullWidth
                          />
                        ) : (
                          <Box
                            sx={{
                              p: 1,
                              border: "1px solid #eeeeee",
                              borderRadius: "4px",
                              color: "#757575",
                              fontStyle: "italic",
                              m: 1,
                            }}
                          >
                            No document names available.
                          </Box>
                        )
                      ) : null}
                    </Box>{" "}
                  </Box>

                  <SearchFilters
                    key={load}
                    data={searchTags}
                    setValues={setValues}
                  />
                </StyledFieldContainer>
              </Box>
            </Box>
          )}
        </Box>
      </div>
    );
  };
  return (
    <Box
      sx={{
        height: "91.2vh",
        overflow: "hidden",
        display: "flex",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "row",
          flex: 1,
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            height: isCollapsed ? "50px" : "100%",
            width: isCollapsed ? "50px" : "350px",
            minWidth: isCollapsed ? "50px" : "350px",
            transition: "all 0.3s ease-in-out",
            overflow: "hidden",
          }}
        >
          {renderSearchFields()}
        </Box>
        <Box
          sx={{
            ml: "2px",
            height: "100%",
          }}
        >
          <Box sx={{ height: "100%" }}>
            <DataGrid
              key={"search-grid"}
              tasks={searchValues}
              showSkeletonLoader={showSkeletonLoader}
              columns={fields ?? []}
              onSelection={(v) => {}}
              showButton={true}
              defaultHeight="100%"
              defaultRowsPage={50}
              buttons={buttons}
              renderOptions={
                InternalTagUpdate &&
                fieldsData.length > 0 && (
                  <Button
                    onClick={handleSaveButtonClick}
                    sx={{
                      fontSize: "0.78rem",
                      height: "2.2em",
                      margin: "2px",
                      mr: "20px",
                      border: `1px solid ${Themecolors.Button_bg3}`,
                      backgroundColor: Themecolors.Button_bg3,
                      color: Themecolors.Button2,
                      "&:hover": {
                        backgroundImage: Themecolors.B_hv3,
                        backgroundColor: Themecolors.Button_bg3,
                        border: `1px solid ${Themecolors.Button_bg3}`,
                      },
                      fontFamily: fonts.inter,
                    }}
                  >
                    Add New
                  </Button>
                )
              }
            />
          </Box>
        </Box>
      </Box>
      <Box>
        <Modal open={openModal} onClose={handleModalClose}>
          <Box>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                boxShadow: 24,
                paddingY: "1.5em",
                paddingX: "0.5em",
                borderRadius: "8px",
                width: "60%",
                height: "90%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "0.23em",
                  right: "0.55em",
                  cursor: "pointer",
                  fontSize: 14,
                }}
                onClick={handleModalClose}
              >
                <CloseIcon />
              </Box>

              <Typography
                sx={{
                  mt: "23px",
                  width: "100%",
                  height: "85vh",
                  maxHeight: "100%",
                  overflow: "auto",
                  fontFamily: fonts.inter,
                }}
              >
                <TaskTagDetails
                  taskTagId={selectedRow}
                  taskTableId={selectedDocumentTypeTableId}
                />
              </Typography>
            </Box>
          </Box>
        </Modal>
      </Box>
      <Box>
        <Modal open={openEditModal} onClose={handleCloseEditModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              borderRadius: "8px",
              width: "70%",
              height: "90%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              padding: "15px",
            }}
          >
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              <ApplicationEdit
                selectedEditRow={selectedEditRow}
                handleModalClose={handleModalClose}
                documentTypeTableId={selectedDocumentTypeTableId}
                handleSubmit={handleSubmit}
                fields={fieldsData}
              />
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default SearchFilter;

export const removeEmptyKeys = (obj: any): any => {
  // Create a new object without modifying the original
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== "")
  );
};
