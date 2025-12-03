import { createContext, useEffect, useReducer } from "react";
import axios from "axios";
import appStore from "../mobxStore/AppStore";
import { api } from "api/API";
const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_NOTIFICATIONS": {
      return { ...state, notifications: action.payload };
    }

    case "DELETE_NOTIFICATION": {
      return { ...state, notifications: action.payload };
    }

    case "CLEAR_NOTIFICATIONS": {
      return { ...state, notifications: action.payload };
    }

    default:
      return state;
  }
};

const NotificationContext = createContext({
  notifications: [],
  deleteNotification: () => {},
  clearNotifications: () => {},
  getNotifications: () => {},
  createNotification: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, []);

  const deleteNotification = async (notificationID) => {
    try {
      const res = await axios.post("/api/notification/delete", {
        id: notificationID,
      });
      dispatch({ type: "DELETE_NOTIFICATION", payload: res.data });
    } catch (e) {
      console.error(e);
    }
  };

  const clearNotifications = async () => {
    try {
      const res = await axios.post("/api/notification/delete-all");
      dispatch({ type: "CLEAR_NOTIFICATIONS", payload: res.data });
    } catch (e) {
      console.error(e);
    }
  };

  const getNotifications = async () => {
    try {
      const res = await axios.get("/api/notification");
      dispatch({ type: "LOAD_NOTIFICATIONS", payload: res.data });
    } catch (e) {
      console.error(e);
    }
  };

  const createNotification = async (notification) => {
    try {
      const res = await axios.post("/api/notification/add", { notification });
      dispatch({ type: "CREATE_NOTIFICATION", payload: res.data });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let unsubscribe;
    const init = async () => {
      try {
        const socket = await appStore.loadSocket(api);
        if (!socket) return;

        const onMessage = (data) => {
          console.log("Received a new note:", data);
        };

        socket.on("message", onMessage);
        unsubscribe = () => socket.off("message", onMessage);
      } catch (e) {
        console.error(e);
      }
    };
    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  return (
    <NotificationContext.Provider
      value={{
        getNotifications,
        deleteNotification,
        clearNotifications,
        createNotification,
        notifications: state.notifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
