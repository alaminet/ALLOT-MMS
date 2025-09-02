// hooks/usePermission.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useLogout from "./useLogout";
import axios from "axios";
import { message } from "antd";
import { Loginuser } from "../features/userSlice";

export const usePermission = () => {
  const logout = useLogout();
  const dispatch = useDispatch();
  const user = useSelector((user) => user.loginSlice.login);

  const getAccess = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/member/access`,
        { id: user.id },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        }
      );
      dispatch(Loginuser(res.data.member));
      localStorage.setItem("user", JSON.stringify(res.data.member));
    } catch (error) {
      if (
        error.response.data.error === "Invalid Token" ||
        error.response.data.error === "Token expired" ||
        error.response.data.error === "Your Accounts is blocked"
      ) {
        message.error("Your session expaired");
        setTimeout(() => {
          logout();
        }, 3000);
      } else {
        console.log(error);
      }
    }
  };

  const permissions = useSelector(
    (state) => state.loginSlice.login?.access || []
  );

  const getModule = (key) => {
    return permissions.find((mod) => mod.key === key);
  };

  const canViewPage = (key) => {
    const module = getModule(key);
    return module?.pageAccess?.view ?? false;
  };

  const canDoOwn = (key, action) => {
    const module = getModule(key);
    return module?.own?.[action] ?? false;
  };

  const canDoOther = (key, action) => {
    const module = getModule(key);
    return module?.other?.[action] ?? false;
  };

  useEffect(() => {
    getAccess();
  }, []);
  return {
    canViewPage,
    canDoOwn,
    canDoOther,
  };
};
