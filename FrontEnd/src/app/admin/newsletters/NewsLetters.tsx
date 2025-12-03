import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import DataGrid from "app/formComponents/DataGrid";
import { Split } from "app/formComponents/styles/Split";
import TabBar from "app/formComponents/TabBar";
import NewsLetterProperties from "./NewsLetterProperties";
import newslettersData from "app/data/newsletters.json";
import { api } from "api/API";
import FilterButtonComponent from "app/formComponents/FilterButtonComponent";
import CustomButton from "app/components/CustomButton ";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const columns: any = [
  { id: "id", label: "ID", type: "number" },
  { id: "newsletterName", label: "Title", type: "string" },
];

const NewsLetters: React.FC = () => {
  const [resetKey, setResetKey] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [currentObj, setCurrentObj] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("administrator/newsletters");
      const mappedData = response.rows.map(({ newsletterId, ...rest }) => ({
        id: newsletterId,
        ...rest,
      }));
      setNewsletters(mappedData);

      const currentSelectedId = currentObj?.id;
      if (currentSelectedId) {
        const matchedDoc = mappedData.find(
          (doc) => doc.id === currentSelectedId
        );
        if (matchedDoc) {
          setCurrentObj(matchedDoc);
          return;
        }
      }
      setCurrentObj(mappedData[0]);
    } catch (err) {
      console.error("Error fetching newsletters:", err);
    }
  };

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleSelection = (id: number) => {
    if (id === null) {
      setResetKey(false);
      return;
    }
    const selected = newsletters.find((item) => item.id === id);
    if (selected) setCurrentObj(selected);
  };

  const renderTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
      default:
        return (
          <NewsLetterProperties data={currentObj} reloadData={fetchData} />
        );
    }
  };

  const handleFilterAction = (value: string) => {
    switch (value) {
      case "Create":
        setCurrentObj({});
        setSelectedTab(0);
        setResetKey(true);
        break;
      case "Delete":
        if (currentObj) {
          setOpenDialog(true);
        }
        break;
      default:
        console.log("Invalid Option");
    }
  };

  const deleteDocumentType = async () => {
    setOpenDialog(false);

    try {
      const response = await api.delete(`administrator/newsletters`, {
        body: {
          newsletterIds: [currentObj?.id],
        },
      });
      if (response.message.length > 0) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error deleting document type:", error);
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
      <Box sx={{ width: "100%", borderRadius: "4px", height: "100%" }}>
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
                      {"News Letters"}
                    </Typography>
                  </InfoBox>
                </HeaderBox>
                <Box sx={{ flex: 1, overflow: "hidden" }}>
                  <DataGrid
                    tasks={newsletters}
                    columns={columns}
                    onSelection={handleSelection}
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
                  tabs={["Properties"]}
                />
                <Box sx={{ height: "100%", overflow: "hidden", mt: "5px" }}>
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
            Are you sure you want to delete newsletter
            <strong> {currentObj?.newsletterName || ""}</strong>?
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

export default NewsLetters;
