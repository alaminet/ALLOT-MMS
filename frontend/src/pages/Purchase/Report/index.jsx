import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Flex } from "antd";
import NotAuth from "../../notAuth";
import { usePermission } from "../../../hooks/usePermission";
import BreadCrumbCustom from "../../../components/breadCrumbCustom";

const PurchaseReport = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  // User Permission Check
  const { canViewPage, canDoOther } = usePermission();
  if (!canViewPage("purchase-report")) {
    return <NotAuth />;
  }

  return (
    <>
      {lastSegment !== "view" && (
        <>
          <Flex justify="space-between">
            <BreadCrumbCustom />
          </Flex>
        </>
      )}
      <Outlet /> {/* Outlet for New and update layout */}
    </>
  );
};

export default PurchaseReport;
