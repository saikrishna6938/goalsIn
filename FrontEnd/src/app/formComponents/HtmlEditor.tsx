import React from "react";
import { FieldProps } from "formik";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../components/regularinputs/HtmlEditor.css";

interface CustomHtmlEditorProps extends FieldProps {
  height?: string; // Optional height from parent
}

const HtmlEditor: React.FC<CustomHtmlEditorProps> = ({
  field,
  form,
  height,
}) => {
  const handleChange = (content: string) => {
    form.setFieldValue(field.name, content);
  };

  return (
    <div
      className="editor-wrapper"
      style={{ height: height || "calc(95vh - 300px)" }}
    >
      <ReactQuill
        value={field.value || ""}
        onChange={handleChange}
        theme="snow"
        className="custom-quill"
      />
    </div>
  );
};

export default HtmlEditor;
