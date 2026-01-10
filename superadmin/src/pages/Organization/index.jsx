import React from "react";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import { Outlet } from "react-router-dom";
const Organization = () => {
  // User Permission Check
  const { canViewPage } = usePermission();
  if (!canViewPage("organization")) {
    return <NotAuth />;
  }
  return <Outlet />;
};

export default Organization;
