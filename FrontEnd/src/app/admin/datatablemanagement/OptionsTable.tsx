import React, { useEffect, useState } from "react";
import DataGrid from "app/formComponents/DataGrid";
import FilterButtonComponent from "app/formComponents/FilterButtonComponent";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import { api } from "api/API";
import { Split } from "app/formComponents/styles/Split";
import TabBar from "app/formComponents/TabBar";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  Avatar,
} from "@mui/material";
import CustomButton from "app/components/CustomButton ";
import Details from "./DetailsDataTable";
import DetailsDataTable from "./DetailsDataTable";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const optionsColumns: any = [
  { id: "id", label: "ID", type: "number" },
  { id: "optionName", label: "Option Name", type: "string" },
];

const OptionsTable: React.FC = () => {
  const [optionsData, setOptionsData] = useState<any[]>([]);
  const [currentOption, setCurrentOption] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [resetKey, setResetKey] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("administrator/options");
      const mappedData = res.data?.map(({ optionId, ...rest }) => ({
        id: optionId,
        ...rest,
      }));

      setOptionsData(mappedData);

      const currentSelectedId = currentOption?.id;

      if (currentSelectedId) {
        const matchedDoc = mappedData.find(
          (doc) => doc.id === currentSelectedId
        );
        if (matchedDoc) {
          setCurrentOption(matchedDoc);
          return;
        }
      }
      setCurrentOption(mappedData[0]);
    } catch (error) {
      console.error("Error fetching document types:", error);
    }
  };

  const handleFilterAction = (value: string) => {
    switch (value) {
      case "Create":
        setCurrentOption({});
        setSelectedTab(0);
        setResetKey(true);
        break;
      case "Delete":
        if (currentOption) {
          setOpenDialog(true);
        }
        break;
      default:
        console.log("Invalid Option");
    }
  };

  const handleSelection = (id: number) => {
    if (id === null) {
      setResetKey(false);
      return;
    }
    const selected = optionsData.find((opt) => opt.id === id);

    setCurrentOption(selected);
  };

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const deleteDocumentType = async () => {
    setOpenDialog(false);
    try {
      const response = await api.delete(
        `administrator/options/${currentOption.id}`
      );
      if (response.message.length > 0) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error deleting document type:", error);
    }
  };

  const renderTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return (
          <DetailsDataTable
            currentObject={currentOption}
            reloaddData={fetchData}
          />
        );

      default:
        return null;
    }
  };

  return (
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
          {" "}
          <Split
            left={
              <div
                style={{
                  paddingRight: "5px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <HeaderBox style={{ height: "60px" }}>
                  <InfoBox>
                    <Typography
                      variant="overline"
                      sx={{ fontSize: 15, ml: "16px" }}
                    >
                      {"Options Management"}
                    </Typography>
                  </InfoBox>
                </HeaderBox>
                <Box
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                  }}
                >
                  <DataGrid
                    tasks={optionsData}
                    columns={optionsColumns}
                    resetSelectionRowId={resetKey}
                    defaultHeight="100%"
                    filterComponent={
                      <FilterButtonComponent
                        categories={["Create", "Delete"]}
                        onButtonClick={handleFilterAction}
                        getIcon={(category) => {
                          switch (category) {
                            case "Create":
                              return <AddCircleIcon />;
                            case "Delete":
                              return <DeleteIcon />;
                            default:
                              return null;
                          }
                        }}
                      />
                    }
                    onSelection={handleSelection}
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
                  tabs={["Details"]}
                />
                <Box
                  sx={{
                    height: "100%",
                    overflow: "hidden",
                    mt: "5px",
                  }}
                >
                  {renderTab(selectedTab)}
                </Box>
              </div>
            }
          />
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete document type{" "}
            <strong>{currentOption?.optionName || ""}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <PrimaryButton
            label="Cancel"
            startIcon={<CancelIcon />}
            type="button"
            onClick={() => setOpenDialog(false)}
          />
          <PrimaryButton
            label="Delete"
            startIcon={<DeleteIcon />}
            type="button"
            onClick={deleteDocumentType}
          />
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OptionsTable;
