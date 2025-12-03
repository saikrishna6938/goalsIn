import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  IconButton,
  Modal,
  TextField,
  Paper,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import UserHeaderComponent, {
  UserHeaderBox,
  UserInfoBox,
} from "app/appComponents/UserHeaderComponent";
import DocumentValues from "app/appComponents/DocumentValues";
import { UserDocument } from "app/types/Form";
import TabBar from "app/formComponents/TabBar";
import data from "app/data/sample.json";
import { Themecolors } from "api/Colors";
import CustomButton from "app/components/CustomButton ";
import DocFormEditable from "./DocFormEditable";
import CloseIcon from "@mui/icons-material/Close";

interface ProfileProps extends UserDocument {
  showTabs?: boolean;
  maxHeight?: string | number;
  ShowEditButton?: boolean;
  handleReload?: Function;
}

const Profile: React.FC<ProfileProps> = (props) => {
  const { handleReload } = props;
  const [selectedTab, setSelectedTab] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    setSelectedTab(0);
  }, [props.documentTypeObject]);

  const rawDoc = props.documentTypeObject ?? data;
  const selections = rawDoc.selections || [];

  const resolveDropdownValue = (order: string, value: string) => {
    if (!value) return value;
    const selection = selections.find((s: any) =>
      s.questions?.includes(Number(order))
    );
    const option = selection?.options?.find((opt: any) => opt.id === value);
    return option ? option.name : value;
  };

  const sections = (rawDoc.sections || []).map((section: any) => {
    const newInitialValues: any = { ...section.initialValues };

    section.formDetails?.forEach((form: any) => {
      form.form?.forEach((field: any) => {
        if (field.attributeType === "8") {
          const currentVal = section.initialValues?.[field.order];
          if (currentVal) {
            newInitialValues[field.order] = resolveDropdownValue(
              field.order,
              currentVal
            );
          }
        }
      });
    });

    return {
      ...section,
      initialValues: newInitialValues,
    };
  });

  const sectionNames = sections.map(
    (section: { sectionName: string }) => section.sectionName
  );

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleEditClick = () => {
    const currentSection = sections[selectedTab];
    if (currentSection) {
      setEditData({ ...currentSection });
      setOpenModal(true);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Updated Section Data:", editData);
    setOpenModal(false);
  };

  const renderTabContent = (tab: number) => {
    const sectionData = sections[tab];
    if (sectionData) {
      return (
        <DocumentValues
          data={{ ...props.documentTypeObject, sections: [sectionData] }}
          openFile={props.openFile}
        />
      );
    }
    return <div>No Content Available</div>;
  };

  return (
    <Box
      sx={{
        borderRadius: 0,
        height: "100%",
        maxHeight: props.maxHeight || "calc(98.5vh - 185px)",
        width: "100%",
        marginTop: "5px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginTop: "2px", flexShrink: 0 }}>
        <UserHeaderComponent
          userInfoComponent={
            <UserHeaderBox>
              <Avatar
                src={props.userImage}
                sx={{
                  transition: "transform .2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    backgroundImage: Themecolors.UH_hv1,
                  },
                  backgroundColor: Themecolors.UH_Icon_bg1,
                  color: Themecolors.UH_Icon2,
                }}
              />
              <UserInfoBox
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ color: Themecolors.UH_text3 }}>
                    {props.Name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: Themecolors.UH_text3 }}
                  >
                    {props.userEmail}
                  </Typography>
                </Box>
              </UserInfoBox>
            </UserHeaderBox>
          }
          ShowEditButton={props.ShowEditButton}
          onEditButtonClick={handleEditClick}
        />
        <Box sx={{ mt: "2px" }}>
          <TabBar
            value={selectedTab}
            onChange={handleTabChange}
            tabs={sectionNames}
          />
        </Box>
      </div>

      <Box
        sx={{
          overflowY: "auto",
          flex: 1,
          mt: "2px",
        }}
      >
        {renderTabContent(selectedTab)}
      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            padding: "1em 2em 2em 2em",
            borderRadius: "8px",
            maxHeight: "85vh",
            maxWidth: "75vw",
            width: "75vw",
            height: "85vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "0.1em",
              right: "0.1em",
              cursor: "pointer",
              borderRadius: "50%",
              padding: "1px",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
            onClick={() => setOpenModal(false)}
          >
            <CloseIcon fontSize="medium" />
          </Box>
          <DocFormEditable
            Data={props.documentTypeObject}
            documentTypeAnswersId={props?.documentTypeAnswersId}
            reload={handleReload}
            onCloseMainDialog={() => setOpenModal(false)}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default Profile;
