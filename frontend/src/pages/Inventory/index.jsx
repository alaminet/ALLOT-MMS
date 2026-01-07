import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import { Button, Flex, Input, Grid } from "antd";
import BreadCrumbCustom from "../../components/breadCrumbCustom";
import { useSelector } from "react-redux";
import {
  FileExcelOutlined,
  FilterOutlined,
  InfoCircleTwoTone,
  UnorderedListOutlined,
} from "@ant-design/icons";
import useExcelExport from "../../hooks/useExcelExport";
const { Search } = Input;
const { useBreakpoint } = Grid;

const Inventory = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const location = useLocation();

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
      </Flex>
      <Outlet /> {/* Outlet for New and update layout */}
    </>
  );
};
export default Inventory;
