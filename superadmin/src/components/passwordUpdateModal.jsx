import React, { useState } from "react";
import {
  Button,
  Modal,
  Tooltip,
  Flex,
  Input,
  Form,
  Space,
  message,
} from "antd";
import {
  LockTwoTone,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
const PasswordUpdateModal = ({ data }) => {
  const user = useSelector((user) => user.loginSlice.login);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async (values) => {
    setLoading(true);
    try {
      console.log(values);
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/super/SUmember/update/${data}`,
          { ["password"]: values.confirmPass },
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          }
        )
        .then((res) => {
          message.success(res.data.message);
          form.resetFields();
          setIsModalOpen(false);
        });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <Tooltip title="Password">
        <Button
          onClick={showModal}
          // onChange={(e) => handleUserChange(record.action, "status", e)}
          icon={<LockTwoTone />}
        />
      </Tooltip>
      <Modal
        title="Update User Password"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        // onOk={() => form.submit()}
        onCancel={handleCancel}
        footer={
          <Space>
            <Button
              loading={loading}
              onClick={handleCancel}
              style={{ borderRadius: "0px", padding: "10px 30px" }}>
              Cancel
            </Button>
            <Button
              loading={loading}
              type="primary"
              style={{ borderRadius: "0px", padding: "10px 30px" }}
              onClick={async () => {
                try {
                  setLoading(true);
                  const values = await form.validateFields();
                  await handleOk(values);
                } catch (err) {
                  // validation errors are shown by the form; stop loading
                  console.log("validation failed", err);
                  setLoading(false);
                }
              }}>
              Update
            </Button>
          </Space>
        }>
        <Form
          form={form}
          name="form"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={handleOk}
          //   onFinishFailed={onFinishFailed}
          className="form-input-borderless"
          autoComplete="off">
          <Form.Item
            name="password"
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
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
          <Form.Item
            name="confirmPass"
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
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default PasswordUpdateModal;
