import { Avatar, Box, Paper, Typography } from "@mui/material";
import { api } from "api/API";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import DataGrid from "app/formComponents/DataGrid";
import React, { useEffect, useState } from "react";
import { applicationsColumns, taskDetailsColumns } from "../tasks/samples";
import { useNavigate } from "react-router-dom";
import UserHeaderComponent, {
  UserHeaderBox,
  UserInfoBox,
} from "app/appComponents/UserHeaderComponent";
import { Themecolors } from "api/Colors";
interface TasksViewProps {
  userId: number;
  userEmail?: string;
  Name?: string;
  userImage?: any;
  documentTypeId?: number;
  documentTypeName?: string;
  documentGroupName?: string;
}

export interface TaskDetails {
  taskId: number;
  taskName: string;
  documentTypeAnswersId: number;
  documentTypeId: number;
  userId: number;
  createdDate: string;
  updatedDate: string;
  attachments: string;
  documentStateId: number;
  taskTableId: number;
  taskTagId: number;
  taskUsers: string;
}
export const TasksView = (props: TasksViewProps) => {
  const { userId, documentTypeId } = props;
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    initData();
  }, [userId, documentTypeId]);
  const [showSkeletonLoader, SetShowSkeletonLoader] = useState(false);

  const initData = () => {
    SetShowSkeletonLoader(true);

    api
      .get(`tasks/user/${userId}/${documentTypeId}`)
      .then((res) => {
        if (res.status) setTasks(res.data);
        else setTasks([]);
      })
      .finally(() => SetShowSkeletonLoader(false));
  };
  return (
    <Paper
      style={{
        marginTop: "5px",
        height: "100%",
        maxHeight: "calc(100vh - 100px)",
        overflow: "hidden",
        borderRadius: 0,
      }}
    >
      <UserHeaderComponent
        userInfoComponent={
          <>
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
              <UserInfoBox>
                <Typography variant="h6" sx={{ color: Themecolors.UH_text3 }}>
                  {props.Name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: Themecolors.UH_text3 }}
                >
                  {props.userEmail}
                </Typography>
              </UserInfoBox>
            </UserHeaderBox>
            <UserHeaderBox>
              <UserInfoBox>
                <Typography variant="body2">
                  {props.documentGroupName}
                </Typography>
                <Typography variant="body2">
                  {props.documentTypeName}
                </Typography>
              </UserInfoBox>
            </UserHeaderBox>
          </>
        }
      />
      <Box height="100%">
        <DataGrid
          showSkeletonLoader={showSkeletonLoader}
          onSelection={(id) => {
            if (id) navigate(`/user/task/${id}`);
          }}
          tasks={tasks as any}
          columns={taskDetailsColumns}
          defaultHeight="calc(100% - 73px)"
        />
      </Box>
    </Paper>
  );
};
