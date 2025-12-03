import React, { useState, useRef, useEffect } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Grid,
  Typography,
  Card,
  Box,
  Icon,
} from "@mui/material";
import HeaderTypography from "./HeaderTypography";
import { Themecolors, fonts } from "api/Colors";

type Message = {
  noteId: number;
  noteUserId: number;
  noteComment: string;
  noteCreated: string;
  userFirstName: string;
  userLastName: string;
  noteMentions: string;
  noteTaskId: number;
};

type ChatBoxProps = {
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUser: number;
};

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  currentUser,
}) => {
  const [inputValue, setInputValue] = useState("");
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const groupByDate = (messages: Message[]) => {
    return messages.reduce((groups: { [date: string]: Message[] }, message) => {
      const date = new Date(message.noteCreated).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
  };

  const messageGroups = groupByDate(messages);

  return (
    <Paper
      elevation={3}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        marginRight: "40px",
        maxWidth: "84%",
        position: "relative",
        borderRadius: 0,
        fontFamily: fonts.inter,
        backgroundColor: "#ffffff",
      }}
    >
      <HeaderTypography title="Notes" />
      <List style={{ flex: 1, overflowY: "scroll" }}>
        {Object.keys(messageGroups).map((date) => (
          <React.Fragment key={date}>
            <Typography
              variant="subtitle2"
              style={{
                padding: "10px",
                fontFamily: fonts.poppins,
                color: Themecolors.NP_text,
              }}
            >
              {date}
            </Typography>
            {messageGroups[date].map((message) => (
              <ListItem
                key={message.noteId}
               
              >
                <Box sx={{ width: "100%" }}>
                  <Card
                    sx={{
                      width: "100%",
                      backgroundColor:
                        message.noteUserId === currentUser
                          ? Themecolors.NP_bg_user
                          : Themecolors.NP_bg_other,
                      border: `1px solid ${Themecolors.NP_border}`,
                      borderRadius: 2,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ mt: 1, ml: 1, width: 22, height: 22 }}>
                        {message.userFirstName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      sx={{
                        ml: 1.5,
                        mr: 1,
                        mt: 2,
                        mb: 1.5,
                        fontFamily: fonts.open_sans,
                        color: Themecolors.NP_text,
                      }}
                      primary={message.noteComment
                        .split("\n")
                        .map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                    />
                    <ListItemText
                      sx={{
                        position: "absolute",
                        top: 14,
                        left: 50,
                        width: "230px",
                        fontFamily: fonts.inter,
                      }}
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            fontWeight="600"
                            fontFamily={fonts.poppins}
                            sx={{ color: Themecolors.NP_text }}
                          >
                            {`${message.userFirstName}`}
                          </Typography>
                          <Typography
                            fontWeight="600"
                            fontSize={"small"}
                            fontFamily={fonts.inter}
                            sx={{ color: Themecolors.NP_text }}
                          >
                            {`${new Date(
                              message.noteCreated
                            ).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}`}
                          </Typography>
                        </Box>
                      }
                    />
                  </Card>
                </Box>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
        <div ref={endOfMessagesRef}></div>
      </List>
      <Box
        sx={{
          padding: "10px",
          borderTop: `1px solid ${Themecolors.NP_border}`,
          marginTop: "auto",
        }}
      >
        <Grid item xs={12} sx={{ mr: "8px" }}>
          <textarea
            placeholder="Add your Comment here..."
            style={{
              width: "100%",
              minHeight: "30px",
              padding: "8px",
              resize: "none",
              fontFamily: fonts.inter,
              fontSize: "14px",
              border: `1px solid ${Themecolors.NP_border}`,
              borderRadius: 4,
              outline: "none",
              color: Themecolors.NP_text,
            }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setInputValue((prev) => prev + "\n");
              }
            }}
          />
        </Grid>
        <Box
          sx={{
            width: "100%",
            mr: "15px",
            paddingX: "8px",
            padding: "8px 8px 0 8px",
          }}
        >
          <Grid container justifyContent="space-between" alignItems="center">
            <Icon sx={{ color: Themecolors.NP_text }}>attachment</Icon>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleSend}
                sx={{
                  borderColor: Themecolors.Button1,
                  backgroundColor: Themecolors.Button1,
                  color: Themecolors.Button2,
                  fontFamily: fonts.poppins,
                  "&:hover": {
                    backgroundImage: Themecolors.B_hv1,
                    borderColor: Themecolors.Button1,
                    backgroundColor: Themecolors.Button1,
                  },
                  height: "28px",
                }}
              >
                Send
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatBox;
