import React, { useEffect, useState } from "react";
import DocumentForm from "../DocumentForm";
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import appStore from "app/mobxStore/AppStore";
import { api } from "api/API";
import { observer } from "mobx-react-lite";
import DynamicField from "./DynamicField";
import jsonData from "./Sample.json";
import { IndexType } from "app/types/User";

const DocReviewForm: React.FC = observer(() => {
  const navigate = useNavigate();
  const [entity, setEntity] = useState<string>("Select Entity");
  const [docName, setDocName] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [userObj, SetUserObj] = useState(null);
  const [values, setValues] = useState<any>({});
  const [error, SetError] = useState("Please select the user");

  useEffect(() => {
    const userType = appStore.loginResponse?.user?.[0]?.userType;
    if (!appStore.selectedEntity || !userType) return;
    const fetchUsers = async () => {
      try {
        const result = await api.get(
          `job/users/${appStore.selectedEntity}/${userType}`
        );
        setUsers(result.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [appStore.selectedEntity]);

  useEffect(() => {
    const selectedEntityName =
      appStore.userEntities.find((e) => e.entityId === appStore.selectedEntity)
        ?.entityName ?? "Select Entity";
    setEntity(selectedEntityName);
  }, [appStore.selectedEntity]);

  const location = useLocation();
  const currentPath = location.pathname;
  const params = currentPath.split("/");
  const documentId = params[params.length - 1];

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const decodedFormTitle = searchParams.get("formTitle");
    if (decodedFormTitle) {
      setDocName(decodedFormTitle);
    }
  }, [location.search]);

  const handleValueChange = (fieldId: any, value: any) => {
    const userId = value;
    if (userId) {
      SetError("");
    }
    const selectedUser = users.find((user) => user.userId === userId);
    SetUserObj(selectedUser);
  };

  const handleClose = () => {
    navigate(`/admin/create_forms`);
  };

  const handleshow = () => {
    appStore.showToast("Profile submitted successfully ", "success");
  };

  const getSelections = (fieldSelections: any) => {
    if (fieldSelections === "{Entity_Users}") {
      return users.map((user) => ({
        label: user.userFullName,
        value: user.userId,
      }));
    } else if (Array.isArray(fieldSelections)) {
      // Return static options from JSON
      return fieldSelections.map((item) => ({
        label: item,
        value: item,
      }));
    }
    return [];
  };

  return (
    <Paper
      sx={{
        height: "98%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: 1,
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          maxHeight: "calc(95vh - 60px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
          }}
        >
          <DocumentForm
            showCloneButton={false}
            documentTypeId={Number(documentId)}
            isInitialCheck={false}
            userObj={appStore.loginResponse.user[0]}
            onCloseMainDialog={handleClose}
            showFormDoc={handleshow}
            indexType={IndexType.INDEX}
          />
        </Box>
      </Box>

      {/* right side content ---- start*/}

      <Box
        sx={{
          width: "27em",
          height: "100%",
          ml: 1,
          borderRadius: "7px",
          padding: "0.6em 1.1em",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #ccc",
        }}
      >
        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
          }}
        >
          <Box sx={{ ml: 1, mb: 1.5 }}>
            <Typography sx={{ fontWeight: "bold", fontSize: "1.2em" }}>
              {docName || "No Document Selected"}
            </Typography>
            <Typography sx={{ fontSize: "0.9em", ml: "5px" }}>
              {entity}
            </Typography>
          </Box>
          {/* {jsonData.tags.map((tag, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <DynamicField
                item={tag}
                values={values}
                errors={error}
                getSelections={() => getSelections(tag.fieldSelections)}
                handleChange={(value: any) => {
                  handleValueChange(tag.tagId, value);
                }}
              />
            </Box>
          ))} */}
        </Box>
      </Box>
    </Paper>
  );
});

export default DocReviewForm;
