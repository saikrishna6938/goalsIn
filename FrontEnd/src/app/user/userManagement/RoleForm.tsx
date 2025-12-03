import React, { useEffect, useState } from "react";
import GenericForm from "app/formComponents/GenericForm";
import * as Yup from "yup";
import { Box } from "@mui/material";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";

interface RoleFormProps {
  role?: any;
  onReload?: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onReload }) => {
  const [roleTypes, setRoleTypes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("administrator/types/role-type/get");
        setRoleTypes(response.data || []);
      } catch (err) {
        appStore.showToast("Failed to load role types", "error");
      }
    };
    fetchData();
  }, []);

  const fields = [
    {
      name: "roleName",
      label: "Role Name",
      type: "string",
    },
    {
      name: "roleTypeId",
      label: "Role Type",
      type: "dropdown",
      selections:
        roleTypes.map((type: any) => ({
          id: type.roleTypeId,
          name: type.roleTypeName,
        })) || [],
    },
    {
      name: "roleNameDescription",
      label: "Role Description",
      type: "textArea",
      column: 1,
    },
  ];

  const initialValues = {
    roleName: role?.roleName || "",
    roleNameDescription: role?.roleNameDescription || "",
    roleTypeId:
      role?.roleTypeId ?? (roleTypes.length > 0 ? roleTypes[0].roleTypeId : ""),
  };

  const validationSchema = Yup.object({
    roleName: Yup.string().required("Role Name is required"),
    roleNameDescription: Yup.string().required("Description is required"),
  });

  const handleSubmit = async (values: any) => {
    try {
      const isEdit = !!role?.id;

      const url = isEdit
        ? `administrator/roles/names/update`
        : `administrator/roles/names/create`;

      const payload = isEdit
        ? Object.keys(values).reduce(
            (acc: any, key) => {
              if (values[key] !== role[key]) {
                acc[key] = values[key];
              }
              return acc;
            },
            { roleNameId: role.id }
          )
        : values;

      if (isEdit && Object.keys(payload).length === 1) {
        appStore.showToast("No changes to update.", "info");
        return;
      }

      const res = isEdit
        ? await api.put(url, { body: payload })
        : await api.post(url, { body: payload });

      appStore.showToast(res.message, res.success ? "success" : "error");
      onReload?.();
    } catch (error) {
      appStore.showToast("Failed to save role", "error");
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

export default RoleForm;
