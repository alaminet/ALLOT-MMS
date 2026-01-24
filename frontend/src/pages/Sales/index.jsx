import React from "react";
import { Outlet } from "react-router-dom";
import NotAuth from "../notAuth";
import { usePermission } from "../../hooks/usePermission";
const Sales = () => {
  // User Permission Check
  const { canViewPage } = usePermission();
  if (!canViewPage("sales")) {
    return <NotAuth />;
  }
  return <Outlet />;
};

export default Sales;
