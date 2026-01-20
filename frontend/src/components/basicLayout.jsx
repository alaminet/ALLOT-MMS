import React, { useEffect, useState } from "react";
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  FileSyncOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  ProductOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  theme,
  ConfigProvider,
  message,
  Flex,
  Typography,
  Button,
} from "antd";
const { Header, Content, Footer, Sider } = Layout;
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loginuser } from "../features/userSlice";
import useModuleFilter from "../hooks/useModuleFilter";
const { Text } = Typography;
// Navigation
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const items = [
  getItem("Dashboard", "dashboard", <PieChartOutlined />),
  getItem("Purchase", "purchase", <ShoppingCartOutlined />, [
    getItem("Requisition", "purchase-requisition", <FileDoneOutlined />),
    getItem("Order", "purchase-order", <FileProtectOutlined />),
    getItem("Supplier", "supplier", <FileSyncOutlined />),
    getItem("Report", "purchase-report", <FileDoneOutlined />),
  ]),
  getItem("Warehouse", "transaction", <ShopOutlined />, [
    getItem("Inventory", "inventory", <AppstoreOutlined />),
    getItem("Receive", "receive", <ArrowRightOutlined />),
    getItem("Issue", "issue", <ArrowLeftOutlined />),
    getItem("Tnx-Report", "tnx-report", <FileDoneOutlined />),
    getItem("MO-Report", "mo-report", <FileDoneOutlined />),
  ]),
  getItem("Item Master", "master", <ProductOutlined />, [
    getItem("Item List", "item-list", <FileDoneOutlined />),
    getItem("Item Details", "item-details", <FileDoneOutlined />),
  ]),
  getItem("Settings", "settings", <SettingOutlined />),
  getItem("User", "user", <TeamOutlined />),
];

// Theme configure
const customTheme = {
  token: {
    colorPrimary: "#247F93",
    colorDark: "#212121",
    fontFamily: "Poppins, sans-serif",
  },
};

// Recursive Menu Filtering
const filterMenuItems = (menuItems, allowedKeys) => {
  return menuItems
    ?.map((item) => {
      if (item.children) {
        const filteredChildren = filterMenuItems(item.children, allowedKeys);
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
      }
      return allowedKeys?.includes(item.key) ? item : null;
    })
    .filter(Boolean);
};

const BasicLayout = () => {
  const [curent, setCurent] = useState();
  const user = useSelector((user) => user.loginSlice.login);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [resBroken, setResBroken] = useState(false);
  const {
    token: { colorBgContainer, colorDark, colorPrimary },
  } = theme.useToken();

  // Filter Menu as per Org Package
  const filterWithOrgPack = useModuleFilter(items, user?.moduleList);

  // Get Accessable menu
  const allowedKeys = user?.access
    ?.filter((entry) => entry.pageAccess?.view)
    .map((entry) => entry.key);

  // handle Navigation
  const handleMenu = (e) => {
    if (e.key !== "logout") {
      navigate(e.key);
      setCurent(e.key);
    }
  };

  const handleLogout = () => {
    message.warning("logout");
    localStorage.removeItem("user");
    dispatch(Loginuser(null));
    navigate("/");
  };

  // Side Bar sticky Style
  const siderStyle = {
    overflow: "auto",
    height: "100vh",
    position: "sticky",
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: "thin",
    scrollbarGutter: "stable",
    background: colorBgContainer,
  };

  // User Popover Content
  const content = (
    <Flex vertical gap={10}>
      <Button
        icon={<SettingOutlined />}
        type="link"
        onClick={() => navigate("/settings")}
        block
        size="small">
        Settings
      </Button>
      <Button
        icon={<LogoutOutlined />}
        type="link"
        onClick={handleLogout}
        block
        size="small">
        Logout
      </Button>
    </Flex>
  );

  const menuItems = [
    ...filterMenuItems(filterWithOrgPack, allowedKeys),
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: () => {
        handleLogout();
      },
    },
  ];

  return (
    <>
      <ConfigProvider theme={customTheme}>
        <Layout style={{ minHeight: "100vh" }}>
          <Sider
            breakpoint="lg"
            collapsedWidth={resBroken ? "0" : "80px"}
            onBreakpoint={(broken) => setResBroken(broken)}
            trigger={null}
            style={siderStyle}
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}>
            <Flex
              vertical
              justify="center"
              align="center"
              style={{ padding: collapsed ? "0px" : "20px 0" }}>
              <div
                className="top-icon-btn"
                style={{
                  width: collapsed ? "30px" : "80px",
                  height: collapsed ? "30px" : "80px",
                  borderRadius: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <UserOutlined
                  style={{ fontSize: collapsed ? "18px" : "50px" }}
                />
              </div>
              <Text
                className="colorLink"
                style={{ fontWeight: "500", paddingTop: "10px" }}>
                {collapsed ? "" : user?.name}
              </Text>
            </Flex>
            <Menu
              style={{ border: "0px" }}
              theme="light"
              defaultSelectedKeys={["1"]}
              mode="inline"
              items={menuItems}
              onClick={handleMenu}
            />
          </Sider>
          <Layout>
            <Header
              style={{
                padding: 0,
                background: colorBgContainer,
                display: "flex",
                alignItems: "center",
              }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              />
              <Flex
                align="center"
                justify="space-between"
                // gap={100}
                style={{ width: "100%" }}>
                {/* <img src={logoDark} alt="aayaaz" width={120} /> */}
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: colorDark,
                  }}>
                  ALLOT
                </span>
                {/* <Search
                  style={{ width: "500px" }}
                  size="large"
                  placeholder="input search text"
                  // onSearch={onSearch}
                  enterButton
                /> */}
                {/* <Flex gap={10}>
                  <Button
                    className="top-icon-btn"
                    type="default"
                    shape="circle"
                    size="large"
                    icon={<NotificationFilled />}
                  />
                  <Badge count={5}>
                    <Button
                      className="top-icon-btn"
                      type="default"
                      shape="circle"
                      size="large"
                      icon={<BellFilled />}
                    />
                  </Badge>

                  <Popover content={content} trigger="click">
                    <Button
                      type="primary"
                      shape="circle"
                      size="large"
                      icon={<UserOutlined />}
                    />
                  </Popover>
                </Flex> */}
              </Flex>
            </Header>
            <Content style={{ margin: collapsed ? "0px 5px" : "0 16px" }}>
              <div
                style={{
                  padding: "20px 0",
                  minHeight: 360,
                }}>
                <Outlet />
              </div>
            </Content>
            <Footer style={{ textAlign: "center", padding: "0 0 10px 0" }}>
              All rights Reserved ©ALLOT {new Date().getFullYear()} | Developed
              by{" "}
              <Link to="https://github.com/alaminet" target="_blank">
                Al Amin ET
              </Link>
            </Footer>
          </Layout>
        </Layout>
      </ConfigProvider>
    </>
  );
};

export default BasicLayout;
