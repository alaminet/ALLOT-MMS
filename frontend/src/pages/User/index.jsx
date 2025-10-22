import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import { Button, Flex, Input } from "antd";
import BreadCrumbCustom from "../../components/breadCrumbCustom";
const { Search } = Input;

const User = () => {
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
      <Flex justify="space-between">
        <BreadCrumbCustom />
        {lastSegment !== "new" && (
          <Button
            type="primary"
            onClick={() => navigate("new")}
            disabled={!canDoOwn("user", "create")}>
            Add User
          </Button>
        )}
      </Flex>
      <Flex
        justify="space-between"
        style={{
          marginBottom: "10px",
          display:
            (lastSegment === "new" || lastSegment === "update") && "none",
        }}>
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
        <Search
          className="search-field"
          style={{
            width: "300px",
          }}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          // onSearch={onSearch}
          enterButton
        />
      </Flex>
      <Outlet context={search} /> {/* Outlet for New and update layout */}
    </>
  );
};

export default User;
