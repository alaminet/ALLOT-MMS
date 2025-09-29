import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Flex } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import BreadCrumbCustom from "../../../components/breadCrumbCustom";
import NotAuth from "../../notAuth";

const Receive = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  // User Permission Check
  const { canViewPage, canDoOther } = usePermission();
  if (!canViewPage("receive")) {
    return <NotAuth />;
  }

  return (
    <>
      <Flex justify="space-between">
        <BreadCrumbCustom />
        {lastSegment === "logs" ? (
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
        )}
      </Flex>
      <Outlet /> {/* Outlet for New and update layout */}
    </>
  );
};

export default Receive;
