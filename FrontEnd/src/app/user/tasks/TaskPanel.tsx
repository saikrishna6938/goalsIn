// TaskPanel.tsx
import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  Tooltip,
  Typography,
  Slide,
  useTheme,
  styled,
  Paper,
  Button,
} from "@mui/material";
import ActionIcon from "@mui/icons-material/CallToAction";
import AttachmentIcon from "@mui/icons-material/Attachment";
import NoteIcon from "@mui/icons-material/Chat";
import HistoryIcon from "@mui/icons-material/History";
import DocumentForm from "../DocumentForm";
import FormPreview from "../FormPreview";
import ActionButtons from "../actions/ActionButtons";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "api/API";
import HeaderTypography from "app/formComponents/HeaderTypography";
import AttachmentList from "app/formComponents/AttachmentList";
import ChatBox from "app/formComponents/ChatBox";
import TaskHistory, { TaskEvent } from "app/formComponents/TaskHistory";
import appStore from "app/mobxStore/AppStore";
import FilePreviewDialog from "../FilePreview";
import Toast, { ToastProps } from "app/formComponents/Toast";
import TabBar from "app/formComponents/TabBar";
import { UserDocument } from "app/types/Form";
import Profile from "../documents/Profile";
import { updateInitialValues } from "../documents/DocumentsView";
import TaskApprovalHistory from "app/formComponents/TaskApprovalHistory";
import { Directions, Group, InboxRounded } from "@mui/icons-material";
import { assignedUsers } from "./AssignApprovers";
import AssignApprovers from "./AssignApprovers";
import TaskTagDetails from "../TaskTagDetails";
import ApprovedHistory from "api/ApprovedHistory";
import PermMediaSharpIcon from "@mui/icons-material/PermMediaSharp";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import { Task } from "./Task";
import { Themecolors } from "api/Colors";
import GetTaskNoData from "api/GetTaskNoData";
import Loading from "app/components/Loading";
import { IndexType } from "app/types/User";
import CustomButton from "app/components/CustomButton ";
import taskStore from "app/mobxStore/TaskStore";
import { toJS } from "mobx";
import PaginationNavigator from "./PaginationNavigator";
import TaskPageDocumentViewer from "./TaskPageDocumentViewer";
import NoData from "api/NoData";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";

const ContentBox = styled(Box)(({ theme }) => ({
  borderLeft: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  overflowY: "auto",
  backgroundColor: "rgb(245, 247, 250)",
}));

const TaskPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>("actions");
  const [taskDetails, setTaskDetails] = useState<Task>();
  const [selectedTab, setSelectedTab] = useState(0);
  const theme = useTheme();
  const location = useLocation();
  const currentPath = location.pathname;
  const [attachments, setAttachments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState<UserDocument>();

  const navigate = useNavigate();
  const params = currentPath.split("/");
  const taskId = params[params.length - 1];
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [blobUrl, setBlobUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [approvalUsers, setApprovalUsers] = useState([]);
  const currentUser = appStore.loginResponse.user[0].userId;
  const userType = appStore.loginResponse.user[0].userType;
  const [updateTaskDetails, setUpdateTaskDetails] = useState(false);
  const [formData, setFormData] = useState(null);
  const [indexType, setIndexType] = useState(IndexType.INDEX);
  const [noAccess, setNoAccess] = useState(false);
  const [localAppType, setLocalAppType] = useState<string | null>(null);
  const [workFlowhistory, setWorkFlowhistory] = useState<TaskEvent[]>([]);

  useEffect(() => {
    const params = location.pathname.split("/");
    const taskId = params[params.length - 1];

    if (!taskId) return;

    const fetchGroupIndexType = async () => {
      try {
        const response = await api.get(`tasks/${taskId}/group-index-type`);

        if (response.success) {
          const { groupTypeName } = response.data;
          setLocalAppType(groupTypeName);
        }
      } catch (error) {
        console.error("Error fetching group type:", error);
      }
    };

    fetchGroupIndexType();
  }, [location.pathname]);

  useEffect(() => {
    const idToFetch = taskId;
    if (!idToFetch) return;

    setActiveTab("actions");
    api.get(`get-task-workflow/${idToFetch}`).then((res) => {
      setWorkFlowhistory(res.data || []);
    });
  }, [taskId, updateTaskDetails]);

  useEffect(() => {
    api
      .post(`getobject`, {
        body: {
          taskId: `${params[params.length - 1]}`,
        },
      })
      .then((res) => {
        if (res.status && res.data) {
          const ansObject = JSON.parse(res.data.documentTypeAnswersObject);
          const documentTypeId = res.data.documentTypeId;

          api.get(`document-type/get-object/${documentTypeId}`).then((data) => {
            if (data.status) {
              const attachments = getAttachments(ansObject);
              setAttachments(attachments);
            }
          });
        }
      });
  }, [params[params.length - 1]]);

  const getAttachments = (answerObject) => {
    let attachments = [];
    Object.entries(answerObject).map((a) => {
      if (typeof a[1] == "object") {
        //@ts-ignore
        attachments = [...attachments, ...a[1]];
      }
    });
    return attachments;
  };
  useEffect(() => {
    application();
  }, [taskDetails?.documentTypeAnswersId]);

  const application = async () => {
    if (!taskDetails?.documentTypeAnswersId) return;

    try {
      const response = await api.post(`get-application-id`, {
        body: { documentTypeAnswersId: taskDetails.documentTypeAnswersId },
      });

      if (response.status) {
        const updatedForm = updateInitialValues(
          response.data.documentTypeObject.sections,
          JSON.parse(response.data.documentTypeAnswersObject)
        );

        setFormData(response.data.documentTypeObject);
        setIndexType(response.data.groupTypeId);
        setCurrentDocument(response.data);
        loadTaskApprovals();
      }
    } catch (err) {
      console.error("Error reloading application:", err);
    }
  };

  const [toastObj, setToastObj] = useState<ToastProps>({
    onClose: () => {},
    open: false,
    message: "",
    severity: "info",
  });

  const handleTabClick = (tab: string) => {
    setActiveTab((prevTab) => (prevTab === tab ? null : tab));
  };

  const loadTaskApprovals = async () => {};
  const loadNotes = async () => {
    await api.get(`task/notes/${taskId}`).then((m) => {
      setMessages(m);
    });
  };
  const handleClose = () => {
    URL.revokeObjectURL(blobUrl); // Release the blob URL to free resources
    setBlobUrl("");
    setOpen(false);
  };

  const openDialogPrompt = async (file) => {
    setLoading(true); // Set loading to true
    setOpen(true);
    try {
      const response = await api.post("get/filedata", {
        body: {
          uploadId: file.uploadId,
        },
      });

      if (response && response.data && response.data.fileData) {
        setBlobUrl(response.data.fileData);
      } else {
        console.error("Invalid response or no file data received.");
      }
    } catch (error) {
      console.error("Error fetching file:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (newNote) => {
    await api
      .post(`addNote`, {
        body: {
          ...newNote,
        },
      })
      .then((r) => {
        loadNotes();
      });
  };
  const loadHistory = async () => {
    await api.get(`history/task/${taskId}`).then((h) => {
      if (h.status) setHistory(h.data);
    });
  };

  const loadTaskDetails = async () => {
    setNoAccess(false);
    try {
      const response = await api.post(`check-task-access`, {
        body: {
          taskId: taskId,
          userId: appStore.loginResponse.user[0].userId,
        },
      });
      if (response.status === true) {
        setTaskDetails(response.data);
        const userId = appStore.loginResponse.user[0].userId;

        api
          .post(`history/add`, {
            body: {
              historyTypeId: 2,
              historyUserId: userId,
              historyTaskId: taskId,
            },
          })
          .then((Response) => {
            if (Response.status) {
              // History added successfully
            }
          });
      } else {
        setNoAccess(true);
        setTaskDetails(null);
      }
    } catch (error) {
      console.error("Error fetching action data:", error);
    }
  };

  useEffect(() => {
    loadHistory();
    loadNotes();
    loadTaskDetails();
  }, [currentPath]);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };
  const handleSendMessage = (text: string) => {
    const newNote = {
      noteId: messages.length + 1,
      noteUserId: currentUser,
      noteComment: text,
      noteMentions: JSON.stringify({}),
      noteCreated: new Date(),
      noteTaskId: taskId,
      noteTypeId: 2,
    };
    addNote(newNote);
    // setMessages([
    //   ...messages,
    //   { ...newNote, userFirstName: "", userLastName: "" },
    // ]);
  };
  const renderTab = (tab: number) => {
    if (localAppType === "Index") {
      switch (tab) {
        case 0:
          return <TaskPageDocumentViewer taskId={taskId} />;
        // case 1:
        //   return <ApprovedHistory taskId={taskId} data={workFlowhistory} />;
        default:
          return <></>;
      }
    }

    switch (tab) {
      case 0:
        return <ApprovedHistory taskId={taskId} data={workFlowhistory} />;
      case 1:
        return currentDocument ? (
          <Profile
            {...currentDocument}
            openFile={openDialogPrompt}
            ShowEditButton={true}
            handleReload={application}
          />
        ) : (
          <></>
        );
      case 2:
        return indexType === IndexType.APPLY ? (
          <TaskTagDetails
            taskTagId={taskDetails.taskTagId}
            taskTableId={taskDetails.taskTableId}
          />
        ) : (
          <></>
        );
      default:
        return <></>;
    }
  };

  const tabs =
    localAppType === "Index"
      ? ["Document Viewer"]
      : indexType === IndexType.APPLY
      ? ["Approved History", "Details", "Tag Details"]
      : ["Approved History", "Details"];

  if (noAccess) return <GetTaskNoData taskId={taskId} />;
  if (!taskDetails) return <Loading />;

  return (
    <div
      style={{
        height: "100%",
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
        width: "100%",
        borderRadius: 0,
      }}
    >
      <>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: "5px",
            borderBottom: "1px solid #ccc",
          }}
        >
          <Box
            sx={{
              borderBottom: "1px solid #eeeeee",
              flexShrink: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxSizing: "border-box",
              overflow: "hidden",
              padding: "3px",
              background: "linear-gradient(to top, #fafafa 0%, #eeeeee 100%)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontSize: "14px",
                  lineHeight: "1.4",
                  ml: "16px",
                }}
              >
                {taskDetails?.taskName || "No Task Name"}
              </Typography>
              <Typography
                variant="overline"
                sx={{
                  fontSize: "12px",
                  lineHeight: "1.2",
                  ml: "16px",
                }}
              >
                <span style={{ fontWeight: "bold", marginRight: "6px" }}>
                  {currentDocument?.userName || "No User Name"}
                </span>
                {` (${currentDocument?.documentTypeDescription})`}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <PaginationNavigator />
              <PrimaryButton
                label="Go Back"
                type="button"
                onClick={() => {
                  navigate(-1);
                }}
                backgroundColor={"white"}
              />
            </Box>
          </Box>

          <Box
            display="flex"
            sx={{
              flex: 1,
              display: "flex",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                flex: 1,
                height: "100%",
                bgcolor: "white",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <Box sx={{ flexShrink: 0 }}>
                <TabBar
                  value={selectedTab}
                  onChange={handleTabChange}
                  tabs={tabs}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {renderTab(selectedTab)}
              </Box>
            </Box>
            <Box
              sx={{
                bgcolor: "white",
                position: "relative",
              }}
            >
              <Slide
                direction="left"
                in={Boolean(activeTab)}
                style={{
                  height: "100%",
                  overflowY: "hidden",
                  padding: 0,
                  backgroundColor: "white",
                }}
              >
                <ContentBox width={Boolean(activeTab) ? "400px" : "60px"}>
                  {activeTab === "actions" && taskDetails && (
                    <>
                      <ActionButtons
                        documentStateId={taskDetails.documentStateId}
                        taskId={+taskId}
                        documentTypeId={taskDetails.documentTypeId}
                        currentUser={currentUser}
                        userType={userType}
                        onActionComplete={(message: string, severity: any) => {
                          setToastObj({
                            ...toastObj,
                            open: true,
                            message: message,
                            severity: severity,
                          });
                          loadTaskDetails();
                          setUpdateTaskDetails(!updateTaskDetails);
                        }}
                        assignedApprovers={taskDetails.taskApprovers}
                      />
                    </>
                  )}
                  {activeTab === "attachments" && (
                    <>
                      <Paper
                        sx={{
                          height: "100%",
                          width: "335px",
                          borderRadius: 0,
                        }}
                      >
                        {attachments.length > 0 ? (
                          <Box sx={{ paddingLeft: 0 }}>
                            <AttachmentList
                              key={"attachments"}
                              attachments={attachments}
                              onOpenAttachment={openDialogPrompt}
                            />
                          </Box>
                        ) : (
                          <>
                            <Box
                              sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <HeaderTypography
                                key={"attachment-header"}
                                title="Attachments"
                              />

                              <Box
                                sx={{
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                }}
                              >
                                <NoData
                                  icon={PermMediaOutlinedIcon}
                                  title="No attachments available"
                                  subtitle="No files have been attached yet."
                                  iconSize={30}
                                  titleSize={15}
                                  subtitleSize={11}
                                />
                              </Box>
                            </Box>
                          </>
                        )}
                      </Paper>
                    </>
                  )}
                  {activeTab === "notes" && (
                    <Box sx={{ height: "100%" }}>
                      <ChatBox
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        currentUser={currentUser}
                      />
                    </Box>
                  )}
                  {activeTab === "assigned" && (
                    <AssignApprovers
                      unAssignedUsers={approvalUsers}
                      assignedUsers={[]}
                      taskUsers={taskDetails.taskUsers}
                      handleTaskUsers={(taskUsers) => {
                        api
                          .post(`update-taskusers`, {
                            body: {
                              taskId: taskId,
                              taskUsers: taskUsers,
                            },
                          })
                          .then(async (res) => {
                            if (res.status) {
                              await api
                                .post(`check-task-access`, {
                                  body: {
                                    taskId: taskId,
                                    userId:
                                      appStore.loginResponse.user[0].userId,
                                  },
                                })
                                .then((response) => {
                                  setTaskDetails(response.data);
                                });
                            }
                          });
                      }}
                    />
                  )}
                  {activeTab === "history" && (
                    <Box sx={{ height: "100%" }}>
                      <TaskHistory history={history} />
                    </Box>
                  )}
                  {activeTab === "ApprovedHistory" && (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        marginRight: "40px",
                        maxWidth: "84%",
                        position: "relative",
                        borderRadius: 0,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <HeaderTypography title="ApprovedHistory" />
                      <ApprovedHistory taskId={taskId} data={workFlowhistory} />
                    </Box>
                  )}
                </ContentBox>
              </Slide>
              <Drawer
                variant="persistent"
                anchor="right"
                open={true}
                PaperProps={{
                  style: {
                    width: "65px",
                    position: "absolute",
                    top: 0,
                    right: 0,
                    height: "100%", // Adjusted to take up full height of the parent box
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
                    borderTopRightRadius: "5px",
                    borderBottomRightRadius: "5px",
                  },
                }}
              >
                <List style={{ flexGrow: 1 }}>
                  <ListItem button onClick={() => handleTabClick("actions")}>
                    <Tooltip title="Actions" placement="left">
                      <ActionIcon
                        color={activeTab === "actions" ? "primary" : "action"}
                      />
                    </Tooltip>
                  </ListItem>
                  {(localAppType === "Index" || localAppType === "Create") && (
                    <ListItem
                      button
                      onClick={() => handleTabClick("ApprovedHistory")}
                    >
                      <Tooltip title="Approved History" placement="left">
                        <CheckCircleIcon
                          color={
                            activeTab === "ApprovedHistory"
                              ? "primary"
                              : "action"
                          }
                        />
                      </Tooltip>
                    </ListItem>
                  )}
                  <ListItem
                    button
                    onClick={() => handleTabClick("attachments")}
                  >
                    <Tooltip title="Attachments" placement="left">
                      <AttachmentIcon
                        color={
                          activeTab === "attachments" ? "primary" : "action"
                        }
                      />
                    </Tooltip>
                  </ListItem>
                  <ListItem button onClick={() => handleTabClick("notes")}>
                    <Tooltip title="Notes" placement="left">
                      <NoteIcon
                        color={activeTab === "notes" ? "primary" : "action"}
                      />
                    </Tooltip>
                  </ListItem>
                  <ListItem button onClick={() => handleTabClick("history")}>
                    <Tooltip title="History" placement="left">
                      <HistoryIcon
                        color={activeTab === "history" ? "primary" : "action"}
                      />
                    </Tooltip>
                  </ListItem>
                  {/* <ListItem button onClick={() => handleTabClick("assigned")}>
            <Tooltip title="Assigned Users" placement="left">
              <Group color={activeTab === "assigned" ? "primary" : "action"} />
            </Tooltip>
          </ListItem> */}
                </List>
              </Drawer>
            </Box>
            <FilePreviewDialog
              open={open}
              blobUrl={blobUrl}
              handleClose={handleClose}
              loading={loading}
              key={"File-Preview-Dialog"}
            />
            <Toast
              open={toastObj.open}
              onClose={() => {
                setToastObj({ ...toastObj, open: false });
              }}
              message={toastObj.message}
              severity={toastObj.severity}
            />
          </Box>
        </Box>
      </>
    </div>
  );
};

export default TaskPanel;
