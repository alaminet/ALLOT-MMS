import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Flex, Input } from "antd";
import { useSelector } from "react-redux";
import { FilterOutlined, InfoCircleTwoTone } from "@ant-design/icons";
import { usePermission } from "../../../hooks/usePermission";
import NotAuth from "../../notAuth";
import BreadCrumbCustom from "../../../components/breadCrumbCustom";
const { Search } = Input;

const PurchaseRequisition = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  // User Permission Check
  const { canViewPage,  canDoOwn } = usePermission();
  if (!canViewPage("purchase-requisition")) {
    return <NotAuth />;
  }

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  return (
    <>
      <Flex justify="space-between">
        <BreadCrumbCustom />
        {lastSegment !== "new" && (
          <Button
            type="primary"
            onClick={() => navigate("new")}
            disabled={!canDoOwn("purchase-requisition", "create")}>
            Purchase Requisition
          </Button>
        )}
      </Flex>
      <Flex
        justify="space-between"
        style={{
          marginBottom: "10px",
          display: lastSegment === "new" && "none",
        }}>
        <Flex gap={10}>
          <Button
            className="borderBrand"
            style={{ borderRadius: "0px" }}
            type={lastSegment === "logs" ? "primary" : "default"}
            onClick={() =>
              navigate("logs", {
                state: {
                  model: "Purchase-Requisition",
                },
              })
            }>
            Logs
          </Button>
        </Flex>
        <Search
          className="search-field"
          style={{
            width: "300px",
            display: lastSegment !== "PR" && "none",
          }}
          placeholder="Search by name"
          onChange={(e) => setSearch(e.target.value)}
          enterButton
        />
      </Flex>
      <Outlet context={search} /> {/* Outlet for New and update layout */}
    </>
  );
};

export default PurchaseRequisition;
