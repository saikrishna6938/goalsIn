import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import * as Yup from "yup";
import GenericForm from "app/formComponents/GenericForm";
import appStore from "app/mobxStore/AppStore";
import { api } from "api/API";
import DropDownTable from "../formManagement/userform/DropDownTable";

interface CurrentObjectType {
  id?: number;
  optionName?: string;
}

interface Props {
  currentObject: CurrentObjectType;
  reloaddData?: () => void;
}

const CreateNew = [
  { name: "optionName", label: "Option Name", type: "string", column: 1 },
];

const DetailsDataTable: React.FC<Props> = ({ currentObject, reloaddData }) => {
  const [actionList, setActionList] = useState<any[]>([]);
  const [initialActionList, setInitialActionList] = useState<any[]>([]);
  const resetDropDownFormRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!currentObject?.id) {
      setActionList([]);
      setInitialActionList([]);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get(`administrator/options/${currentObject.id}`);
        const apiData = Array.isArray(res.data.options) ? res.data.options : [];
        const initialActionList = apiData.map((item) => ({
          type: item.id,
          name: item.name,
          description: item.description || "",
        }));
        setActionList(initialActionList);
        setInitialActionList(initialActionList);
      } catch (err) {
        console.error("Error", err);
      }
    };
    fetchData();
  }, [currentObject?.id]);

  useEffect(() => {
    resetDropDownFormRef.current?.();
  }, [currentObject?.id]);

  const initialValues = {
    ...currentObject,
  };

  const validationSchema = Yup.object({
    optionName: Yup.string().required("Option Name is required"),
  });

  const handleOnSubmit = async (values: any) => {
    const isEditMode = !!currentObject?.id;
    const isChanged =
      JSON.stringify(values) !== JSON.stringify(initialValues) ||
      JSON.stringify(actionList) !== JSON.stringify(initialActionList);
    if (!isChanged) {
      appStore.showToast("No changes made to update.", "info");
      return;
    }

    const payload = {
      optionName: values.optionName?.trim(),
      options: actionList.map((row) => ({
        id: row.type,
        name: row.name ?? "",
        description: row.description ?? "",
      })),
    };

    const url = isEditMode
      ? `administrator/options/${currentObject.id}`
      : "administrator/options";

    try {
      const response = isEditMode
        ? await api.put(url, { body: payload })
        : await api.post(url, { body: payload });

      appStore.showToast(response.message, "success");
      reloaddData?.();
      resetDropDownFormRef.current();
    } catch (error) {
      console.error("Submission error:", error);
      appStore.showToast("Submission failed", "error");
    }
  };

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box display="flex" flexDirection="column">
        <GenericForm
          fields={CreateNew}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleOnSubmit}
          columns={2}
          showSaveButton={true}
          readOnly={false}
          showHeaderComponent={false}
        />
      </Box>
      <Box sx={{ mt: "10px" }}>
        <DropDownTable
          title="Options Data"
          onResetRef={resetDropDownFormRef}
          columns={[
            {
              colName: "Id",
              colData: [],
              colType: 1,
              colWidth: "100px",
              key: "type",
            },
            {
              colName: "Name",
              colData: [],
              colType: 1,
              colWidth: "200px",
              key: "name",
            },
            {
              colName: "Description",
              colData: [],
              colType: 1,
              colWidth: "250px",
              key: "description",
            },
          ]}
          data={actionList}
          onAddRow={(newRow) => setActionList((prev) => [...prev, newRow])}
          onEditRow={(index, updatedRow) => {
            const updated = [...actionList];
            updated[index] = updatedRow;
            setActionList(updated);
          }}
          onDeleteRow={(index) => {
            const updated = [...actionList];
            updated.splice(index, 1);
            setActionList(updated);
          }}
        />
      </Box>
    </Box>
  );
};

export default DetailsDataTable;
