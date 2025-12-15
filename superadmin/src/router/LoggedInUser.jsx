import React from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import Login from "../pages/login";

const LoggedInUser = () => {
  const user = useSelector((user) => user.loginSlice.login);
  return user ? <Outlet /> : <Login />;
};

export default LoggedInUser;
