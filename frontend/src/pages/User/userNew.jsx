import React, { useState } from "react";
import { Button, Divider, Flex, Form, Input, message, Select } from "antd";
import axios from "axios";
import Title from "antd/es/typography/Title";
import {
  DollarOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import UserRoleTable from "./userRoleTable";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import UserAuthorizationTable from "./userAuthorizationTable";

const UserNew = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [roleData, setRoleData] = useState([]);
  const [authData, setAuthData] = useState([]);
  const [costCenter, setCostCenter] = useState();
  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = { ...values, access: roleData, authorization: authData };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/member/new`,
        formData,
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        }
      );
      message.success(res.data.message);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error(error.response.data.error);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // Get Category List
  const getCostCenter = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemDetails/viewAll`,
        {
          model: ["CostCenter"],
        },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        }
      );
      const tableArr = res?.data?.items?.map((item, index) => {
        item.data = item?.data?.map((i) => ({
          value: i._id,
          label: item?.modelName === "ItemUOM" ? i.code : i.name,
        }));
        return { ...item };
      });
      setCostCenter(tableArr);
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getCostCenter();
  }, []);
  return (
    <>
      <Title style={{ textAlign: "center" }} className="colorLink form-title">
        Create New User
      </Title>
      <Flex justify="center">
        <Form
          name="form"
          // labelCol={{ span: 8 }}
          // wrapperCol={{ span: 16 }}
          // style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="form-input-borderless">
          <Flex justify="center">
            <Form.Item style={{ maxWidth: 350 }}>
              <Form.Item
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Your Name!",
                  },
                ]}>
                <Input prefix={<UserOutlined />} placeholder="Your name" />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Your email!" },
                  { type: "email", message: "Enter valid email!" },
                ]}>
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
              <Form.Item name="phone">
                <Input prefix={<PhoneOutlined />} placeholder="Phone" />
              </Form.Item>
              <Form.Item name="costCenter" style={{ marginBottom: "40px" }}>
                <Select
                  prefix={<DollarOutlined />}
                  style={{ width: "100%" }}
                  allowClear
                  options={
                    costCenter?.filter(
                      (item) => item.modelName === "CostCenter"
                    )[0]?.data
                  }
                  placeholder="Cost Center"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Form.Item
                  name="password"
                  style={{ display: "inline-block", width: "calc(50% - 8px)" }}
                  rules={[
                    {
                      required: true,
                      message: "Your password!",
                    },
                    { min: 6, message: "Minimum 6 characters!" },
                  ]}
                  hasFeedback>
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPass"
                  style={{
                    display: "inline-block",
                    width: "calc(50% - 2px)",
                    marginLeft: "10px",
                  }}
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: "Confirm password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Password not match!"));
                      },
                    }),
                  ]}>
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm Password"
                  />
                </Form.Item>
              </Form.Item>
            </Form.Item>
          </Flex>
          <Form.Item>
            <Divider>User Role Access</Divider>
            <UserRoleTable data={roleData} setData={setRoleData} />
          </Form.Item>
          <Form.Item>
            <Divider>User Authorization Access</Divider>
            <UserAuthorizationTable data={authData} setData={setAuthData} />
          </Form.Item>
          <Form.Item label={null}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ borderRadius: "0px", padding: "10px 30px" }}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    </>
  );
};

export default UserNew;
