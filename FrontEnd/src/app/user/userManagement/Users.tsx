import DataGrid, { Data } from "app/formComponents/DataGrid";
import TabBar from "app/formComponents/TabBar";
import React, { Component } from "react";
import { userColumns } from "../tasks/samples";
import FilterComponent from "app/formComponents/FilterComponent";
import { api } from "api/API";
import UserForm, { currentUser } from "./UserForm";
import UserRoles from "./UserRoles";
import appStore from "app/mobxStore/AppStore";
import DocumentView from "app/formComponents/DocumentView";
import { Avatar, Box, Typography } from "@mui/material";
import MainDialog from "app/formComponents/MainDialog";
import DocumentForm from "../DocumentForm";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import Toast from "app/formComponents/Toast";
import NoData from "api/NoData";
import PlagiarismTwoToneIcon from "@mui/icons-material/PlagiarismTwoTone";
import { Split } from "app/formComponents/styles/Split";
import GenericDropDown from "../genericCompoenets/GenericDropdown";
import { reaction } from "mobx";
import { number } from "prop-types";
import RolesManagers from "./RolesManagers";
import Show from "app/appComponents/Show";
import { User } from "app/types/User";
import FilterButtonComponentProps from "app/formComponents/FilterButtonComponent";
import {
  UserHeaderBox,
  UserInfoBox,
} from "app/appComponents/UserHeaderComponent";
import { Themecolors } from "api/Colors";
import { IndexType } from "app/types/User";
import userStore from "./UserStore";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import DeleteIcon from "@mui/icons-material/Delete";

interface UserProps {
  name?: string;
  age?: number;
}

const selections = [
  { value: -1, label: "None" },
  { value: 1, label: "Admin" },
  { value: 2, label: "Student" },
  { value: 3, label: "Job" },
  { value: 4, label: "Entity Admin" },
  { value: 5, label: "Super Admin" },
];

interface UsersState {
  selectedTab: number;
  filteruserData: Data[];
  users: Data[];
  currentUser: User;
  selectedOption: string;
  roles: Role[];
  entities: Entity[];
  userObject: User;
  showDocumentsDialog: boolean;
  entityDocuments: any[];
  showDocumentForm: boolean;
  selectedDocumentId: number;
  documentFormSubmitted: boolean;
  selectedDocumentName: string;
  selectedLocation: any[];
  selectedEntity: string;
  selectedRole: string;
  documentTypes: any[];
  mappedDocumentTypes: Map<string, any[]>;
  resetKey: boolean;
  leftSideRoles: any[];
  rightSideRoles: any[];
}
class Users extends Component<UserProps, UsersState> {
  disposer = null;
  userType = appStore.loginResponse.user[0].userType;
  constructor(props: UserProps) {
    super(props);
    this.state = {
      selectedTab: 0,
      users: [],
      currentUser: currentUser,
      userObject: {},
      selectedOption: "",
      roles: [],
      entities: [],
      showDocumentsDialog: false,
      documentTypes: [],
      entityDocuments: [],
      showDocumentForm: false,
      selectedDocumentId: -1,
      documentFormSubmitted: false,
      selectedDocumentName: "",
      selectedLocation: [],
      filteruserData: [],
      selectedEntity: "",
      selectedRole: "",
      mappedDocumentTypes: new Map(),
      resetKey: false,
      leftSideRoles: [],
      rightSideRoles: [],
    };
  }

  componentDidMount() {
    this.onload();

    // Set up a reaction
    this.disposer = reaction(
      () => appStore.selectedEntity,
      (entityId) => {
        this.loadUsers(entityId);
      }
    );
  }

