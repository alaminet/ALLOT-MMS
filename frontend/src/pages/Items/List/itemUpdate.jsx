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
import HTMLTextarea from "../../../components/htmlTextarea";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const { Title } = Typography;

const ItemUpdate = () => {
  const location = useLocation();
  const { productInfo } = location.state || {};
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [prodDisc, setProdDisc] = useState(productInfo.discription);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = {
      ...values,
      discription: prodDisc,
      updatedBy: user?.id,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/product/update/${formData.id}`,
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
        Update Existing Product
      </Title>
      <Card>
        <Form
          form={form}
          name="new"
          layout="vertical"
          initialValues={{
            ...productInfo,
            category: productInfo.category?._id, // override with just the ID
          }}
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
                    hidden
                    name="id"
                    initialValue={productInfo._id}
                    rules={[
                      {
                        required: true,
                        message: "Update ID Required!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
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
                    {categories.length > 0 && (
                      <Select
                        style={{ width: "100%" }}
                        allowClear
                        optionFilterProp="label"
                        options={categories}
                        placeholder="select Category"
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Product Discription" name="discripton">
                    <HTMLTextarea
                      onChange={setProdDisc}
                      defaultData={prodDisc}
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
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
                <Col lg={6} xs={24}>
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
                <Col lg={6} xs={24}>
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
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Rating"
                    name="rating"
                    style={{ width: "100%" }}
                  >
                    <Select
                      showSearch
                      placeholder="Category"
                      optionFilterProp="label"
                      options={[
                        { label: "Best", value: "Best" },
                        { label: "Good", value: "Good" },
                        { label: "Regular", value: "Regular" },
                        { label: "Low", value: "Low" },
                      ]}
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
                      Update Product
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

export default ItemUpdate;
