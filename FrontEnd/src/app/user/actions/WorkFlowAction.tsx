import React, { useEffect, useState } from "react";
import { List, Avatar, Typography, Box, useTheme } from "@mui/material";
import { blue } from "@mui/material/colors";
import appStore from "app/mobxStore/AppStore";
import { api } from "api/API";
import NoData from "api/NoData";
import PlagiarismTwoToneIcon from "@mui/icons-material/PlagiarismTwoTone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useParams } from "react-router-dom";

export interface TaskEvent {
  taskWorkflowId: number;
  taskId: number;
  taskSelectedOption: string;
  taskNote: string;
  taskWorkflowDate: string;
  taskUserId: string;
  taskActionId: string;
  userFirstName: string;
  userLastName: string;
  actionName: string;
}

interface Props {
  taskId: any;
}

const WorkFlowAction: React.FC<Props> = ({ taskId }) => {
  const [history, setHistory] = useState<TaskEvent[]>([]);
  const userType = appStore.loginResponse.user[0].userType;
  const theme = useTheme();
  const params = useParams();
  const paramTaskId = params.id;

  useEffect(() => {
    const idToFetch = paramTaskId || taskId;
    if (!idToFetch) return;

    api.get(`get-task-workflow/${idToFetch}`).then((res) => {
      setHistory(res.data || []);
    });
  }, [paramTaskId, taskId]);

  const sortedHistory = history.sort(
    (a, b) =>
      new Date(b.taskWorkflowDate).getTime() -
      new Date(a.taskWorkflowDate).getTime()
  );

  const groupedHistory = sortedHistory.reduce<{ [key: string]: TaskEvent[] }>(
    (acc, event) => {
      const date = new Date(event.taskWorkflowDate).toLocaleDateString();
      acc[date] = acc[date] || [];
      acc[date].push(event);
      return acc;
    },
    {}
  );

  return (
    <Box
      sx={{
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {Object.entries(groupedHistory).length === 0 ? (
        <Box sx={{ height: "100%", width: "100%", mb: 8, mt: 2 }}>
          <NoData
            icon={PlagiarismTwoToneIcon}
            title="No Workflow Action Found"
            subtitle="No workflow actions performed yet."
            iconSize={26}
            titleSize={14}
            subtitleSize={10}
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flex: 1,
            overflowY: "auto",
            mb: 3,
          }}
        >
          <List sx={{ width: "100%" }}>
            {Object.entries(groupedHistory).map(([date, events]) => (
              <React.Fragment key={date}>
                <Box sx={{ px: 3, mt: 3, mb: 5, position: "relative" }}>
                  {events.map((event) => (
                    <Box
                      key={event.taskWorkflowId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 3,
                      }}
                    >
                      {/* LEFT SIDE: Avatar + Name */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            mr: 1,
                            "&::after": {
                              content: '""',
                              position: "absolute",
                              top: "100%",
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "2px",
                              height: "100%",
                              borderLeft: "2px dotted #bdbdbd",
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              backgroundColor: blue[100],
                              color: blue[600],
                              height: 27,
                              width: 27,
                              fontSize: 14,
                              flexShrink: 0,
                              zIndex: 2,
                            }}
                          >
                            {event.userFirstName[0] + event.userLastName[0]}
                          </Avatar>
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            ml: 1,
                            flexShrink: 1,
                            minWidth: 0,
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                            fontSize: "1rem",
                          }}
                        >
                          {event.actionName}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          textAlign: "right",
                          flex: 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.68rem",
                            color: "#757575",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {new Date(event.taskWorkflowDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <AccessTimeIcon
                            sx={{
                              fontSize: "0.82rem",
                              color: "#9e9e9e",
                              mr: 0.5,
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: "0.62rem",
                              color: "#9e9e9e",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {new Date(
                              event.taskWorkflowDate
                            ).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default WorkFlowAction;
