import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  message,
  Row,
  Select,
  Typography,
  Grid,
} from "antd";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
const { Title } = Typography;
const { useBreakpoint } = Grid;

const UpdateB2BCustomer = () => {
  const location = useLocation();
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const { refData } = location.state || {};
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = {
      ...values,
      updatedBy: user?.id,
    };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sales/SalesB2B/customer-update/${refData._id}`,
        formData,
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        },
      );
      message.success(res.data.message);
      setLoading(false);
      navigate("/B2B/customer");
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
      <Title style={{ textAlign: "left" }} className="colorLink form-title">
        Update Existing Customer
      </Title>

      <Card>
        <Form
          form={form}
          name="new"
          layout="vertical"
          initialValues={{
            ...refData,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="borderlessInput">
          <Row gutter={16}>
            <Col>
              <Row justify="space-between" gutter={16}>
                <Col lg={12} xs={24}>
                  <Form.Item
                    label="Customer Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%" }}>
                    <Input
                      placeholder="Customer Name"
                      maxLength={50}
                      showCount
                    />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="TIN"
                    name="TIN"
                    style={{ width: "100%" }}
                    rules={[
                      {
                        required: true,
                      },
                    ]}>
                    <Input placeholder="TIN No" maxLength={50} showCount />
                  </Form.Item>
                </Col>
                <Col lg={4} xs={24}>
                  <Form.Item
                    label="Type"
                    name="type"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%", marginBottom: "35px" }}>
                    <Select
                      style={{ width: "100%" }}
                      allowClear
                      options={[
                        { name: "Local", value: "Local" },
                        { name: "Import", value: "Import" },
                      ]}
                      placeholder="Customer Type"
                    />
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Phone Numbers"
                    style={{ marginBottom: "35px" }}>
                    <Flex
                      gap={16}
                      style={{ flexFlow: screens.xs ? "wrap" : "nowrap" }}>
                      <Form.Item
                        name={["phone", "office"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Office number is required",
                          },
                        ]}>
                        <Input placeholder="Office Phone Number" />
                      </Form.Item>
                      <Form.Item
                        name={["phone", "contact"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Contact number is required",
                          },
                        ]}>
                        <Input placeholder="Contact Phone Number" />
                      </Form.Item>
                      <Form.Item name={["phone", "alternate"]} noStyle>
                        <Input placeholder="Alternate Phone Number" />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Email Address"
                    style={{ marginBottom: "35px" }}>
                    <Flex
                      gap={16}
                      style={{ flexFlow: screens.xs ? "wrap" : "nowrap" }}>
                      <Form.Item
                        name={["email", "office"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Office mail is required",
                          },
                        ]}>
                        <Input placeholder="Office mail address" />
                      </Form.Item>
                      <Form.Item
                        name={["email", "contact"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Contact mail is required",
                          },
                        ]}>
                        <Input placeholder="Contact mail address" />
                      </Form.Item>
                      <Form.Item name={["email", "alternate"]} noStyle>
                        <Input placeholder="Alternate mail address" />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Tax Information"
                    style={{ marginBottom: "35px" }}>
                    <Flex
                      gap={16}
                      style={{ flexFlow: screens.xs ? "wrap" : "nowrap" }}>
                      <Form.Item
                        name={["taxInfo", "name"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Registered name is required",
                          },
                        ]}>
                        <Input placeholder="Input Name" />
                      </Form.Item>
                      <Form.Item
                        name={["taxInfo", "BIN"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Registered BIN is required",
                          },
                        ]}>
                        <Input placeholder="Input BIN" />
                      </Form.Item>
                      <Form.Item
                        name={["taxInfo", "address"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Registered address is required",
                          },
                        ]}>
                        <Input placeholder="Input Address" />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Office Address"
                    style={{ marginBottom: "35px" }}>
                    <Flex
                      gap={16}
                      style={{ flexFlow: screens.xs ? "wrap" : "nowrap" }}>
                      <Form.Item
                        name={["officeAddress", "street"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Office street is required",
                          },
                        ]}>
                        <Input placeholder="Office street" />
                      </Form.Item>
                      <Form.Item
                        name={["officeAddress", "city"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Office city is required",
                          },
                        ]}>
                        <Input placeholder="Office city" />
                      </Form.Item>
                      <Form.Item
                        name={["officeAddress", "country"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Office country is required",
                          },
                        ]}>
                        <Input placeholder="Office country" />
                      </Form.Item>
                      <Form.Item
                        name={["officeAddress", "postal"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Office postal is required",
                          },
                        ]}>
                        <Input placeholder="Office postal" />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Payment Information"
                    style={{ marginBottom: "35px" }}>
                    <Flex
                      gap={16}
                      style={{
                        marginBottom: "35px",
                        flexFlow: screens.xs ? "wrap" : "nowrap",
                      }}>
                      <Form.Item
                        name={["paymentInfo", "name"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Account name is required",
                          },
                        ]}>
                        <Input placeholder="Account name" />
                      </Form.Item>
                      <Form.Item
                        name={["paymentInfo", "account"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Account number is required",
                          },
                        ]}>
                        <Input placeholder="Account number" />
                      </Form.Item>
                      <Form.Item
                        name={["paymentInfo", "bank"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Bank name is required",
                          },
                        ]}>
                        <Input placeholder="Bank name" />
                      </Form.Item>
                    </Flex>
                    <Flex
                      gap={16}
                      style={{ flexFlow: screens.xs ? "wrap" : "nowrap" }}>
                      <Form.Item
                        name={["paymentInfo", "branch"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Branch name is required",
                          },
                        ]}>
                        <Input placeholder="Branch name" />
                      </Form.Item>
                      <Form.Item
                        name={["paymentInfo", "routing"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Routing number is required",
                          },
                        ]}>
                        <Input placeholder="Routing number" />
                      </Form.Item>
                      <Form.Item
                        name={["paymentInfo", "swift"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Swift number is required",
                          },
                        ]}>
                        <Input placeholder="Swift number" />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
              </Row>
              <Row justify="end">
                <Col span={24}>
                  <Form.Item label={null}>
                    <Button
                      size="large"
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      style={{ borderRadius: "0px", padding: "10px 30px" }}>
                      Update Customer
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

export default UpdateB2BCustomer;
