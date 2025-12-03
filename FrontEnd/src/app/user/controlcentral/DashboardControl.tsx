import {
  Box,
  Button,
  Grid,
  Modal,
  Paper,
  SelectChangeEvent,
  styled,
  Typography,
  Divider,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import jsonsData from "../controlcentral/Data.json";
import DashboardCharts from "./DashboardCharts";
import { observer } from "mobx-react";
import dashboardStore from "./DashboardStore";
import CloseIcon from "@mui/icons-material/Close";
import { Themecolors } from "api/Colors";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import appStore from "app/mobxStore/AppStore";
import { api } from "api/API";
import GlobalFilters from "./GlobalFilters";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "app/components/Loading";
import CustomButton from "app/components/CustomButton ";
import { toJS } from "mobx";
import { useParams } from "react-router-dom";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import { ClearAll } from "@mui/icons-material";

const StyledButton = styled(Button)({
  ml: "2px",
  fontSize: "0.85rem",
  height: "1.8em",
  margin: "2px",
  border: `1px solid ${Themecolors.main_bg2}`,
  background: " #ffa726",
  color: Themecolors.Button2,
  "&:hover": {
    backgroundImage: Themecolors.button_hover1,
    backgroundColor: Themecolors.Button_bg3,
    border: `1px solid ${Themecolors.Button_bg3}`,
  },
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  borderRadius: "30px",
});
interface URLPARAMS {
  id: string;
}
const DashboardControl: React.FC = observer(() => {
  const [openModal, setOpenModal] = useState(false);
  const [period, SetPeriod] = useState("");
  const [documentType, SetDocumentType] = useState<any>("");
  const [selectedLocation, SetSelectedLocation] = useState("");
  const [selectedGroupID, SetSelectedGroupID] = useState<any>();
  const [jsonData, setJsonData] = useState<any>({});
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, SetLoading] = useState(true);
  const [entites, SetEntites] = useState<any>();
  const [selectedEntity, SetselectedEntity] = useState<any>();
  const [clearall, SetCleerall] = useState(false);
  const [documetnName, SetDocumetnName] = useState();
  const [periodName, setPeriodName] = useState();
  const [defaultLocation, SetDefaultLocation] = useState();
  const [defaulEntityId, SetDefaultEntityid] = useState<any>();
  const [pauloadData, SetPayloadData] = useState({});
  const [showSkeletonLoader, SetShowSkeletonLoader] = useState(false);

  const { id } = useParams<any>();
  const defaultEntity =
    appStore.userEntities.find((e) => e.entityId === appStore.selectedEntity)
      ?.entityName ?? "Select Entity";

  useEffect(() => {
    if (clearall) {
      SetCleerall(false);
      return;
    }
    const loadDashboardData = async () => {
      SetShowSkeletonLoader(true);
      try {
        const response = await api.post("outstainding-tasks", {
          body: {
            entity: appStore.selectedEntity,
            controlCenterId: id,
            period: period,
            documenTypeId: documentType.id,
          },
        });
        if (response.status) {
          if (response && response.data) {
            setJsonData(response.data);
          }
        } else {
          navigate("/user/control_central", { replace: true });
        }
      } catch (error) {
        console.log("error", error);
      } finally {
        SetLoading(false);
        SetShowSkeletonLoader(false);
      }
    };
    loadDashboardData();
    SetDefaultEntityid(appStore.selectedEntity);
    SetselectedEntity(appStore.selectedEntity);
  }, [appStore.selectedEntity]);

  useEffect(() => {
    dashboardStore.resetFilters();
  }, [location.pathname]);

  const title = Object.entries(dashboardStore.selectedFilter);

  const handleSubmit = async () => {
    try {
      const payload = {
        entity: selectedEntity,
        period: period,
        controlCenterId: id,
        documenTypeId: documentType.id,
      };
      const response = await api.post("outstainding-tasks", {
        body: payload,
      });
      if (response.status) {
        if (response && response.data) {
          setJsonData(response.data);
        }
      } else {
        navigate("/user/control_central", { replace: true });
      }

      const selectEntity = dashboardStore.entities.find(
        (e) => e.entityId === payload.entity
      );
      SetEntites(selectEntity.entityName);
      SetDefaultEntityid(selectEntity?.entityId);
      // dashboardStore.setSelectedEntity(selectEntity.entityId);

      const documentName =
        dashboardStore.selectedDocumentObj.id === payload.documenTypeId
          ? dashboardStore.selectedDocumentObj.name
          : undefined;
      SetDocumetnName(documentName);

      const periodName = dashboardStore.selectedPeriod.find(
        (item) => item.value === payload.period
      )?.label;
      setPeriodName(periodName);

      const location = dashboardStore.selectedLocation;
      console.log("Selected Location =", toJS(location));
      SetDefaultLocation(location);
    } catch (error) {
      console.log("error", error);
    }

    setOpenModal(false);
    dashboardStore.resetFilters();
  };

  const handleEntityChange = (id) => {
    SetselectedEntity(id);
    const selectEntity = appStore.userEntities.find(
      (e) => e.entityId === id
    )?.entityName;
    // SetEntites(selectEntity);
  };

  const handleSlectedId = (id) => {
    SetSelectedGroupID(id);
  };

  const handleSelectPeriod = (val) => {
    SetPeriod(val);
  };
  const handleSelectDoc = (val) => {
    SetDocumentType(val);
  };
  const handleClear = () => {
    dashboardStore.resetFilters();
  };

  const handleClearAll = () => {
    SetPeriod("");
    SetDocumentType("");
    SetSelectedLocation("");
    SetSelectedGroupID("");
    dashboardStore.clearAll();
    setOpenModal(false);
    SetCleerall(true);
  };

  return (
    <>
      {loading ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Loading />
        </Box>
      ) : (
        <Paper
          sx={{
            height: "98%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 0,
            backgroundColor: (t) => t.palette.background.paper,
          }}
        >
          <HeaderBox
            sx={{
              display: "flex",
              alignItems: "center",
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
              minHeight: 56,
              px: 2,
              py: 1,
              mb: 0.5,
              backgroundColor: (t) => t.palette.background.paper,
              boxShadow: "none",
            }}
          >
            <InfoBox
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "5px",
                width: "50%",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.9em",
                  borderRight: "1px solid #ccc",
                  paddingRight: 1,
                  mr: 1,
                }}
              >
                Entity :
                <span
                  style={{
                    fontSize: "1.1em",
                    fontWeight: "bold",
                    cursor: "pointer",
                    marginLeft: "5px",
                  }}
                  onClick={() => setOpenModal(true)}
                >
                  {entites || defaultEntity}
                </span>
              </Typography>

              {period.length > 0 && (
                <Typography
                  sx={{
                    fontSize: "0.9em",
                    borderRight: "1px solid #ccc",
                    paddingRight: 1,
                  }}
                >
                  Period :
                  <span
                    style={{
                      fontSize: "1.1em",
                      fontWeight: "bold",
                      marginLeft: "5px",
                    }}
                  >
                    {periodName}
                  </span>
                </Typography>
              )}
              {documentType && (
                <Typography
                  sx={{
                    fontSize: "0.9em",
                    paddingRight: 1,
                    ml: "8px",
                  }}
                >
                  Intake :
                  <span
                    style={{
                      fontSize: "1.1em",
                      fontWeight: "bold",
                      marginLeft: "5px",
                    }}
                  >
                    {documetnName}
                  </span>
                </Typography>
              )}
            </InfoBox>

            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "50%",
                paddingLeft: "10px",
                whiteSpace: "nowrap",
              }}
            >
              {title && title.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minWidth: 0,
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.9em",
                      mr: 1,
                    }}
                  >
                    Filters :
                  </Typography>
                  {title.map(([key, value], index) => (
                    <StyledButton key={index}>
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: "1em",
                          padding: "5px",
                          color: "#01579b",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {value}
                      </span>
                      <CloseIcon
                        onClick={() => dashboardStore.removeFilter(key)}
                        sx={{
                          color: "white",
                          height: "1.1em",
                          width: "1.1em",
                          padding: "5px",
                          "&:hover": {
                            backgroundImage: Themecolors.button_hover1,
                            backgroundColor: Themecolors.Button_bg3,
                            borderRadius: "15px",
                          },
                        }}
                      />
                    </StyledButton>
                  ))}
                </Box>
              ) : (
                <Typography>No Filters Applied</Typography>
              )}
              <Typography
                sx={{
                  ml: "20px",
                  p: 2,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={handleClear}
              >
                Clear All
              </Typography>
            </Box>
          </HeaderBox>

          <Box
            sx={{
              height: "95%",
              width: "100%",
              maxHeight: "calc(91vh - 80px)",
              overflowY: "auto",
              mt: "2px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Grid
              container
              sx={{
                height: "100%",
                width: "100%",
                flexDirection: "row",
                padding: "2px",
              }}
            >
              {jsonData?.rows?.map((row, rowIndex) => (
                <Grid
                  item
                  key={rowIndex}
                  sx={{
                    height: row.styles?.height,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "stretch",
                  }}
                >
                  {row.row?.map((col, colIndex) => (
                    <Box
                      key={colIndex}
                      sx={{
                        width: col.styles.width,
                        height: col.styles.height,
                        maxHeight: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                        padding: "2px",
                      }}
                    >
                      <DashboardCharts
                        data={col}
                        showSkeletonLoader={showSkeletonLoader}
                      />
                    </Box>
                  ))}
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      )}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: (t) => t.palette.background.paper,
              boxShadow: (t) => t.shadows[6],
              padding: "0.5em 0.5em 0.9em",
              borderRadius: 0,
              width: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",

                width: "100%",
              }}
            >
              <Typography sx={{ fontSize: "1.4em", ml: "0.7em" }}>
                Global Eentity
              </Typography>
              <CloseIcon
                sx={{
                  borderRadius: "45%",
                  marginLeft: "auto",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
                onClick={() => setOpenModal(false)}
              />
            </Box>

            <Box
              sx={{
                height: "100%",
                width: "450px",
                padding: "0.4em 1.6em 0.9em",
              }}
            >
              <GlobalFilters
                defaultPeriod={periodName}
                defaultDocumentType={documetnName}
                defaultSelecteGroupdId={selectedGroupID}
                defaultSelectLocation={defaultLocation}
                onEntityChange={handleEntityChange}
                onSetselctedId={handleSlectedId}
                onSelectPeriod={handleSelectPeriod}
                onSelectDoc={handleSelectDoc}
                defaulEntityId={defaulEntityId}
              />
            </Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                borderTop: "1px solid #ccc",
                backgroundColor: "#fff",
                gap: "10px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: "10px",
                }}
              >
                <PrimaryButton
                  label="Clear All"
                  startIcon={<ClearAll />}
                  type="button"
                  onClick={handleClearAll}
                />
              </Box>
              <Box sx={{ display: "flex", gap: "10px" }}>
                <PrimaryButton
                  label="Cancel"
                  startIcon={<CancelIcon />}
                  type="button"
                  onClick={() => setOpenModal(false)}
                />
                <PrimaryButton
                  label="Submit"
                  startIcon={<SaveIcon />}
                  type="submit"
                  onClick={handleSubmit}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
});

export default DashboardControl;
