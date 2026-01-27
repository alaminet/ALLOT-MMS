import React, { useState } from "react";
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  List,
  message,
  Modal,
  Typography,
} from "antd";
import {
  DollarOutlined,
  EditOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import SalesListDrawer from "./salesListDrawer";
import { usePermission } from "../hooks/usePermission";
import axios from "axios";
import Barcode from "react-barcode";
import usePhoneNormalize from "../hooks/usePhoneNormalize";
const { Title, Text } = Typography;

// 128 Bar code
function Barcode128({ value }) {
  return (
    <Barcode
      value={value} // your data string
      format="CODE128" // specify Code 128
      width={2} // bar width
      height={25} // bar height
      displayValue={true} // show text below barcode
    />
  );
}

// Print layout
function handlePrint(invId, orgName, orgLoc) {
  const orgAdd = Object.values(orgLoc).reverse().join(", ");
  const styleTag = document.createElement("style");
  const value = String(invId);
  styleTag.innerHTML = `
    @media print {
      @page {
        width: 80mm !important;
        height:auto !important;
        margin: 0 !important;
      }
      body {
        margin: 0 !important;
      }
      *{
       font-size: 10px !important;
       }
        .print-page-modal,
        .print-page-modal * {
        visibility: visible;
        }
        .print-page-modal {
        box-sizing: border-box;
        position: fixed;
        top: 0 !important;
        left: 0 !important;
        padding: 0 !important;
        }
       .ant-card-body{
       padding: 5px !important;
       }
      .ant-list-item{
      padding: 0 !important;
      }
      .ant-typography-edit, .ant-card-actions{
      display: none !important;
      }
      .ant-form-item{
      margin: 0 !important;
      }
      input::placeholder{
      color: transparent !important;
      }
      textarea::placeholder{
      color: transparent !important;
      }
      .ant-form input::placeholder,
      .ant-form textarea::placeholder {
      color: transparent !important;
      }
    }
  `;

  // Create print header with org name and invoice ID
  const printHeader = document.createElement("div");
  printHeader.id = "print-header-temp";
  printHeader.style.cssText = `
    text-align: center;
    padding: 10px 5px;
    border-bottom: 2px solid #000;
    margin-bottom: 5px;
    page-break-after: avoid;
  `;
  printHeader.innerHTML = `
    <div style="font-weight: bold; font-size: 14px;">${orgName || "Organization"}</div>
    <div style="margin: 0 auto; font-size: 10px; width: 80%">${orgAdd || "Organization Location"}</div>
  `;

  //create print footer
  const printFooter = document.createElement("div");
  printFooter.id = "print-footer-temp";
  printFooter.style.cssText = `
  text-align: center;
    padding: 10px 5px;
    border-top: 0.5px solid #b3b3b3;
    margin-top: 5px;
    page-break-after: avoid;
  `;
  printFooter.innerHTML = `
    <div style="font-size: 8px;">©ALLOT 2026 | Developed by Al Amin ET</div>
  `;

  const printPageDiv = document.querySelector(".print-page-modal");
  if (printPageDiv) {
    printPageDiv.insertBefore(printHeader, printPageDiv.firstChild);
    printPageDiv.appendChild(printFooter);
  }

  // Remove the print header after print dialog closes
  const removePrintHeader = () => {
    const header = document.getElementById("print-header-temp");
    const footer = document.getElementById("print-footer-temp");
    if (header) {
      header.remove();
      footer.remove();
    }
    window.removeEventListener("afterprint", removePrintHeader);
  };

  window.addEventListener("afterprint", removePrintHeader);
  document.head.appendChild(styleTag);
  window.print();
}

const PosSalesView = ({ data }) => {
  const user = useSelector((user) => user.loginSlice.login);
  const { toE164 } = usePhoneNormalize();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartData, setCartData] = useState(data?.products);
  const [discountAmount, setDiscountAmount] = useState(
    data?.payments?.discount,
  );
  const [adjustment, setAdjustment] = useState(data?.payments?.adjustment);
  const payment = data?.payments?.payment?.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const [billingAdd, setBillingAdd] = useState(data?.billing);

  // User Permission Check
  const { canDoOther, canDoOwn } = usePermission();

  const ownEdit = canDoOwn("POS", "edit");
  const othersEdit = canDoOther("POS", "edit");

  // Modal Options
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Discount calculation
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

  const handleOrderConfirm = async () => {
    if (!ownEdit || !othersEdit) {
      message.warning("You are not authorized");
      return; // stop execution
    }
    // try {
    //   const dueAmount = Number(
    //     cartData
    //       ?.reduce((sum, item) => sum + item.salePrice * item.quantity, 0)
    //       ?.toFixed(0) -
    //       Number(discountAmount)?.toFixed(0) +
    //       Number(
    //         cartData
    //           ?.reduce(
    //             (sum, item) =>
    //               sum + getDiscountedPrice(item) * (item?.VAT / 100),
    //             0,
    //           )
    //           ?.toFixed(2),
    //       ) -
    //       Number(adjustment) -
    //       Number(payment),
    //   )?.toFixed(2);

    //   if (dueAmount < 0) {
    //     message.warning("Payment exceeds the total amount due.");
    //     return; // stop execution
    //   }
    //   const normalNumber = toE164(billingAdd?.number);

    //   if (
    //     dueAmount > 0 &&
    //     (!billingAdd?.address || !billingAdd?.name || !billingAdd?.number)
    //   ) {
    //     message.warning("Need due billing details.");
    //     return; // stop execution
    //   }
    //   if (normalNumber?.length < 14) {
    //     message.warning("Incorrect Phone number");
    //     return; // stop execution
    //   }
    //   const oldpayment = data?.payments?.payment.reduce(
    //     (sum, item) => sum + item.amount,
    //     0,
    //   );
    //   const installment = {};
    //   if (oldpayment !== Number(payment)) {
    //     installment.receiveAmonut = Number(payment) - oldpayment;
    //     installment.receivedBy = user?.id;
    //   }

    //   const payload = {
    //     billing: {
    //       number: normalNumber,
    //       name: billingAdd.name,
    //       address: billingAdd.address,
    //     },
    //     payments: {
    //       ...data?.payments,
    //       adjustment: Number(adjustment),
    //       paymentBy: paymentBy,
    //       paymentRef: paymentRef,
    //       duePay: Number(dueAmount),
    //     },
    //     installment,
    //   };
    //   console.log(payload);
    //   await axios
    //     .post(
    //       `${import.meta.env.VITE_API_URL}/api/sales/SalesPOS/update/${
    //         data?._id
    //       }`,
    //       payload,
    //       {
    //         headers: {
    //           Authorization: import.meta.env.VITE_SECURE_API_KEY,
    //           token: user?.token,
    //         },
    //       },
    //     )
    //     .then((res) => {
    //       message.success(res.data.message);
    //       setIsModalOpen(false);
    //     });
    // } catch (error) {
    //   console.log(error);
    // }
  };
  return (
    <>
      <Button type="link" onClick={showModal}>
        {data?.code}
      </Button>
      <Modal
        title={`Invoce-${data?.code}`}
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            disabled={data?.products?.length > 0 ? false : true}
            icon={<PrinterOutlined />}
            onClick={() =>
              handlePrint(data?.code, user?.orgName, user?.orgAddress)
            }>
            Print
          </Button>,
          <Button
            disabled={data?.products?.length > 0 ? false : true}
            type="primary"
            icon={<DollarOutlined />}
            onClick={handleOrderConfirm}>
            Update
          </Button>,
        ]}>
        <Card className="print-page-modal" style={{ padding: "0" }}>
          <div style={{ textAlign: "center" }}>
            <Barcode128 value={String(data?.code)} />
          </div>
          <List
            itemLayout="horizontal"
            dataSource={cartData}
            renderItem={(item, index) => (
              <List.Item key={index}>
                <Flex style={{ flexFlow: "column", width: "auto" }}>
                  <Text strong>{`${item?.name}`}</Text>
                  <Text style={{ color: "#00000073" }}>
                    {`SKU: ${item?.SKU} | Cart: ${item?.quantity} ${item?.UOM}`}
                  </Text>
                </Flex>
                <Flex justify="end" style={{ minWidth: "100px" }}>
                  <Flex style={{ flexDirection: "column" }}>
                    <div style={{ textAlign: "right", paddingRight: "8px" }}>
                      <strike style={{ fontSize: "10px", marginRight: "8px" }}>
                        {item?.salePrice * item?.quantity !==
                          getDiscountedPrice(item) &&
                          `${item?.salePrice * item?.quantity} BDT`}
                      </strike>
                      <Text strong>
                        {getDiscountedPrice(item)?.toFixed(0)} BDT
                      </Text>
                    </div>
                    {item?.VAT > 0 && (
                      <div style={{ textAlign: "right", paddingRight: "8px" }}>
                        <Text style={{ fontSize: "10px", color: "#00000073" }}>
                          VAT:{" "}
                          {Number(
                            getDiscountedPrice(item) * (item?.VAT / 100),
                          )?.toFixed(2)}{" "}
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
              <Divider>Billing Details</Divider>
              <Form
                form={form}
                name="form"
                initialValue={{ ...data?.billing }}
                layout="vertical"
                onValuesChange={(changedValues, allValues) =>
                  setBillingAdd(allValues)
                }>
                <Form.Item
                  initialValue={data?.billing?.number}
                  name="number"
                  style={{ marginBottom: "10px" }}>
                  <Input variant="filled" placeholder="Customer Mobile" />
                </Form.Item>
                <Form.Item
                  initialValue={data?.billing?.name}
                  name="name"
                  style={{ marginBottom: "10px" }}>
                  <Input variant="filled" placeholder="Name" />
                </Form.Item>
                <Form.Item
                  initialValue={data?.billing?.address}
                  name="address"
                  style={{ marginBottom: "0px" }}>
                  <Input.TextArea
                    variant="filled"
                    rows={4}
                    placeholder="Address"
                  />
                </Form.Item>
              </Form>
            </div>
            <div>
              <Divider>Payment Details</Divider>
              <Flex style={{ flexDirection: "column" }}>
                <Flex justify="space-between">
                  <Text>Sub Total :</Text>
                  <Text>
                    {cartData
                      ?.reduce(
                        (sum, item) => sum + item.salePrice * item.quantity,
                        0,
                      )
                      ?.toFixed(0)}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>Discount :</Text>
                  <Text>{discountAmount?.toFixed(0)}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>VAT :</Text>
                  <Text>
                    {cartData
                      ?.reduce(
                        (sum, item) =>
                          sum + getDiscountedPrice(item) * (item?.VAT / 100),
                        0,
                      )
                      ?.toFixed(2)}
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
                      {Number(adjustment)?.toFixed(2)}
                    </Text>
                  </Flex>
                </Flex>
                <Flex justify="space-between">
                  <Text>Payment :</Text>
                  <Flex align="center" gap={4}>
                    <Text>{payment}</Text>
                  </Flex>
                </Flex>
                <Flex justify="space-between">
                  <Text strong>Due Pay :</Text>
                  <Text strong>
                    {Number(
                      cartData
                        ?.reduce(
                          (sum, item) => sum + item.salePrice * item.quantity,
                          0,
                        )
                        ?.toFixed(0) -
                        Number(discountAmount)?.toFixed(0) +
                        Number(
                          cartData
                            ?.reduce(
                              (sum, item) =>
                                sum +
                                getDiscountedPrice(item) * (item?.VAT / 100),
                              0,
                            )
                            ?.toFixed(2),
                        ) -
                        Number(adjustment) -
                        Number(payment),
                    )?.toFixed(2)}
                  </Text>
                </Flex>
              </Flex>
            </div>
          </Flex>
        </Card>
      </Modal>
    </>
  );
};
export default PosSalesView;
