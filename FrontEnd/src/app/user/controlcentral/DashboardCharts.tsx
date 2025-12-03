import React from "react";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import { Box, Card, Typography } from "@mui/material";
import DataGrid from "app/formComponents/DataGrid";
import dashboardStore from "./DashboardStore";
import { observer } from "mobx-react";

interface DashboardChartsProps {
  data: any;
  showSkeletonLoader?: boolean;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  data,
  showSkeletonLoader,
}) => {
  const type = data?.type;
  switch (type) {
    case "pie":
      return <RenderPieChart data={data} />;
    case "bar":
      return <RenderBarChart data={data} />;
    case "data-grid":
      return (
        <RenderDataGrid data={data} showSkeletonLoader={showSkeletonLoader} />
      );
    default:
      return null;
  }
};

const RenderPieChart = observer(({ data }: { data: any }) => {
  const handlePieSelect = (item) => {
    if (data.filterFields.length > 0) {
      const selected = data?.data.find((f) => f.status === item);
      const active = { [data.filterFields]: selected[data.filterFields] };
      dashboardStore.setSelectedFilter(active);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <PieChart
        title={data.title}
        data={data?.data}
        onSelection={handlePieSelect}
      />
    </Box>
  );
});

const RenderBarChart = observer(({ data }: { data: any }) => {
  const handleBarSelect = (item) => {
    if (data.filterFields.length > 0) {
      const selected = data?.data.find((f) => f.name === item);
      const active = { [data.filterFields]: selected[data.filterFields] };
      dashboardStore.setSelectedFilter(active);
    }
  };
  const rows =
    dashboardStore.selectedFilter && data.filters.length > 0
      ? data.data.filter((f) =>
          Object.entries(dashboardStore.selectedFilter).every(
            ([key, value]) => {
              return key in f ? f[key] === value : true; // ✅ Ignore if key doesn't exist
            }
          )
        )
      : data?.data;
  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <BarChart title={data.title} data={rows} onSelection={handleBarSelect} />
    </Box>
  );
});

const RenderDataGrid = observer(
  ({ data, showSkeletonLoader }: { data: any; showSkeletonLoader: any }) => {
    const handleSelection = (id: any) => {
      if (data.filterFields?.length > 0) {
        const selected = data?.data.find((f) => f.id === id);

        if (selected) {
          const activeFilter = {
            [data.filterFields]: selected[data.filterFields] || null,
          };

          dashboardStore.setSelectedFilter(activeFilter);
        }
      }
    };

    const rows =
      dashboardStore.selectedFilter && data.filters.length > 0
        ? data.data.filter((f) =>
            Object.entries(dashboardStore.selectedFilter).every(
              ([key, value]) => f[key] === value
            )
          )
        : data?.data;

    return (
      <Card
        sx={{
          width: "99.5%",
          height: "99.5%",
          padding: "2px 5px 5px 5px",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.9em",
            fontWeight: "bold",
            padding: "2px 1px",
          }}
        >
          {data?.title}
        </Typography>
        <DataGrid
          key={`${data.title}`}
          onSelection={handleSelection}
          tasks={rows}
          columns={data.columnHeader}
          defaultHeight="calc(100% - 20px)"
          showSkeletonLoader={showSkeletonLoader}
        />
      </Card>
    );
  }
);

export default DashboardCharts;
