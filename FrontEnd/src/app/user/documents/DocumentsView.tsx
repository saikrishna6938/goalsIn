import React, { useEffect, useState } from "react";
import { api } from "api/API";
import { observer } from "mobx-react";
import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import DataGrid from "app/formComponents/DataGrid";
import TabBar from "app/formComponents/TabBar";
import Profile from "./Profile";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import DynamicSearch from "app/appComponents/DynamicSearch";
import { TasksView } from "./TasksView";
import FilePreviewDialog from "../FilePreview";
import { Split } from "app/formComponents/styles/Split";
import GenericDropDown from "../genericCompoenets/GenericDropdown";
import CustomDropDown from "../genericCompoenets/CustomDropDown";
import { applicationsColumns } from "../tasks/samples";
import appStore from "app/mobxStore/AppStore";
import { UserDocument } from "app/types/Form";
import { Apps } from "@mui/icons-material";
import { IndexType } from "app/types/User";

export enum ShowSplitPanel {
  both = 0,
  left = 1,
  right = 2,
}

export interface CreateTaskObject {
  taskName: string;
  answerObjectId: number;
  documentTypeId: number;
  userId: number;
  taskTableId: number;
  taskTagId: number;
  entityId: number;
}

const uniquePeriod = [
  { period: "3 months", value: 3 },
  { period: "6 months", value: 6 },
  { period: "9 months", value: 9 },
  { period: "12 months", value: 12 },
];

export const fieldData = [
  { name: "Id", type: "INT AUTO_INCREMENT PRIMARY KEY", searchField: false },
  { name: "Name", type: "VARCHAR(255)", searchField: false },
  { name: "Concentration", type: "VARCHAR(255)", searchField: true },
  { name: "StudyLevelId", type: "INT", searchField: false },
  { name: "StudyLvl", type: "VARCHAR(100)", searchField: false },
  { name: "Country", type: "VARCHAR(100)", searchField: true },
  { name: "University", type: "VARCHAR(255)", searchField: true },
  { name: "Country1", type: "VARCHAR(100)", searchField: false },
  { name: "Duration", type: "VARCHAR(50)", searchField: false },
  { name: "UniversityId", type: "INT", searchField: false },
  { name: "WorkExp", type: "VARCHAR(100)", searchField: false },
  { name: "IeltsOverall", type: "FLOAT" },
  { name: "ToeflScore", type: "FLOAT", searchField: true },
  { name: "PteScore", type: "FLOAT", searchField: true },
  { name: "SatScore", type: "FLOAT", searchField: true },
  { name: "ActScore", type: "FLOAT", searchField: true },
  { name: "GreScore", type: "FLOAT", searchField: true },
  { name: "GmatScore", type: "FLOAT", searchField: true },
  { name: "DETScore", type: "FLOAT", searchField: true },
];

