import React from "react";
import { Box, Button } from "@mui/material";
import GenericForm from "app/formComponents/GenericForm";
import * as Yup from "yup";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";

interface Props {
  curentObj?: any;
  reload?: () => void;
  laststep?: any;
}

const Details: React.FC<Props> = ({ curentObj, reload, laststep }) => {
  const initialValues = {
    ...curentObj,
  };

  const fields = [
    {
      name: "documentStateName",
      label: "Document State Name",
      type: "string",
    },
    {
      name: "documentStateDescription",
      label: "Document State Description",
      type: "textArea",
    },
    // {
    //   name: "steps",
    //   label: "Steps",
    //   type: "dropdown",
    //   selections: Array.from({ length: 10 }, (_, i) => ({
    //     id: i + 1,
    //     name: `${i + 1}`,
    //   })),
    // },
  ];

  const validationSchema = Yup.object({
    documentStateName: Yup.string().required("Required"),
    documentStateDescription: Yup.string().required("Required"),
    steps: Yup.number().required("Required").min(1, "Must be at least 1"),
  });

  const handleSubmit = async (values: any) => {
    const isEditMode = !!curentObj?.documentStateId;

    let payload;

    if (isEditMode) {
      payload = {
        documentStateId: curentObj.documentStateId,
        documentStateName: values.documentStateName.trim(),
        documentStateDescription: values.documentStateDescription.trim(),
        steps: values.steps,
      };
    } else {
      payload = {
        documentStateName: values.documentStateName.trim(),
        documentStateDescription: values.documentStateDescription.trim(),
        WorkflowID: curentObj?.WorkflowID,
        steps: (laststep?.steps ?? 0) + 1,
      };
    }

    const url = "administrator/workflows/document-states";

    try {
      const response = isEditMode
        ? await api.put(url, { body: payload })
        : await api.post(url, { body: payload });

      if (response.status) {
        appStore.showToast(response.message, "success");
        reload?.();
      }
    } catch (err) {
      console.error("Failed to submit the form", err);
      appStore.showToast("Submission failed", "error");
    }
  };

  return (
    <Box>
      <GenericForm
        fields={fields}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        columns={1}
        readOnly={false}
        showUserInfo={false}
      />
    </Box>
  );
};

export default Details;
