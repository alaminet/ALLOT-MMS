import React from "react";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Row,
  Typography,
} from "antd";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";
const { Title } = Typography;
const WebSettings = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [businessSettings, setBusinessSettings] = useState();
  const [form] = Form.useForm();

  // User Permission Check
  const { canViewPage, canDoOwn } = usePermission();
  if (!canViewPage("settings")) {
    return <NotAuth />;
  }

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = { ...values, updatedBy: user?.id };

    // try {
    //   await axios
    //     .post(
    //       `${import.meta.env.VITE_API_URL}/api/orgUser/update/${values?._id}`,
    //       formData,
    //       {
    //         headers: {
    //           Authorization: import.meta.env.VITE_SECURE_API_KEY,
    //           token: user?.token,
    //         },
    //       }
    //     )
    //     .then((res) => {
    //       message.success(res.data.message);
    //       setLoading(false);
    //       getBusinessSettings();
    //     });
    // } catch (error) {
    //   setLoading(false);
    //   message.error(error.response.data.error);
    // }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // Get Business Settings
  const getBusinessSettings = async () => {
    try {
      await axios
        .get(`${import.meta.env.VITE_API_URL}/api/orgUser/view`, {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        })
        .then((res) => {
          const settings = res.data?.businessSettings;
          setBusinessSettings(settings);
          if (settings) {
            form.setFieldsValue(settings);
          }
        });
    } catch (error) {
      setLoading(false);
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getBusinessSettings();
  }, []);

  return (
    <>
      <Card>
        <Form
          form={form}
          name="new"
          layout="vertical"
          // initialValues={{ ...businessSettings }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="borderlessInput">
          <Form.Item
            hidden
            label="Id"
            name="_id"
            rules={[
              {
                required: true,
              },
            ]}
            style={{ width: "100%" }}>
            <Input placeholder="Id" showCount />
          </Form.Item>
          <Row gutter={16}>
            <Col span={24}>
              <Row justify="space-between" gutter={16}>
                <Col lg={24} xs={24}>
                  <Form.Item label="Dashboard" style={{ marginBottom: "35px" }}>
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Form.Item
                          label="Water Chart One"
                          name={["dashboard", "waterChart", "one"]}
                          layout="vertical"
                          rules={[
                            {
                              required: true,
                              message: "Code/SKU is required",
                            },
                          ]}>
                          <Input placeholder="Code/SKU" showCount />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="Water Chart Two"
                          name={["dashboard", "waterChart", "two"]}
                          layout="vertical"
                          rules={[
                            {
                              required: true,
                              message: "Code/SKU is required",
                            },
                          ]}>
                          <Input placeholder="Code/SKU" showCount />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                  <Form.Item label="Accounts" style={{ marginBottom: "35px" }}>
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Form.Item
                          label="Currency"
                          name={["accounts", "currency"]}
                          layout="vertical"
                          rules={[
                            {
                              required: true,
                              message: "Currency is required",
                            },
                          ]}>
                          <Input placeholder="$/৳ or USD/BDT" showCount />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
              </Row>
              <Row justify="end">
                <Col span={24}>
                  <Form.Item label={null}>
                    <Button
                      disabled={!canDoOwn("settings", "edit")}
                      size="large"
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      style={{ borderRadius: "0px", padding: "10px 30px" }}>
                      Save Settings
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Card>
    </>
  );
};

export default WebSettings;
