import React from "react";
import { Outlet } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";

const Purchase = () => {
  // User Permission Check
  const { canViewPage } = usePermission();
  if (!canViewPage("purchase")) {
    return <NotAuth />;
  }
  return <Outlet />;
};

export default Purchase;
