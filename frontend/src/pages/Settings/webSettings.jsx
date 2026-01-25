import React from "react";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import axios from "axios";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Row,
  Switch,
  Typography,
} from "antd";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";
const { Title } = Typography;
const WebSettings = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [webSettings, setWebSettings] = useState();
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
    const formData = { ...values };
    try {
      await axios
        .post(`${import.meta.env.VITE_API_URL}/api/webSetting/new`, formData, {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        })
        .then((res) => {
          message.success(res.data.message);
          setLoading(false);
        });
    } catch (error) {
      setLoading(false);
      message.error(error.response.data.error);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // Get Web Settings
  const getWebSettings = async () => {
    try {
      await axios
        .get(`${import.meta.env.VITE_API_URL}/api/webSetting/view`, {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        })
        .then((res) => {
          const settings = res.data?.webSetting;
          setWebSettings(settings);
          if (settings) {
            form.setFieldsValue(settings);
          }
        });
    } catch (error) {
      console.log(error);
      setLoading(false);
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getWebSettings();
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
          className="borderlessInput"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Row justify="space-between" gutter={16}>
                <Col lg={24} xs={24}>
                  <Divider style={{ fontWeight: "bold", color: "#247f93" }}>
                    Dashboard
                  </Divider>
                  <Form.Item>
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Form.Item label="Water Chart One" layout="vertical">
                          <Form.Item
                            name={["dashboard", "waterChart", 0, "SKU"]}
                          >
                            <Input placeholder="SKU" showCount />
                          </Form.Item>
                          <Form.Item
                            name={["dashboard", "waterChart", 0, "Limit"]}
                          >
                            <Input placeholder="Limit" showCount />
                          </Form.Item>
                          <Form.Item
                            name={["dashboard", "waterChart", 0, "status"]}
                            valuePropName="checked"
                          >
                            <Checkbox>Show on dashboard</Checkbox>
                          </Form.Item>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Water Chart Two">
                          <Form.Item
                            name={["dashboard", "waterChart", 1, "SKU"]}
                          >
                            <Input placeholder="SKU" showCount />
                          </Form.Item>
                          <Form.Item
                            name={["dashboard", "waterChart", 1, "Limit"]}
                          >
                            <Input placeholder="Limit" showCount />
                          </Form.Item>
                          <Form.Item
                            name={["dashboard", "waterChart", 1, "status"]}
                            valuePropName="checked"
                          >
                            <Checkbox>Show on dashboard</Checkbox>
                          </Form.Item>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name={["dashboard", "safetyChart", "status"]}
                          valuePropName="checked"
                        >
                          <Checkbox>Show Stock Type Chart</Checkbox>
                        </Form.Item>
                        <Form.Item
                          name={["dashboard", "weeklyOrder", "status"]}
                          valuePropName="checked"
                        >
                          <Checkbox>Show Weekly Move Order Chart</Checkbox>
                        </Form.Item>
                        <Form.Item
                          name={["dashboard", "monthlyOrder", "status"]}
                          valuePropName="checked"
                        >
                          <Checkbox>Show Monthly Move Order Chart</Checkbox>
                        </Form.Item>
                        <Form.Item
                          name={["dashboard", "moveOrderTable", "status"]}
                          valuePropName="checked"
                        >
                          <Checkbox>Show Latest Move Order Table</Checkbox>
                        </Form.Item>
                        <Form.Item
                          name={["dashboard", "PRTable", "status"]}
                          valuePropName="checked"
                        >
                          <Checkbox>
                            Show Latest Parchase Request Table
                          </Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                  <Divider style={{ fontWeight: "bold", color: "#247f93" }}>
                    Accounts
                  </Divider>
                  <Form.Item style={{ marginBottom: "35px" }}>
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Form.Item
                          label="Currency"
                          name={["accounts", "currency"]}
                          layout="vertical"
                        >
                          <Input placeholder="$/৳ or USD/BDT" showCount />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                  <Divider style={{ fontWeight: "bold", color: "#247f93" }}>
                    Terms & Conditions
                  </Divider>
                  <Form.Item style={{ marginBottom: "35px" }}>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Form.Item
                          label="Delivery Terms"
                          name={["terms", "deliveryTerms"]}
                          layout="vertical"
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="Delivery Terms"
                            showCount
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Delivery Location"
                          name={["terms", "deliveryLocation"]}
                          layout="vertical"
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="Delivery Location"
                            showCount
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Bill Submission"
                          name={["terms", "billSubmission"]}
                          layout="vertical"
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="Bill Submission"
                            showCount
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Required Documents for Billing"
                          name={["terms", "POReqDoc"]}
                          layout="vertical"
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="Required Documents for Billing"
                            showCount
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Payment Terms"
                          name={["terms", "paymentTerms"]}
                          layout="vertical"
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="Payment Terms"
                            showCount
                          />
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
                      style={{ borderRadius: "0px", padding: "10px 30px" }}
                    >
                      Save Web Settings
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
