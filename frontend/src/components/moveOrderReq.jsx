import React, { useEffect, useState } from "react";
import axios from "axios";
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
  Space,
  notification,
} from "antd";
const { Title } = Typography;
const { useBreakpoint } = Grid;
import { PlusCircleOutlined, DeleteTwoTone } from "@ant-design/icons";

const MoveOrderReq = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const screens = useBreakpoint();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [costCenter, setCostCenter] = useState();
  const [form] = Form.useForm();

  // Drawer options
  const showDrawer = () => {
    getItems();
    getCostCenter();
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  // Form submission
  const onFinish = async (values) => {
    const formData = {
      ...values,
      requestedBy: {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: new Date(),
      },
      createdBy: user?.id,
      // costCenter: user?.costCenter,
    };
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/transaction/move-order/new`,
        formData,
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        },
      );
      onClose();
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
        },
      );
      const tableArr = res?.data?.items?.map((item, index) => ({
        ...item,
      }));
      setItemList(tableArr);
    } catch (error) {
      console.log(error);
    }
  };

  // Get CostCenter List
  const getCostCenter = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemDetails/viewAll`,
        {
          model: ["CostCenter"],
        },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        },
      );
      const tableArr = res?.data?.items?.map((item, index) => {
        item.data = item?.data?.map((i) => ({
          value: i._id,
          label: item?.modelName === "ItemUOM" ? i.code : i.name,
        }));
        return { ...item };
      });
      setCostCenter(tableArr);
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  return (
    <>
      <Button
        onClick={showDrawer}
        icon={<PlusCircleOutlined />}
        type="primary"
        className="borderBrand"
        style={{ borderRadius: "0px" }}>
        Move Order
      </Button>
      <Drawer
        title="Move Order Request"
        placement="bottom"
        size="large"
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
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="borderlessInput">
          <Row gutter={16}>
            <Col span={24}>
              <Row gutter={16}>
                <Col lg={8} xs={24}>
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

                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Header Text"
                    name="headerText"
                    style={{ width: "100%" }}>
                    <Input placeholder="Header Text" maxLength={50} showCount />
                  </Form.Item>
                </Col>
                <Col lg={8} xs={24}>
                  <Form.Item
                    label="Deptartment"
                    name="costCenter"
                    initialValue={user?.costCenter}
                    style={{ width: "100%" }}>
                    <Select
                      allowClear
                      options={
                        costCenter?.filter(
                          (item) => item.modelName === "CostCenter",
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
              </Row>
              <div>
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
                                        (i) => i.name === value,
                                      );
                                      if (matched) {
                                        form.setFieldValue(
                                          ["itemDetails", name, "UOM"],
                                          matched.UOM.code,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "code"],
                                          matched._id,
                                        );

                                        form.setFieldValue(
                                          ["itemDetails", name, "SKU"],
                                          matched.SKU,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "onHand"],
                                          matched.stock?.reduce(
                                            (sum, acc) =>
                                              sum + (acc.onHandQty || 0),
                                            0,
                                          ),
                                        );
                                      }
                                    }}
                                    onChange={(value) => {
                                      const matched = itemList.find(
                                        (i) => i.name === value,
                                      );
                                      if (!matched) {
                                        form.setFieldValue(
                                          ["itemDetails", name, "UOM"],
                                          "",
                                        ); // clear UOM for manual input
                                        form.setFieldValue(
                                          ["itemDetails", name, "code"],
                                          "",
                                        ); // clear code for manual input
                                        form.setFieldValue(
                                          ["itemDetails", name, "SKU"],
                                          "",
                                        ); // clear SKU for manual input
                                        form.setFieldValue(
                                          ["itemDetails", name, "onHand"],
                                          "",
                                        ); // clear onHand for manual input
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
                              <Col xs={0} sm={3}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "onHand"]}>
                                  <Input disabled placeholder="On-Hand" />
                                </Form.Item>
                              </Col>
                              <Col xs={4} sm={3}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "reqQty"]}
                                  rules={[
                                    {
                                      type: "number",
                                      validator: (_, value) =>
                                        value > 0
                                          ? Promise.resolve()
                                          : Promise.reject(
                                              new Error("Greater then 0"),
                                            ),
                                    },
                                  ]}>
                                  <InputNumber
                                    placeholder="Req. Qty"
                                    style={{ width: "100%" }}
                                  />
                                </Form.Item>
                              </Col>
                              <Col xs={4} sm={4}>
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
                                <DeleteTwoTone
                                  twoToneColor="#eb2f96"
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
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default MoveOrderReq;
