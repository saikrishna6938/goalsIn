import React from "react";
import { Avatar, Typography } from "@mui/material";

export const getInitials = (fullName?: string) => {
  if (!fullName) return "";
  const parts = fullName.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface UserAvatarProps {
  avatarUrl?: string;
  fullName?: string;
  size?: number;
  fontSize?: number;
  bgColor?: string;
  textColor?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  fullName,
  size = 42,
  fontSize = 44,
  bgColor,
  textColor,
}) => {
  const initials = getInitials(fullName);

  return (
    <Avatar
      src={avatarUrl || undefined}
      sx={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontWeight: "bold",
        color: textColor ?? (avatarUrl ? "#FF9800" : "#FFFFFF"),
        backgroundColor: bgColor ?? (avatarUrl ? "#2196F3" : "#bdbdbd"),
        borderRadius: "50%",
        overflow: "hidden",
        img: {
          objectFit: "cover",
          width: "100%",
          height: "100%",
        },
      }}
    >
      {!avatarUrl && (
        <Typography
          sx={{
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: `${fontSize}px`,
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {initials}
        </Typography>
      )}
    </Avatar>
  );
};

export default UserAvatar;
