import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import * as Yup from "yup";
import GenericForm from "app/formComponents/GenericForm";
import appStore from "app/mobxStore/AppStore";
import { api } from "api/API";

interface Props {
  data?: any;
  reloadData?: () => void;
}

const NewsLetterProperties: React.FC<Props> = ({ data, reloadData }) => {
  const [newslettersTypes, SetNewslettersTypes] = useState([]);

  useEffect(() => {
    const tablesData = async () => {
      try {
        const response = await api.get("administrator/newsletters/types");
        const mappedTables = response.rows.map((item: any) => ({
          id: item.typeId,
          name: item.typeName,
        }));
        SetNewslettersTypes(mappedTables);
      } catch (err) {
        console.error("Error fetching newsletter types", err);
      }
    };
    tablesData();
  }, []);

  const isEditMode = !!data?.id;

  const initialValues = {
    title: data?.newsletterName ?? "",
    template: data?.typeDescription ?? "",
    newsletterTypeId: data?.newsletterTypeId ?? "",
  };

  const fields = [
    { name: "title", label: "Title", type: "string" },
    {
      name: "newsletterTypeId",
      label: "newsletterTypeId",
      type: "dropdown",
      selections: newslettersTypes,
    },
    {
      name: "template",
      label: "Template",
      type: "htmlEditor",
      column: 1,
    },
  ];

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    template: Yup.string().required("Template is required"),
  });

  const handleSubmit = async (values: any) => {
    const url = "administrator/newsletters";

    const stripHtml = (html: string) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || "";
    };

    const payload = isEditMode
      ? {
          newsletterId: data.id,
          newsletterName: values.title.trim(),
          newsletterDescription: stripHtml(values.template.trim()),
          newsletterTypeId: values.newsletterTypeId,
        }
      : [
          {
            newsletterName: values.title.trim(),
            newsletterDescription: stripHtml(values.template.trim()),
            newsletterTypeId: values.newsletterTypeId,
          },
        ];

    try {
      const response = isEditMode
        ? await api.put(url, { body: payload })
        : await api.post(url, { body: payload });

      if (response.status) {
        appStore.showToast("Saved successfully", "success");
        reloadData?.();
      }
    } catch (err) {
      console.error("Error submitting newsletter:", err);
      appStore.showToast("Failed to save newsletter", "error");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{ height: "100%", backgroundColor: "white", mt: "5px" }}
    >
      <GenericForm
        fields={fields}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        columns={2}
        showSaveButton={true}
        readOnly={false}
        showHeaderComponent={false}
      />
    </Box>
  );
};

export default NewsLetterProperties;
