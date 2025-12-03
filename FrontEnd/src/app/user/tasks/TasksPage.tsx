import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  IconButton,
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { Search } from "@mui/icons-material";

import appStore from "app/mobxStore/AppStore";
import { api } from "api/API";
import TasksGrid from "./TasksGrid";
import DataGrid, { ColumnTypes } from "app/formComponents/DataGrid";
import { observer } from "mobx-react";
import taskStore from "app/mobxStore/TaskStore";
import { applicationColumns, taskDetailsColumns } from "./samples";
import { useNavigate } from "react-router-dom";
import CustomDropDown from "../genericCompoenets/CustomDropDown";
import CustomButton from "app/components/CustomButton ";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";

interface Task {
  id: number;
  name: string;
  description: string;
  // Add other task properties here
}

const TasksPage: React.FC = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
    taskStore.clearSelectedTaskIds();
  }, []);

  const [tasks, setTasks] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);

  const [selectedIntake, setSelectedIntake] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const loadTasks = async () => {
    const userId = appStore.loginResponse.user[0].userId;
    const response = await api.post(`assigned-tasks`, {
      body: {
        taskIds: taskStore.taskIds,
      },
    });
    if (response.status) {
      setTasks(response.data);
      setFilteredDocuments(response.data);
    }
  };

  useEffect(() => {
    let filteredData = [...tasks];
    if (selectedIntake && selectedIntake !== (-1 as any)) {
      filteredData = filteredData.filter(
        (doc) => doc.documentTypeName === selectedIntake
      );
    }

    if (selectedStatus && selectedStatus !== (-1 as any)) {
      filteredData = filteredData.filter(
        (doc) => doc.documentStateName === selectedStatus
      );
    }

    setFilteredDocuments(filteredData);
  }, [selectedIntake, selectedStatus, tasks]);

  const uniqueIntake = [
    ...new Map(tasks.map((doc) => [doc.documentTypeName, doc])).values(),
  ];

  const uniqueStatus = [
    ...new Map(tasks.map((doc) => [doc.documentStateName, doc])).values(),
  ];

  const handleIntake = (intake: any) => {
    if (intake === -1) {
      setSelectedIntake(intake);
    } else {
      setSelectedIntake(intake.documentTypeName);
    }
  };

  const handleStatus = (status: any) => {
    if (status === -1) {
      setSelectedStatus(status);
    } else {
      setSelectedStatus(status.documentStateName);
    }
  };

  const handleSelectedRowIds = (selectedIds: number[]) => {
    if (
      selectedIds.length !== taskStore.selectedTaskIds.length ||
      !selectedIds.every((id, idx) => id === taskStore.selectedTaskIds[idx])
    ) {
      taskStore.setSelectedTaskIds(selectedIds);
    }
  };

  return (
    <Paper
      sx={{
        height: "calc(99vh - 100px)",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4f6f8",
          overflow: "auto",
          width: "100%",
          height: "100%",
          paddingY: 0,
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            paddingX: 0,
            overflowY: "hidden",
            paddingTop: 1,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 550, paddingX: 2 }}>
            {taskStore.pageHeader}
          </Typography>

          <DataGrid
            onSelection={async (id) => {
              if (!id) return;

              navigate(`/user/task/${id}`);
            }}
            tasks={filteredDocuments as any}
            columns={applicationColumns}
            defaultHeight="100%"
            multiSelect={true}
            onSelectedRowIds={handleSelectedRowIds}
            headerRender={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PrimaryButton
                  label={`Open Tasks (${taskStore.selectedTaskIds.length})`}
                  type="button"
                  onClick={() => {
                    if (taskStore.selectedTaskIds.length > 0) {
                      navigate(`/user/task/${taskStore.selectedTaskIds[0]}`);
                    }
                  }}
                  height={"1.9rem"}
                  backgroundColor={"white"}
                />
                <CustomDropDown
                  label="Intake"
                  options={uniqueIntake}
                  onChange={handleIntake}
                  renderOption={(doc: any) => <>{doc.documentTypeName}</>}
                  height={"1.9rem"}
                  bgcolor={"white"}
                />
                <CustomDropDown
                  label="Status"
                  options={uniqueStatus}
                  onChange={handleStatus}
                  renderOption={(doc: any) => <>{doc.documentStateName}</>}
                  height={"1.9rem"}
                  bgcolor={"white"}
                />
              </Box>
            }
          />
        </CardContent>
      </Box>
    </Paper>
  );
});
export default TasksPage;
