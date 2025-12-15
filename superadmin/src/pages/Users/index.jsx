import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Flex, Input } from "antd";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import BreadCrumbCustom from "../../components/breadCrumbCustom";
const { Search } = Input;

const Users = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  // User Permission Check
  const { canViewPage, canDoOwn } = usePermission();
  if (!canViewPage("user")) {
    return <NotAuth />;
  }

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  return (
    <>
      <Flex justify="space-between" align="center">
        <BreadCrumbCustom />
        <Flex
          justify="end"
          style={{
            marginBottom: "10px",
            gap: "10px",
            display:
              (lastSegment === "new" || lastSegment === "update") && "none",
          }}>
          {lastSegment !== "new" && (
            <Button
              type="primary"
              onClick={() => navigate("new")}
              disabled={!canDoOwn("user", "create")}
              style={{ borderRadius: "0px", padding: "10px 30px" }}>
              Add User
            </Button>
          )}
          <Button
            lassName="borderBrand"
            style={{ borderRadius: "0px" }}
            type={lastSegment === "logs" ? "primary" : "default"}
            onClick={() =>
              navigate("logs", {
                state: {
                  model: "Member",
                },
              })
            }>
            Logs
          </Button>
          {/* <Search
          className="search-field"
          style={{
            width: "300px",
          }}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          // onSearch={onSearch}
          enterButton
        /> */}
        </Flex>
      </Flex>
      <Outlet context={search} /> {/* Outlet for New and update layout */}
    </>
  );
};

export default Users;
