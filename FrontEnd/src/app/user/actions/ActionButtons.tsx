import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Modal,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  styled,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Collapse from "@mui/material/Collapse";

// axios import removed as it was unused
import { api } from "api/API";
import HeaderTypography from "app/formComponents/HeaderTypography";
import { ArrowForward, Clear, InboxRounded } from "@mui/icons-material";
import appStore from "app/mobxStore/AppStore";
import ChecklistRtlOutlinedIcon from "@mui/icons-material/ChecklistRtlOutlined";
import { Themecolors, fonts } from "api/Colors";
import { observer } from "mobx-react";
import DocStore from "app/mobxStore/DocumentStore";
import { blue } from "@mui/material/colors";
import { User } from "@auth0/auth0-spa-js";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import taskStore from "app/mobxStore/TaskStore";
import { toJS } from "mobx";
import { useNavigate, useParams } from "react-router-dom";
import NoData from "api/NoData";
import WorkFlowAction from "./WorkFlowAction";

const StyledActionCard = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  marginLeft: "auto",
  marginRight: "auto",
  width: "95%",
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: "#fff",
  boxShadow: "0 1px 2px rgba(16,24,40,0.05)",
  overflow: "hidden",
}));

const StyledActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#ffffff",
  color: theme.palette.text.primary,
  fontWeight: 600,
  textTransform: "none",
  fontFamily: fonts.poppins,
  height: 56,
  width: "100%",
  justifyContent: "space-between",
  borderRadius: 0,
  border: "none",
  boxShadow: "none",
  paddingLeft: 16,
  paddingRight: 14,
  transition: "background-color 120ms ease, box-shadow 120ms ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    boxShadow: "none",
  },
}));

const OptionContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#ffffff",
  padding: 16,
  borderTop: `1px solid ${theme.palette.divider}`,
  transition: "all 200ms ease-in-out",
}));

const StyledNoteField = styled(TextField)(({ theme }) => ({
  margin: 5,
  width: "100%",
  fontFamily: fonts.inter,
}));

const SubmitButton = styled(LoadingButton)(({ theme }) => ({
  width: "100%",
  margin: 5,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontFamily: fonts.inter,
  borderRadius: 10,
  paddingTop: 10,
  paddingBottom: 10,
  boxShadow: "0 6px 12px rgba(16,24,40,0.08)",
  textTransform: "none",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  "&.Mui-disabled": {
    boxShadow: "none",
    opacity: 0.6,
  },
}));

interface Props {
  documentStateId: number;
  taskId: number;
  documentTypeId?: number;
  currentUser: number;
  userType: number;
  onActionComplete: (
    message: string,
    severity: "error" | "success" | "info" | "warning"
  ) => void;

  assignedApprovers: User[];
}

interface Action {
  actionId: number;
  actionName: string;
  actionStateId: number;
  options: Option[];
}

interface Option {
  id: number;
  name: string;
  description: string;
}

