import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Col,
  Row,
  Popover,
  Typography,
  Space,
  DatePicker,
  List,
  Card,
  Button,
  Input,
  Tooltip,
  Flex,
  InputNumber,
  Select,
  Collapse,
  Form,
  Cascader,
  Divider,
  message,
  Tag,
  Drawer,
  Table,
} from "antd";

import {
  PrinterOutlined,
  PlusCircleOutlined,
  InfoCircleTwoTone,
  DollarOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteTwoTone,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FilterFilled,
  MinusOutlined,
  PaperClipOutlined,
  PlusOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { usePermission } from "../../../hooks/usePermission";
import NotAuth from "../../notAuth";
import { useEffect } from "react";

const { Search } = Input;
const { Title, Text, Link } = Typography;

const POS = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [form] = Form.useForm();
  const [queryData, setQueryData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [billingAdd, setBillingAdd] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const [payment, setPayment] = useState(0);
  const [paymentBy, setPaymentBy] = useState("Cash");
  const [paymentRef, setPaymentRef] = useState(null);
  const [isDiscountManual, setIsDiscountManual] = useState(false);
  // User Permission Check
  const { canViewPage, canDoOwn } = usePermission();
  if (!canViewPage("POS")) {
    return <NotAuth />;
  }

  const canCreate = canDoOwn("POS", "create");

  // handle Cart Button
  const handleAddToCart = (product) => {
    setCartData((prev) => {
      const exists = prev.find((p) => p.key === product.key);
      return exists
        ? prev
        : [
            ...prev,
            { ...product, quantity: 1, discount: 0, discountType: "flat" },
          ];
    });
  };
  const updateQuantity = (key, value) => {
    setCartData((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: Math.max(1, Math.min(item.stock, Number(value))),
            }
          : item,
      ),
    );
  };

  // implement add button inside cart list
  const getCartItem = (key) => cartData.find((p) => p.key === key);

  // update discount value
  const updateDiscountValue = (key, value) => {
    setCartData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, discount: value } : item,
      ),
    );
    setIsDiscountManual(false);
  };

  const updateDiscountType = (key, type) => {
    setCartData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, discountType: type } : item,
      ),
    );
  };
  const getDiscountedPrice = (item) => {
    const base = item.salePrice;
    const quantity = item.quantity;
    const discount = item.discount || 0;
    const type = item.discountType;

    const perUnit =
      type === "percent" ? base - (base * discount) / 100 : base - discount;

    const total = perUnit * quantity;

    return Math.max(0, total);
  };

  const getDiscountAmount = (item) => {
    const base = item.salePrice * item.quantity;
    const discount = item.discount || 0;

    return item.discountType === "percent"
      ? (base * discount) / 100
      : discount * item.quantity;
  };
  const getVatAmount = (item) => {
    const base = Number(item.salePrice) * Number(item.quantity);
    const vat = item.VAT || 0;
    return (base * vat) / 100;
  };

  const handleRemove = (key) => {
    setCartData((prev) => prev.filter((item) => item.key !== key));
  };

  // Get Product Table data
  const getTableData = async () => {
    const payload = { scope: "all" };
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/master/itemInfo/view`,
          { scope: "all", isSaleable: true },
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          },
        )
        .then((res) => {
          // message.success(res.data.message);
          const tableArr = res?.data?.items?.map((item, index) => ({
            key: index + 1,
            name: item?.name,
            SKU: item.SKU,
            UOM: item?.UOM?.code,
            VAT: item?.vat,
            label: item?.name + "-" + item?.SKU,
            stock: item?.stock?.reduce((acc, curr) => acc + curr.onHandQty, 0),
            salePrice: item?.salePrice || item?.avgPrice,
            avgPrice: item?.avgPrice,
            search: `${item?.SKU}-${item?.name}`,
          }));
          setQueryData(tableArr);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    // Get Product Data
    getTableData();

    // set Discount Amount
    if (!isDiscountManual) {
      const totalDiscount = cartData?.reduce(
        (sum, item) => sum + getDiscountAmount(item),
        0,
      );
      setDiscountAmount(totalDiscount);
    }
  }, [cartData]);

  const handleOrderConfirm = async () => {
    if (!canCreate) {
      message.warning("You are not authorized");
      return; // stop execution
    }
    try {
      const billAmount = Number(
        cartData
          ?.reduce((sum, item) => sum + item.salePrice * item.quantity, 0)
          .toFixed(0),
      ).toFixed(0);
      const dueAmount = Number(
        cartData
          ?.reduce((sum, item) => sum + item.salePrice * item.quantity, 0)
          .toFixed(0) -
          Number(discountAmount).toFixed(0) +
          Number(
            cartData
              ?.reduce(
                (sum, item) =>
                  sum + getDiscountedPrice(item) * (item?.VAT / 100),
                0,
              )
              .toFixed(2),
          ) -
          Number(adjustment) -
          Number(payment),
      ).toFixed(2);

      const VAT = Number(
        cartData?.reduce(
          (sum, item) => sum + getDiscountedPrice(item) * (item?.VAT / 100),
          0,
        ),
      ).toFixed(2);

      const payload = {
        products: cartData,
        billingAddress: billingAdd,
        payments: {
          totalBill: Number(billAmount),
          vat: Number(VAT),
          discount: Number(discountAmount.toFixed(0)),
          discountType: isDiscountManual ? "Manual" : "Calculated",
          payment: Number(payment),
          paymentBy: paymentBy,
          paymentRef: paymentRef,
          adjustment: Number(adjustment),
          duePay: Number(dueAmount),
        },
      };
      console.log(payload);

      //   await axios
      //     .post(`${import.meta.env.VITE_API_URL}/api/order/new`, payload, {
      //       headers: {
      //         Authorization: import.meta.env.VITE_SECURE_API_KEY,
      //         token: user?.token,
      //       },
      //     })
      //     .then((res) => {
      //       message.success(res.data.message);
      //       form.resetFields();
      //       setCartData([]);
      //       setBillingAdd([]);
      //       setDiscountAmount(0);
      //       setVatAmount(0);
      //       setIsDiscountManual(false);
      //     });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col md={8}>
          <Card>
            <Flex gap={10}>
              <Input.Search
                placeholder="Product Search"
                size="large"
                variant="filled"
                onChange={(e) => setSearch(e.target.value)}
              />
            </Flex>
            <List
              style={{ height: "calc(100vh - 220px)", overflowY: "scroll" }}
              itemLayout="horizontal"
              dataSource={queryData?.filter((item) =>
                item?.label?.toLowerCase().includes(search?.toLowerCase()),
              )}
              renderItem={(item, index) => (
                <List.Item
                  key={index}
                  actions={[
                    item.stock === 0 ? (
                      <Button
                        style={{ cursor: "not-allowed" }}
                        danger
                        type="primary">
                        Stock out
                      </Button>
                    ) : cartData.some((p) => p.key === item.key) ? (
                      <Flex>
                        <Tooltip title="Delete">
                          <Button
                            type="link"
                            style={{ padding: "0 8px" }}
                            onClick={() => handleRemove(item.key)}>
                            <DeleteTwoTone twoToneColor="#eb2f96" />
                          </Button>
                        </Tooltip>
                        <InputNumber
                          value={getCartItem(item.key)?.quantity}
                          controls={false}
                          style={{ width: "110px" }}
                          min={1}
                          max={getCartItem(item.key)?.stock}
                          onChange={(value) => updateQuantity(item.key, value)}
                          addonBefore={
                            <MinusOutlined
                              onClick={() =>
                                updateQuantity(
                                  item.key,
                                  getCartItem(item.key)?.quantity - 1,
                                )
                              }
                              disabled={item.quantity <= 1}
                            />
                          }
                          addonAfter={
                            <PlusOutlined
                              onClick={() =>
                                updateQuantity(
                                  item.key,
                                  getCartItem(item.key)?.quantity + 1,
                                )
                              }
                              disabled={item.quantity >= item.stock}
                            />
                          }
                        />
                      </Flex>
                    ) : (
                      <Button
                        icon={<ShoppingCartOutlined />}
                        onClick={() => handleAddToCart(item)}
                        type={
                          cartData.some((p) => p.key === item.key)
                            ? "primary"
                            : "default"
                        }>
                        {cartData.some((p) => p.key === item.key)
                          ? "Added"
                          : "Cart"}
                      </Button>
                    ),
                    // <InfoCircleTwoTone />,
                  ]}>
                  <List.Item.Meta
                    // avatar={
                    //   <Avatar
                    //     src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}
                    //   />
                    // }
                    title={`${item.name}, ${item.UOM}`}
                    description={
                      <span
                        dangerouslySetInnerHTML={{
                          __html: `SKU: ${item.SKU} | Stock: ${item.stock}<br />Sale: ${item.salePrice} BDT | Avg.: ${item.avgPrice} BDT`,
                        }}
                      />
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col md={8}>
          <Card
            actions={[
              <Text strong>Total</Text>,
              <Text strong>
                {cartData
                  ?.reduce((sum, item) => sum + getDiscountedPrice(item), 0)
                  .toFixed(0)}{" "}
                BDT
              </Text>,
              ,
            ]}>
            <Text strong>Cart ({cartData.length} Items)</Text>
            <List
              style={{ height: "calc(100vh - 250px)", overflowY: "scroll" }}
              itemLayout="horizontal"
              dataSource={cartData}
              renderItem={(item, index) => (
                <List.Item key={index}>
                  <Flex style={{ flexFlow: "column" }}>
                    <Text strong>{`${item.name}, ${item.UOM}`}</Text>
                    <Text style={{ color: "#00000073" }}>
                      Sale: {item.salePrice} BDT | Avg.: {item.avgPrice} BDT
                    </Text>
                    <Flex>
                      <InputNumber
                        style={{ width: "100px" }}
                        controls={false}
                        value={item.discount}
                        min={0}
                        max={
                          item.discountType === "percent" ? 100 : item.salePrice
                        }
                        onChange={(value) =>
                          updateDiscountValue(item.key, value)
                        }
                        addonAfter={
                          <Select
                            value={item.discountType}
                            onChange={(type) =>
                              updateDiscountType(item.key, type)
                            }>
                            <Option value="flat">=</Option>
                            <Option value="percent">%</Option>
                          </Select>
                        }
                        defaultValue={item.discount}
                      />
                    </Flex>
                  </Flex>
                  <Flex justify="space-between">
                    <Flex style={{ flexDirection: "column" }}>
                      <div style={{ textAlign: "right", paddingRight: "8px" }}>
                        <strike
                          style={{ fontSize: "10px", marginRight: "8px" }}>
                          {item.salePrice * item.quantity !==
                            getDiscountedPrice(item) &&
                            `${item.salePrice * item.quantity} BDT`}
                        </strike>
                        <Text strong>
                          {getDiscountedPrice(item).toFixed(0)} BDT
                        </Text>
                      </div>
                      <Flex>
                        <Tooltip title="Delete">
                          <Button
                            type="link"
                            style={{ padding: "0 8px" }}
                            onClick={() => handleRemove(item.key)}>
                            <DeleteTwoTone twoToneColor="#eb2f96" />
                          </Button>
                        </Tooltip>
                        <InputNumber
                          value={item.quantity}
                          controls={false}
                          style={{ width: "120px" }}
                          min={1}
                          max={item.stock}
                          onChange={(value) => updateQuantity(item.key, value)}
                          addonBefore={
                            <MinusOutlined
                              onClick={() =>
                                updateQuantity(item.key, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            />
                          }
                          addonAfter={
                            <PlusOutlined
                              onClick={() =>
                                updateQuantity(item.key, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                            />
                          }
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col md={8}>
          <Card
            actions={[
              <Button
                type="primary"
                style={{ backgroundColor: "#ff9800" }}
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  message.success("New bill initialized");
                  form.resetFields();
                  setCartData([]);
                  setBillingAdd([]);
                  setDiscountAmount(0);
                  setVatAmount(0);
                  setAdjustment(0);
                  setIsDiscountManual(false);
                }}>
                New
              </Button>,
              <Button
                icon={<PrinterOutlined />}
                //   onClick={() => handleOrderConfirm("Draft")}
              >
                Print
              </Button>,
              <Button type="primary" danger icon={<DollarOutlined />}>
                Due
              </Button>,
              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={handleOrderConfirm}>
                Save
              </Button>,
            ]}>
            <Text strong>Checkout & Confirm</Text>
            <div>
              <List
                itemLayout="horizontal"
                dataSource={cartData}
                renderItem={(item, index) => (
                  <List.Item key={index}>
                    <Flex style={{ flexFlow: "column" }}>
                      <Text strong>{`${item.name}, ${item.UOM}`}</Text>
                      <Text style={{ color: "#00000073" }}>
                        {`SKU: ${item.SKU} | Cart: ${item.quantity} ${item.UOM}`}
                      </Text>
                    </Flex>
                    <Flex justify="end" style={{ minWidth: "140px" }}>
                      <Flex style={{ flexDirection: "column" }}>
                        <div
                          style={{ textAlign: "right", paddingRight: "8px" }}>
                          <strike
                            style={{ fontSize: "10px", marginRight: "8px" }}>
                            {item.salePrice * item.quantity !==
                              getDiscountedPrice(item) &&
                              `${item.salePrice * item.quantity} BDT`}
                          </strike>
                          <Text strong>
                            {getDiscountedPrice(item).toFixed(0)} BDT
                          </Text>
                        </div>
                        {item?.VAT > 0 && (
                          <div
                            style={{ textAlign: "right", paddingRight: "8px" }}>
                            <Text
                              style={{ fontSize: "10px", color: "#00000073" }}>
                              VAT:{" "}
                              {Number(
                                getDiscountedPrice(item) * (item?.VAT / 100),
                              ).toFixed(2)}{" "}
                              BDT
                            </Text>
                          </div>
                        )}
                      </Flex>
                    </Flex>
                  </List.Item>
                )}
              />
              <Flex gap={8} justify="space-between">
                <div>
                  <Divider orientation="center">Billing Details</Divider>
                  <Input
                    variant="filled"
                    placeholder="Customer Mobile"
                    defaultValue={"+880"}
                    // onChange={(e) => handleCustomer(e.target.value)}
                  />
                  <Flex style={{ flexDirection: "column" }}>
                    <Typography.Text>{billingAdd.name}</Typography.Text>
                    <Typography.Text>{billingAdd.number}</Typography.Text>
                    <Typography.Text>{billingAdd.numberAlt}</Typography.Text>
                    <Typography.Text>{billingAdd.address1}</Typography.Text>
                    <Typography.Text>
                      {billingAdd.address2?.slice().reverse().join(", ")}
                    </Typography.Text>
                  </Flex>
                </div>
                <div>
                  <Divider orientation="center">Payment Details</Divider>
                  <Flex style={{ flexDirection: "column" }}>
                    <Flex justify="space-between">
                      <Text>Sub Total :</Text>
                      <Text>
                        {cartData
                          ?.reduce(
                            (sum, item) => sum + item.salePrice * item.quantity,
                            0,
                          )
                          .toFixed(0)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Discount :</Text>
                      <Text>{discountAmount.toFixed(0)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>VAT :</Text>
                      <Text>
                        {cartData
                          ?.reduce(
                            (sum, item) =>
                              sum +
                              getDiscountedPrice(item) * (item?.VAT / 100),
                            0,
                          )
                          .toFixed(2)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Adjust :</Text>
                      <Flex align="center" gap={4}>
                        <Text
                          editable={{
                            icon: <EditOutlined />,
                            onChange: (value) => setAdjustment(value),
                          }}>
                          {Number(adjustment).toFixed(2)}
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Payment :</Text>
                      <Flex align="center" gap={4}>
                        <Text
                          editable={{
                            icon: <EditOutlined />,
                            onChange: (value) => setPayment(value),
                          }}>
                          {Number(payment).toFixed(2)}
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Pay By.:</Text>
                      <Flex align="center" gap={4}>
                        <Text
                          editable={{
                            icon: <EditOutlined />,
                            onChange: (value) => setPaymentBy(value),
                          }}>
                          {paymentBy}
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Pay Ref.:</Text>
                      <Flex align="center" gap={4}>
                        <Text
                          editable={{
                            icon: <EditOutlined />,
                            onChange: (value) => setPaymentRef(value),
                          }}>
                          {paymentRef}
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex justify="space-between">
                      <Text strong>Due Pay :</Text>
                      <Text strong>
                        {Number(
                          cartData
                            ?.reduce(
                              (sum, item) =>
                                sum + item.salePrice * item.quantity,
                              0,
                            )
                            .toFixed(0) -
                            Number(discountAmount).toFixed(0) +
                            Number(
                              cartData
                                ?.reduce(
                                  (sum, item) =>
                                    sum +
                                    getDiscountedPrice(item) *
                                      (item?.VAT / 100),
                                  0,
                                )
                                .toFixed(2),
                            ) -
                            Number(adjustment) -
                            Number(payment),
                        ).toFixed(2)}
                      </Text>
                    </Flex>
                  </Flex>
                </div>
              </Flex>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default POS;
