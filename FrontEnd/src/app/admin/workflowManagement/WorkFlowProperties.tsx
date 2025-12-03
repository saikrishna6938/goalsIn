import React from "react";
import { Box } from "@mui/material";
import * as Yup from "yup";
import GenericForm from "app/formComponents/GenericForm";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";

interface Props {
  data?: WorkflowData;
  reloadData?: () => void;
}

interface WorkflowData {
  id?: number;
  WorkflowName: string;
  Description: string;
  CreatedAt?: string;
}

const WorkFlowProperties: React.FC<Props> = ({ data, reloadData }) => {
  const defaultValues: WorkflowData = {
    WorkflowName: "",
    Description: "",
    CreatedAt: "",
  };

  const initialValues: WorkflowData = {
    ...defaultValues,
    ...data,
  };

  const fields = [
    {
      name: "WorkflowName",
      label: "Workflow Name",
      type: "string",
      column: 1,
    },
    {
      name: "Description",
      label: "Description",
      type: "textArea",
      column: 1,
    },
  ];

  const validationSchema = Yup.object({
    WorkflowName: Yup.string().required("Workflow Name is required"),
    Description: Yup.string().required("Description is required"),
  });

  const handleOnSubmit = async (values: WorkflowData) => {
    const isEditMode = !!values.id;
    const url = `administrator/workflows`;

    const isChanged = JSON.stringify(values) !== JSON.stringify(initialValues);

    if (!isChanged) {
      appStore.showToast("No changes made to update.", "info");
      return;
    }

    if (isEditMode) {
      const payload = {
        WorkflowID: values.id,
        WorkflowName: values.WorkflowName,
        Description: values.Description,
      };

      try {
        const res = await api.put(url, { body: payload });
        appStore.showToast(res.message, "success");
        reloadData?.();
      } catch (error) {
        console.error("Error while updating workflow:", error);
        appStore.showToast("Something went wrong. Please try again.", "error");
      }
    } else {
      const payload = {
        WorkflowName: values.WorkflowName,
        Description: values.Description,
      };

      try {
        const res = await api.post(url, { body: payload });
        appStore.showToast(res.message, "success");
        reloadData?.();
      } catch (error) {
        console.error("Error while creating workflow:", error);
        appStore.showToast("Something went wrong. Please try again.", "error");
      }
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
        onSubmit={handleOnSubmit}
        columns={2}
        showSaveButton={true}
        readOnly={false}
        showHeaderComponent={false}
      />
    </Box>
  );
};

export default WorkFlowProperties;
