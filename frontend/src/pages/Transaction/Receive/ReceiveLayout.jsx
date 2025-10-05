import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Space,
  Row,
  Select,
  Typography,
  AutoComplete,
  message,
  InputNumber,
  Flex,
} from "antd";
import { useSelector } from "react-redux";
import { MinusCircleOutlined } from "@ant-design/icons";
const { Title } = Typography;
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate } from "react-router-dom";
dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";
const ReceiveLayout = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [costCenter, setCostCenter] = useState();
  const [form] = Form.useForm();

  // Form submission
  const onFinish = async (values) => {
    const formData = {
      ...values,
      documentAt: values.documentAt.$d,
      receivedAt: values.receivedAt.$d,
      createdBy: user?.id,
    };
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/transaction/receive/new`,
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
      getItems();
      getItemInfo();
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
        SKU: item?.SKU,
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
          model: ["StoreLocation"],
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
          value: item?.modelName === "ItemUOM" ? i.code : i.name,
          label: item?.modelName === "ItemUOM" ? i.code : i.name,
        }));
        return { ...item };
      });
      setCostCenter(tableArr);
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
        Goods Receive
      </Title>
      <Card>
        <Form
          form={form}
          name="new"
          layout="vertical"
          initialValues={{ receivedAt: dayjs(), documentAt: dayjs() }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="borderlessInput">
          <Row gutter={16}>
            <Col span={24}>
              <Row gutter={16}>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Document Date"
                    name="documentAt"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%" }}>
                    <DatePicker
                      defaultValue={dayjs()}
                      maxDate={dayjs()}
                      format={dateFormat}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Receive Date"
                    name="receivedAt"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%" }}>
                    <DatePicker
                      defaultValue={dayjs()}
                      minDate={dayjs().subtract(1, "month")}
                      maxDate={dayjs()}
                      format={dateFormat}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Transaction Type"
                    name="tnxType"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%", marginBottom: "35px" }}>
                    <Select
                      style={{ width: "100%" }}
                      allowClear
                      options={["PO GRN", "Initial Balance", "Others"].map(
                        (item) => ({
                          label: item,
                          value: item,
                        })
                      )}
                      placeholder="Transaction Type"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Source Type"
                    name="sourceType"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    style={{ width: "100%" }}>
                    <Select
                      style={{ width: "100%" }}
                      allowClear
                      options={[
                        { name: "Local", value: "Local" },
                        { name: "Import", value: "Import" },
                      ]}
                      placeholder="Source Type"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Source Referance"
                    name="sourceRef"
                    style={{ width: "100%" }}>
                    <Input placeholder="Source Ref." maxLength={50} showCount />
                  </Form.Item>
                </Col>

                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Header Text"
                    name="headerText"
                    style={{ width: "100%" }}>
                    <Input placeholder="Source Ref." maxLength={50} showCount />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Invoice No"
                    name="invoiceNo"
                    style={{ width: "100%" }}>
                    <Input
                      placeholder="Invoice Ref."
                      maxLength={50}
                      showCount
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="BL/MUSHOK No"
                    name="TaxNo"
                    style={{ width: "100%" }}>
                    <Input
                      placeholder="BL/MUSHOK Ref."
                      maxLength={50}
                      showCount
                    />
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
                        <Row gutter={8}>
                          <Col span={7} style={{ fontWeight: "600" }}>
                            Name
                          </Col>
                          <Col span={3} style={{ fontWeight: "600" }}>
                            Part/SKU
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            UOM
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            Unit Price
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            Req. Qty
                          </Col>
                          <Col span={3} style={{ fontWeight: "600" }}>
                            Location
                          </Col>
                          <Col span={4} style={{ fontWeight: "600" }}>
                            Remarks
                          </Col>
                        </Row>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row key={key} justify="space-between" gutter={8}>
                            <Col span={7}>
                              <Form.Item
                                {...restField}
                                name={[name, "name"]}
                                rules={[
                                  {
                                    required: true,
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
                                        matched.code
                                      );
                                      form.setFieldValue(
                                        ["itemDetails", name, "unitPrice"],
                                        matched.price
                                      );
                                      form.setFieldValue(
                                        ["itemDetails", name, "SKU"],
                                        matched.SKU
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
                                        ["itemDetails", name, "SKU"],
                                        ""
                                      ); // clear unitPrice for manual input
                                    }
                                  }}
                                  placeholder="Item name"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={3}>
                              <Form.Item {...restField} name={[name, "SKU"]}>
                                <Input disabled placeholder="SKU/Code" />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Form.Item
                                {...restField}
                                name={[name, "UOM"]}
                                rules={[
                                  {
                                    required: true,
                                  },
                                ]}>
                                <Input placeholder="UOM" />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Form.Item
                                {...restField}
                                name={[name, "unitPrice"]}>
                                <InputNumber placeholder="Price" />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Form.Item
                                {...restField}
                                name={[name, "receiveQty"]}
                                rules={[
                                  {
                                    type: "number",
                                    validator: (_, value) =>
                                      value > 0
                                        ? Promise.resolve()
                                        : Promise.reject(
                                            new Error("Greater then 0")
                                          ),
                                  },
                                ]}>
                                <InputNumber placeholder="Req. Qty" />
                              </Form.Item>
                            </Col>
                            <Col span={3}>
                              <Form.Item
                                {...restField}
                                name={[name, "location"]}
                                rules={[
                                  {
                                    required: true,
                                  },
                                ]}>
                                <Select
                                  allowClear
                                  showSearch
                                  options={
                                    costCenter?.filter(
                                      (item) =>
                                        item.modelName === "StoreLocation"
                                    )[0]?.data
                                  }
                                  placeholder="Location"
                                  filterOption={(input, option) =>
                                    (option?.label ?? "")
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
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

export default ReceiveLayout;
