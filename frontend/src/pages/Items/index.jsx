import React from "react";
import { Outlet } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";

const Items = () => {
  // User Permission Check
  const { canViewPage, canDoOther } = usePermission();
  if (!canViewPage("item-list")) {
    return <NotAuth />;
  }

  return (
    <>
      <Outlet /> {/* Outlet for New and update layout */}
    </>
  );
};

export default Items;
