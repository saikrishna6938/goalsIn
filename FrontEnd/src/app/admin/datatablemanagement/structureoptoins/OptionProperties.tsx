import { Box } from "@mui/material";
import { api } from "api/API";
import DropDownTable from "app/admin/formManagement/userform/DropDownTable";
import DataGrid from "app/formComponents/DataGrid";
import GenericForm from "app/formComponents/GenericForm";
import appStore from "app/mobxStore/AppStore";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";

interface TabProps {
  currentObj?: any;
  data?: any;
  onReload?: () => void;
  entity?: any;
}

const columns: any = [
  { id: "id", label: "ID", type: "number" },
  { id: "name", label: "Name", type: "string" },
  { id: "description", label: "Description", type: "string" },
];

const OptionProperties: React.FC<TabProps> = ({
  currentObj,
  data,
  onReload,
  entity,
}) => {
  const [fullOptionsList, SetfullOptionsList] = useState<any[]>([]);

  useEffect(() => {
    const FetchData = async () => {
      if (!currentObj?.id) {
        SetfullOptionsList([]);
        return;
      }

      try {
        const response = await api.get(
          `administrator/options/structure-values/values/${currentObj.id}`
        );

        const fullOptionsList = response.data.fullOptionsList || [];
        SetfullOptionsList(fullOptionsList);
      } catch (err) {
        console.error("Error fetching structure values", err);
      }
    };

    FetchData();
  }, [currentObj?.id]);

  const initialValues = {
    Name: currentObj?.valueLabel ?? "",
    notes: currentObj?.notes ?? "",
    optionId: currentObj?.optionId ?? "",
    entityId: currentObj?.entityId ?? "",
  };

  const fields = [
    { name: "Name", label: "Name", type: "string" },
    {
      name: "notes",
      label: "Note",
      type: "textArea",
      column: 1,
    },
    {
      name: "optionId",
      label: "Options",
      type: "dropdown",
      selections:
        data?.map((d: any) => ({
          id: d.id,
          name: d.optionName,
        })) || [],
    },
    {
      name: "entityId",
      label: "Entity",
      type: "dropdown",
      selections:
        entity?.map((d: any) => ({
          id: d.entityId,
          name: d.entityName,
        })) || [],
    },
  ];

  const validationSchema = Yup.object({
    Name: Yup.string().required("Title is required"),
    notes: Yup.string().required("Role Description is required"),
  });

  const handleSubmit = async (values: any) => {
    try {
      const isEdit = !!currentObj?.id;

      const url = isEdit
        ? `administrator/options/structure-value/${currentObj.id}`
        : `administrator/options/structure-value`;

      const payload = {
        entityId: values.entityId,
        optionId: values.optionId,
        selectedOptionId: currentObj?.selectedOptionId ?? -1,
        valueLabel: values.Name,
        notes: values.notes,
      };

      if (isEdit) {
        const noChanges =
          payload.entityId === currentObj.entityId &&
          payload.optionId === currentObj.optionId &&
          payload.valueLabel === currentObj.valueLabel &&
          payload.notes === currentObj.notes;

        if (noChanges) {
          appStore.showToast("No changes to update.", "info");
          return;
        }
      }

      const res = isEdit
        ? await api.put(url, { body: payload })
        : await api.post(url, { body: payload });

      appStore.showToast(
        res.message ||
          (isEdit ? "Updated successfully" : "Created successfully"),
        res.success ? "success" : "error"
      );

      onReload?.();
    } catch (err) {
      appStore.showToast("Failed to save structure option", "error");
      throw err;
    }
  };
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflow: "auto",
        padding: "10px",
      }}
    >
      <Box>
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

        <Box sx={{ mt: 2 }}>
          <DataGrid
            tasks={fullOptionsList}
            columns={columns}
            onSelection={() => {}}
            resetSelectionRowId={true}
            defaultHeight="100%"
          />{" "}
        </Box>
      </Box>
    </Box>
  );
};

export default OptionProperties;
