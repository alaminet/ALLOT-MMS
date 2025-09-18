import React from "react";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import { Outlet } from "react-router-dom";

const Transaction = () => {
  // User Permission Check
  const { canViewPage, canDoOther } = usePermission();
  if (!canViewPage("master")) {
    return <NotAuth />;
  }

  return (
    <>
      <Outlet /> {/* Outlet for New and update layout */}
    </>
  );
};

export default Transaction;
