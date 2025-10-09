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
  notification,
} from "antd";
import { useSelector } from "react-redux";
import { MinusCircleOutlined } from "@ant-design/icons";
const { Title } = Typography;
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate } from "react-router-dom";
dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";

const IssueLayout = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [itemDetails, setItemDetails] = useState();
  const [form] = Form.useForm();

  // Form submission
  const onFinish = async (values) => {
    const formData = {
      ...values,
      documentAt: values.documentAt.$d,
      issuedAt: values.issuedAt.$d,
      createdBy: user?.id,
    };
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/transaction/issue/new`,
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
      //   message.error(error.response.data.error);
      notification.error({
        message: "Error",
        description: error.response?.data?.error,
        duration: 0,
        onClose: () => {
          // your custom logic here
        },
      });
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
        ...item,
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
          model: ["StoreLocation", "CostCenter"],
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
      setItemDetails(tableArr);
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getItems();
    getItemInfo();
  }, [filteredOptions]);

  return (
    <>
      <Title style={{ textAlign: "center" }} className="colorLink form-title">
        Goods Issue
      </Title>
      <Card>
        <Form
          form={form}
          name="new"
          layout="vertical"
          initialValues={{ issuedAt: dayjs(), documentAt: dayjs() }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="borderlessInput">
          <Row gutter={16}>
            <Col span={24}>
              <Row gutter={16}>
                <Col lg={8} xs={24}>
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
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Issue Date"
                    name="issuedAt"
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
                <Col lg={8} xs={24}>
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
                      options={["Move Order", "Others"].map((item) => ({
                        label: item,
                        value: item,
                      }))}
                      placeholder="Transaction Type"
                    />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    name="costCenter"
                    // initialValue={user.costCenter}
                    label="Cost Center"
                    rules={[
                      {
                        required: true,
                      },
                    ]}>
                    <Select
                      allowClear
                      options={
                        itemDetails?.filter(
                          (item) => item.modelName === "CostCenter"
                        )[0]?.data
                      }
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      placeholder="Cost Center"
                    />
                  </Form.Item>
                </Col>

                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Referance"
                    name="referance"
                    style={{ width: "100%" }}>
                    <Input
                      placeholder="Movement Ref."
                      maxLength={50}
                      showCount
                    />
                  </Form.Item>
                </Col>

                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Header Text"
                    name="headerText"
                    style={{ width: "100%" }}>
                    <Input placeholder="Header Text" maxLength={50} showCount />
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
                          <Col span={6} style={{ fontWeight: "600" }}>
                            Name
                          </Col>
                          <Col span={3} style={{ fontWeight: "600" }}>
                            Part/SKU
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            UOM
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            Avg.Price
                          </Col>
                          <Col span={4} style={{ fontWeight: "600" }}>
                            Location
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            Issue Qty
                          </Col>
                          <Col span={4} style={{ fontWeight: "600" }}>
                            Remarks
                          </Col>
                          <Col span={1} style={{ fontWeight: "600" }}></Col>
                        </Row>
                        {fields.map(({ key, name, ...restField }) => (
                          <>
                            <Row key={key} justify="space-between" align="top">
                              <Col span={6}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "name"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Enter name",
                                    },
                                  ]}>
                                  <Select
                                    allowClear
                                    showSearch
                                    placeholder="Item Name"
                                    options={itemList?.map((item) => ({
                                      label: item.name,
                                      value: item.name,
                                    }))}
                                    filterOption={(input, option) =>
                                      (option?.value ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                    onSelect={(value) => {
                                      const matched = itemList.find(
                                        (i) => i.name === value
                                      );
                                      if (matched) {
                                        form.setFieldValue(
                                          ["itemDetails", name, "UOM"],
                                          matched.UOM.code
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "code"],
                                          matched.code
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "issuePrice"],
                                          matched.avgPrice
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "SKU"],
                                          matched.SKU
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "stockList"],
                                          matched.stock
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "location"],
                                          matched.stock?.[0]?.location || ""
                                        );
                                      }
                                    }}
                                    onChange={(value) => {
                                      const matched = itemList.find(
                                        (i) => i.name === value
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
                                          ["itemDetails", name, "issuePrice"],
                                          ""
                                        ); // clear issuePrice for manual input
                                        form.setFieldValue(
                                          ["itemDetails", name, "SKU"],
                                          ""
                                        ); // clear SKU for manual input
                                        form.setFieldValue(
                                          ["itemDetails", name, "location"],
                                          ""
                                        ); // clear location for manual input
                                        form.setFieldValue(
                                          ["itemDetails", name, "stockList"],
                                          ""
                                        ); // clear stockList for manual input
                                      }
                                    }}
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
                                      message: "Enter UOM",
                                    },
                                  ]}>
                                  <Input disabled placeholder="UOM" />
                                </Form.Item>
                              </Col>
                              <Col span={2}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "issuePrice"]}>
                                  <InputNumber
                                    placeholder="Price"
                                    style={{ width: "100%" }}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={4}>
                                <Form.Item
                                  shouldUpdate={(prev, curr) =>
                                    prev.itemDetails?.[name]?.stockList !==
                                    curr.itemDetails?.[name]?.stockList
                                  }>
                                  {() => {
                                    const stockList =
                                      form.getFieldValue([
                                        "itemDetails",
                                        name,
                                        "stockList",
                                      ]) || [];

                                    const locationOptions = stockList
                                      .filter((f) => f.onHandQty > 0)
                                      .map((loc) => ({
                                        label: `${loc.location} (${loc.onHandQty})`,
                                        value: loc.location,
                                      }));
                                    return (
                                      <Form.Item
                                        {...restField}
                                        name={[name, "location"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Enter location",
                                          },
                                        ]}>
                                        <Select
                                          options={locationOptions}
                                          placeholder="Location"
                                          allowClear
                                          showSearch
                                          filterOption={(input, option) =>
                                            (option?.label ?? "")
                                              .toLowerCase()
                                              .includes(input.toLowerCase())
                                          }
                                        />
                                      </Form.Item>
                                    );
                                  }}
                                </Form.Item>
                              </Col>
                              <Col span={2}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "issueQty"]}
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
                                  <InputNumber
                                    placeholder="Issue Qty"
                                    style={{ width: "100%" }}
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
                                  justifyContent: "center",
                                }}>
                                <MinusCircleOutlined
                                  onClick={() => remove(name)}
                                />
                              </Col>
                            </Row>
                          </>
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

export default IssueLayout;
