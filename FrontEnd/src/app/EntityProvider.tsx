import React, { createContext, useContext, useEffect, useState } from "react";
import appStore from "./mobxStore/AppStore";
import { api } from "api/API";
import Loading from "./components/Loading";
import { Box } from "@mui/material";

const EntityContext = createContext(null);

export const EntityProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntities = async () => {
      const storedEntityId = localStorage.getItem("selectedEntity");
      const userId = appStore.loginResponse.user[0].userId;

      try {
        if (storedEntityId) {
          appStore.setSelectedEntity(Number(storedEntityId));
          localStorage.removeItem("selectedEntity");
        } else if (appStore.selectedEntity === -1) {
          const res = await api.get(`get-user-entities/${userId}`);
          if (res.success && res.data.length > 0) {
            const selectedEntityId = res.data[0]?.entityId ?? -1;
            appStore.setSelectedEntity(selectedEntityId);
            appStore.setUserEntities(res.data);
          }
        }
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntities();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("selectedEntity", String(appStore.selectedEntity));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [appStore.selectedEntity]);

  const updateEntity = (newEntity) => {
    appStore.setSelectedEntity(newEntity);
  };

  if (isLoading) {
    return (
      <Box style={{ height: "96%" }}>
        <Loading />
      </Box>
    );
  }

  return (
    <EntityContext.Provider
      value={{
        entity: appStore.selectedEntity,
        entities: appStore.userEntities,
        updateEntity,
      }}
    >
      {children}
    </EntityContext.Provider>
  );
};

export const useEntity = () => {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error("useEntity must be used within an EntityProvider");
  }
  return context;
};
