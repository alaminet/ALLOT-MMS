import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import { Button, Flex, Input, Grid } from "antd";
import BreadCrumbCustom from "../../components/breadCrumbCustom";
import { useSelector } from "react-redux";
import {
  FilterOutlined,
  InfoCircleTwoTone,
  UnorderedListOutlined,
} from "@ant-design/icons";
const { Search } = Input;
const { useBreakpoint } = Grid;

const Inventory = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const screens = useBreakpoint();
  // User Permission Check
  const { canViewPage, canDoOther } = usePermission();
  if (!canViewPage("inventory")) {
    return <NotAuth />;
  }

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  return (
    <>
      <Flex justify="space-between">
        <BreadCrumbCustom />
        <Flex
          gap={10}
          style={{
            marginBottom: "10px",
            display:
              lastSegment !== "inventory"
                ? "none"
                : screens.md
                ? "flex"
                : "none",
          }}>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "10px 15px",
              borderRadius: "5px",
              border: "1px solid #12121269",
            }}>
            <p>
              Total Available <InfoCircleTwoTone />
            </p>
            <p className="colorLink">510215 Unit</p>
          </div>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "10px 15px",
              borderRadius: "5px",
              border: "1px solid #12121269",
            }}>
            <p>Total Category</p>
            <p className="colorLink">510215 Unit</p>
          </div>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "10px 15px",
              borderRadius: "5px",
              border: "1px solid #12121269",
            }}>
            <p>Total Damage</p>
            <p className="colorLink">510215 Unit</p>
          </div>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "10px 15px",
              borderRadius: "5px",
              border: "1px solid #12121269",
              display: !canViewPage("value") && "none",
            }}>
            <p>Total Stock Value</p>
            <p className="colorLink">BDT 510215</p>
          </div>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "10px 15px",
              borderRadius: "5px",
              border: "1px solid #12121269",
              display: !canViewPage("value") && "none",
            }}>
            <p>Total Purchase Value</p>
            <p className="colorLink">BDT 510215</p>
          </div>
        </Flex>
      </Flex>
      <div
        style={{
          marginBottom: "10px",
          display: lastSegment === "new" && "none",
        }}>
        <Flex
          justify="space-between"
          gap={10}
          style={{ flexDirection: screens.md ? "row" : "column" }}>
          <Flex gap={10}>
            <Button
              className="borderBrand"
              style={{ borderRadius: "0px" }}
              type={lastSegment === "inventory" ? "primary" : "default"}
              onClick={() => navigate("/inventory")}>
              Stock
            </Button>
            <Button
              className="borderBrand"
              style={{ borderRadius: "0px" }}
              type={lastSegment === "list" ? "primary" : "default"}
              onClick={() => navigate("list")}
              icon={<UnorderedListOutlined />}>
              Listview
            </Button>
          </Flex>
          <Flex>
            <Search
              className="search-field"
              style={{
                width: "350px",
                display: !["inventory", "list"].includes(lastSegment) && "none",
              }}
              placeholder="Search by code"
              onChange={(e) => setSearch(e.target.value)}
              enterButton
            />
          </Flex>
        </Flex>
      </div>
      <Outlet context={search} /> {/* Outlet for New and update layout */}
    </>
  );
};
export default Inventory;
