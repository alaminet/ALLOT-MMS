import React, { useState } from "react";
import { Button, Flex, Form, Input, message, Select, Switch } from "antd";
import axios from "axios";
import Title from "antd/es/typography/Title";
import {
  DollarOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import UserRoleTable from "./userRoleTable";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const UserUpdate = () => {
  const location = useLocation();
  const { userInfo } = location.state || {};
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [roleData, setRoleData] = useState(userInfo.access);
  const [costCenter, setCostCenter] = useState();

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
        Update Existing User
      </Title>
      <Flex justify="center">
        <Form
          name="form"
          // labelCol={{ span: 8 }}
          // wrapperCol={{ span: 16 }}
          //   style={{ maxWidth: 600 }}
          initialValues={{
            ...userInfo,
            costCenter: userInfo.costCenter,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="form-input-borderless">
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
                ]}>
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
                ]}>
                <Input prefix={<UserOutlined />} placeholder="Your name" />
              </Form.Item>
              <Form.Item
                name="email"
                initialValue={userInfo?.email}
                rules={[
                  { required: true, message: "Your email!" },
                  { type: "email", message: "Enter valid email!" },
                ]}>
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
              <Form.Item name="phone" initialValue={userInfo?.phone}>
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
