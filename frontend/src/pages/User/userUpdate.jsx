import React, { useState } from "react";
import { Button, Flex, Form, Input, message, Switch } from "antd";
import axios from "axios";
import Title from "antd/es/typography/Title";
import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import UserRoleTable from "./userRoleTable";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const UserUpdate = () => {
  const location = useLocation();
  const { userInfo } = location.state || {};
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [roleData, setRoleData] = useState(userInfo.access);

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = { ...values, access: roleData };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/member/update/${formData.id}`,
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
  return (
    <>
      <Title style={{ textAlign: "center" }} className="colorLink form-title">
        Update Existing User
      </Title>
      <Flex justify="center">
        <Form
          name="form"
          // labelCol={{ span: 8 }}
          // wrapperCol={{ span: 16 }}
          //   style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="form-input-borderless"
        >
          <Flex justify="center">
            <Form.Item style={{ minWidth: 350 }}>
              <Form.Item
                hidden
                name="id"
                initialValue={userInfo?._id}
                rules={[
                  {
                    required: true,
                    message: "Update User ID Required!",
                  },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="User ID" />
              </Form.Item>
              <Form.Item
                name="name"
                initialValue={userInfo?.name}
                rules={[
                  {
                    required: true,
                    message: "Your Name!",
                  },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Your name" />
              </Form.Item>
              <Form.Item
                name="email"
                initialValue={userInfo?.email}
                rules={[
                  { required: true, message: "Your email!" },
                  { type: "email", message: "Enter valid email!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
              <Form.Item name="phone" initialValue={userInfo?.phone}>
                <Input prefix={<PhoneOutlined />} placeholder="Phone" />
              </Form.Item>
            </Form.Item>
          </Flex>
          <Form.Item>
            <UserRoleTable data={roleData} setData={setRoleData} />
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Update User
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    </>
  );
};

export default UserUpdate;