  componentWillUnmount() {
    // Dispose of the reaction
    if (this.disposer) {
      this.disposer();
    }

    this.setState({
      currentUser: {},
      userObject: {},
    });
  }
  async loadUsers(entityId: number) {
    const users = await api.get(`job/users/${entityId}/${this.userType}`);
    let filteredData = users.data;
    if (Number(this.state.selectedRole) > 0) {
      filteredData = users.data.filter(
        (user) => Number(user.userType) === Number(this.state.selectedRole)
      );
    }
    this.setState({
      filteruserData: filteredData,
    });
    if (filteredData.length > 0) {
      const firstUser = filteredData[0];
      const currentuserId = this.state.currentUser.userId;
      const currentUserData = filteredData.find(
        (user) => user.userId === currentuserId
      );

      this.setState({
        currentUser: this.getCurrentUserObjeect(firstUser),
        userObject: currentUserData,
      });
    }
  }

  updateCurrentUserSelection(userId) {
    const user = this.state.filteruserData.find(
      (user) => user.userId === userId
    );

    if (user) {
      this.setState({
        currentUser: this.getCurrentUserObjeect(user),
        userObject: user,
      });
    }
  }

  async onload() {
    const userEntity = appStore.loginResponse.user[0].entities;
    const userType = appStore.loginResponse.user[0].userType;
    const user = appStore.loginResponse.user[0];
    const entityResult: any = await api.get(`get-user-entities/${user.userId}`);
    if (entityResult.success && entityResult.data.length > 0) {
      appStore.userEntities = entityResult.data;

      if (appStore.selectedEntity === -1) {
        const defaultEntity = entityResult.data[0].entityId;
        appStore.setSelectedEntity(defaultEntity);
      }
    }

    const result = await api.get(
      `job/users/${appStore.selectedEntity}/${userType}`
    );
    userStore.setUsers(result.data);

    const rolesResult = await api.get(`roles/get-roles-types`);
    const leftResponse = await api.get("administrator/roles/names/get");

    this.setState({
      filteruserData: result.data,
      roles: rolesResult.data,
      entities: entityResult.data,
      leftSideRoles: leftResponse.data,
    });

    if (this.state.currentUser.userId < 0 && result.data.length > 0) {
      const userObj = this.getCurrentUserObjeect(result.data[0]);
      this.setState({ currentUser: userObj, userObject: result.data[0] });
      const currentUserId = userObj?.userId;
      if (currentUserId) {
        await this.fetchRightRoles(currentUserId);
      }
    } else {
      const currentuserId = this.state.currentUser.userId;
      const currentUserData = result.data.find(
        (user) => user.userId === currentuserId
      );
      if (currentUserData) {
        const userObj = this.getCurrentUserObjeect(currentUserData);
        this.setState({ currentUser: userObj, userObject: currentUserData });
      }
    }
  }

  handleRoleChange = async (selectedValue: string) => {
    let users = await api.get(
      `job/users/${appStore.selectedEntity}/${this.userType}`
    );
    let filteredData = [];
    if (selectedValue) {
      filteredData = users.data.filter(
        (user) => Number(user.userType) === Number(selectedValue)
      );
    }
    this.setState({
      filteruserData: Number(selectedValue) > 0 ? filteredData : users.data,
      selectedRole: selectedValue,
    });
  };

  handleEntityChange = (selectedValue: string) => {
    this.setState({ selectedEntity: selectedValue });
    appStore.selectedEntity = Number(selectedValue);
  };

  getCurrentUserObjeect(user) {
    if (!user) return null;
    return {
      ...currentUser,
      ...Object.keys(currentUser).reduce((acc, key) => {
        if (user.hasOwnProperty(key)) acc[key] = user[key];
        return acc;
      }, {}),
    };
  }

  async fetchRightRoles(userId: any) {
    try {
      const response = await api.get(
        `administrator/users/roles/multiple/${userId}`
      );
      this.setState({ rightSideRoles: response.rows });
    } catch (err) {
      console.error("Failed to fetch right side roles:", err);
    }
  }

  handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({ selectedTab: newValue });
  };

  handleshow = () => {
    this.setState({ documentFormSubmitted: true });
    if (appStore.loginResponse.user[0].userType !== 2) {
      appStore.showToast("Profile submitted successfully ", "success");
    }
  };

  closeMainDialog = () => {
    this.setState({ showDocumentForm: false });
  };

  handleOptionsChange = async (selectedOption: string) => {
    this.setState({ selectedOption });

    switch (selectedOption) {
      case "Create":
        this.createUser();
        this.setState({ resetKey: true });
        break;
      case "Delete":
        this.deleteUser();
        break;
      case "Apply":
        this.applyForDocuments();
        break;
      default:
        break;
    }
  };

  createUser = () => {
    this.setState({
      currentUser: this.getCurrentUserObjeect(newUser),
    });
  };

  deleteUser = () => {
    if (this.state.currentUser.userId > 0) {
      api
        .delete("delete-user", {
          body: { userId: this.state.currentUser.userId },
        })
        .then((res) => {
          if (res.success) {
            console.log("User deleted successfully.");
          }
        });
    }
  };

  applyForDocuments = () => {
    api
      .get(
        `user/document-types/${appStore.loginResponse.user[0].userId}/${IndexType.APPLY}`
      )
      .then((res) => {
        if (res.success) {
          this.setState({
            showDocumentsDialog: true,
            documentTypes: res.data,
          });
        }
      });
  };

  handleRolesSubmit = async (newRoles: any[], deletedRoles: any[]) => {
    try {
      const userRolesData =
        newRoles?.map((role) => ({
          userId: this.state.currentUser.userId,
          userRoleNameId: role.roleNameId,
        })) || [];

      const deletePayload = {
        userId: this.state.currentUser.userId,
        roleIds: deletedRoles?.map((role) => role.roleNameId) || [],
      };

      // Skip API call if no changes
      if (userRolesData.length === 0 && deletePayload.roleIds.length === 0) {
        appStore.showToast("No changes to submit.", "error");
        return;
      }
      // Update roles if there are new roles
      if (userRolesData.length > 0) {
        const response = await api.post("administrator/users/roles/multiple", {
          body: userRolesData,
        });
        appStore.showToast(response.message, "success");
      }

      // Delete roles if there are roles to delete
      if (deletePayload.roleIds.length > 0) {
        const response = await api.delete(
          "administrator/users/roles/multiple",
          {
            body: deletePayload,
          }
        );
        appStore.showToast(response.message, "success");
      }

      await this.fetchRightRoles(this.state.currentUser.userId);
    } catch (error) {
      console.error("Error submitting roles:", error);
      appStore.showToast("Failed to update roles.", "error");
    }
  };

  renderTab(tab: number) {
    switch (tab) {
      case 0:
        return (
          <UserForm
            user={this.state.currentUser}
            reloadUsers={async () => {
              const result = await api.get(
                `job/users/${appStore.selectedEntity}/${this.userType}`
              );
              this.setState({
                filteruserData: result.data,
              });
              const user = result.data.find(
                (user) => user.userId === this.state.currentUser.userId
              );

              if (user) {
                this.setState({
                  currentUser: this.getCurrentUserObjeect(user),
                  userObject: user,
                });
              }
            }}
          />
        );
      case 1:
        return (
          <RolesManagers
            currentObjId={this.state.currentUser.userId}
            leftSideRoles={this.state.leftSideRoles}
            rightSideRoles={this.state.rightSideRoles}
            onSubmit={this.handleRolesSubmit}
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
                      {this.state.currentUser.userName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: Themecolors.UH_text3 }}
                    >
                      {this.state.currentUser.userEmail}
                    </Typography>
                  </UserInfoBox>
                </UserHeaderBox>
              </>
            }
          />
        );
      // case 2:
      //   if (this.state.currentUser.userId < 0) {
      //     this.setState({ selectedTab: 0 });
      //   }
      //   return (
      //     <UserRoles
      //       roles={this.state.roles}
      //       entities={this.state.entities}
      //       user={this.state.userObject}
      //       reloadRoles={() => {
      //         this.onload();
      //       }}
      //     />
      //   );
    }
  }

  handleFilterGroupData = (filterType) => {
    this.setState({ selectedLocation: filterType });
  };

  handleFilterChange(selectedCategory: string) {
    // console.log(selectedCategory);
    this.setState({ selectedOption: selectedCategory });
  }

  createRows(users: Data[]) {
    return users.map((user) => {
      return {
        id: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        userFullName: user.userFullName,
        createdDate: user.userCreated,
        enabled: user.userEnabled,
      };
    });
  }

  render() {
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          height: "calc(100vh - 95px)",
          maxHeight: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            borderRadius: "4px",
            height: "100%",
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderBottom: "1px solid #ccc",
            }}
          >
            <Split
              left={
                <div
                  style={{
                    paddingRight: "5px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <HeaderBox>
                    <InfoBox>
                      <Typography
                        variant="overline"
                        sx={{ fontSize: 15, ml: "16px" }}
                      >
                        {"Users"}
                      </Typography>
                    </InfoBox>
                    <Box
                      sx={{
                        display: "flex",
                        gap: "15px",
                        justifyContent: "flex-start",
                        marginLeft: "auto",
                      }}
                    >
                      <Show condition={this.userType <= 1}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            marginRight: "20px",
                            paddingRight: "20px",
                            borderRight: "solid 1px #dedede",
                          }}
                        >
                          <GenericDropDown
                            headerLabel="Filter By Roles"
                            selectedFontSize="0.88rem"
                            options={selections}
                            label={
                              selections[this.state.selectedRole]?.label ??
                              "None"
                            }
                            onChange={this.handleRoleChange}
                            padding="0em"
                            renderOption={(option) => <>{option.label}</>}
                          />
                        </Box>
                      </Show>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <GenericDropDown
                          headerLabel="Select Entity"
                          selectedFontSize="0.88rem"
                          options={this.state.entities}
                          label={`${
                            appStore.userEntities.find(
                              (e) => e.entityId === appStore.selectedEntity
                            )?.entityName ?? "Select Entity"
                          }`}
                          onChange={this.handleEntityChange}
                          renderOption={(Option) => <>{Option.entityName}</>}
                          padding="0em"
                        />
                      </Box>
                    </Box>
                  </HeaderBox>
                  <Box
                    sx={{
                      flex: 1,
                      overflow: "hidden",
                    }}
                  >
                    <DataGrid
                      defaultHeight="100%"
                      resetSelectionRowId={this.state.resetKey}
                      onSelection={async (rowIndex) => {
                        const user = this.state.filteruserData.find(
                          (user) => user.userId === rowIndex
                        );
                        if (user) {
                          this.setState({
                            currentUser: this.getCurrentUserObjeect(user),
                            userObject: user,
                          });
                          await this.fetchRightRoles(user?.userId);
                        }
                        this.setState({ resetKey: false });
                      }}
                      tasks={this.createRows(this.state.filteruserData)}
                      columns={userColumns}
                      filterComponent={
                        <FilterButtonComponentProps
                          categories={
                            appStore.loginResponse.user[0].userType < 2
                              ? ["Create", "Apply", "Delete"]
                              : ["Create", "Apply"]
                          }
                          onButtonClick={(val) => {
                            this.handleOptionsChange(val);
                          }}
                          getIcon={(category) => {
                            switch (category) {
                              case "Create":
                                return <AddCircleIcon />;
                              case "Apply":
                                return <HowToRegIcon />;
                              case "Delete":
                                return <DeleteIcon />;
                              default:
                                return null;
                            }
                          }}
                        />
                      }
                    />
                  </Box>
                  <>
                    {this.state.showDocumentsDialog && (
                      <div>
                        <MainDialog
                          filteredDocumentGroup={this.handleFilterGroupData}
                          entityDocuments={this.state.documentTypes}
                          onClose={() => {
                            this.setState({ showDocumentsDialog: false });
                          }}
                          onOutsideClick={() =>
                            this.setState({ showDocumentsDialog: false })
                          }
                          dialogTitle={`Student Name: ${this.state.userObject.userFirstName} ${this.state.userObject.userLastName}`}
                          dialogDescription="Select the intake you want to submit"
                        >
                          {this.state.selectedLocation.length > 0 ? (
                            <Box
                              flexDirection={"row"}
                              flexWrap={"wrap"}
                              display={"flex"}
                            >
                              {this.state.selectedLocation.map((doc) => {
                                return (
                                  <DocumentView
                                    key={doc.documentTypeId}
                                    id={doc.documentTypeId}
                                    title={doc.documentTypeName}
                                    onDocumentClick={async (id) => {
                                      this.setState({
                                        showDocumentForm: true,
                                        selectedDocumentId: id,
                                        selectedDocumentName:
                                          doc.documentTypeName,
                                        showDocumentsDialog: false,
                                      });
                                    }}
                                  />
                                );
                              })}
                            </Box>
                          ) : (
                            <Box sx={{ height: "100%", width: "100%" }}>
                              <NoData
                                icon={PlagiarismTwoToneIcon}
                                title="No documents have been found."
                                subtitle="Please select the location"
                              />
                            </Box>
                          )}
                        </MainDialog>
                      </div>
                    )}
                  </>
                  {this.state.showDocumentForm && (
                    <div>
                      <MainDialog
                        width={"75vw"}
                        showLocationFilter={false}
                        onClose={() => {
                          this.setState({ showDocumentForm: false });
                        }}
                        onOutsideClick={() =>
                          this.setState({ showDocumentForm: false })
                        }
                        dialogTitle={`User: ${this.state.userObject.userFirstName} ${this.state.userObject.userLastName}`}
                        dialogDescription={`Selected Intake is : ${this.state.selectedDocumentName}`}
                      >
                        <DocumentForm
                          userObj={this.state.userObject}
                          documentTypeId={this.state.selectedDocumentId}
                          showFormDoc={() => {
                            this.handleshow();
                          }}
                          onCloseMainDialog={this.closeMainDialog}
                        />
                      </MainDialog>
                    </div>
                  )}
                  {/* {appStore.loginResponse.user[0].userType !== 2 && (
                    <Toast
                      open={this.state.documentFormSubmitted}
                      onClose={() => {
                        this.setState({
                          documentFormSubmitted: false,
                          showDocumentForm: false,
                        });
                      }}
                      message={"Profile submitted successfully"}
                      autoHideDurationDefault={1200}
                    />
                  )} */}
                </div>
              }
              right={
                <div
                  style={{
                    paddingLeft: "5px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <TabBar
                    value={this.state.selectedTab}
                    onChange={this.handleTabChange}
                    tabs={
                      appStore.loginResponse.user[0].userType === -1
                        ? ["Properties", "Roles Managers"]
                        : ["Profile"]
                    }
                  />

                  {
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          overflowY: "hidden",
                        }}
                      >
                        <div
                          style={{
                            minHeight: "100%",
                            height: "100%",
                          }}
                        >
                          {this.renderTab(this.state.selectedTab)}
                        </div>
                      </Box>
                    </Box>
                  }
                </div>
              }
            />
          </Box>
        </Box>
      </div>
    );
  }
}

export default Users;

export const newUser = {
  userId: -1,
  userName: "",
  userEmail: "",
  userFirstName: "",
  userLastName: "",
  userPassword: "",
  userAddress: "",
  userServerEmail: "",
  userPhoneOne: "",
  userPhoneTwo: "",
  userEnabled: 0,
  userLocked: 0,
};
