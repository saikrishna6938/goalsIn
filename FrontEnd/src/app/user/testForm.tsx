import React from "react";
import { useFormik } from "formik";
import axios from "axios";

const FileUploadForm = () => {
  const formik = useFormik({
    initialValues: {
      uploadName: "",
      description: "",
      category: "",
      file: null,
    },
    onSubmit: async (values) => {
      try {
        // First API call to update form values
        const updateResponse = await axios.post("/update-form-values", {
          uploadName: values.uploadName,
          description: values.description,
          category: values.category,
        });

        // Second API call to upload the file data
        const formData = new FormData();
        formData.append("file", values.file);
        const uploadResponse = await axios.post("/upload-file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Handle the responses (e.g., notify the user of success)
        console.log("Form values updated successfully:", updateResponse.data);
        console.log("File uploaded successfully:", uploadResponse.data);
      } catch (error) {
        // Handle the error (e.g., notify the user of the failure)
        console.error("An error occurred:", error);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Same form fields as before */}
      {/* ... */}
    </form>
  );
};

export default FileUploadForm;