const DocumentsView: React.FC = observer(() => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<UserDocument[]>(
    []
  );
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null
  );
  const [selectedAnswerId, setSelectedAnswerId] = useState<number>(-1);
  const [formData, setFormData] = useState<any>(null);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [refreshTable, setRefreshTable] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [documentTypeTableId, setDocumentTypeTableId] = useState<number>(-1);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [selectedIntake, setSelectedIntake] = useState<any | null>(null);
  const [splitView, setSplitView] = useState<ShowSplitPanel>(
    ShowSplitPanel.both
  );
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  const userId = appStore.loginResponse.user[0].userId;
  const user = appStore.loginResponse.user[0];
  const [groupNames, setGroupNames] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(3);
  const [showSkeletonLoader, SetShowSkeletonLoader] = useState(false);

  // Fetch applicant data
  useEffect(() => {
    const fetchApplicantData = async () => {
      SetShowSkeletonLoader(true);
      setSelectedLocation(null);
      setSelectedIntake(null);
      try {
        const response = await api.get(
          `user/document-types/${appStore.loginResponse.user[0].userId}/${IndexType.APPLY}`
        );
        const uniqueGroupNames = [
          ...new Set(response.data.map((item) => item.documentGroupName)),
        ];
        setGroupNames(uniqueGroupNames);

        const res = await api.post("applications", {
          body: {
            entityId: appStore.selectedEntity,
            userId,
            period: selectedPeriod,
          },
        });
        if (res.status) {
          setDocuments(res.data);

          const filteredByGroup = res.data.filter((doc) =>
            uniqueGroupNames.includes(doc.documentGroupName)
          );

          setFilteredDocuments(filteredByGroup);
          if (res.data.length > 0) {
            const initialDocument = res.data[0];
            setCurrentDocument({
              ...initialDocument,
              documentTypeObject: null,
            });
            setSelectedUserId(initialDocument?.userId);
            setSelectedDocumentId(initialDocument?.documentTypeId);
            setDocumentTypeTableId(initialDocument?.documentTypeTableId);

            const response = await api.post("get-application-id", {
              body: { documentTypeAnswersId: initialDocument.id },
            });
            if (response.status) {
              updateInitialValues(
                response.data.documentTypeObject.sections,
                JSON.parse(response.data.documentTypeAnswersObject)
              );
              setFormData(response.data.documentTypeObject);
              setSelectedAnswerId(response.data.documentTypeAnswersId);
              setCurrentDocument({
                ...response.data,
                documentGroupName: initialDocument.documentGroupName,
              });
            }
          } else {
            setCurrentDocument(null);
            setFormData(null);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        SetShowSkeletonLoader(false);
      }
    };

    fetchApplicantData();
  }, [appStore.selectedEntity, userId]);

  // Apply filters when location or intake change
  useEffect(() => {
    const applyFilters = async () => {
      try {
        let filteredData = [...documents];

        if (selectedLocation && selectedLocation !== -1) {
          filteredData = filteredData.filter(
            (doc) => doc.documentGroupName === selectedLocation
          );
        }

        if (selectedIntake && selectedIntake !== -1) {
          filteredData = filteredData.filter(
            (doc) => doc.documentTypeName === selectedIntake
          );
        }
        setFilteredDocuments(filteredData);

        if (filteredData.length > 0) {
          const response = await api.post("get-application-id", {
            body: { documentTypeAnswersId: filteredData[0].id },
          });

          if (response.status) {
            updateInitialValues(
              response.data.documentTypeObject.sections,
              JSON.parse(response.data.documentTypeAnswersObject)
            );
            setSelectedDocumentId(response.data.documentTypeId);
            setFormData(response.data.documentTypeObject);
            setCurrentDocument(response.data);
            setDocumentTypeTableId(response.data.documentTypeTableId);
            setSelectedAnswerId(response.data.documentTypeAnswersId);
          }
        } else {
          setFormData(null);
          setCurrentDocument(null);
        }
      } catch (error) {
        console.error("Error applying filters:", error);
      }
    };

    if (selectedLocation || selectedIntake) {
      applyFilters();
    }
  }, [selectedLocation, selectedIntake, documents]);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
    setSplitView(newValue === 1 ? ShowSplitPanel.right : ShowSplitPanel.both);
  };

  const getCurrentDocument = async (selectedId: number) => {
    setSelectedAnswerId(selectedId);
    const selectedDocument = documents.find((d) => d.id === selectedId);
    if (selectedDocument) {
      setSelectedUserId(selectedDocument.userId);
      setSelectedDocumentId(selectedDocument.documentTypeId);
      setDocumentTypeTableId(selectedDocument.documentTypeTableId);

      try {
        const response = await api.post("get-application-id", {
          body: { documentTypeAnswersId: selectedId },
        });
        if (response.status) {
          updateInitialValues(
            response.data.documentTypeObject.sections,
            JSON.parse(response.data.documentTypeAnswersObject)
          );
          setFormData(response.data.documentTypeObject);
          setCurrentDocument({
            ...response.data,
            documentGroupName: selectedDocument.documentGroupName,
          });
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    }
  };

  const onCreateTask = async (tagId: number, tagName: string) => {
    const documentType = documents.find((d) => d.id === selectedAnswerId);
    if (!documentType) return;

    const { id, documentTypeId, documentTypeTableId, userId } = documentType;
    const taskObject: CreateTaskObject = {
      answerObjectId: id,
      documentTypeId,
      taskName: tagName,
      taskTableId: documentTypeTableId,
      taskTagId: tagId,
      userId,
      entityId: appStore.selectedEntity,
    };

    try {
      const response = await api.post("task/add", { body: taskObject });
      appStore.showToast(
        response.message,
        response.success ? "success" : "error"
      );
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const openDialogPrompt = async (file: any) => {
    setLoading(true);
    setOpen(true);
    try {
      const response = await api.post("get/filedata", {
        body: { uploadId: file.uploadId },
      });
      if (response?.data?.fileData) {
        setBlobUrl(response.data.fileData);
      } else {
        console.error("Invalid response or no file data received.");
      }
    } catch (error) {
      console.error("Error fetching file data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    URL.revokeObjectURL(blobUrl);
    setBlobUrl("");
    setOpen(false);
  };

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await api.get(`get-user-entities/${user.userId}`);
        setEntities(response.data);
        if (appStore.selectedEntity === -1) {
          const defaultEntity = response.data[0].entityId;
          appStore.setSelectedEntity(defaultEntity);
        }
      } catch (error) {
        console.error("Error fetching user entities:", error);
      }
    };

    fetchEntities();
  }, [appStore.selectedEntity, user.userId]);

  const handleEntityChange = (selectedValue: any) => {
    setSelectedEntity(selectedValue);
    appStore.selectedEntity = Number(selectedValue);
  };

  const uniqueLocation = [
    ...new Map(
      documents
        .filter((d) => groupNames.includes(d.documentGroupName))
        .map((doc) => [doc.documentGroupName, doc])
    ).values(),
  ];

  const uniqueIntake = [
    ...new Map(documents.map((doc) => [doc.documentTypeName, doc])).values(),
  ];

  const handleLocation = (location: any) => {
    setSelectedLocation(
      location === -1 ? location : location.documentGroupName
    );
  };

  const handleIntake = (intake: any) => {
    setSelectedIntake(intake === -1 ? intake : intake.documentTypeName);
  };

  const handlePeriod = async (selectedOption: any) => {
    try {
      const response = await api.post(
        `applications?period=${selectedOption.value}`,
        {
          body: {
            period: selectedOption.value,
            entityId: appStore.selectedEntity,
            userId,
          },
        }
      );

      if (response?.status) {
        setDocuments(response.data);
        setFilteredDocuments(response.data);

        if (!response.data || response.data.length === 0) {
          setCurrentDocument(null);
          setFormData(null);
        }
      }
    } catch (err) {
      throw err;
    }
  };

  const renderTab = (tab: number) => {
    switch (tab) {
      case 0:
        return currentDocument ? (
          <Profile
            {...currentDocument}
            openFile={openDialogPrompt}
            maxHeight="calc(100vh - 100px)"
          />
        ) : null;
      case 1:
        return formData ? (
          <DynamicSearch
            data={formData}
            selectedId={selectedDocumentId}
            onApply={onCreateTask}
            refreshGrid={refreshTable}
            documentTableId={documentTypeTableId}
            {...currentDocument}
          />
        ) : null;
      case 2:
        return currentDocument ? (
          <TasksView userId={selectedUserId} {...currentDocument} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#ffffff",
          height: "calc(100vh - 95px)",
          maxHeight: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            overflowY: "auto",
            overflowX: "hidden",
            width: "100%",
            borderRadius: "4px",
            height: "100%",
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderBottom: "1px solid #ccc",
            }}
          >
            <Split
              showLeft={
                splitView === ShowSplitPanel.both ||
                splitView === ShowSplitPanel.left
              }
              showRight={
                splitView === ShowSplitPanel.both ||
                splitView === ShowSplitPanel.right
              }
              left={
                <div
                  style={{
                    marginRight: "5px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <HeaderBox
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      overflow: "hidden",
                      flexWrap: "nowrap",
                      height: "55px",
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        fontSize: 15,
                        ml: "16px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Applicants
                    </Typography>
                    <GenericDropDown
                      headerLabel=" Filter By Entity"
                      selectedFontSize="0.88rem"
                      options={entities}
                      label={
                        appStore.userEntities.find(
                          (e) => e.entityId === appStore.selectedEntity
                        )?.entityName || "Select Entity"
                      }
                      onChange={handleEntityChange}
                      renderOption={(option) => <>{option.entityName}</>}
                    />
                  </HeaderBox>

                  <Box sx={{ flex: 1, overflow: "hidden" }}>
                    <DataGrid
                      showSkeletonLoader={showSkeletonLoader}
                      onSelection={(id) => {
                        if (documents.length > 0) {
                          getCurrentDocument(id);
                        }
                      }}
                      tasks={filteredDocuments as any}
                      columns={applicationsColumns}
                      defaultHeight="100%"
                      headerRender={
                        <Box sx={{ display: "flex" }}>
                          <CustomDropDown
                            label="Period"
                            options={uniquePeriod}
                            value={uniquePeriod.find(
                              (p) => p.value === selectedPeriod
                            )}
                            onChange={(option: any) => {
                              setSelectedPeriod(option.value);
                              handlePeriod(option);
                            }}
                            renderOption={(option: any) => <>{option.period}</>}
                          />

                          <CustomDropDown
                            label="Location"
                            options={uniqueLocation}
                            onChange={handleLocation}
                            renderOption={(doc: any) => (
                              <>{doc.documentGroupName}</>
                            )}
                          />

                          <CustomDropDown
                            label="Intake"
                            options={uniqueIntake}
                            onChange={handleIntake}
                            renderOption={(doc: any) => (
                              <>{doc.documentTypeName}</>
                            )}
                          />
                        </Box>
                      }
                    />
                  </Box>
                </div>
              }
              right={
                <div
                  style={{
                    marginRight: "5px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: "4px",
                  }}
                >
                  <TabBar
                    value={selectedTab}
                    onChange={handleTabChange}
                    tabs={["Profile", "Search & Apply", "Applications"]}
                  />
                  <Box
                    sx={{
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    {renderTab(selectedTab)}
                  </Box>
                </div>
              }
            />
          </Box>
        </Box>
      </div>
      <Box>
        <FilePreviewDialog
          open={open}
          blobUrl={blobUrl}
          handleClose={handleClose}
          loading={loading}
          key="File-Preview-Dialog"
        />
      </Box>
    </>
  );
});

export default DocumentsView;

export function updateInitialValues(formData: any[], answerObject: any): any[] {
  formData.forEach((section) => {
    section.formDetails.forEach((formDetail: any) => {
      if (section.repeated) {
        const newFormData = { ...formDetail };
        const formValues = [...newFormData.form];

        const values = findCorrespondingKeys(
          section.initialValues,
          answerObject
        );
        const groupedValues: { [key: string]: any[] } = {};

        Object.entries(values).forEach(([key, val]) => {
          const [_, index] = key.split("-");
          if (!groupedValues[index]) {
            groupedValues[index] = [];
          }
          const obj = { ...formValues[0], order: key };
          groupedValues[index].push(obj);

          if (!section.initialValues.hasOwnProperty(key)) {
            section.initialValues[key] = val;
          }
        });

        Object.values(groupedValues).forEach((objects) => {
          section.formDetails.push({
            ...newFormData,
            form: objects,
          });
        });
      }
    });

    // Update section.initialValues with values from answerObject
    for (const key in section.initialValues) {
      if (answerObject?.hasOwnProperty(key)) {
        section.initialValues[key] = answerObject[key];
      }
    }
  });

  return formData;
}

export function findCorrespondingKeys(
  initialValues: any,
  answerObject: any
): any {
  const foundKeys: { [key: string]: any } = {};

  for (const key in initialValues) {
    if (initialValues.hasOwnProperty(key)) {
      let index = 0;
      let dynamicKey = `${key}-${index}`;
      while (answerObject.hasOwnProperty(dynamicKey)) {
        foundKeys[dynamicKey] = answerObject[dynamicKey];
        index += 1;
        dynamicKey = `${key}-${index}`;
      }
    }
  }

  return foundKeys;
}
