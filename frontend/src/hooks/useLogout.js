import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogoutUser } from "../features/userSlice";

const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return () => {
    localStorage.removeItem("user");
    dispatch(LogoutUser());
    navigate("/");
  };
};

export default useLogout;
