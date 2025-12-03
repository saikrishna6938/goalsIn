import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton, Tooltip, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { Edit } from "@mui/icons-material";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";
import UserAvatar from "app/admin/formManagement/userform/UserAvatar";

const AvatarWrapper = styled(Box)({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

const EditOverlay = styled(Box)({
  position: "absolute",
  borderRadius: "50%",
  backgroundColor: "#fff",
});

const HiddenInput = styled("input")({
  display: "none",
});

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  userId?: number;
  avatar?: string;
  userFirstName?: string;
  userLastName?: string;
  onLoad?: Function;
  avatarSize?: number;
}

const ProfileImageField: React.FC<Props> = ({
  userId,
  avatar,
  userFirstName,
  userLastName,
  onLoad,
  avatarSize = 99,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(avatar);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(avatar || null);
  }, [avatar]);

  const validateFile = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      throw new Error("Unsupported file type. Use JPG, PNG, WebP, or AVIF.");
    }
    if (f.size > MAX_BYTES) {
      throw new Error("File size exceeds 5 MB.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    try {
      validateFile(f);
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    } catch (err: any) {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleRemove = async () => {
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";

    try {
      const res = await api.post("users/avatar/delete", {
        body: {
          userId: userId,
        },
      });

      appStore.showToast(res.message || "Avatar deleted", "success");
      onLoad();
    } catch (err) {
      throw err;
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const token = (api as any).authToken;
      const url = `${(api as any).baseUrl.replace(
        /\/$/,
        ""
      )}/users/${userId}/avatar`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);

        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
          }
        };

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText || "{}");
            if (xhr.status >= 200 && xhr.status < 300) {
              appStore.showToast(
                json.message,
                json.success ? "success" : "error"
              );
              onLoad?.();
              resolve();
            } else {
              reject(json);
            }
          } catch (err) {
            reject(err);
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const userFullName = `${userFirstName || ""} ${userLastName || ""}`.trim();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      <AvatarWrapper>
        <UserAvatar
          avatarUrl={previewUrl || undefined}
          fullName={userFullName}
          size={avatarSize}
          fontSize={40}
        />

        <EditOverlay sx={{ bottom: -8, right: -8 }}>
          {uploading ? (
            <IconButton size="small" disabled>
              <CircularProgress size={16} />
            </IconButton>
          ) : (
            <Tooltip title={previewUrl ? "Save" : "Upload"}>
              <IconButton
                size="small"
                onClick={
                  previewUrl ? handleUpload : () => inputRef.current?.click()
                }
              >
                {previewUrl ? (
                  <SaveIcon fontSize="small" />
                ) : (
                  <CameraAltIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
        </EditOverlay>

        {previewUrl && !uploading && (
          <>
            <Tooltip title="Change image">
              <IconButton
                size="small"
                onClick={() => inputRef.current?.click()}
                sx={{
                  position: "absolute",
                  top: -8,
                  left: -8,
                  backgroundColor: "#fff",
                  boxShadow: 1,
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove image">
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  backgroundColor: "#fff",
                  boxShadow: 1,
                }}
                onClick={handleRemove}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </AvatarWrapper>

      <HiddenInput
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default ProfileImageField;
