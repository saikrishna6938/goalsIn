import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { api } from "api/API";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import DataGrid from "app/formComponents/DataGrid";
import { Split } from "app/formComponents/styles/Split";
import TabBar from "app/formComponents/TabBar";
import FilterButtonComponent from "app/formComponents/FilterButtonComponent";
import CustomButton from "app/components/CustomButton ";
import Roles from "./Roles";
import UserType from "./UserType";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";

const profileTypeColumns: any = [
  { id: "id", label: "ID", type: "number" },
  { id: "name", label: "Profile Name", type: "string" },
];

const UserProfileType: React.FC = () => {
  const [profileTypes, setProfileTypes] = useState<any[]>([]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [resetKey, setResetKey] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchProfileType();
  }, []);

  const fetchProfileType = async () => {
    try {
      const res = await api.get("administrator/sub-profile-types");
      const mapped = res.map(({ subProfileId, subProfileName }) => ({
        id: subProfileId,
        name: subProfileName,
      }));

      setProfileTypes(mapped);

      if (currentProfile?.id) {
        const match = mapped.find((t) => t.id === currentProfile.id);
        if (match) {
          setCurrentProfile(match);
          return;
        }
      }

      if (mapped.length > 0) {
        setCurrentProfile(mapped[0]);
      }
    } catch (error) {
      console.error("Failed to load profile types", error);
    }
  };

  const handleSelection = (id: number) => {
    if (id === null) {
      setResetKey(false);
      return;
    }

    const selected = profileTypes.find((p) => p.id === id);
    setCurrentProfile(selected);
  };

  const handleFilterAction = (value: string) => {
    switch (value) {
      case "Create Profile Type":
        setCurrentProfile({});
        setResetKey(true);
        break;

      case "Delete Profile Type":
        if (currentProfile) {
          setOpenDialog(true);
        }
        break;
    }
  };

  const handleDelete = async () => {
    setOpenDialog(false);

    try {
      await api.delete(`administrator/user-settings-types${currentProfile.id}`);
      fetchProfileType();
    } catch (error) {
      throw error;
    }
  };

  const renderTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return <Roles currentObj={currentProfile} />;
      case 1:
        return <UserType currentObj={currentProfile} />;

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 95px)",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: "100%",
      }}
    >
      <Box sx={{ width: "100%", height: "100%" }}>
        <Split
          initialSize={0.4}
          minSize={150}
          maxSize={900}
          left={
            <div
              style={{
                paddingRight: "5px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <HeaderBox style={{ height: "60px" }}>
                <InfoBox>
                  <Typography
                    variant="overline"
                    sx={{ fontSize: 15, ml: "16px" }}
                  >
                    {"Profile Types"}
                  </Typography>
                </InfoBox>
              </HeaderBox>
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <DataGrid
                  tasks={profileTypes}
                  columns={profileTypeColumns}
                  onSelection={handleSelection}
                  resetSelectionRowId={resetKey}
                  defaultHeight="100%"
                  // filterComponent={
                  //   <FilterButtonComponent
                  //     categories={[
                  //       "Delete Profile Type",
                  //       "Create Profile Type",
                  //     ]}
                  //     onButtonClick={handleFilterAction}
                  //   />
                  // }
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
                onChange={(_e, val) => setSelectedTab(val)}
                tabs={["Profile Type", "Users"]}
              />
              <Box sx={{ height: "100%", overflow: "hidden", mt: "5px" }}>
                {renderTab(selectedTab)}
              </Box>
            </div>
          }
        />
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete profile type{" "}
          <strong>{currentProfile?.name}</strong>?
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
            onClick={handleDelete}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfileType;
