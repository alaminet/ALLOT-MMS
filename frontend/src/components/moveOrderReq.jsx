import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Drawer,
  Col,
  Grid,
  Form,
  Input,
  Row,
  Select,
  Typography,
  message,
  InputNumber,
  notification,
  Space,
} from "antd";
const { Title } = Typography;
const { useBreakpoint } = Grid;
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import axios from "axios";
dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";

const MoveOrderReq = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const screens = useBreakpoint();
  const isMobile = screens.xs;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [itemDetails, setItemDetails] = useState();
  const [form] = Form.useForm();

  // Drawer options
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  // Form submission
  const onFinish = async (values) => {
    const formData = {
      ...values,
      documentAt: new Date(),
      issuedAt: new Date(),
      createdBy: user?.id,
      tnxType: "Move Order",
      costCenter: user?.costCenter?.id,
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
      notification.success({
        message: "Success",
        description: res.data.message,
        duration: 0,
        onClose: () => {
          // your custom logic here
        },
      });
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
  }, []);

  return (
    <>
      <Button
        onClick={showDrawer}
        icon={<PlusCircleOutlined />}
        type="primary"
        lassName="borderBrand"
        style={{ borderRadius: "0px" }}>
        Move Order
      </Button>
      <Drawer
        title="Move Order Request"
        placement="bottom"
        height="95%"
        closable={{ "aria-label": "Close Button" }}
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button
              onClick={onClose}
              style={{ borderRadius: "0px", padding: "10px 30px" }}>
              Cancel
            </Button>
            <Button
              loading={loading}
              onClick={() => form.submit()}
              type="primary"
              style={{ borderRadius: "0px", padding: "10px 30px" }}>
              Submit
            </Button>
          </Space>
        }>
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
                <Col lg={12} xs={24}>
                  <Form.Item
                    label="Referance"
                    name="reference"
                    style={{ width: "100%" }}>
                    <Input
                      placeholder="Movement Ref."
                      maxLength={50}
                      showCount
                    />
                  </Form.Item>
                </Col>

                <Col lg={12} xs={24}>
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
                          <Col xs={9} sm={7} style={{ fontWeight: "600" }}>
                            Name
                          </Col>
                          <Col xs={0} sm={4} style={{ fontWeight: "600" }}>
                            Part/SKU
                          </Col>
                          <Col xs={4} sm={2} style={{ fontWeight: "600" }}>
                            UOM
                          </Col>
                          <Col xs={0} sm={3} style={{ fontWeight: "600" }}>
                            On-Hand
                          </Col>
                          <Col xs={4} sm={4} style={{ fontWeight: "600" }}>
                            Req. Qty
                          </Col>
                          <Col xs={4} sm={3} style={{ fontWeight: "600" }}>
                            Remarks
                          </Col>
                          <Col xs={1} style={{ fontWeight: "600" }}></Col>
                        </Row>
                        {fields.map(({ key, name, ...restField }) => (
                          <>
                            <Row key={key} justify="space-between" align="top">
                              <Col xs={9} sm={7}>
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
                                      find: item.name + "_" + item.SKU,
                                    }))}
                                    filterOption={(input, option) =>
                                      (option?.find ?? "")
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
                                          matched.stock?.reduce(
                                            (sum, acc) =>
                                              sum + (acc.onHandQty || 0),
                                            0
                                          )
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
                              <Col xs={0} sm={4}>
                                <Form.Item {...restField} name={[name, "SKU"]}>
                                  <Input disabled placeholder="SKU/Code" />
                                </Form.Item>
                              </Col>
                              <Col xs={4} sm={2}>
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
                              <Col xs={4} sm={3}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "stockList"]}>
                                  <Input disabled placeholder="On-Hand" />
                                </Form.Item>
                              </Col>
                              <Col xs={4} sm={4}>
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
                                    placeholder="Req. Qty"
                                    style={{ width: "100%" }}
                                  />
                                </Form.Item>
                              </Col>
                              <Col xs={4} sm={3}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "remarks"]}>
                                  <Input placeholder="Remarks" />
                                </Form.Item>
                              </Col>
                              <Col
                                xs={1}
                                sm={1}
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
                          <Button
                            type="primary"
                            onClick={() => add()}
                            block
                            style={{
                              borderRadius: "0px",
                              padding: "10px 30px",
                            }}>
                            + Add Item
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Form.Item>
              </div>
              {/* <Row justify="end">
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
              </Row> */}
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default MoveOrderReq;
