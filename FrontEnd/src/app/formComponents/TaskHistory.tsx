import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import HeaderTypography from "./HeaderTypography";

export interface TaskEvent {
  historyId: number;
  historyUserId: number;
  historyCreatedDate: string; // assuming this is in ISO format: "YYYY-MM-DDTHH:MM:SSZ"
  historyTaskId: number;
  historyTypeName: string;
  userFirstName: string;
  userLastName: string;
}

interface TaskHistoryProps {
  history: TaskEvent[];
}

const TaskHistory: React.FC<TaskHistoryProps> = ({ history }) => {
  // Group history by date
  const groupedHistory: { [key: string]: TaskEvent[] } = {};

  history.sort(
    (a, b) =>
      new Date(a.historyCreatedDate).getTime() -
      new Date(b.historyCreatedDate).getTime()
  );

  history.forEach((event) => {
    const date = new Date(event.historyCreatedDate).toLocaleDateString();
    if (!groupedHistory[date]) {
      groupedHistory[date] = [];
    }
    groupedHistory[date].push(event);
  });

  return (
    <Paper
      elevation={3}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: "84%",
        borderRadius: 0,
      }}
    >
      <HeaderTypography title="Task History" />
      <List style={{ overflowY: "auto" }}>
        {Object.entries(groupedHistory).map(([date, events], index) => (
          <React.Fragment key={index}>
            <ListItem>
              <Typography sx={{ fontSize: "1.1em" }}>{date}</Typography>
            </ListItem>
            <Divider />
            {events.map((event) => (
              <ListItem key={event.historyId}>
                <ListItemText
                  primary={`${event.userFirstName} ${
                    event.userLastName
                  } at ${new Date(event.historyCreatedDate).toLocaleTimeString(
                    "en-US",
                    { hour: "numeric", minute: "numeric", hour12: true }
                  )}`}
                  secondary={event.historyTypeName}
                />
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default TaskHistory;
