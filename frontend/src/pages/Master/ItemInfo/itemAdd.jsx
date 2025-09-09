import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Switch,
  Typography,
} from "antd";
import { useSelector } from "react-redux";
const { Title } = Typography;

const ItemAdd = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = { ...values, createdBy: user?.id };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemInfo/new`,
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
    } catch (error) {
      setLoading(false);
      message.error(error.response.data.error);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // Get Category List
  const getCategories = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemDetails/viewAll`,
        {
          model: [
            "ItemUOM",
            "ItemGroup",
            "ItemType",
            "CostCenter",
            "StoreLocation",
            "Transaction",
          ],
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
      setCategories(tableArr);
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <>
      <Title style={{ textAlign: "left" }} className="colorLink form-title">
        Add New Item
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
          <Row gutter={16}>
            <Col>
              <Row justify="space-between" gutter={16}>
                <Col lg={12} xs={24}>
                  <Form.Item
                    label="Item Name"
                    name="name"
                    required
                    style={{ width: "100%" }}>
                    <Input placeholder="Item Name" maxLength={50} showCount />
                  </Form.Item>
                </Col>
                <Col lg={12} xs={24}>
                  <Form.Item
                    label="Item Discription"
                    name="discription"
                    style={{ width: "100%" }}>
                    <Input
                      placeholder="Discription/Specification"
                      maxLength={50}
                      showCount
                    />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item label="SKU" name="SKU" style={{ width: "100%" }}>
                    <Input placeholder="Item SKU/Part Code" />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="UOM"
                    name="UOM"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%", marginBottom: "35px" }}>
                    <Select
                      style={{ width: "100%" }}
                      allowClear
                      options={
                        categories?.filter(
                          (item) => item.modelName === "ItemUOM"
                        )[0]?.data
                      }
                      placeholder="Select UOM"
                    />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Group"
                    name="group"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%", marginBottom: "35px" }}>
                    <Select
                      style={{ width: "100%" }}
                      allowClear
                      options={
                        categories?.filter(
                          (item) => item.modelName === "ItemGroup"
                        )[0]?.data
                      }
                      placeholder="Select Group"
                    />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
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
                      options={
                        categories?.filter(
                          (item) => item.modelName === "ItemType"
                        )[0]?.data
                      }
                      placeholder="Select Type"
                    />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Low Stock"
                    name="safetyStock"
                    style={{ width: "100%" }}>
                    <InputNumber
                      type="number"
                      placeholder="100"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col lg={4} xs={12}>
                  <Form.Item
                    label="Shelf Life"
                    name="isShelfLife"
                    style={{ width: "100%" }}
                    required
                    rules={{ required: true }}>
                    <Switch
                      checkedChildren="YES"
                      unCheckedChildren="NO"
                      defaultChecked={false}
                    />
                  </Form.Item>
                </Col>
                <Col lg={4} xs={12}>
                  <Form.Item
                    label="Serialized"
                    name="isSerialized"
                    style={{ width: "100%" }}
                    required
                    rules={{ required: true }}>
                    <Switch
                      checkedChildren="YES"
                      unCheckedChildren="NO"
                      defaultChecked={false}
                    />
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
                      Add Item
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

export default ItemAdd;
