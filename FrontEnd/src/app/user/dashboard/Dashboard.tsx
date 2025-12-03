import React, { useEffect, useState } from "react";
import StatCards from "../..//views/dashboard/shared/StatCards";

import {
  Paper,
  Box,
  Typography,
  useTheme,
  styled,
  Grid,
  Tooltip,
  Icon,
  Card,
  Fab,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import appStore from "app/mobxStore/AppStore";
import taskStore from "app/mobxStore/TaskStore";
import { useNavigate } from "react-router-dom";
import StatCards2 from "../..//views/dashboard/shared/StatCards2";
import { Themecolors } from "api/Colors";
import { InfoBox } from "app/appComponents/HeaderBox";
import { UserTypes } from "app/types/User";
import { api } from "api/API";
import Show from "app/appComponents/Show";
import DashBoardListComponent from "app/views/dashboard/shared/DashBoardListComponent";
import { useEntity } from "app/EntityProvider";
import Loading from "app/components/Loading";
import HeaderTypography from "app/formComponents/HeaderTypography";
import { InboxRounded } from "@mui/icons-material";
import NoData from "api/NoData";

const H3 = styled("h3")(({ theme }) => ({
  ...theme.typography.h6,
  margin: 0,
  marginBottom: theme.spacing(1.5),
  color: theme.palette.text.primary,
}));

const Span = styled("span")(() => ({
  fontSize: "0.875rem",
  color: "rgba(0, 0, 0, 0.6)",
}));

const EmptyState: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <Box
    sx={{
      height: "80%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: (t) => t.palette.text.secondary,
      textAlign: "center",
      gap: 1,
      overflow: "hidden",
      p: 2,
      boxSizing: "border-box",
    }}
  >
    <Icon sx={{ fontSize: 36, opacity: 0.6 }}>inbox</Icon>
    <Typography variant="body1" fontWeight={600}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { entity, entities } = useEntity();
  const [userTasks, setUserTasks] = useState<Record<string, any>>({});
  const [taskCounts, setTaskCounts] = useState(appStore.loginResponse.tasks);
  const [pendingTasks, setPendintTasks] = useState(
    appStore.loginResponse.pendingTasks
  );
  const initialPendingAssignedTasks = (
    (appStore.loginResponse as any)?.pendingAssignedTasks ?? {}
  ) as Record<string, Record<string, number[]>>;
  const [pendingAssignedTasks, setPendingAssignedTasks] = useState(
    initialPendingAssignedTasks
  );
  const userType = appStore.loginResponse.user[0].userType;
  const [recentData, setRecentData] = useState([]);
  const [applicaitonOldData, SetApplicaitonOldData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksTab, setTasksTab] = useState(0);

  // Compute total counts for tab badge display
  const applicationTasksCount = React.useMemo((): number => {
    if (!pendingTasks || Object.keys(pendingTasks || {}).length === 0) return 0;
    try {
      return Object.values(pendingTasks as any).reduce<number>(
        (sum: number, types: any) => {
          const inner = Object.values(types || {}).reduce<number>(
            (s, arr: any) => s + (Array.isArray(arr) ? arr.length : 0),
            0
          );
          return sum + (typeof inner === "number" ? inner : 0);
        },
        0 as number
      );
    } catch {
      return 0;
    }
  }, [pendingTasks]);

  const assignedTasksCount = React.useMemo((): number => {
    if (
      !pendingAssignedTasks ||
      Object.keys(pendingAssignedTasks || {}).length === 0
    )
      return 0;
    try {
      return Object.values(pendingAssignedTasks as any).reduce<number>(
        (sum: number, types: any) => {
          const inner = Object.values(types || {}).reduce<number>(
            (innerSum, arr: any) =>
              innerSum + (Array.isArray(arr) ? arr.length : 0),
            0
          );
          return sum + (typeof inner === "number" ? inner : 0);
        },
        0 as number
      );
    } catch {
      return 0;
    }
  }, [pendingAssignedTasks]);

  const ownedTasksCount = React.useMemo((): number => {
    if (!userTasks || Object.keys(userTasks || {}).length === 0) return 0;
    try {
      return Object.values(userTasks as any).reduce<number>(
        (sum, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0),
        0
      );
    } catch {
      return 0;
    }
  }, [userTasks]);

  const loadAssignedTasks = async (type: string, taskIds: number[]) => {
    try {
      if (!taskIds || taskIds.length === 0) {
        return;
      }
      const response = await api.post(`assigned-tasks`, {
        body: {
          taskIds: taskIds,
        },
      });
      if (type == "old") SetApplicaitonOldData(response.data);
      else if (type == "new") {
        setRecentData(response.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    const userId = appStore.loginResponse.user[0].userId;
    // Fetch my assigned tasks for the second tab
    api.get(`assigned-tasks/user/${userId}`).then((res) => {
      if (res.status) setUserTasks(res.data);
    });

    if (userType === UserTypes.DEFAULT_USER) {
      // For default users, fetch assigned tasks directly
      api.get(`assigned-tasks/user/${userId}`).then((res) => {
        if (res.status) setUserTasks(res.data);
        setIsLoading(false);
      });
    } else {
      if (entity !== -1 && entities && entities.length > 0) {
        loadDashboard(userId, entity);
      } else {
        setIsLoading(false);
      }
    }
  }, [entity, entities]);
  const loadDashboard = (userId, selectedEntityId) => {
    setIsLoading(true);
    api
      .post(`user-dashboard`, {
        body: {
          userId: userId,
          entityId: selectedEntityId,
        },
      })
      .then((res) => {
        if (res.success) {
          setPendintTasks(res.data.pendingApplicationTasks);
          setPendingAssignedTasks(
            ((res.data as any)?.pendingAssignedTasks as Record<
              string,
              Record<string, number[]>
            >) || {}
          );
          setTaskCounts(res.data.tasks);
          loadAssignedTasks("old", res.data.oldestTaskIds);
          loadAssignedTasks("new", res.data.recentTaskIds);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleSelect = (item: any) => {
    navigate(`/user/task/${item?.id}`);
  };

  const renderGroupedTaskCards = (
    groups:
      | Map<string, Map<string, number[]>>
      | Record<string, Record<string, number[]>>
      | undefined,
    emptyTitle: string,
    emptySubtitle: string
  ): React.ReactNode => {
    const hasGroups =
      groups instanceof Map
        ? groups.size > 0
        : !!groups && Object.keys(groups as Record<string, unknown>).length > 0;

    if (!hasGroups) {
      return (
        <NoData
          icon={InboxRounded}
          title={emptyTitle}
          subtitle={emptySubtitle}
        />
      );
    }

    const groupEntries =
      groups instanceof Map
        ? Array.from(groups.entries())
        : Object.entries((groups || {}) as Record<string, Record<string, number[]>>);

    return groupEntries.map(([groupName, types]) => {
      const typeEntries =
        types instanceof Map
          ? Array.from(types.entries())
          : Object.entries((types || {}) as Record<string, number[]>);

      return (
        <Box key={groupName} sx={{ width: "100%", mb: 2 }}>
          <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
            {groupName}
          </Typography>
          <Grid container spacing={2} wrap="wrap" alignItems="stretch">
            {typeEntries.map(([typeName, taskIds]) => {
              const normalizedTaskIds = Array.isArray(taskIds) ? taskIds : [];

              return (
                <Grid
                  item
                  key={`${groupName}-${typeName}`}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  minWidth={200}
                  sx={{ display: "flex" }}
                  onClick={() => {
                    taskStore.setTaskIds(
                      normalizedTaskIds,
                      `${groupName} - ${typeName}`
                    );
                    navigate("/user/tasks");
                  }}
                >
                  <StyledCard>
                    <Box
                      sx={{
                        alignSelf: "flex-start",
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1.5,
                        bgcolor: (t) => t.palette.action.hover,
                        color: (t) => t.palette.text.primary,
                        fontSize: (t) => t.typography.pxToRem(12),
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      {typeName}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <ContentBox sx={{ flex: 1 }}>
                        <Icon className="icon">task_alt</Icon>
                        <Box
                          ml="8px"
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            lineHeight: 1,
                          }}
                        >
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{ m: 0 }}
                          >
                            {normalizedTaskIds.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tasks
                          </Typography>
                        </Box>
                      </ContentBox>

                      <Tooltip title="View Details" placement="top">
                        <FabIcon
                          size="medium"
                          sx={{
                            backgroundColor: (t) =>
                              t.palette.action.disabledOpacity,
                          }}
                        >
                          <Icon>arrow_right_alt</Icon>
                        </FabIcon>
                      </Tooltip>
                    </Box>
                  </StyledCard>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      );
    });
  };

  const renderOwnedTasks = (): React.ReactNode => {
    if (!userTasks || Object.keys(userTasks || {}).length === 0) {
      return (
        <NoData
          icon={InboxRounded}
          title="No owned tasks"
          subtitle="You do not have any owned tasks currently."
        />
      );
    }

    return (
      <Grid container spacing={2} wrap="wrap" alignItems="stretch">
        {Object.entries(userTasks).map(([documentTypeName, tasks]) => {
          const normalizedTasks = Array.isArray(tasks) ? tasks : [];

          return (
            <Grid
              item
              key={documentTypeName}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              minWidth={200}
              sx={{ display: "flex" }}
              onClick={() => {
                if (normalizedTasks.length === 1) {
                  const singleTaskId =
                    normalizedTasks[0]?.id ?? normalizedTasks[0];
                  navigate(`/user/task/${singleTaskId}`);
                } else {
                  const taskIds = normalizedTasks.map(
                    (t: any) => t?.id ?? t
                  );
                  taskStore.setTaskIds(
                    taskIds,
                    `Your Applications - ${documentTypeName}`
                  );
                  navigate("/user/tasks");
                }
              }}
            >
              <StyledCard>
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 1.5,
                    bgcolor: (t) => t.palette.action.hover,
                    color: (t) => t.palette.text.primary,
                    fontSize: (t) => t.typography.pxToRem(12),
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {documentTypeName}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <ContentBox sx={{ flex: 1 }}>
                    <Icon className="icon">assignment</Icon>
                    <Box
                      ml="8px"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        lineHeight: 1,
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ m: 0 }}
                      >
                        {normalizedTasks.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tasks
                      </Typography>
                    </Box>
                  </ContentBox>

                  <Tooltip title="View Details" placement="top">
                    <FabIcon
                      size="medium"
                      sx={{
                        backgroundColor: (t) =>
                          t.palette.action.disabledOpacity,
                      }}
                    >
                      <Icon>arrow_right_alt</Icon>
                    </FabIcon>
                  </Tooltip>
                </Box>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  if (isLoading) {
    return (
      <Box style={{ height: "96%" }}>
        <Loading />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        backgroundColor: theme.palette.background.default,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          height: "100%",
          gap: 2,
        }}
      >
        {/* Left Panel */}
        <Box
          sx={{
            flexBasis: { xs: "100%", md: "30%" },
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: { md: "calc(100vh - 80px)" },

            py: 2,
            overflow: "visible",
            height: "auto",
          }}
        >
          <Card
            sx={{
              p: 1.5,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: 1,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "auto",
              minHeight: 0,
            }}
          >
            <StatCards2
              onTime={taskCounts.onTime.length}
              Critical={taskCounts.critical.length}
              stacked
              sx={{ flex: 1, overflow: "hidden" }}
              handleCardClick={(type) => {
                if (type === "OnTime") {
                  taskStore.setTaskIds(taskCounts.onTime, "On Time");
                } else {
                  taskStore.setTaskIds(
                    taskCounts.critical,
                    "Priority Applications"
                  );
                }
                navigate("/user/tasks");
              }}
            />
          </Card>
          <Card
            sx={{
              p: 1.5,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: 1,
              display: "flex",
              flexDirection: "column",
              flex: 1,

              minHeight: 0,
              width: "100%",
              height: "auto",
              overflow: "visible",
            }}
          >
            {recentData && recentData.length > 0 ? (
              <DashBoardListComponent
                onButtonClick={handleSelect}
                heading="Recent applications"
                items={recentData}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Typography variant="h6" sx={{ px: 1, pt: 1 }}>
                  Recent applications
                </Typography>
                <NoData
                  icon={InboxRounded}
                  title="No recent applications"
                  subtitle="You haven’t submitted any applications yet."
                  iconSize={24}
                  titleSize={13}
                  subtitleSize={11}
                />
              </Box>
            )}
          </Card>
        </Box>
        {/* <Card
            sx={{
              p: 1.5,
              mt: 1,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: 1,
              minHeight: { md: "45%" },
              display: "flex",
              flexDirection: "column",
            }}
          >
            {applicaitonOldData && applicaitonOldData.length > 0 ? (
              <DashBoardListComponent
                onButtonClick={handleSelect}
                items={applicaitonOldData}
                heading="Old applications"
              />
            ) : (
              <>
                <Typography variant="h6" sx={{ px: 1, pt: 1 }}>
                  Old applications
                </Typography>
                <EmptyState
                  title="No old applications"
                  subtitle="There are no previous items."
                />
              </>
            )}
          </Card> */}

        {/* right panel */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: "calc(100vh - 80px)",
            // Prevent outer panel from scrolling so the tab content
            // can own the scroll while tabs remain visible
            overflowY: "hidden",
            py: 2,
          }}
        >
          <Show condition={userType === UserTypes.DEFAULT_USER}>
            <Paper
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: 2,
                width: "100%",
                mt: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
                boxShadow: 1,
                backgroundColor: (t) => t.palette.background.paper,
              }}
            >
              <H3 sx={{ color: Themecolors.DB_text2 }}>Tasks</H3>
              {Object.entries(userTasks).length > 0 ? (
                <StatCards
                  cardList={userTasks}
                  handleTasks={(tasks) => {
                    if (tasks.length == 1) {
                      navigate(`/user/task/${tasks[0].id}`);
                    } else {
                      const taskIds = tasks.map((t) => t.id);
                      taskStore.setTaskIds(taskIds, "Your Applications");
                      navigate("/user/tasks");
                    }
                  }}
                />
              ) : (
                <InfoBox>
                  <Span>No Tasks Assigned</Span>
                </InfoBox>
              )}
            </Paper>
          </Show>
          <Show condition={userType !== UserTypes.DEFAULT_USER}>
            <Card
              sx={{
                p: { xs: 1.5, md: 2 },
                width: "100%",
                backgroundColor: (t) => t.palette.background.paper,
                flex: "1 1 auto",
                // Use flex column; keep header fixed and content scrollable
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minHeight: 0,
              }}
            >
              <Tabs
                value={tasksTab}
                onChange={(_, v) => setTasksTab(v)}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Tab
                  value={0}
                  label={
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Box component="span">Application Tasks</Box>
                      <Chip
                        label={applicationTasksCount}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  }
                />
                <Tab
                  value={1}
                  label={
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Box component="span">Assigned Tasks</Box>
                      <Chip
                        label={assignedTasksCount}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  }
                />
                <Tab
                  value={2}
                  label={
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Box component="span">Owned Tasks</Box>
                      <Chip
                        label={ownedTasksCount}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  }
                />
              </Tabs>
              {/* Scrollable area for tab panels */}
              <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, pt: 2 }}>
                {tasksTab === 0 &&
                  renderGroupedTaskCards(
                    pendingTasks as any,
                    "No tasks",
                    "There are no applications to display right now"
                  )}
                {tasksTab === 1 &&
                  renderGroupedTaskCards(
                    pendingAssignedTasks,
                    "No assigned tasks",
                    "You do not have any assigned tasks currently."
                  )}
                {tasksTab === 2 && renderOwnedTasks()}
              </Box>
            </Card>
          </Show>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

const Heading = styled("h6")(({ theme }) => ({
  margin: 0,
  marginTop: theme.spacing(0.5),
  fontSize: theme.typography.pxToRem(18),
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const FabIcon = styled(Fab)(({ theme }) => ({
  width: 40,
  height: 40,
  minHeight: 40,
  boxShadow: "none",
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.action.hover,
  transition: theme.transitions.create(
    ["transform", "box-shadow", "background-color"],
    {
      duration: theme.transitions.duration.shortest,
    }
  ),
  "&:hover": {
    transform: "translateY(-2px)",
    backgroundColor: theme.palette.action.selected,
    boxShadow: theme.shadows[2],
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  "& small": {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  "& .icon": {
    opacity: 0.9,
    fontSize: 40,
    color: theme.palette.primary.main,
  },
}));

export const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  cursor: "pointer",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  width: "100%",
  height: "auto",
  transition: theme.transitions.create(
    ["transform", "box-shadow", "background-color"],
    {
      duration: theme.transitions.duration.shortest,
    }
  ),
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.action.hover,
  },
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(1.5) },
}));
