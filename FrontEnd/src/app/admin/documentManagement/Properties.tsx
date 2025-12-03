import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import * as Yup from "yup";
import appStore from "app/mobxStore/AppStore";
import GenericForm from "app/formComponents/GenericForm";
import { api } from "api/API";

interface DocumentTypeFormProps {
  entity?: DocumentType;
  reloadEntities?: () => void;
}

interface DocumentType {
  id?: number;
  documentGroupId: number;
  documentTypeDescription: string;
  documentTypeName: string;
  documentTypeObjectId: number;
  documentTypeRoles: string;
  documentTypeTableId: number;
  enabled: any;
  tableName: string;
}

const DocumentTypeForm: React.FC<DocumentTypeFormProps> = ({
  entity,
  reloadEntities,
}) => {
  const [tableSelections, setTableSelections] = useState<any>([]);
  const [groupSelections, setGroupSelections] = useState<any>([]);

  const defaultValues: DocumentType = {
    documentTypeDescription: "",
    documentTypeName: "",
    documentTypeObjectId: 1,
    documentGroupId: 4,
    documentTypeTableId: 13,
    documentTypeRoles: "",
    enabled: 0,
    tableName: "",
  };

  const initialValues: DocumentType = {
    ...defaultValues,
    ...entity,
  };

  const fields = [
    { name: "documentTypeName", label: "Name", type: "string" },
    {
      name: "enabled",
      label: "Enabled",
      type: "dropdown",
      selections: [
        { id: 0, name: "No" },
        { id: 1, name: "Yes" },
      ],
    },
    {
      name: "documentTypeDescription",
      label: "Description",
      type: "textArea",
      column: 1,
    },
    {
      name: "documentGroupId",
      label: "Document Group",
      type: "dropdown",
      selections: groupSelections,
    },
    {
      name: "documentTypeTableId",
      label: "Document Data",
      type: "dropdown",
      selections: tableSelections,
    },
  ];

  useEffect(() => {
    const tablesData = async () => {
      try {
        const response = await api.get("administrator/data-tables");
        const mappedTables: any[] =
          response.data.map((table: any) => ({
            id: table.tableId,
            name: table.tableName,
          })) ?? [];
        mappedTables.push({ id: 1, name: "None" });
        setTableSelections(mappedTables);
      } catch (err) {
        throw err;
      }
    };
    const groupData = async () => {
      try {
        const response = await api.get("administrator/document-groups");
        const mappedTables = response.map((table: any) => ({
          id: table.documentGroupId,
          name: table.documentGroupName,
        }));
        setGroupSelections(mappedTables);
      } catch (err) {
        throw err;
      }
    };
    groupData();
    tablesData();
  }, []);

  const validationSchema = Yup.object({
    documentTypeDescription: Yup.string().required("Description is required"),
    documentTypeName: Yup.string().required("Name is required"),
    enabled: Yup.mixed().oneOf([0, 1]).required("Enabled is required"),
  });

  const handleOnSubmit = async (values: DocumentType) => {
    const url = `administrator/document-types`;
    const updateUrl = `administrator/document-types/${entity?.id}`;

    const isEditMode = !!values.id;

    const documentTypeTableId = fields.find(
      (f) => f.name === "documentTypeTableId"
    );
    const tableName = documentTypeTableId?.selections?.find(
      (p) => p.id === values.documentTypeTableId
    );

    const updatedValues: DocumentType = {
      ...values,
      tableName: tableName?.name,
    };

    const payload = isEditMode
      ? getUpdatedPayload(initialValues, updatedValues)
      : { ...defaultValues, ...updatedValues };

    const updatedPayload = getUpdatedPayload(initialValues, values);

    if (Object.keys(updatedPayload).length === 0) {
      appStore.showToast("No changes made to update.", "info");
      return;
    }

    try {
      const res = isEditMode
        ? await api.put(updateUrl, { body: payload })
        : await api.post(url, { body: payload });
      appStore.showToast(res.message, "success");
      reloadEntities?.();
      // if (res.success) {
      //   appStore.showToast(res.message, "success");
      //   reloadEntities?.();
      // } else {
      //   appStore.showToast(res.message, "error");
      // }
    } catch (error) {
      console.error("Error while saving document type:", error);
      appStore.showToast("Something went wrong. Please try again.", "error");
    }
  };

  const getUpdatedPayload = (
    original: DocumentType,
    updated: DocumentType
  ): Partial<DocumentType> => {
    return Object.entries(updated).reduce((diff, [key, value]) => {
      if (value !== (original as any)[key]) {
        (diff as any)[key] = value;
      }
      return diff;
    }, {} as Partial<DocumentType>);
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

export default DocumentTypeForm;
