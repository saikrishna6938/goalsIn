import React from "react";
import { Box } from "@mui/material";
import * as Yup from "yup";
import appStore from "app/mobxStore/AppStore";
import GenericForm from "app/formComponents/GenericForm";
import { api } from "api/API";

interface EntityFormProps {
  entity: Entity;
  reloadEntities: () => void;
  roleData?: any[];
}

interface Entity {
  id?: number;
  entityName: string;
  entityLocation: string;
  entityPhone: string;
  entityDescription: string;
  userRoleNameId: number | string;
  RefCode: string;
}

const EntityForm: React.FC<EntityFormProps> = ({
  entity,
  reloadEntities,
  roleData,
}) => {
  const initialValues: Entity = entity || {
    entityName: "",
    entityLocation: "",
    entityPhone: "",
    entityDescription: "",
    userRoleNameId: 0,
    RefCode: "",
  };

  const fields = [
    { name: "entityName", label: "Entity Name", type: "string" },
    { name: "entityLocation", label: "Location", type: "string" },
    { name: "entityPhone", label: "Phone", type: "string" },
    { name: "entityDescription", label: "Description", type: "string" },
    {
      name: "userRoleNameId",
      label: "User Role Name",
      type: "combinedDropdown",
      selections: roleData
        ? roleData
            .filter((role) => role.roleTypeId === 5)
            .map((role) => ({
              id: role.roleNameId,
              name: role.roleName,
            }))
        : [],
    },
    {
      name: "RefCode",
      label: "Reference Code",
      type: "string",
      disabled: true,
    },
  ];

  const validationSchema = Yup.object({
    entityName: Yup.string().required("Entity name is required"),
    entityLocation: Yup.string().required("Location is required"),
    entityPhone: Yup.string()
      .matches(/^[0-9]+$/, "Phone must be only digits")
      .required("Phone is required"),
    entityDescription: Yup.string().required("Description is required"),
    userRoleNameId: Yup.number().required("User Role Name ID is required"),
    RefCode: Yup.string().required("Reference Code is required"),
  });

  const handleOnSubmit = async (values: Entity) => {
    const url = values.id ? `update-entity/${values.id}` : "add-entity";
    const payload = values.id
      ? {
          ...(values.entityName !== initialValues.entityName && {
            entityName: values.entityName,
          }),
          ...(values.entityLocation !== initialValues.entityLocation && {
            entityLocation: values.entityLocation,
          }),
          ...(values.entityPhone !== initialValues.entityPhone && {
            entityPhone: values.entityPhone,
          }),
          ...(values.entityDescription !== initialValues.entityDescription && {
            entityDescription: values.entityDescription,
          }),
          ...(values.userRoleNameId !== initialValues.userRoleNameId && {
            userRoleNameId: values.userRoleNameId,
          }),
          ...(values.RefCode !== initialValues.RefCode && {
            RefCode: values.RefCode,
          }),
        }
      : {
          entityName: values.entityName,
          entityLocation: values.entityLocation,
          entityPhone: values.entityPhone,
          entityDescription: values.entityDescription,
          userRoleNameId: values.userRoleNameId,
          RefCode: values.RefCode,
        };

    try {
      const res = values.id
        ? await api.put(url, { body: payload })
        : await api.post(url, { body: payload });
      if (res.success) {
        appStore.showToast(res.message, "success");
        reloadEntities();
      } else {
        appStore.showToast(res.message, "error");
      }
    } catch (error) {
      console.error("Error while adding/updating entity:", error);
      appStore.showToast(
        "The details entered already exist. Please enter different details.",
        "error"
      );
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        height: "100%",
        backgroundColor: "white",
        mt: "5px",
      }}
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

export default EntityForm;

export const currentEntity: Entity = {
  id: undefined,
  entityName: "",
  entityLocation: "",
  entityPhone: "",
  entityDescription: "",
  userRoleNameId: 0,
  RefCode: "",
};
