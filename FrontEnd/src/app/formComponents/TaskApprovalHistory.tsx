import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemAvatar,
  Avatar,
  Box,
  Tooltip,
  IconButton,
  Icon,
  useTheme,
} from "@mui/material";
import HeaderTypography from "./HeaderTypography";
import { api } from "api/API";
import { blue } from "@mui/material/colors";
import { CheckCircle, Visibility } from "@mui/icons-material";
import { fonts } from "api/Colors";

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

interface TaskHistoryProps {
  taskId: number;
  actionCompletetrigger: boolean;
}

const TaskApprovalHistory: React.FC<TaskHistoryProps> = ({
  taskId,
  actionCompletetrigger,
}) => {
  const [history, setHistory] = useState<TaskEvent[]>([]);
  const { palette } = useTheme();
  useEffect(() => {
    api.get(`get-task-workflow/${taskId}`).then((res) => {
      if (res.status) {
        setHistory(res.data);
      }
    });
  }, [taskId, actionCompletetrigger]);

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
      elevation={3}
      sx={{
        flexDirection: "column",
        overflowY: "auto",
        backgroundColor: palette.background.paper,
      }}
    >
      <HeaderTypography title="Approval History" />
      {Object.entries(groupedHistory).length === 0 ? (
        <Box textAlign="center" m={2}>
          <Typography variant="caption" fontFamily={fonts.inter}>
            No History Found
          </Typography>
        </Box>
      ) : (
        <List sx={{ overflowY: "auto" }}>
          {Object.entries(groupedHistory).map(([date, events]) => (
            <React.Fragment key={date}>
            <ListItem>
              <Typography variant="overline" fontFamily={fonts.poppins}>
                {date}
              </Typography>
            </ListItem>
              <Divider />
              {events.map((event) => (
                <React.Fragment>
                  <ListItem
                    key={event.taskWorkflowId}
                    style={{ alignItems: "flex-start" }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{ backgroundColor: blue[100], color: blue[600] }}
                      >
                        {event.userFirstName[0] + event.userLastName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primaryTypographyProps={{ fontFamily: fonts.inter }}
                      secondaryTypographyProps={{ fontFamily: fonts.inter }}
                      primary={`  ${event.actionName}`}
                      secondary={`${event.userFirstName} ${
                        event.userLastName
                      } At ${new Date(
                        event.taskWorkflowDate
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}`}
                    />
                    <Tooltip title={event.taskNote}>
                      <IconButton>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Divider />
                  </ListItem>
                  {event.taskSelectedOption && (
                    <Box marginLeft={5}>
                      <ListItem style={{ justifyContent: "normal" }}>
                        <Icon style={{ marginRight: 5 }} color="primary">
                          <CheckCircle />
                        </Icon>
                        <Typography fontFamily={fonts.inter}>
                          {event.taskSelectedOption}
                        </Typography>
                      </ListItem>
                    </Box>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default TaskApprovalHistory;
