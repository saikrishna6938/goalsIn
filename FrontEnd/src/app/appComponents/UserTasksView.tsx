import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Icon,
} from "@mui/material";
import {
  ContentBox,
  FabIcon,
  H3,
  H1,
  IconBox,
  Span,
} from "..//views/dashboard/shared/StatCards2";
export interface AssignedTask {
  taskId: number;
  taskName: string;
  documentTypeAnswersId: number;
  documentTypeId: number;
  userId: number;
  createdDate: string; // assuming date is in ISO format as a string
  updatedDate: string; // assuming date is in ISO format as a string
  attachments: string; // assuming attachments are represented as a string (e.g., URLs)
  documentStateId: number;
  taskTableId: number;
  taskTagId: number;
  taskUsers: string; // assuming a comma-separated list of user IDs
  id: number;
  documentTypeName: string;
  documentTypeDescription: string;
  documentTypeObjectId: number;
  tableName: string;
  documentTypeRoles: string; // assuming a comma-separated list of role IDs
  documentGroupId: number;
  documentTypeTableId: number;
}
export interface TasksMap {
  [documentTypeName: string]: AssignedTask[];
}

interface DashboardButtonProps {
  documentTypeName: string;
  tasks: AssignedTask[];
}

const DashboardButton: React.FC<DashboardButtonProps> = ({
  documentTypeName,
  tasks,
}) => {
  return (
    <Card
      elevation={5}
      sx={{
        p: 3,
        m: 3,
        cursor: "pointer",
        transition: "box-shadow .3s, transform .2s",
        "&:hover": {
          boxShadow: "0px 8px 20px rgba(0,0,0,0.12)",
          transform: "scale(1.02)",
        },
        flexWrap: "wrap",
      }}
      onClick={() => {}}
    >
      <ContentBox>
        <FabIcon size="medium" sx={{ background: "rgba(9, 182, 109, 0.15)" }}>
          <Icon sx={{ color: "#08ad6c" }}>trending_up</Icon>
        </FabIcon>
        <H3 textcolor={"#08ad6c"}>{documentTypeName}</H3>
      </ContentBox>

      <ContentBox sx={{ pt: 2.5 }}>
        <H1>Tasks Count: {tasks.length}</H1>
        <IconBox sx={{ background: "rgba(9, 182, 109, 0.15)" }}>
          <Icon className="icon">expand_less</Icon>
        </IconBox>
        <Span textcolor={"#08ad6c"}>(+41%)</Span>
      </ContentBox>
    </Card>
  );
};

export const initialData: TasksMap = {
  "Student USA Form": [
    {
      taskId: 4,
      taskName: "Osmania",
      documentTypeAnswersId: 61,
      documentTypeId: 3,
      userId: 33,
      createdDate: "2023-12-02T04:19:31.000Z",
      updatedDate: "2023-09-20T10:12:10.000Z",
      attachments: "",
      documentStateId: 1,
      taskTableId: -1,
      taskTagId: -1,
      taskUsers: "34",
      id: 4,
      documentTypeName: "Student USA Form",
      documentTypeDescription: "Student USA Document",
      documentTypeObjectId: 3,
      tableName: "ApplicationUniversities",
      documentTypeRoles: "2,3",
      documentGroupId: 2,
      documentTypeTableId: 9,
    },
  ],
  "Student UK Form": [
    {
      taskId: 17,
      taskName: "John Doe",
      documentTypeAnswersId: 62,
      documentTypeId: 2,
      userId: 32,
      createdDate: "2023-12-01T12:09:48.000Z",
      updatedDate: "2023-10-30T04:28:26.000Z",
      attachments: "",
      documentStateId: 3,
      taskTableId: 12,
      taskTagId: 11,
      taskUsers: "36,35,34",
      id: 17,
      documentTypeName: "Student UK Form",
      documentTypeDescription: "Description of Document 1",
      documentTypeObjectId: 2,
      tableName: "UK_Universities",
      documentTypeRoles: "2",
      documentGroupId: 2,
      documentTypeTableId: 12,
    },
  ],
};
const UserTasksView: React.FC = () => {
  const [filter, setFilter] = useState("");
  const [data, setData] = useState<TasksMap>(initialData);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);

    // Implement the filtering logic here
    // For example, filter the initialData based on the input and update `data`
  };

  return (
    <Grid container xs={16} md={12} spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={16} md={6}>
        {Object.entries(data).map(([documentTypeName, tasks]) => (
          <DashboardButton
            key={documentTypeName}
            documentTypeName={documentTypeName}
            tasks={tasks}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default UserTasksView;
