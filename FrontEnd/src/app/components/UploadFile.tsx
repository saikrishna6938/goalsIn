import React, { ChangeEvent, FC, useState } from "react";
import { Button, Typography, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export const UploadFile: FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: "left", my: 2 }}>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="contained-button-file"
          type="file"
          onChange={handleUpload}
        />
        <label htmlFor="contained-button-file">
          <Button
            variant="contained"
            color="primary"
            component="span"
            startIcon={<CloudUploadIcon />}
          >
            Upload
          </Button>
        </label>
        {fileName && <Typography variant="subtitle1">{fileName}</Typography>}
      </Box>
    </Box>
  );
};
