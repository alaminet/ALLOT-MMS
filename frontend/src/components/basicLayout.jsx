import React, { useEffect, useState } from "react";
import {
  BellFilled,
  FileDoneOutlined,
  GroupOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NotificationFilled,
  PieChartOutlined,
  ProductOutlined,
  ShopOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  theme,
  ConfigProvider,
  message,
  Flex,
  Typography,
  Input,
  Button,
  Popover,
  Badge,
} from "antd";
const { Header, Content, Footer, Sider } = Layout;
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loginuser } from "../features/userSlice";
import logoDark from "../assets/logo_dark.svg";
const { Text } = Typography;
const { Search } = Input;
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
  getItem("Order", "order", <FileDoneOutlined />),
  getItem("User", "user", <TeamOutlined />),
  getItem("Inventory", "inventory", <ShopOutlined />),
  getItem("Product", "product", <ProductOutlined />),
  getItem("Category", "category", <GroupOutlined />),
];

// Theme configure
const customTheme = {
  token: {
    colorPrimary: "#247F93",
    fontFamily: "Poppins, sans-serif",
  },
};

const BasicLayout = () => {
  const [curent, setCurent] = useState();
  const user = useSelector((user) => user.loginSlice.login);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [resBroken, setResBroken] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Get Accessable menu
  const allowedKeys = user?.access
    ?.filter((entry) => entry.pageAccess?.view)
    .map((entry) => entry.key);

  // handle Navigation
  const handleMenu = (e) => {
    if (e === "Logout") {
      message.warning("logout");
      localStorage.removeItem("user");
      dispatch(Loginuser(null));
      navigate("/");
    } else {
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
    <div>
      <Button onClick={handleLogout} block size="small">
        Logout
      </Button>
    </div>
  );

  useEffect(() => {
    if (!user?.token) {
      navigate("/");
      return;
    }

    // Decode JWT to check expiry
    const tokenParts = user?.token.split(".");
    if (tokenParts.length !== 3) {
      // Not a valid JWT
      navigate("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        // Token expired
        message.error("Session expired. Please login again.");
        localStorage.removeItem("user");
        dispatch(Loginuser(null));
        navigate("/");
      }
    } catch (e) {
      // Invalid token
      navigate("/");
    }
  }, [curent]);

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
              items={items?.filter((item) => allowedKeys?.includes(item.key))}
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
                <img src={logoDark} alt="aayaaz" width={120} />
                <Search
                  style={{ width: "500px" }}
                  size="large"
                  placeholder="input search text"
                  // onSearch={onSearch}
                  enterButton
                />
                <Flex gap={10}>
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
                </Flex>
              </Flex>
            </Header>
            <Content style={{ margin: collapsed ? "0px" : "0 16px" }}>
              <div
                style={{
                  padding: 24,
                  minHeight: 360,
                }}>
                <Outlet />
              </div>
            </Content>
            {/* <Footer style={{ textAlign: "center" }}>
              All rights Reserved ©AAYAAZ {new Date().getFullYear()} | Developed
              by{" "}
              <Link to="https://github.com/alaminet" target="_blank">
                Al Amin ET
              </Link>
            </Footer> */}
          </Layout>
        </Layout>
      </ConfigProvider>
    </>
  );
};

export default BasicLayout;
