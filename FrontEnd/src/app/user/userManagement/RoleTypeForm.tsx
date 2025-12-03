import React, { useEffect, useState } from "react";
import GenericForm from "app/formComponents/GenericForm";
import * as Yup from "yup";
import { Box } from "@mui/material";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";

interface RoleTypeFormProps {
  roleType?: any;
  onReload?: () => void;
}

const RoleTypeForm: React.FC<RoleTypeFormProps> = ({ roleType, onReload }) => {
  console.log("roleType", roleType);

  const fields = [
    {
      name: "roleTypeName",
      label: "Role Type Name",
      type: "string",
    },
    {
      name: "roleTypeDescription",
      label: "Role Type Description",
      type: "textArea",
      column: 1,
    },
  ];

  const initialValues = {
    roleTypeName: roleType?.roleTypeName || "",
    roleTypeDescription: roleType?.roleTypeDescription || "",
  };

  const validationSchema = Yup.object({
    roleTypeName: Yup.string().required("Role Type Name is required"),
    roleTypeDescription: Yup.string().required(
      "Role Type Description is required"
    ),
  });

  const handleSubmit = async (values: any) => {
    try {
      const isEdit = !!roleType?.id;

      const url = isEdit
        ? `administrator/types/role-type/update`
        : `administrator/types/role-type/create`;

      const payload = isEdit ? { roleTypeId: roleType.id, ...values } : values;

      if (
        isEdit &&
        !Object.keys(values).some((key) => values[key] !== roleType[key])
      ) {
        appStore.showToast("No changes to update.", "info");
        return;
      }

      const res = isEdit
        ? await api.put(url, { body: payload })
        : await api.post(url, { body: payload });

      appStore.showToast(res.message, res.success ? "success" : "error");
      onReload?.();
    } catch (error) {
      appStore.showToast("Failed to save role type", "error");
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

export default RoleTypeForm;
