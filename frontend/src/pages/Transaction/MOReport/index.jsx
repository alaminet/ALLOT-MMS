import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Flex } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import BreadCrumbCustom from "../../../components/breadCrumbCustom";
import NotAuth from "../../notAuth";

const MOReport = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  // User Permission Check
  const { canViewPage, canDoOther } = usePermission();
  if (!canViewPage("mo-report")) {
    return <NotAuth />;
  }

  return (
    <>
      {lastSegment !== "view" && (
        <>
          <Flex justify="space-between">
            <BreadCrumbCustom />
            {/* {lastSegment === "logs" ? (
          ""
        ) : (
          <Button
            className="borderBrand"
            style={{ borderRadius: "0px" }}
            type="default"
            onClick={() =>
              navigate("logs", {
                state: {
                  model: "Goods-Receive",
                },
              })
            }>
            Logs
          </Button>
        )} */}
          </Flex>
        </>
      )}
      <Outlet /> {/* Outlet for New and update layout */}
    </>
  );
};

export default MOReport;
