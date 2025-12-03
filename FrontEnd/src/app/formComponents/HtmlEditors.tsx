import React from "react";
import { FieldProps } from "formik";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const HtmlEditors: React.FC<FieldProps> = ({ field, form }) => {
  const handleChange = (content: string) => {
    form.setFieldValue(field.name, content);
  };

  return (
    <ReactQuill
      style={{ height: "160px", marginBottom: "60px" }}
      value={field.value || ""}
      onChange={handleChange}
      theme="snow"
    />
  );
};

export default HtmlEditors;
