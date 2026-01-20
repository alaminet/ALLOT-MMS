import React from "react";
import axios from "axios";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Typography,
} from "antd";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";
import { DollarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Title } = Typography;

const OrgPackageAdd = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orgData, setOrgData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [form] = Form.useForm();

  // User Permission Check
  const pathname = location.pathname;
  const lastSegment = "organization/org-package";
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage(lastSegment)) {
    return <NotAuth />;
  }
  // Get pathname
  const ownView = canDoOwn(lastSegment, "view");
  const othersView = canDoOther(lastSegment, "view");
  const ownCreate = canDoOwn(lastSegment, "create");
  const othersCreate = canDoOther(lastSegment, "create");
  const ownEdit = canDoOwn(lastSegment, "edit");
  const othersEdit = canDoOther(lastSegment, "edit");
  const ownDelete = canDoOwn(lastSegment, "delete");
  const othersDelete = canDoOther(lastSegment, "delete");

  // Module List
  const modules = [
    { label: "Dashboard", value: "dashboard" },
    { label: "Purchase", value: "purchase" },
    { label: "Purchase requisition", value: "purchase-requisition" },
    { label: "Supplier", value: "supplier" },
    { label: "Purchase report", value: "purchase-report" },
    { label: "Warehouse", value: "transaction" },
    { label: "Inventory (Stock)", value: "inventory" },
    { label: "Goods receive", value: "receive" },
    { label: "Goods issue", value: "issue" },
    { label: "Transaction report", value: "tnx-report" },
    { label: "Move Order report", value: "mo-report" },
    { label: "Item master", value: "master" },
    { label: "Item Information", value: "item-list" },
    { label: "Item details", value: "item-details" },
    { label: "Users", value: "user" },
    { label: "Password reset", value: "pwdr" },
    { label: "Web settings", value: "settings" },
  ];
  const authorizations = [
    { label: "Purchase requisition", value: "purchase-requisition" },
    { label: "Purchase order", value: "purchase-order" },
    { label: "Move order", value: "move-order" },
  ];

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = { ...values, dueDate: values?.dueDate?.$d };

    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/super/SUOrgPackage/new`,
          formData,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          }
        )
        .then((res) => {
          message.success(res.data.message);
          setLoading(false);
          navigate("/organization/org-package");
        });
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
      setOrgData([]);
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
            label: item?.orgName + " (" + item?.orgId + ")",
            value: item?._id,
          }));
          setOrgData(tableArr);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };
  // Get User Data
  const getUserData = async () => {
    const payload = { scope: "all" };

    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/super/SUmember/view`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          }
        )
        .then((res) => {
          const tableArr = res?.data?.members?.map((item, index) => ({
            label: item?.name + " (" + item?.username + ")",
            value: item?._id,
          }));
          setUserData(tableArr);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getORGData();
    getUserData();
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
          <Row gutter={16}>
            <Col>
              <Row justify="space-between" gutter={16}>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Organization Name"
                    name="organization"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%" }}>
                    <Select
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        borderRadius: "1px",
                        borderColor: "#247f93",
                      }}
                      allowClear
                      options={orgData}
                      placeholder="Organization"
                    />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Affiliate Name"
                    name="affiliater"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%" }}>
                    <Select
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        borderRadius: "1px",
                        borderColor: "#247f93",
                      }}
                      allowClear
                      options={userData}
                      placeholder="Affiliate"
                    />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Due Date"
                    name="dueDate"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%", marginBottom: "35px" }}>
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Due Date"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Module access"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name="module"
                        noStyle
                        initialValue={[
                          "dashboard",
                          "master",
                          "item-list",
                          "item-details",
                          "user",
                          "pwdr",
                          "settings",
                        ]}>
                        <Checkbox.Group
                          style={{ width: "100%" }}
                          options={modules}
                          // onChange={onChange}
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Authorization access"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name="authorization"
                        noStyle
                        initialValue={null}>
                        <Checkbox.Group options={authorizations} />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="User Limit"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["limit", "users"]}
                        noStyle
                        initialValue={null}>
                        <InputNumber
                          placeholder="User Limit"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Item/SKU Limit"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["limit", "items"]}
                        noStyle
                        initialValue={null}>
                        <InputNumber
                          placeholder="Item/SKU Limit"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Storage Limit"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["limit", "locations"]}
                        noStyle
                        initialValue={null}>
                        <InputNumber
                          placeholder="Storage Limit"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Cost Center Limit"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["limit", "costCenters"]}
                        noStyle
                        initialValue={null}>
                        <InputNumber
                          placeholder="Cost Center Limit"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Purchase Limit"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["limit", "purchases"]}
                        noStyle
                        initialValue={null}>
                        <InputNumber
                          placeholder="Purchase Limit"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Transaction Limit"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["limit", "transactions"]}
                        noStyle
                        initialValue={null}>
                        <InputNumber
                          placeholder="Transaction Limit"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Package Price (BDT)"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["price", "packagePrice"]}
                        noStyle
                        initialValue={null}>
                        <InputNumber
                          placeholder="Package Price (BDT)"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Discount (Flat BDT)"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["price", "discount"]}
                        noStyle
                        initialValue={null}>
                        <InputNumber
                          placeholder="Discount (Flat BDT)"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Payable Amount (BDT)"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["price", "payableAmount"]}
                        noStyle
                        initialValue={null}>
                        <InputNumber
                          placeholder="Payable Amount (BDT)"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Affalite (%)"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name="affaliteAmount"
                        noStyle
                        initialValue={null}>
                        <InputNumber
                          placeholder="Affalite (%)"
                          style={{ width: "100%" }}
                        />
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
                      Add Pacakage
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

export default OrgPackageAdd;
