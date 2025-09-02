import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import { Button, Flex, Input } from "antd";
import BreadCrumbCustom from "../../components/breadCrumbCustom";
import { useSelector } from "react-redux";
import { FilterOutlined } from "@ant-design/icons";
const { Search } = Input;

const Category = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  // User Permission Check
  const { canViewPage, canDoOther } = usePermission();
  if (!canViewPage("category")) {
    return <NotAuth />;
  }

  return (
    <>
      <Flex justify="space-between">
        <BreadCrumbCustom />
        {lastSegment !== "new" && (
          <Button
            type="primary"
            onClick={() => navigate("new")}
            disabled={!canDoOther("category", "create")}
          >
            Add Category
          </Button>
        )}
      </Flex>
      <Flex
        justify="space-between"
        style={{
          marginBottom: "10px",
          display: lastSegment === "new" && "none",
        }}
      >
        <Flex gap={10}>
          <Button
            className="borderBrand"
            style={{ borderRadius: "0px" }}
            type={lastSegment === "" ? "primary" : "default"}
            onClick={() =>
              navigate("logs", {
                state: {
                  model: "product",
                },
              })
            }
            icon={<FilterOutlined />}
          >
            Filter
          </Button>
          <Button
            className="borderBrand"
            style={{ borderRadius: "0px" }}
            type={lastSegment === "logs" ? "primary" : "default"}
            onClick={() =>
              navigate("logs", {
                state: {
                  model: "Category",
                },
              })
            }
          >
            Logs
          </Button>
        </Flex>
        <Search
          className="search-field"
          style={{
            width: "300px",
            display: lastSegment !== "category" && "none",
          }}
          placeholder="Search by code"
          onChange={(e) => setSearch(e.target.value)}
          enterButton
        />
      </Flex>
      <Outlet context={search} /> {/* Outlet for New and update layout */}
    </>
  );
};

export default Category;
