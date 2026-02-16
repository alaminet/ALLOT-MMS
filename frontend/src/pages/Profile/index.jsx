import React, { useState } from "react";
import {
  Button,
  Modal,
  Tooltip,
  Flex,
  Input,
  Form,
  Row,
  Col,
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

const Profile = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async (values) => {
    setLoading(true);
    try {
      const payload = {
        id: user.id,
        newPassword: values.password,
        oldPassword: values.oldpassword,
      };
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/member/change-password`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          },
        )
        .then((res) => {
          message.success(res.data.message);
          form.resetFields();
        })
        .catch((err) => {
          message.error(err.response.data.error);
        });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Row justify="center" align="middle">
        <Col md={8} xs={24}>
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
              name="oldpassword"
              rules={[
                {
                  required: true,
                  message: "Old password!",
                },
                { min: 6, message: "Minimum 6 characters!" },
              ]}
              hasFeedback>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Old password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "New password!",
                },
                { min: 6, message: "Minimum 6 characters!" },
              ]}
              hasFeedback>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="New password"
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
            <Form.Item label={null}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ borderRadius: "0px", padding: "10px 30px" }}>
                Update Password
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </>
  );
};
export default Profile;
