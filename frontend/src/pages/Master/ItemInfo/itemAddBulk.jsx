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
import TextArea from "antd/es/input/TextArea";
const { Title } = Typography;

const ItemAddBulk = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();

  // Form submission
  const onFinish = async (values) => {
    // console.log(values);
    const itemList = values.itemDetails?.split("\n").map((item) => {
      const [
        name,
        description,
        SKU,
        UOM,
        group,
        type,
        lowStock,
        shelfLife,
        serialized,
      ] = item.split("\t").map((i) => i.trim());
      return {
        name,
        description,
        SKU,
        UOM,
        group,
        type,
        lowStock: Number(lowStock) || 0,
        shelfLife: shelfLife?.toLowerCase() === "true",
        serialized: serialized?.toLowerCase() === "true",
      };
    });
    if (itemList.length > 100) {
      message.warning("Maximum 100 items can be inserted at a time");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemInfo/new-bulk`,
        itemList,
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
        Add Bulk New Item
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
            <Col span={24}>
              <Row justify="space-between" gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Item Details"
                    name="itemDetails"
                    required
                    style={{ width: "100%" }}>
                    <TextArea
                      placeholder="Name | Discription | SKU | UOM | Group | Type | Low Stock | Shelf Life | Serialized"
                      rows={16}
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

export default ItemAddBulk;
