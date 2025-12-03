import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  Switch,
  TextField,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
  IconButton,
  DialogTitle,
  Box,
} from "@mui/material";
import HeaderTypography from "app/formComponents/HeaderTypography";
import { Edit, UnpublishedRounded } from "@mui/icons-material";
import appStore from "app/mobxStore/AppStore";
import TextInputField from "app/components/regularinputs/TextInpuField";

interface User {
  userId: string;
  userName: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
}

interface ApproverDialogProps {
  assignedUsers: User[];
  unAssignedUsers: User[];
  taskUsers: string;
  handleTaskUsers: (users: string) => void;
}

const AssignApprovers: React.FC<ApproverDialogProps> = ({
  assignedUsers,
  unAssignedUsers,
  taskUsers,
  handleTaskUsers,
}) => {
  let userIdsArray = taskUsers.split(",").map(Number);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [nonUserFilter, setNonUserFilter] = useState("");
  const [users, setUsers] = useState(assignedUsers);
  const [nonUsers, setNonUsers] = useState(unAssignedUsers);
  const [allUsers, setAllUsers] = useState(taskUsers);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  useEffect(() => {
    userIdsArray = taskUsers.split(",").map(Number);
    const filteredUsers = unAssignedUsers.filter((user) =>
      userIdsArray.includes(+user.userId)
    );
    const filteredNonUsers = unAssignedUsers.filter(
      (user) => !userIdsArray.includes(+user.userId)
    );
    setUsers(filteredUsers);
    setNonUsers(filteredNonUsers);
  }, [taskUsers]);
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
    if (event.target.value !== "") {
      setUsers(
        users.filter((user) =>
          user.userFirstName
            .toLowerCase()
            .includes(event.target.value.toLowerCase())
        )
      );
    } else {
      const filteredUsers = unAssignedUsers.filter((user) =>
        userIdsArray.includes(+user.userId)
      );
      setUsers(filteredUsers);
    }
  };
  const handleNonUserFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNonUserFilter(event.target.value);
    if (event.target.value !== "") {
      setNonUsers(
        nonUsers.filter((user) =>
          user.userFirstName
            .toLowerCase()
            .includes(event.target.value.toLowerCase())
        )
      );
    } else {
      const filteredNonUsers = unAssignedUsers.filter(
        (user) => !userIdsArray.includes(+user.userId)
      );
      setNonUsers(filteredNonUsers);
    }
  };
  const handleSwitchUser = (user: User) => {
    const userId = `${user.userId}`;
    const usersArray = allUsers.length > 0 ? allUsers.split(",") : [];
    if (usersArray.includes(userId)) {
      setAllUsers(usersArray.filter((id) => id !== userId).join(","));
    } else {
      const updatedList =
        allUsers.length > 0 ? `${allUsers},${userId}` : userId;
      setAllUsers(updatedList);
    }
  };

  const userType = appStore.loginResponse.user[0].userType;
  return (
    <div style={{ height: "100vh" }}>
      <HeaderTypography title={"Assigned Users"}>
        {true && (
          <IconButton
            style={{ backgroundColor: "white", borderRadius: "10" }}
            size="small"
            onClick={handleOpen}
          >
            <Edit color="primary" />
          </IconButton>
        )}
      </HeaderTypography>
      {users.length == 0 && (
        <Box
          p={5}
          display={"flex"}
          flexDirection={"column"}
          sx={{ backgroundColor: "white" }}
          alignContent={"center"}
          justifyContent={"center"}
        >
          <UnpublishedRounded
            style={{ display: "flex", alignSelf: "center", margin: "10px" }}
          />
          <Typography
            variant="h6"
            color={"gray"}
            style={{ alignSelf: "center" }}
          >
            No Users are Assigned.
          </Typography>
        </Box>
      )}
      <Stack
        direction="column"
        marginBottom={2}
        sx={{ backgroundColor: "white", height: "100%" }}
      >
        {users.map((user) => (
          <ListItem
            key={user.userId}
            sx={{ height: "50px", borderBottom: "0.5px solid #dedede" }}
          >
            <ListItemAvatar>
              <Avatar sx={{ width: "30px", height: "30px" }} />
            </ListItemAvatar>
            <ListItemText primary={user.userFirstName} />
          </ListItem>
        ))}
      </Stack>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth={"md"}
        style={{ height: 700 }}
      >
        <DialogTitle
          id="simple-dialog-title"
          style={{ backgroundColor: "#dedede" }}
        >
          <Typography variant="inherit" align="left">
            {"Update assigned users"}
          </Typography>
        </DialogTitle>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          m={2}
        >
          <Stack
            width={"50%"}
            m={1}
            height={400}
            border={"1px solid #dedede"}
            margin={1}
            padding={1}
          >
            <Typography variant="overline" align="left">
              {"Assigned Users"}
            </Typography>
            <TextInputField
              label="Filter assigned users"
              value={filter}
              variant="filled"
              onChange={handleFilterChange}
            />
            <List style={{ overflowY: "scroll" }}>
              {users.map((user) => (
                <ListItem
                  key={user.userId}
                  sx={{ height: "50px", borderBottom: "0.5px solid #dedede" }}
                >
                  <ListItemAvatar>
                    <Avatar />
                  </ListItemAvatar>
                  <ListItemText primary={user.userFirstName} />
                  <Switch
                    checked={allUsers.includes(`${user.userId}`)}
                    onChange={() => handleSwitchUser(user)}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
          <Stack
            width={"50%"}
            m={1}
            height={400}
            border={"1px solid #dedede"}
            margin={1}
            padding={1}
          >
            <Typography variant="overline" align="left">
              {"Unassigned Users"}
            </Typography>
            <TextInputField
              label="Filter unassigned users"
              value={nonUserFilter}
              variant="filled"
              onChange={handleNonUserFilterChange}
            />
            <List style={{ overflowY: "scroll" }}>
              {nonUsers.map((user) => (
                <ListItem
                  key={user.userId}
                  sx={{ height: "50px", borderBottom: "0.5px solid #dedede" }}
                >
                  <ListItemAvatar>
                    <Avatar />
                  </ListItemAvatar>
                  <ListItemText primary={user.userFirstName} />
                  <Switch
                    checked={allUsers.includes(`${user.userId}`)}
                    onChange={() => handleSwitchUser(user)}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        </Box>

        <DialogActions style={{ padding: "20px", backgroundColor: "#dedede" }}>
          <Button onClick={handleClose} variant="outlined" color="error">
            Close
          </Button>
          <Button
            onClick={() => {
              handleTaskUsers(allUsers);
              handleClose();
            }}
            variant="outlined"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AssignApprovers;

export const assignedUsers = [
  {
    id: "user1",
    name: "Alice",
    avatarUrl: "https://example.com/avatar1.jpg", // Replace with actual URLs
  },
  {
    id: "user2",
    name: "Bob Smith",
    avatarUrl: "https://example.com/avatar2.jpg",
  },
  {
    id: "user3",
    name: "Carol Williams",
    avatarUrl: "https://example.com/avatar3.jpg",
  },
  {
    id: "user4",
    name: "David Brown",
    avatarUrl: "https://example.com/avatar4.jpg",
  },
  {
    id: "1",
    name: "Alice",
    avatarUrl: "https://example.com/avatar1.jpg", // Replace with actual URLs
  },
  {
    id: "2",
    name: "Bob Smith",
    avatarUrl: "https://example.com/avatar2.jpg",
  },
  {
    id: "3",
    name: "Carol Williams",
    avatarUrl: "https://example.com/avatar3.jpg",
  },
  {
    id: "4",
    name: "David Brown",
    avatarUrl: "https://example.com/avatar4.jpg",
  },
  // Add more users as needed
];
