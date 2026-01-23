import React from "react";
import axios from "axios";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import {
  Button,
  Card,
  Checkbox,
  Col,
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
import { useLocation, useNavigate } from "react-router-dom";
import BreadCrumbCustom from "../../components/breadCrumbCustom";
const { Title } = Typography;

const OrgUpdate = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const navigate = useNavigate();
  const location = useLocation();
  const { orgDetails } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // User Permission Check
  const { canViewPage, canDoOwn, canDoOther } = usePermission();
  const ownEdit = canDoOwn("organization", "edit");
  const othersEdit = canDoOther("organization", "edit");
  if (
    (!ownEdit && user.id === orgDetails?.createdBySU?._id) ||
    (!othersEdit && user.id !== orgDetails?.createdBySU?._id)
  ) {
    return <NotAuth />;
  }

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = { ...values, updatedBy: user?.id };

    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/super/SUOrganization/update/${
            orgDetails?._id
          }`,
          formData,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          },
        )
        .then((res) => {
          message.success(res.data.message);
          setLoading(false);
          navigate("/organization");
        });
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
      <Flex justify="space-between">
        <BreadCrumbCustom />
      </Flex>
      <Card>
        <Form
          form={form}
          name="new"
          layout="vertical"
          initialValues={{
            ...orgDetails,
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
                    label="Organization Name"
                    name="orgName"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%" }}>
                    <Input placeholder="Organization Name" showCount />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="TIN No"
                    name="TIN"
                    style={{ width: "100%" }}
                    rules={[
                      {
                        required: true,
                      },
                    ]}>
                    <Input placeholder="TIN No" showCount />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Trade Licenses"
                    name="trade"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%", marginBottom: "35px" }}>
                    <Input placeholder="Trade Licenses" showCount />
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Phone Numbers"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["phone", "office"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Office number is required",
                          },
                        ]}>
                        <Input placeholder="Office Phone Number" showCount />
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
                        <Input placeholder="Contact Phone Number" showCount />
                      </Form.Item>
                      <Form.Item name={["phone", "alternate"]} noStyle>
                        <Input placeholder="Alternate Phone Number" showCount />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Email Address"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["email", "office"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Office mail is required",
                          },
                        ]}>
                        <Input placeholder="Office mail address" showCount />
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
                        <Input placeholder="Contact mail address" showCount />
                      </Form.Item>
                      <Form.Item name={["email", "alternate"]} noStyle>
                        <Input placeholder="Alternate mail address" showCount />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Tax Information"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["taxInfo", "name"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Registered name is required",
                          },
                        ]}>
                        <Input placeholder="Input Name" showCount />
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
                        <Input placeholder="Input BIN" showCount />
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
                        <Input placeholder="Input Address" showCount />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Office Address"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["officeAddress", "street"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Office street is required",
                          },
                        ]}>
                        <Input placeholder="Office street" showCount />
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
                        <Input placeholder="Office city" showCount />
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
                        <Input placeholder="Office country" showCount />
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
                        <Input placeholder="Office postal" showCount />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Business Address"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["businessAddress", "street"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Street is required",
                          },
                        ]}>
                        <Input placeholder="Business street" showCount />
                      </Form.Item>
                      <Form.Item
                        name={["businessAddress", "city"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "City is required",
                          },
                        ]}>
                        <Input placeholder="Business city" showCount />
                      </Form.Item>
                      <Form.Item
                        name={["businessAddress", "country"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Country is required",
                          },
                        ]}>
                        <Input placeholder="Business country" showCount />
                      </Form.Item>
                      <Form.Item
                        name={["businessAddress", "postal"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Postal is required",
                          },
                        ]}>
                        <Input placeholder="Business postal" showCount />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Bank Information"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16} style={{ marginBottom: "35px" }}>
                      <Form.Item
                        name={["paymentInfo", "name"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Account name is required",
                          },
                        ]}>
                        <Input placeholder="Account name" showCount />
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
                        <Input placeholder="Account number" showCount />
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
                        <Input placeholder="Bank name" showCount />
                      </Form.Item>
                    </Flex>
                    <Flex gap={16}>
                      <Form.Item
                        name={["paymentInfo", "branch"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Branch name is required",
                          },
                        ]}>
                        <Input placeholder="Branch name" showCount />
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
                        <Input placeholder="Routing number" showCount />
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
                        <Input placeholder="Swift number" showCount />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
              </Row>
              <Row justify="end">
                <Col span={24}>
                  <Form.Item label={null}>
                    <Button
                      //   disabled={!canCreate}
                      size="large"
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      style={{ borderRadius: "0px", padding: "10px 30px" }}>
                      Update Organization
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

export default OrgUpdate;
