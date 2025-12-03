import {
  Box,
  Paper,
  Button,
  styled,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  Card,
  Typography,
  Icon,
} from "@mui/material";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";
import React, { useEffect, useState } from "react";
// Local styled card matching dashboard task card design
// Kept local to avoid affecting other pages that reuse StyledCardComponent.
import { useNavigate } from "react-router-dom";
import { AssuredWorkloadOutlined, Search } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { Themecolors } from "api/Colors";
import Loading from "app/components/Loading";
import { IndexType } from "app/types/User";
import FilteredSearch from "app/components/regularinputs/FilteredSearch";

// Styled components adapted from user/dashboard/Dashboard.tsx for visual consistency
const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  cursor: "pointer",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
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
}));

const ContentBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: theme.spacing(1.5),
  "& .icon": {
    opacity: 0.9,
    fontSize: 40,
    color: theme.palette.primary.main,
  },
}));

interface DocumentType {
  documentGroupName: string;
  documentTypeId?: number;
  documentTypeName: string;
  documentTypeDescription: string;
  documentGroupId: number;
  documentTypeTableId: number;
}

const CreateForms: React.FC = () => {
  const navigate = useNavigate();
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [groupedDocuments, setGroupedDocuments] = useState<
    Map<string, DocumentType[]>
  >(new Map());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, SetLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(
          `user/document-types/${appStore.loginResponse.user[0].userId}/${IndexType.CREATE}`
        );
        setDocumentTypes(response.data);
      } catch (error) {
        console.error("Error fetching document types:", error);
      } finally {
        SetLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (documentTypes.length > 0) {
      const actionMap: Map<string, DocumentType[]> = new Map();
      documentTypes.forEach((doc) => {
        const groupName = doc.documentGroupName;

        if (!actionMap.has(groupName)) {
          actionMap.set(groupName, []);
        }
        actionMap.get(groupName)?.push(doc);
      });
      setGroupedDocuments(actionMap);
    }
  }, [documentTypes]);

  const handleGroupToggle = (groupName: string) => {
    setSelectedGroups((prev) => {
      const updatedGroups = new Set(prev);
      if (updatedGroups.has(groupName)) {
        updatedGroups.delete(groupName);
      } else {
        updatedGroups.add(groupName);
      }
      return new Set(updatedGroups);
    });
  };
  const handleCall = (id: number, formTitle: string) => {
    navigate(`/user/forms/${id}?formTitle=${formTitle}`);
  };

  return (
    <Paper sx={{ height: "99%", width: "100%", p: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          background: "linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)",
          p: 2,
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: isMobile ? "center" : "flex-start",
          }}
        >
          {Array.from(groupedDocuments.keys()).map((groupName) => (
            <Button
              key={groupName}
              type="button"
              onClick={() => handleGroupToggle(groupName)}
              variant={selectedGroups.has(groupName) ? "contained" : "outlined"}
              color="primary"
              sx={{
                height: "2.2em",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: selectedGroups.has(groupName) ? "bold" : "normal",
              }}
            >
              {groupName}
              {selectedGroups.has(groupName) && (
                <CloseIcon sx={{ fontSize: "1.3em" }} />
              )}
            </Button>
          ))}
        </Box>
        <FilteredSearch
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth={isMobile}
        />
      </Box>
      <>
        {loading ? (
          <Box
            sx={{
              height: "85%",
              width: "90%",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <Loading />
          </Box>
        ) : (
          <Box
            sx={{
              display: "block",
              flexWrap: "wrap",
              gap: 2,
              mt: 2,
              px: 1,
              overflowY: "auto",
              overflowX: "hidden",
              height: "100%",
              maxHeight: "calc(93vh - 135px)",
            }}
          >
            {Array.from(
              selectedGroups.size > 0 ? selectedGroups : groupedDocuments.keys()
            ).map((groupName) => {
              const documents = groupedDocuments.get(groupName) || [];
              const filteredDocuments = documents.filter((doc) =>
                doc.documentTypeName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              );

              if (filteredDocuments.length === 0) return null;

              return (
                <Box
                  key={groupName}
                  sx={{
                    width: "100%",
                    marginBottom: "10px",
                  }}
                >
                  <Box
                    sx={{
                      fontSize: "1em",
                      mb: 0.5,
                      px: 1,
                      py: 0.5,
                      backgroundColor: Themecolors.Dg_bg1,
                      borderRadius: 1,
                      width: "fit-content",
                    }}
                  >
                    {groupName}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      my: 1,
                      justifyContent: isMobile ? "center" : "flex-start",
                    }}
                  >
                    {filteredDocuments.map((doc) => (
                      <Box
                        key={doc.documentTypeId}
                        sx={{
                          flex: "1 1 240px",
                          minWidth: 220,
                          maxWidth: 360,
                        }}
                      >
                        <StyledCard
                          onClick={() =>
                            handleCall(
                              doc.documentTypeId!,
                              doc.documentTypeName
                            )
                          }
                        >
                          <ContentBox>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <AssuredWorkloadOutlined className="icon" />
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600, lineHeight: 1.2 }}
                                noWrap
                                title={doc.documentTypeName}
                              >
                                {doc.documentTypeName}
                              </Typography>
                            </Box>
                            <Icon
                              sx={{ color: (t) => t.palette.text.secondary }}
                            >
                              arrow_right_alt
                            </Icon>
                          </ContentBox>
                        </StyledCard>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </>
    </Paper>
  );
};

export default CreateForms;
