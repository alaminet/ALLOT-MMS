import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Checkbox,
  Flex,
  Form,
  Input,
  message,
  Typography,
  theme,
  ConfigProvider,
} from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { Loginuser } from "../features/userSlice";
const { Title } = Typography;
import logoWhite from "../assets/logo_white.svg";

// Theme configure
const customTheme = {
  token: {
    colorPrimary: "#247F93",
    fontFamily: "Poppins, sans-serif",
  },
};

const Login = () => {
  const dispatch = useDispatch();

  // Login Form Submission
  const onFinish = async (values) => {
    // console.log("Success:", values);
    const { email, password } = values;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/member/login`,
        { email: email, password: password },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
          },
        }
      );
      message.success(res.data.message);
      dispatch(Loginuser(res.data.member));
      localStorage.setItem("user", JSON.stringify(res.data.member));
    } catch (error) {
      console.log(error);
      message.error(error.response.data.error);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <ConfigProvider theme={customTheme}>
        <Flex
          style={{
            height: "100vh",
            flexDirection: "column",
            backgroundColor: "#e6e6e6ff",
          }}
          align="center"
          justify="center">
          <Card
            // variant="outlined"
            style={{
              width: 450,
              // backgroundColor: "#121212",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}>
            <div style={{ textAlign: "center", padding: "0 0 30px 0" }}>
              {/* <img src={logoWhite} alt="Logo" style={{ width: 200 }} /> */}
              <span style={{ fontSize: "36px", fontWeight: "800" }}>ALLOT</span>
            </div>
            <Form
              name="login"
              initialValues={{ remember: true }}
              style={{ maxWidth: 360 }}
              onFinish={onFinish}>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}>
                <Input
                  size="large"
                  style={{
                    borderRadius: "0px",
                    alignItems: "baseline",
                    padding: "8px 16px",
                  }}
                  prefix={<UserOutlined />}
                  placeholder="Enter your mail here"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your Password!" },
                ]}
                style={{ margin: "0px" }}>
                <Input
                  size="large"
                  style={{
                    borderRadius: "0px",
                    alignItems: "baseline",
                    padding: "8px 16px",
                  }}
                  prefix={<LockOutlined />}
                  type="password"
                  placeholder="Password"
                />
              </Form.Item>
              <Form.Item>
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ marginTop: "5px" }}>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="colorLink">Remember</Checkbox>
                  </Form.Item>
                  <a href="" className="colorLink">
                    Forgot password
                  </a>
                </Flex>
              </Form.Item>

              <Form.Item>
                <Button
                  size="large"
                  block
                  type="primary"
                  htmlType="submit"
                  style={{ borderRadius: "1px" }}>
                  Log in
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Flex>
      </ConfigProvider>
    </>
  );
};
export default Login;
