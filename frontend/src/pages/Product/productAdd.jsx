import React, { useState } from "react";
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
  Typography,
} from "antd";
import { useSelector } from "react-redux";
import HTMLTextarea from "../../components/htmlTextarea";
import { useEffect } from "react";
const { Title } = Typography;

const ProductAdd = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [prodDisc, setProdDisc] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = { ...values, createdBy: user?.id, discription: prodDisc };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/product/new`,
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
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/category/view`,
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        }
      );
      const tableArr = res?.data?.categories?.map((item, index) => ({
        label: item.name,
        value: item._id,
      }));
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
        Add New Product
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
          className="borderlessInput"
        >
          <Row gutter={16}>
            <Col>
              <Row justify="space-between" gutter={16}>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Product Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%" }}
                  >
                    <Input placeholder="Product Name" />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="SKU"
                    name="code"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%" }}
                  >
                    <Input placeholder="Product SKU" />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Category"
                    name="category"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%", marginBottom: "35px" }}
                  >
                    <Select
                      style={{ width: "100%" }}
                      allowClear
                      options={categories}
                      placeholder="select Category"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Product Discription" name="discripton">
                    <HTMLTextarea onChange={setProdDisc} />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Purchase Price"
                    name="purchasePrice"
                    style={{ width: "100%" }}
                    required
                    rules={[{ required: true }, { type: "number", min: 0 }]}
                  >
                    <InputNumber
                      type="number"
                      placeholder="100"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Sale Price"
                    name="salePrice"
                    style={{ width: "100%" }}
                    rules={[{ required: true }, { type: "number", min: 0 }]}
                  >
                    <InputNumber
                      type="number"
                      placeholder="100"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Low Stock Alert"
                    name="safetyStock"
                    style={{ width: "100%" }}
                    rules={[{ required: true }, { type: "number", min: 0 }]}
                  >
                    <InputNumber
                      type="number"
                      placeholder="100"
                      style={{ width: "100%" }}
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
                      style={{ borderRadius: "0px", padding: "10px 30px" }}
                    >
                      Add Product
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

export default ProductAdd;
