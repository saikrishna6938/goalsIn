import React, { useEffect, useState } from "react";
import PlagiarismTwoToneIcon from "@mui/icons-material/PlagiarismTwoTone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  Paper,
  Typography,
  List,
  ListItem,
  Box,
  Tooltip,
  Avatar,
  useTheme,
} from "@mui/material";
import { api } from "api/API";
import { blue } from "@mui/material/colors";
import NoData from "./NoData";
import appStore from "app/mobxStore/AppStore";
import { useParams } from "react-router-dom";
import Loading from "app/components/Loading";

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

interface HaroProps {
  taskId: any;
  data?: any;
}

const ApprovedHistory: React.FC<HaroProps> = ({ taskId, data }) => {
  const [history, setHistory] = useState<TaskEvent[]>([]);
  const theme = useTheme();
  const userType = appStore.loginResponse.user[0].userType;
  const [loading, SetLoading] = useState(true);
  const params = useParams();
  const paramTaskId = params.id;

  useEffect(() => {
    const idToFetch = paramTaskId || taskId;
    if (!idToFetch) return;
    SetLoading(true);
    setHistory(data);
    SetLoading(false);
  }, [data, taskId]);

  // Sort and group history
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
    <Paper
      sx={{
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
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
        <>
          {Object.entries(groupedHistory).length === 0 ? (
            <Box sx={{ height: "100%", width: "100%" }}>
              <NoData
                icon={PlagiarismTwoToneIcon}
                title="No History Found"
                subtitle="Still no action performed on this task."
                iconSize={38}
                titleSize={22}
                subtitleSize={14}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flex: 1,
                overflowY: "auto",
              }}
            >
              <List sx={{ width: "100%" }}>
                {Object.entries(groupedHistory).map(([date, events]) => (
                  <React.Fragment key={date}>
                    <Box
                      sx={{
                        borderTop: "1px solid #bdbdbd",
                        borderBottom: "1px solid #bdbdbd",
                        padding: "8px",
                        fontWeight: "bold",
                        mx: 5.5,
                      }}
                    >
                      {date}
                    </Box>
                    <Box
                      sx={{
                        ml: 4,
                        mr: 5,
                        mt: 3,
                        mb: 5,
                      }}
                    >
                      {events.map((event, index) => (
                        <React.Fragment key={event.taskWorkflowId}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px",
                              marginTop: "10px",
                            }}
                          >
                            <Box
                              sx={{
                                flexShrink: 0,
                                marginRight: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  backgroundColor: blue[100],
                                  color: blue[600],
                                  height: 27,
                                  width: 27,
                                  fontSize: 14,
                                  ml: "5px",
                                }}
                              >
                                {event.userFirstName[0] + event.userLastName[0]}
                              </Avatar>
                            </Box>
                            <Box
                              sx={{
                                flex: 1,
                                display: "flex",
                              }}
                            >
                              <Typography
                                sx={{ fontSize: 17, fontWeight: 450, ml: 1.6 }}
                              >
                                {event.actionName}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                flexShrink: 0,
                                marginLeft: 2,
                                color: "#9e9e9e",
                              }}
                            >
                              {index === 0 ||
                              new Date(
                                events[index - 1].taskWorkflowDate
                              ).getMinutes() !==
                                new Date(
                                  event.taskWorkflowDate
                                ).getMinutes() ? (
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <AccessTimeIcon
                                    sx={{ fontSize: 18, marginRight: "2px" }}
                                  />
                                  <Typography
                                    align="right"
                                    sx={{
                                      fontSize: 12,
                                      fontWeight: 410,
                                      color: "#9e9e9e",
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
                              ) : (
                                <Box padding={"4px"} />
                              )}
                            </Box>
                          </Box>
                          {(event.taskSelectedOption || event.taskNote) && (
                            <Box sx={{ ml: 3 }}>
                              <ListItem
                                style={{
                                  borderLeft: "2px dashed #bdbdbd",
                                  paddingLeft: "20px",
                                  paddingTop: "0px",
                                }}
                              >
                                <Box sx={{ ml: 3 }}>
                                  <Typography
                                    sx={{
                                      marginBottom: "15px",
                                      fontSize: 12,
                                      fontWeight: "bold",
                                    }}
                                  >
                                    by :
                                    <span
                                      style={{
                                        fontWeight: 550,
                                        marginLeft: "10px",
                                        color: theme.palette.primary.main,
                                      }}
                                    >{`${event.userFirstName} ${event.userLastName} `}</span>
                                  </Typography>
                                  {event.taskSelectedOption && (
                                    <Typography
                                      sx={{
                                        marginBottom: "6px",
                                        fontWeight: 550,
                                      }}
                                    >
                                      Option :
                                      <span
                                        style={{
                                          marginLeft: "10px",
                                          fontWeight: 400,
                                        }}
                                      >
                                        {event.taskSelectedOption}
                                      </span>
                                    </Typography>
                                  )}
                                  {event.taskNote && userType !== 2 && (
                                    <Tooltip title={event.taskNote}>
                                      <Typography sx={{ fontWeight: 550 }}>
                                        Notes :
                                        <span
                                          style={{
                                            marginLeft: "10px",
                                            fontWeight: 400,
                                          }}
                                        >
                                          {event.taskNote}
                                        </span>
                                      </Typography>
                                    </Tooltip>
                                  )}
                                </Box>
                              </ListItem>
                            </Box>
                          )}
                        </React.Fragment>
                      ))}
                    </Box>
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ApprovedHistory;
