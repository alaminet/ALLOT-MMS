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
  Typography,
  Space,
} from "antd";
import { CloseOutlined, UserOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import HTMLTextarea from "../../components/htmlTextarea";
import { useLocation } from "react-router-dom";
const { Title } = Typography;

const CategoryUpdate = () => {
  const location = useLocation();
  const { categoryInfo } = location.state || {};
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [catDisc, setCatDisc] = useState(categoryInfo.discription);
  const [form] = Form.useForm();

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = {
      ...values,
      discription: catDisc,
      updatedBy: user.id,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/category/update/${formData.id}`,
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
  return (
    <>
      <Title style={{ textAlign: "left" }} className="colorLink form-title">
        Update Existing Category
      </Title>
      <Card>
        <Form
          form={form}
          name="dynamic_form_complex"
          layout="vertical"
          initialValues={categoryInfo}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="borderlessInput"
        >
          <Row gutter={16}>
            <Col>
              <Row justify="space-between" gutter={16}>
                <Col lg={12} xs={24}>
                  <Form.Item
                    hidden
                    name="id"
                    initialValue={categoryInfo._id}
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
                    label="Category Name"
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
                <Col lg={12} xs={24}>
                  <Form.Item
                    label="Code"
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

                <Col lg={24} xs={24}>
                  <Form.Item label="Category Discription" name="discripton">
                    <HTMLTextarea
                      onChange={setCatDisc}
                      defaultData={categoryInfo.discription}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.List name="size">
                    {(fields, { add, remove }) => (
                      <Row gutter={16}>
                        <Col lg={24} xs={24}>
                          <Form.Item label={null}>
                            <Button
                              size="large"
                              type="primary"
                              onClick={() => add()}
                              block
                              style={{
                                borderRadius: "0px",
                                padding: "10px 30px",
                              }}
                            >
                              + Add Size
                            </Button>
                          </Form.Item>
                        </Col>
                        {fields.map((field) => (
                          <Col lg={8}>
                            <Card
                              size="small"
                              title={`Size ${field.name + 1}`}
                              key={field.key}
                              extra={
                                <CloseOutlined
                                  onClick={() => {
                                    remove(field.name);
                                  }}
                                />
                              }
                            >
                              <Form.Item
                                label="Name"
                                name={[field.name, "name"]}
                              >
                                <Input />
                              </Form.Item>

                              {/* Nest Form.List */}
                              <Form.Item label="Attribute">
                                <Form.List name={[field.name, "attribute"]}>
                                  {(subFields, subOpt) => (
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        rowGap: 16,
                                      }}
                                    >
                                      {subFields.map((subField) => (
                                        <Space key={subField.key}>
                                          <Form.Item
                                            noStyle
                                            name={[subField.name, "name"]}
                                          >
                                            <Input placeholder="Name" />
                                          </Form.Item>
                                          <Form.Item
                                            noStyle
                                            name={[subField.name, "value"]}
                                          >
                                            <Input placeholder="Value" />
                                          </Form.Item>
                                          <CloseOutlined
                                            onClick={() => {
                                              subOpt.remove(subField.name);
                                            }}
                                          />
                                        </Space>
                                      ))}
                                      <Button
                                        type="dashed"
                                        onClick={() => subOpt.add()}
                                        block
                                      >
                                        + Add Attribute
                                      </Button>
                                    </div>
                                  )}
                                </Form.List>
                              </Form.Item>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Form.List>
                </Col>

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
                      Update Category
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

export default CategoryUpdate;
