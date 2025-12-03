import React, { useEffect, useState } from "react";
import { FieldProps } from "formik";
import { Button, Box, Typography, Grid, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { v4 as uuidv4 } from "uuid";
import { Themecolors } from "api/Colors";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import { UploadFile } from "@mui/icons-material";

type CustomUploadFileProps = FieldProps & {
  label: string;
};

const CustomUploadFile: React.FC<CustomUploadFileProps> = ({
  field,
  form: { setFieldValue },
}) => {
  const [filesPresent, setFilesPresent] = useState(false);

  useEffect(() => {
    if (field.value?.length > 0 && !(field.value[0] instanceof File)) {
      const convertedFiles: File[] = field.value.map((f: any) => {
        const blob = new Blob([], { type: f.type });
        const file = new File([blob], f.fileName, { type: f.type });
        (file as any).uploadName = f.uploadName;
        return file;
      });
      setFieldValue(field.name, convertedFiles);
      setFilesPresent(convertedFiles.length > 0);
    } else {
      setFilesPresent(field.value?.length > 0);
    }
  }, [field.value, field.name, setFieldValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFieldValue(field.name, Array.from(files));
      setFilesPresent(true);
    }
  };

  const handleFileClick = (file: any) => {
    window.open(URL.createObjectURL(file), "_blank");
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...(field.value || [])];
    updatedFiles.splice(index, 1);
    setFieldValue(field.name, updatedFiles);
    if (updatedFiles.length === 0) {
      setFilesPresent(false);
    }
  };

  const [inputId] = useState(uuidv4());

  return (
    <div>
      <input
        accept="image/*,.pdf"
        style={{ display: "none" }}
        id={inputId}
        multiple
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor={inputId} style={{ display: "inline-block" }}>
        <PrimaryButton
          label="Upload"
          startIcon={<UploadFile />}
          height="1.9rem"
          component="span"
          sx={{
            width: "auto",
          }}
        />
      </label>
      {filesPresent && (
        <Box mt={2}>
          <Grid container spacing={2}>
            {field.value?.map((file: File, index: number) => {
              return (
                <Grid item key={index}>
                  <Box
                    sx={{
                      position: "relative",
                      border: "1px solid #000",
                      padding: 1,
                      minWidth: 100,
                      minHeight: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Button
                      sx={{ padding: 0 }}
                      onClick={() => handleFileClick(file)}
                    >
                      <Typography variant="body2" color={"black"}>
                        {file.name}
                      </Typography>
                    </Button>

                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(index)}
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        padding: "5px",
                        zIndex: 1,
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </div>
  );
};

export default CustomUploadFile;
