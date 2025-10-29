import React from "react";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import { Tabs, Typography } from "antd";
import { BankOutlined, GlobalOutlined } from "@ant-design/icons";
import BusinessSettings from "./businessSettings";
import WebSettings from "./webSettings";
const { Title } = Typography;

const Settings = () => {
  // User Permission Check
  const { canViewPage } = usePermission();
  if (!canViewPage("settings")) {
    return <NotAuth />;
  }

  // Tabs Options
  const items = [
    {
      key: "1",
      label: "Business",
      children: <BusinessSettings />,
      icon: <BankOutlined />,
    },
    {
      key: "2",
      label: "Website",
      children: <WebSettings />,
      icon: <GlobalOutlined />,
    },
  ];

  return (
    <>
      <Title
        style={{ textAlign: "center", margin: "0" }}
        className="colorLink form-title">
        Settings
      </Title>
      <Tabs type="card" defaultActiveKey="1" items={items} />
    </>
  );
};

export default Settings;
