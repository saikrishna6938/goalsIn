import { createContext, useEffect, useReducer } from "react";
import axios from "axios";
import { MatxLoading } from "app/components";
import { api } from "../../api/API";
import { Settings } from "@mui/icons-material";
import { getNavigations } from "../navigations";
import appStore from "../mobxStore/AppStore";
const initialState = {
  user: null,
  isInitialised: false,
  isAuthenticated: false,
};

// const isValidToken = (accessToken) => {
//   if (!accessToken) return false;

//   const decodedToken = jwtDecode(accessToken);
//   const currentTime = Date.now() / 1000;
//   return decodedToken.exp > currentTime;
// };

// const setSession = (accessToken) => {
//   if (accessToken) {
//     localStorage.setItem('accessToken', accessToken);
//     axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
//   } else {
//     localStorage.removeItem('accessToken');
//     delete axios.defaults.headers.common.Authorization;
//   }
// };

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT": {
      const { isAuthenticated, user } = action.payload;
      return { ...state, isAuthenticated, isInitialised: true, user };
    }

    case "LOGIN": {
      const { user } = action.payload;
      return { ...state, isAuthenticated: true, user };
    }

    case "LOGOUT": {
      return { ...state, isAuthenticated: false, user: null };
    }

    case "REGISTER": {
      const { user } = action.payload;

      return { ...state, isAuthenticated: true, user };
    }

    default:
      return state;
  }
};

const AuthContext = createContext({
  ...initialState,
  method: "JWT",
  login: () => {},
  logout: () => {},
  register: () => {},
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async (email, password) => {
    const response = await api.post(`login`, {
      body: {
        userEmail: email,
        userPassword: password,
      },
    });
    if (response.success) {
      const { user } = response;
      const authDataJSON = JSON.stringify(response);
      api.setAuthToken(response.accessToken);
      appStore.setLoginResponse(response);
      api.setNavigations(response.navigations);
      sessionStorage.setItem("authData", authDataJSON);
      dispatch({ type: "LOGIN", payload: { user } });
    } else {
      //show toast message
    }
  };

  const register = async (email, username, password, firstname, lastname) => {
    const response = await api.post(`create-user`, {
      body: {
        userName: username,
        userEmail: email,
        userPassword: password,
        userFirstName: firstname,
        userLastName: lastname,
        userImage: "https://example.com/profile-image.jpg",
        userAddress: "123 Main St, City, Country",
        userServerEmail: email,
        userPhoneOne: "123-456-7890",
        userPhoneTwo: "987-654-3210",
        userEnabled: true,
        userLocked: false,
      },
    });
    const { user } = response;
    api.setAuthToken(response.accessToken);
    api.setNavigations(response.navigations);
    appStore.setLoginResponse(response);
    const authDataJSON = JSON.stringify(response);
    sessionStorage.setItem("authData", authDataJSON);
    dispatch({ type: "REGISTER", payload: { user } });
  };

  const logout = () => {
    appStore.setSelectedEntity(-1);
    dispatch({ type: "LOGOUT" });
  };

  useEffect(() => {
    const jsonUser = sessionStorage.getItem("authData");
    const authData = JSON.parse(jsonUser);
    if (authData) {
      (async () => {
        try {
          const response = await api.post("check-token", {
            body: {
              accessToken: authData.accessToken,
              userId: authData.user[0].userId,
            },
          });
          if (response.success) {
            api.setAuthToken(authData.accessToken);
            appStore.setLoginResponse(authData);
            api.setNavigations(authData.navigations);
            dispatch({
              type: "INIT",
              payload: { isAuthenticated: true, user: authData.user[0] },
            });
          } else {
            dispatch({
              type: "INIT",
              payload: { isAuthenticated: false, user: null },
            });
          }
        } catch (err) {
          console.error(err);
          dispatch({
            type: "INIT",
            payload: { isAuthenticated: false, user: null },
          });
        }
      })();
    } else {
      dispatch({
        type: "INIT",
        payload: { isAuthenticated: false, user: null },
      });
    }
  }, []);

  // SHOW LOADER
  if (!state.isInitialised) return <MatxLoading />;

  return (
    <AuthContext.Provider
      value={{ ...state, method: "JWT", login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
