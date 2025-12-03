import React, { useEffect, useState } from "react";
import { Typography, Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Themecolors, fonts } from "api/Colors";
import { api } from "api/API";
import { ProfileHeaderStyle } from "app/appComponents/HeaderBox";
import Loading from "app/components/Loading";

// Define TypeScript interfaces for the data structure
interface Detail {
  name: string;
  value: string; // Key in tableData
}

interface TaskTagDetail {
  title: string;
  description: string;
  details: Detail[];
  columnType: number;
}

interface TableData {
  [key: string]: any; // Using any for simplicity; you could define a more specific type
}

interface Props {
  taskTagId: number;
  taskTableId: number;
}

// React component
const TaskTagDetails: React.FC<Props> = ({ taskTagId, taskTableId }) => {
  const [taskTagDetailsData, settaskTagDetailsData] =
    useState<TaskTagDetail[]>(null);
  const [tableData, setTableData] = useState<TableData>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    try {
      api
        .get(`task/tagDetails/${taskTableId}/${taskTagId}`)
        .then((response) => {
          if (response.status) {
            settaskTagDetailsData(response.data.taskTagDetailsData);
            setTableData(response.data.tableData);
          } else {
          }
        });
    } catch (error) {
      throw new Error("Network response was not ok");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        <Loading />
      </Box>
    );
  if (!taskTagDetailsData) return <></>;

  return (
    <>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {taskTagDetailsData.map((tagDetail, index) => (
            <StyledSection key={index}>
              <StyledTitle>
                <ProfileHeaderStyle>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: Themecolors.H_text1,
                      cursor: "pointer",
                      fontFamily: fonts.poppins,
                    }}
                  >
                    {tagDetail.title}
                  </Typography>
                </ProfileHeaderStyle>
              </StyledTitle>
              {tagDetail.columnType === 1 ? (
                // For two-column layout
                <StyledGroup>
                  {tagDetail.details.map((detail, idx) => (
                    <StyledField key={idx}>
                      <FieldLabel>{detail.name}:</FieldLabel>
                      <FieldValue>{tableData[detail.value]}</FieldValue>
                    </StyledField>
                  ))}
                </StyledGroup>
              ) : (
                // For one-column layout
                tagDetail.details.map((detail, idx) => (
                  <StyledSingleField key={idx}>
                    <FieldLabel>{detail.name}:</FieldLabel>
                    <FieldValue>{tableData[detail.value]}</FieldValue>
                  </StyledSingleField>
                ))
              )}
            </StyledSection>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default TaskTagDetails;

const StyledSection = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  display: "grid",
  gridTemplateColumns: "repeat(1, 1fr)",
  marginBottom: theme.spacing(1),
}));

const StyledGroup = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  width: "100%",
  padding: `0px ${theme.spacing(0.5)} ${theme.spacing(0.5)} ${theme.spacing(0.5)}`,
}));

const StyledField = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  borderRadius: 4,
}));

// Styled component for one-column layout
const StyledSingleField = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  boxSizing: "border-box",
  marginBottom: theme.spacing(1),
  borderRadius: 4,
}));

const StyledTitle = styled(Box)({
  marginBottom: 2,
  gridColumn: "span 2",
  cursor: "pointer",
  marginLeft: 4,
});

const FieldLabel = styled(Typography)({
  width: "100%",
  fontWeight: 500,
  marginBottom: 4,
  fontSize: "0.75rem",
  fontFamily: fonts.inter,
});

const FieldValue = styled(Typography)({
  width: "100%",
  fontWeight: 400,
  color: Themecolors.InputText_Color2,
  fontSize: "0.875rem",
  wordWrap: "break-word",
  overflowWrap: "break-word",
  whiteSpace: "normal",
  display: "block",
  wordBreak: "break-word",
  fontFamily: fonts.open_sans,
});
