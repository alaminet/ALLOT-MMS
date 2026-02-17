import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  message,
  Row,
  Grid,
  AutoComplete,
  Select,
  Typography,
} from "antd";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { DeleteTwoTone, MinusCircleOutlined } from "@ant-design/icons";
const { Title } = Typography;
const { useBreakpoint } = Grid;

const PurchaseRequisitiionUpdate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const { refData } = location.state || {};
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [itemInfo, setItemInfo] = useState();
  const [form] = Form.useForm();

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);
    const formData = values;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/purchase/requisition/update/${
          refData._id
        }`,
        formData,
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        },
      );
      message.success(res.data.message);
      setLoading(false);
      navigate("/purchase-requisition/print", {
        state: {
          refData: refData?._id,
        },
      });
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
        },
      );
      const tableArr = res?.data?.items?.map((item, index) => ({
        label: item?.name,
        value: item?._id,
        code: item?.code,
        UOM: item?.UOM?.code,
        SKU: item?.SKU,
        price: item?.avgPrice,
        onHandQty: item?.stock?.reduce(
          (sum, stock) => sum + (Number(stock?.onHandQty) || 0),
          0,
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
        },
      );
      const tableArr = res?.data?.items?.map((item, index) => {
        item.data = item?.data?.map((i) => ({
          value: i._id,
          label: item?.modelName === "ItemUOM" ? i.code : i.name,
        }));
        return { ...item };
      });
      setItemInfo(tableArr);
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
      <Title style={{ textAlign: "left" }} className="colorLink form-title">
        Update Purchase Requisition
      </Title>
      <Card>
        <Form
          form={form}
          name="new"
          layout="vertical"
          initialValues={{
            ...refData,
            costCenter: refData.costCenter?._id,
          }}
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
                    <Flex
                      gap={16}
                      style={{ flexFlow: screens.xs ? "wrap" : "nowrap" }}>
                      <Form.Item
                        name={["requestedBy", "name"]}
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
                            itemInfo?.filter(
                              (item) => item.modelName === "CostCenter",
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
                        <Row
                          justify="space-between"
                          style={{ display: screens.xs ? "none" : "flex" }}>
                          <Col span={4} style={{ fontWeight: "600" }}>
                            Name<span style={{ color: "red" }}>*</span>
                          </Col>
                          <Col span={3} style={{ fontWeight: "600" }}>
                            SKU/Code
                          </Col>
                          <Col span={3} style={{ fontWeight: "600" }}>
                            Specification
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            Brand
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            UOM<span style={{ color: "red" }}>*</span>
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            Unit Price
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            On-Hand Qty
                          </Col>
                          <Col span={2} style={{ fontWeight: "600" }}>
                            Req. Qty<span style={{ color: "red" }}>*</span>
                          </Col>
                          <Col span={3} style={{ fontWeight: "600" }}>
                            Remarks
                          </Col>
                          <Col span={1} style={{ fontWeight: "600" }}></Col>
                        </Row>
                        {fields.map(({ key, name, ...restField }) => {
                          const itemData = form.getFieldValue([
                            "itemDetails",
                            name,
                          ]);
                          const isDisabled = itemData?.POQty > 0;

                          return (
                            <Row
                              key={key}
                              justify="space-between"
                              align="top"
                              style={{
                                borderBottom: screens.xs
                                  ? "2px dotted black"
                                  : "none",
                                marginBottom: screens.xs ? "10px" : "0",
                              }}>
                              <Col md={4} xs={24}>
                                <Form.Item
                                  {...restField}
                                  label={screens.xs ? "Name" : null}
                                  name={[name, "name"]}
                                  // help={
                                  //   form.getFieldValue([
                                  //     "itemDetails",
                                  //     name,
                                  //     "SKU",
                                  //   ])
                                  //     ? `SKU: ${form.getFieldValue([
                                  //         "itemDetails",
                                  //         name,
                                  //         "SKU",
                                  //       ])}`
                                  //     : ""
                                  // }
                                  rules={[
                                    {
                                      required: true,
                                      message: "Item name",
                                    },
                                  ]}>
                                  <AutoComplete
                                    disabled={isDisabled}
                                    options={filteredOptions}
                                    onSearch={(searchText) => {
                                      const filtered = itemList
                                        .filter((item) =>
                                          item.label
                                            .toLowerCase()
                                            .includes(searchText.toLowerCase()),
                                        )
                                        .map((item) => ({
                                          label: item.label + "-" + item.SKU,
                                          value: item.label,
                                        }));
                                      setFilteredOptions(filtered);
                                    }}
                                    onSelect={(value) => {
                                      const matched = itemList.find(
                                        (i) => i.label === value,
                                      );
                                      if (matched) {
                                        form.setFieldValue(
                                          ["itemDetails", name, "UOM"],
                                          matched.UOM,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "code"],
                                          matched.value,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "SKU"],
                                          matched.SKU,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "unitPrice"],
                                          matched.price,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "onHandQty"],
                                          matched.onHandQty,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "spec"],
                                          matched.spec,
                                        );
                                      }
                                    }}
                                    onChange={(value) => {
                                      const matched = itemList.find(
                                        (i) => i.label === value,
                                      );
                                      if (!matched) {
                                        form.setFieldValue(
                                          ["itemDetails", name, "UOM"],
                                          null,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "SKU"],
                                          null,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "code"],
                                          null,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "unitPrice"],
                                          null,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "onHandQty"],
                                          null,
                                        );
                                        form.setFieldValue(
                                          ["itemDetails", name, "spec"],
                                          null,
                                        );
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
                              <Col md={3} xs={24}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "SKU"]}
                                  label={screens.xs ? "SKU" : null}>
                                  <Input
                                    disabled={isDisabled}
                                    placeholder="SKU/Code"
                                  />
                                </Form.Item>
                              </Col>
                              <Col md={3} xs={24}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "spec"]}
                                  label={screens.xs ? "Specification" : null}>
                                  <Input
                                    disabled={isDisabled}
                                    placeholder="Specification"
                                  />
                                </Form.Item>
                              </Col>
                              <Col md={2} xs={12}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "brand"]}
                                  label={screens.xs ? "Brand" : null}>
                                  <Input
                                    disabled={isDisabled}
                                    placeholder="Brand"
                                  />
                                </Form.Item>
                              </Col>
                              <Col md={2} xs={12}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "UOM"]}
                                  label={screens.xs ? "UOM" : null}
                                  rules={[
                                    {
                                      required: true,
                                      message: "UOM",
                                    },
                                  ]}>
                                  <Input
                                    disabled={isDisabled}
                                    placeholder="UOM"
                                  />
                                </Form.Item>
                              </Col>
                              <Col md={2} xs={12}>
                                <Form.Item
                                  {...restField}
                                  label={screens.xs ? "Unit Price" : null}
                                  name={[name, "unitPrice"]}>
                                  <Input
                                    disabled={isDisabled}
                                    placeholder="Price"
                                  />
                                </Form.Item>
                              </Col>
                              <Col md={2} xs={12}>
                                <Form.Item
                                  {...restField}
                                  label={screens.xs ? "On Hand" : null}
                                  name={[name, "onHandQty"]}>
                                  <Input
                                    disabled={isDisabled}
                                    placeholder="On Hand"
                                  />
                                </Form.Item>
                              </Col>
                              <Col md={2} xs={24}>
                                <Form.Item
                                  {...restField}
                                  label={screens.xs ? "Req. Qty" : null}
                                  name={[name, "reqQty"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Req. Qty",
                                    },
                                  ]}>
                                  <Input
                                    disabled={isDisabled}
                                    placeholder="Req. Qty"
                                  />
                                </Form.Item>
                              </Col>
                              <Col md={3} xs={20}>
                                <Form.Item
                                  {...restField}
                                  label={screens.xs ? "Remarks" : null}
                                  name={[name, "remarks"]}>
                                  <Input
                                    disabled={isDisabled}
                                    placeholder="Remarks"
                                  />
                                </Form.Item>
                              </Col>
                              <Col
                                md={1}
                                xs={4}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  height: "42px",
                                  justifyContent: "center",
                                  marginTop: screens.xs ? "35px" : "0",
                                  fontSize: "30px",
                                }}>
                                <DeleteTwoTone
                                  twoToneColor={"red"}
                                  style={{
                                    cursor: isDisabled
                                      ? "not-allowed"
                                      : "pointer",
                                    opacity: isDisabled ? 0.5 : 1,
                                    color: isDisabled ? "#d9d9d9" : "#000",
                                  }}
                                  onClick={() => !isDisabled && remove(name)}
                                />
                              </Col>
                            </Row>
                          );
                        })}
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
                      Update PR
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

export default PurchaseRequisitiionUpdate;
