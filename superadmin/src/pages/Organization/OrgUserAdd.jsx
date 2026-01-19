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
import { useLocation, useNavigate } from "react-router-dom";
import UserAuthorizationTable from "./userAuthorizationTable";
import { usePermission } from "../../hooks/usePermission";

const OrgUserAdd = () => {
  const navigate = useNavigate();
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [roleData, setRoleData] = useState([]);
  const [authData, setAuthData] = useState([]);
  const [orgData, setOrgData] = useState([]);

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  const accessName = "organization/org-user";
  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();

  const ownCreate = canDoOwn(accessName, "create");
  const othersCreate = canDoOther(accessName, "create");

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = { ...values, access: roleData, authorization: authData };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/super/SUOrgMember/new`,
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
      navigate("/organization/org-user");
    } catch (error) {
      setLoading(false);
      message.error(error.response.data.error);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // Get ORG Data
  const getORGData = async () => {
    const scope =
      ownCreate && othersCreate
        ? "all"
        : ownCreate
        ? "own"
        : othersCreate
        ? "others"
        : null;
    if (!scope) {
      setQueryData([]);
      message.warning("You are not authorized");
      return; // stop execution
    }
    const payload = { scope };

    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/super/SUOrganization/view`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          }
        )
        .then((res) => {
          const tableArr = res?.data?.organization?.map((item, index) => ({
            label: item?.orgName,
            value: item?.orgId,
          }));
          setOrgData(tableArr);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getORGData();
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
            <Form.Item style={{ maxWidth: 450 }}>
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
              <Form.Item
                name="orgId"
                style={{ marginBottom: "30px" }}
                rules={[
                  {
                    required: true,
                    message: "Select Organization!",
                  },
                ]}>
                <Select
                  prefix={<DollarOutlined />}
                  style={{
                    width: "100%",
                    padding: "16px 16px",
                    borderRadius: "1px",
                    borderColor: "#247f93",
                  }}
                  allowClear
                  options={orgData}
                  placeholder="Organization"
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

export default OrgUserAdd;
