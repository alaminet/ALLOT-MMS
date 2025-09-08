import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Typography,
} from "antd";
import { useSelector } from "react-redux";
const { Title } = Typography;

const ItemDetailsAdd = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [formSelection, setFormSelection] = useState("");
  const [form] = Form.useForm();

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = { ...values, createdBy: user?.id };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemDetails/new`,
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
      form.resetFields();
      setFormSelection("");
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
        Add New Item Details
      </Title>
      <Card>
        <Form
          form={form}
          name="new"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="borderlessInput">
          <Row gutter={16} justify={"center"}>
            <Col lg={8}>
              <Form.Item
                name="model"
                label="Model"
                rules={[{ required: true, message: "Select Model!" }]}>
                <Select
                  showSearch
                  style={{ minWidth: "200px" }}
                  placeholder="Select Model"
                  optionFilterProp="label"
                  onChange={(e) => setFormSelection(e)}
                  options={[
                    {
                      value: "ItemUOM",
                      label: "Item UOM",
                    },
                    {
                      value: "ItemGroup",
                      label: "Item Group",
                    },
                    {
                      value: "ItemType",
                      label: "Item Type",
                    },
                    {
                      value: "StoreLocation",
                      label: "Store Location",
                    },
                    {
                      value: "Transaction",
                      label: "Transaction Type",
                    },
                    {
                      value: "CostCenter",
                      label: "Cost Center",
                    },
                  ]}
                />
              </Form.Item>
              {formSelection === "ItemUOM" && (
                <Form.Item
                  label="Code"
                  name="code"
                  rules={[
                    {
                      required: formSelection === "ItemUOM" ? true : false,
                    },
                  ]}
                  style={{
                    width: "100%",
                  }}>
                  <Input placeholder="Code" maxLength={4} showCount />
                </Form.Item>
              )}

              <Form.Item
                label="Name"
                name="name"
                rules={[
                  {
                    required: true,
                  },
                ]}
                style={{ width: "100%" }}>
                <Input placeholder="Name" maxLength={40} showCount />
              </Form.Item>

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
                      Add Details
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

export default ItemDetailsAdd;
