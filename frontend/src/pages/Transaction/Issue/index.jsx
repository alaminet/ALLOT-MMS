import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Flex } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import BreadCrumbCustom from "../../../components/breadCrumbCustom";
import NotAuth from "../../notAuth";


const Issue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  // User Permission Check
  const { canViewPage, canDoOther } = usePermission();
  if (!canViewPage("issue")) {
    return <NotAuth />;
  }

  return (
    <>
      <Flex justify="space-between">
        <BreadCrumbCustom />
        <Flex gap={16}>
          {lastSegment !== "logs" ? (
            <Button
              className="borderBrand"
              style={{ borderRadius: "0px" }}
              type="default"
              onClick={() =>
                navigate("logs", {
                  state: {
                    model: "Goods-Issue",
                  },
                })
              }>
              Logs
            </Button>
          ) : null}
          {lastSegment === "issue" ? (
            <Button
              className="borderBrand"
              style={{ borderRadius: "0px" }}
              type="primary"
              onClick={() => navigate("new")}>
              Manual Issue
            </Button>
          ) : null}
          
        </Flex>
      </Flex>
      <Outlet /> {/* Outlet for New and update layout */}
    </>
  );
};
export default Issue;