const ActionButtons: React.FC<Props> = observer(
  ({
    documentStateId,
    taskId,
    documentTypeId,
    currentUser,
    userType,
    onActionComplete,
    assignedApprovers,
  }) => {
    const [actions, setActions] = useState<Action[]>([]);
    const [currentStateName, setCurrentStateName] =
      useState<string>("Actions State");
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedActionOptions, setSelectedActionOptions] = useState<
      Option[]
    >([]);
    const [currentAction, setCurrentAction] = useState<Action>();
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [note, setNote] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [actionCompleteTrigger, setActionCompleteTrigger] = useState(false);
    const userId = appStore.loginResponse.user[0].userId;
    const canAction = assignedApprovers.some((user) => user.userId === userId);
    const [storedTaskIds, SetStoredtaskId] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();
    const currentId = Number(id);

    useEffect(() => {
      if (canAction) loadTaskActions();
      SetStoredtaskId(toJS(taskStore.selectedTaskIds));
    }, [documentStateId, taskId, documentTypeId]);

    const isButtonDisabled =
      (selectedActionOptions?.length || 0) === 0
        ? note.trim() === ""
        : selectedOption === null;

    const loadTaskActions = () => {
      api
        .post(`task-actions`, {
          body: {
            taskId: taskId,
            userId: currentUser,
            userRoles: appStore.loginResponse.user[0].roles,
          },
        })
        .then((response) => {
          setActions(response.data);
          DocStore.setActions(response.data);
        })
        .catch((error) => {
          console.error("Error fetching action data:", error);
        });
      api
        .post(`get-document-state`, {
          body: {
            documentStateId: documentStateId,
          },
        })
        .then((response) => {
          if (response.status) setCurrentStateName(response.data);
        });
    };

    const handleAction = async (action: Action) => {
      // Toggle open/close if the same action header is clicked again
      if (currentAction?.actionId === action.actionId) {
        setCurrentAction(null);
        setSelectedActionOptions([]);
        setSelectedOption(null);
        setNote("");
        return;
      }
      setSelectedActionOptions(action.options);
      setModalOpen(true);
      setCurrentAction(action);
      setSelectedOption(null);
      setNote("");
    };

    const actionSubmit = async (actionId: number) => {
      const selected = selectedActionOptions?.find(
        (o) => o.id === selectedOption
      ).name;
      setSubmitting(true);
      api
        .post(`add-task-workflow-action`, {
          body: {
            taskId: taskId,
            taskSelectedOption: selected ?? "",
            taskNote: note,
            taskUserId: currentUser,
            taskActionId: actionId,
          },
        })
        .then((res) => {
          if (res.status) {
            api
              .post(`update-action`, {
                body: {
                  taskId: taskId,
                  actionId: actionId,
                  userId: currentUser,
                },
              })
              .then((res) => {
                if (res.status) {
                  // onActionComplete(res.message, "success");
                  // setActionCompleteTrigger((state) => !state);

                  //  window.location.reload();

                  const updatedTaskIds = storedTaskIds.filter(
                    (task) => task !== currentId
                  );

                  taskStore.setSelectedTaskIds(updatedTaskIds);
                  SetStoredtaskId(updatedTaskIds);

                  if (updatedTaskIds.length === 0) {
                    navigate("/dashboard/default");
                  } else {
                    const currentIndex = storedTaskIds.indexOf(currentId);
                    let nextTaskId;

                    if (currentIndex === storedTaskIds.length - 1) {
                      nextTaskId = updatedTaskIds[0];
                    } else {
                      nextTaskId = storedTaskIds[currentIndex + 1];
                    }

                    navigate(`/user/task/${nextTaskId}`);
                  }
                } else {
                  onActionComplete(res.message, "error");
                }
                setCurrentAction(null);
                setNote("");
                setSelectedOption(null);
                setSubmitting(false);
              });
          } else {
            onActionComplete(res.message, "error");
            setSubmitting(false);
          }
        })
        .catch(() => {
          setSubmitting(false);
        });
    };

    const handleSubmit = () => {
      // Implement the API call or logic to submit the selected option and note
      setModalOpen(false);
      actionSubmit(currentAction.actionId);
      setNote("");
    };

    const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedOption(parseInt(event.target.value, 10));
    };

    return (
      <Box
        sx={{
          height: "100%",
          maxWidth: "84%",
          backgroundColor: "#efefef",
        }}
      >
        <HeaderTypography title={currentStateName} />
        <div
          style={{
            maxHeight: "calc(102vh - 150px)",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {actions.length == 0 && (
            <>
              <Box>
                <NoData
                  icon={InboxRounded}
                  title="No actions available"
                  subtitle="Still no actions have been performed in this state."
                  iconSize={20}
                  titleSize={14}
                  subtitleSize={11}
                />
              </Box>
            </>
          )}
          <Stack
            spacing={2}
            direction="column"
            mt={2}
            sx={{
              paddingBottom: "10px",
              alignItems: "center",
              width: "100%",
            }}
          >
            {actions.map((action) => {
              const isExpanded = currentAction?.actionId === action.actionId;
              const hasOptions = (selectedActionOptions?.length || 0) > 0;
              return (
                <StyledActionCard key={action.actionId}>
                  <StyledActionButton
                    variant="text"
                    aria-expanded={isExpanded}
                    endIcon={
                      <ArrowForward
                        sx={{
                          transition: "transform 150ms ease",
                          transform: isExpanded ? "rotate(90deg)" : "none",
                        }}
                      />
                    }
                    onClick={() => handleAction(action)}
                  >
                    {action.actionName}
                  </StyledActionButton>
                  <Collapse in={isExpanded} timeout={250} unmountOnExit>
                    <OptionContainer key={"option-container"}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {hasOptions ? "Choose an option" : "Add a note"}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{ ml: 1 }}
                          onClick={() => {
                            setCurrentAction(null);
                            setNote("");
                            setSelectedOption(null);
                          }}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </Box>

                      {hasOptions && (
                        <>
                          <RadioGroup
                            value={selectedOption}
                            onChange={handleOptionChange}
                          >
                            {selectedActionOptions?.map((option) => {
                              const isSelected = selectedOption === option.id;
                              return (
                                <FormControlLabel
                                  key={option.id}
                                  value={option.id}
                                  control={<Radio />}
                                  sx={{
                                    m: 0,
                                    px: 1.25,
                                    py: 1,
                                    backgroundColor: isSelected
                                      ? "action.selected"
                                      : "transparent",
                                    "&:hover": {
                                      backgroundColor: isSelected
                                        ? "action.selected"
                                        : "action.hover",
                                    },
                                  }}
                                  label={
                                    <Box>
                                      <Typography
                                        sx={{
                                          fontWeight: isSelected ? 600 : 500,
                                          lineHeight: 1.25,
                                        }}
                                      >
                                        {option.name}
                                      </Typography>
                                      {option.description && (
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {option.description}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                />
                              );
                            })}
                          </RadioGroup>
                          <Divider sx={{ my: 1.5 }} />
                        </>
                      )}
                      <Box flexDirection={"column"} width={"100%"}>
                        <StyledNoteField
                          label="Note"
                          multiline
                          rows={4}
                          variant="outlined"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              setNote((prev) => prev + "\n");
                            }
                          }}
                          placeholder="Add an optional note for context"
                          inputProps={{ maxLength: 500 }}
                          helperText={`${note.length}/500`}
                        />
                        <SubmitButton
                          onClick={handleSubmit}
                          variant="contained"
                          loading={submitting}
                          disabled={isButtonDisabled || submitting}
                          loadingPosition="end"
                          endIcon={<ArrowForward />}
                        >
                          Submit Action
                        </SubmitButton>
                      </Box>
                    </OptionContainer>
                  </Collapse>
                </StyledActionCard>
              );
            })}
            <Box sx={{ alignSelf: "stretch", width: "100%" }}>
              <HeaderTypography>Task Approvers</HeaderTypography>
            </Box>
            {assignedApprovers.length === 0 ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 8,
                    width: "100%",
                  }}
                >
                  <NoData
                    icon={SupervisorAccountIcon}
                    title="No Task Approvers available"
                    iconSize={22}
                    titleSize={12}
                  />
                </Box>
              </>
            ) : (
              <List
                sx={{
                  overflowY: "auto",
                  marginBottom: "25px",
                  alignSelf: "stretch",
                  width: "100%",
                }}
              >
                {assignedApprovers.map((user) => (
                  <React.Fragment>
                    <ListItem
                      key={user.userId}
                      style={{ alignItems: "flex-start" }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{ backgroundColor: blue[100], color: blue[600] }}
                        >
                          {user.userFirstName[0] + user.userLastName[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`  ${user.userName}`}
                        secondary={`${user.userFirstName} ${user.userLastName} `}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
            <Box sx={{ alignSelf: "stretch", width: "100%" }}>
              <HeaderTypography>Work Flow</HeaderTypography>
              <Box>
                <WorkFlowAction taskId={taskId} />
              </Box>
            </Box>
          </Stack>
        </div>
      </Box>
    );
  }
);

export default ActionButtons;
