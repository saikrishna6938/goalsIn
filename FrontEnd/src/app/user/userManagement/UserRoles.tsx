import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Typography,
} from "@mui/material";
import HeaderTypography from "app/formComponents/HeaderTypography";
import PanelComponent from "app/formComponents/PanelComponent";
import { api } from "api/API";
import Toast, { ToastProps } from "app/formComponents/Toast";
import appStore from "app/mobxStore/AppStore";
import { Themecolors } from "api/Colors";
import { Search } from "@mui/icons-material";
import UserHeaderComponent, {
  UserHeaderBox,
  UserInfoBox,
} from "app/appComponents/UserHeaderComponent";
import { User } from "app/types/User";

interface FormValues {
  roles: { [key: string]: boolean };
  entities: { [key: string]: boolean };
}

interface UserRolesProps {
  roles?: Role[];
  entities?: Entity[];
  user: User;
  reloadRoles?: Function;
}

const allEntity = {
  entityId: -1,
  entityName: "All Entities",
  name: "",
  entityDescription: "",
  entityLocation: "",
  entityPhone: "",
};

const UserRoles: React.FC<UserRolesProps> = ({
  roles,
  entities,
  user,
  reloadRoles,
}) => {
  const rolesSelected = user.roles?.split(",").map(Number) ?? [];
  const entitiesSelected = user.entities?.split(",").map(Number) ?? [];
  const Usertype = appStore.loginResponse.user[0].userType;
  const [searchRoles, SetSearchRoles] = useState("");
  const [searchEntity, SetSearchEntity] = useState("");

  const formik = useFormik<FormValues>({
    initialValues: {
      roles: roles.reduce((acc, curr) => {
        return {
          ...acc,
          [curr.roleId]: rolesSelected.includes(curr.roleId),
        };
      }, {}),
      entities: entities.reduce((acc, curr) => {
        const entityId = Number(curr.entityId);
        return {
          ...acc,
          [entityId === -1 ? -1 : entityId]: entitiesSelected.includes(
            curr.entityId
          ),
        };
      }, {}),
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      // Convert the selected values to comma-separated strings
      const selectedRoles = roles
        .filter((role) => values.roles[role.roleId])
        .map((role) => role.roleId);

      let selectedEntities = [];

      if (values.entities[-1]) {
        selectedEntities = [-1];
      } else {
        selectedEntities = Object.keys(values.entities)
          .filter((key) => values.entities[key])
          .map(Number)
          .filter((entityId) => entityId !== -1);
      }

      // const selectedEntities = entities
      //   .filter((entity) => values.entities[entity.entityId])
      //   .map((entity) => entity.entityId);
      api
        .post(`update-user`, {
          body: {
            roles: selectedRoles.join(","),
            entities: selectedEntities.join(","),
            userId: user.userId,
          },
        })
        .then((res) => {
          reloadRoles && reloadRoles();
          appStore.showToast(res.message, res.success ? "success" : "error");
        });
    },
  });

  if (Usertype === 1) {
    if (!entities.find((entity) => entity.entityId === -1)) {
      entities.push(allEntity);
    }
  }

  const handleSearchRoles = (e) => {
    SetSearchRoles(e.target.value);
  };

  const handleSearchEntity = (e) => {
    SetSearchEntity(e.target.value);
  };

  return (
    <Paper sx={{ borderRadius: 0 }}>
      <Box
        display={"flex"}
        flexDirection={"column"}
        margin={"2px"}
        padding={"2px"}
        sx={{
          backgroundColor: "white",
          width: "99%",
          height: "77.5vh",
          overflow: "auto",
          mt: "4px",
        }}
      >
        <form
          onSubmit={formik.handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Box sx={{ mb: "0.25em" }}>
            <UserHeaderComponent
              ShowsaveButton={true}
              ButtonName={"Update"}
              userInfoComponent={
                <>
                  <UserHeaderBox>
                    <Avatar
                      src={""}
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
                      <Typography
                        variant="h6"
                        sx={{ color: Themecolors.UH_text3 }}
                      >
                        {user.userName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: Themecolors.UH_text3 }}
                      >
                        {user.userEmail}
                      </Typography>
                    </UserInfoBox>
                  </UserHeaderBox>
                </>
              }
            />
          </Box>
          <Box sx={{ overflowY: "auto" }}>
            <HeaderTypography
              title="Manage Roles"
              searchEnabled={true}
              onSearch={handleSearchRoles}
              searchValue={searchRoles}
            />
            <PanelComponent title="Roles">
              <FormGroup style={{ flexWrap: "wrap", flexDirection: "row" }}>
                {roles
                  .filter((role) =>
                    role.roleName.toLowerCase().includes(searchRoles)
                  )
                  .map((role) => (
                    <FormControlLabel
                      key={role.roleId}
                      sx={{
                        backgroundColor: "#fefefe",
                        height: "50px",
                        minWidth: "200px",
                        padding: "10px",
                        margin: "5px",
                        fontWeight: "semibold",
                        fontSize: "20px",
                        textAlign: "center",
                        color: Themecolors.H_text1,
                        "&:hover": {
                          borderColor: Themecolors.Button2,
                        },
                        border: "1px solid #dedede",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                      control={
                        <Checkbox
                          style={{
                            accentColor: "black",
                            color: formik.values.roles[role.roleId]
                              ? Themecolors.Button1
                              : "black",
                          }}
                          checked={formik.values.roles[role.roleId]}
                          onChange={formik.handleChange}
                          name={`roles.${role.roleId}`}
                        />
                      }
                      label={role.roleName}
                    />
                  ))}
              </FormGroup>
            </PanelComponent>
            <HeaderTypography
              title="Select Entity"
              searchEnabled={true}
              onSearch={handleSearchEntity}
              searchValue={searchEntity}
            />
            <PanelComponent title="Entities">
              <FormGroup style={{ flexWrap: "wrap", flexDirection: "row" }}>
                {entities
                  .filter((entities) =>
                    entities.entityName
                      .toLocaleLowerCase()
                      .includes(searchEntity)
                  )
                  .map((entity) => (
                    <FormControlLabel
                      key={entity.entityId}
                      sx={{
                        backgroundColor: "#fefefe",
                        height: "50px",
                        minWidth: "200px",
                        padding: "10px",
                        margin: "5px",
                        fontWeight: "semibold",
                        fontSize: "20px",
                        textAlign: "center",
                        color: Themecolors.H_text1,
                        "&:hover": {
                          borderColor: Themecolors.Button2,
                        },
                        border: "1px solid #dedede",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                      control={
                        <Checkbox
                          style={{
                            accentColor: "black",
                            color: formik.values.entities[entity.entityId]
                              ? Themecolors.Button1
                              : "black",
                          }}
                          checked={
                            formik.values.entities[entity.entityId] ??
                            entity.entityId === -1
                          }
                          onChange={formik.handleChange}
                          name={`entities.${entity.entityId}`}
                        />
                      }
                      label={entity.entityName}
                    />
                  ))}
              </FormGroup>
            </PanelComponent>
            {/* <Button
              type="submit"
              color="primary"
              variant="outlined"
              sx={{
                margin: "10px",
                width: "200px",
                borderColor: Themecolors.Button1,
                backgroundColor: Themecolors.Button1,
                color: Themecolors.Button2,
                "&:hover": {
                  backgroundImage: Themecolors.B_hv1,
                  borderColor: Themecolors.Button1,
                },
              }}
            >
              Update
            </Button>{" "} */}
          </Box>
        </form>
      </Box>
    </Paper>
  );
};

export default UserRoles;
