import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Space,
  Row,
  Select,
  Typography,
  AutoComplete,
  message,
} from "antd";
import { useSelector } from "react-redux";
import { MinusCircleOutlined } from "@ant-design/icons";
const { Title } = Typography;

const PurchaseRequisitiion = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [itemDetails, setItemDetails] = useState();
  const [form] = Form.useForm();

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = { ...values, createdBy: user?.id };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/purchase/requisition/new`,
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

  // Get item details
  const getItems = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemInfo/view`,
        { scope: "all" },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        }
      );
      const tableArr = res?.data?.items?.map((item, index) => ({
        label: item?.name,
        value: item?._id,
        code: item?.code,
        UOM: item?.UOM?.code,
        price: item?.avgPrice,
        onHandQty: item?.stock?.reduce(
          (sum, stock) => sum + (Number(stock?.onHandQty) || 0),
          0
        ),
        spec: item?.discription,
      }));
      setItemList(tableArr);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Category List
  const getItemInfo = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemDetails/viewAll`,
        {
          model: ["CostCenter"],
          scope: "all",
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
      setItemDetails(tableArr);
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getItems();
    getItemInfo();
  }, []);

  return (
    <>
      <Title style={{ textAlign: "center" }} className="colorLink form-title">
        New Purchase Requisition
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
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="PR Referance"
                    name="reference"
                    style={{ width: "100%" }}>
                    <Input
                      placeholder="PR Referance"
                      maxLength={30}
                      showCount
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
                      options={[
                        { name: "Local", value: "Local" },
                        { name: "Import", value: "Import" },
                      ]}
                      placeholder="Supplier Type"
                    />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="PR Note"
                    name="note"
                    style={{ width: "100%" }}>
                    <Input
                      placeholder="PR Referance"
                      maxLength={50}
                      showCount
                    />
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item
                    label="Requester Details"
                    style={{ marginBottom: "35px" }}>
                    <Flex gap={16}>
                      <Form.Item
                        name={["requestedBy", "name"]}
                        initialValue={user.name}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Name is required",
                          },
                        ]}>
                        <Input placeholder="Requester Name" />
                      </Form.Item>
                      <Form.Item
                        name={["requestedBy", "contact"]}
                        initialValue={user.phone}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Contact number is required",
                          },
                        ]}>
                        <Input placeholder="Contact Number" />
                      </Form.Item>
                      <Form.Item
                        name={["requestedBy", "email"]}
                        initialValue={user.email}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Email is required",
                          },
                        ]}>
                        <Input placeholder="Email Address" />
                      </Form.Item>
                      <Form.Item
                        name="costCenter"
                        initialValue={user.costCenter}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Cost Center required",
                          },
                        ]}>
                        <Select
                          allowClear
                          options={
                            itemDetails?.filter(
                              (item) => item.modelName === "CostCenter"
                            )[0]?.data
                          }
                          placeholder="Cost Center"
                        />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                </Col>
              </Row>
              <div lg={24} xs={24}>
                <Form.Item
                  label="Item Details"
                  style={{ marginBottom: "35px" }}>
                  <Form.List name="itemDetails" style={{ display: "flex" }}>
                    {(fields, { add, remove }) => (
                      <>
                        <Row justify="space-between">
                          <Col span={4} style={{ fontWeight: "600" }}>
                            Name
                          </Col>
                          <Col span={3} style={{ fontWeight: "600" }}>
                            Specification
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            Brand
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            UOM
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            Unit Price
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            On-Hand Qty
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            Req. Qty
                          </Col>
                          <Col span={3} style={{ fontWeight: "600" }}>
                            Plan
                          </Col>
                          <Col span={3} style={{ fontWeight: "600" }}>
                            Remarks
                          </Col>
                          <Col span={1} style={{ fontWeight: "600" }}></Col>
                        </Row>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row key={key} justify="space-between" align="top">
                            <Col span={4}>
                              <Form.Item
                                {...restField}
                                name={[name, "name"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Item name",
                                  },
                                ]}>
                                <AutoComplete
                                  options={filteredOptions}
                                  onSearch={(searchText) => {
                                    const filtered = itemList
                                      .filter((item) =>
                                        item.label
                                          .toLowerCase()
                                          .includes(searchText.toLowerCase())
                                      )
                                      .map((item) => ({
                                        label: item.label,
                                        value: item.label,
                                      }));
                                    setFilteredOptions(filtered);
                                  }}
                                  onSelect={(value) => {
                                    const matched = itemList.find(
                                      (i) => i.label === value
                                    );
                                    if (matched) {
                                      form.setFieldValue(
                                        ["itemDetails", name, "UOM"],
                                        matched.UOM
                                      );
                                      form.setFieldValue(
                                        ["itemDetails", name, "code"],
                                        matched.value
                                      );
                                      form.setFieldValue(
                                        ["itemDetails", name, "unitPrice"],
                                        matched.price
                                      );
                                      form.setFieldValue(
                                        ["itemDetails", name, "onHandQty"],
                                        matched.onHandQty
                                      );
                                      form.setFieldValue(
                                        ["itemDetails", name, "spec"],
                                        matched.spec
                                      );
                                    }
                                  }}
                                  onChange={(value) => {
                                    const matched = itemList.find(
                                      (i) => i.label === value
                                    );
                                    if (!matched) {
                                      form.setFieldValue(
                                        ["itemDetails", name, "UOM"],
                                        ""
                                      ); // clear UOM for manual input
                                      form.setFieldValue(
                                        ["itemDetails", name, "code"],
                                        ""
                                      ); // clear code for manual input
                                      form.setFieldValue(
                                        ["itemDetails", name, "unitPrice"],
                                        ""
                                      ); // clear unitPrice for manual input
                                      form.setFieldValue(
                                        ["itemDetails", name, "onHandQty"],
                                        ""
                                      ); // clear unitPrice for manual input
                                      form.setFieldValue(
                                        ["itemDetails", name, "spec"],
                                        ""
                                      ); // clear unitPrice for manual input
                                    }
                                  }}
                                  placeholder="Item name"
                                />
                              </Form.Item>
                              <Form.Item
                                hidden
                                {...restField}
                                name={[name, "code"]}>
                                <Input placeholder="Code" />
                              </Form.Item>
                            </Col>
                            <Col span={3}>
                              <Form.Item {...restField} name={[name, "spec"]}>
                                <Input placeholder="Specification" />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Form.Item {...restField} name={[name, "brand"]}>
                                <Input placeholder="Brand" />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Form.Item {...restField} name={[name, "UOM"]}>
                                <Input placeholder="UOM" />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Form.Item
                                {...restField}
                                name={[name, "unitPrice"]}>
                                <Input placeholder="Price" />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Form.Item
                                {...restField}
                                name={[name, "onHandQty"]}>
                                <Input placeholder="On Hand" />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Form.Item
                                {...restField}
                                name={[name, "reqQty"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Req. Qty",
                                  },
                                ]}>
                                <Input placeholder="Req. Qty" />
                              </Form.Item>
                            </Col>
                            <Col span={3}>
                              <Form.Item
                                {...restField}
                                name={[name, "consumePlan"]}>
                                <Input placeholder="Consume Plan" />
                              </Form.Item>
                            </Col>
                            <Col span={3}>
                              <Form.Item
                                {...restField}
                                name={[name, "remarks"]}>
                                <Input placeholder="Remarks" />
                              </Form.Item>
                            </Col>

                            <Col
                              span={1}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                height: "42px",
                                justifyContent: "center",
                              }}>
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                              />
                            </Col>
                          </Row>
                        ))}
                        <Form.Item>
                          <Button type="primary" onClick={() => add()} block>
                            + Add Item
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Form.Item>
              </div>
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
                      Submit
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

export default PurchaseRequisitiion;
