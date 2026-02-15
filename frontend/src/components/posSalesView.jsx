import React, { useRef, useState } from "react";
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
  Popover,
  Typography,
  InputNumber,
} from "antd";
import {
  DiffOutlined,
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
import TakePOSPayment from "./takePOSPayment";
import moment from "moment";
const { Title, Text } = Typography;
import html2canvas from "html2canvas";

// 128 Bar code
function Barcode128({ value }) {
  return (
    <Barcode
      value={value} // your data string
      format="CODE128" // specify Code 128
      width={2} // bar width
      height={25} // bar height
      displayValue={false} // show text below barcode
    />
  );
}

// Print layout
function handlePrint(invId, orgName, orgLoc) {
  const orgAdd = Object.values(orgLoc).reverse().join(", ");
  const styleTag = document.createElement("style");
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
        .no-print{
        display: none !important;
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
    <div style="font-size: 12px; font-weight: bold;">Invoice: ${invId || "---"}</div>
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
  const printRef = useRef();
  const user = useSelector((user) => user.loginSlice.login);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const { toE164 } = usePhoneNormalize();
  const [form] = Form.useForm();
  const [formPay] = Form.useForm();
  const [cartData, setCartData] = useState(data?.products);
  const [payList, setPayList] = useState(data?.payments?.payment);
  const [discountAmount, setDiscountAmount] = useState(
    data?.payments?.discount,
  );
  const [adjustment, setAdjustment] = useState(data?.payments?.adjustment);
  const [payment, setPayment] = useState(
    data?.payments?.payment?.reduce((sum, item) => sum + item.amount, 0),
  );

  // User Permission Check
  const { canDoOther, canDoOwn } = usePermission();

  const ownEdit = canDoOwn("POS", "edit");
  const othersEdit = canDoOther("POS", "edit");

  // Print Action
  // const handlePrint = async () => {
  //   if (!printRef.current) return;

  //   // Capture the Row content as canvas
  //   const canvas = await html2canvas(printRef.current, {
  //     scale: 2, // sharper image
  //     useCORS: true,
  //     backgroundColor: "#fff",
  //   });

  //   const imgData = canvas.toDataURL("image/png");

  //   // Open a new tab
  //   const printWindow = window.open("", "_blank", "width=80");

  //   // Write HTML into the new tab
  //   printWindow.document.write(`
  //   <html>
  //     <head>
  //       <title>Print Labels</title>
  //       <style>
  //         @page {  margin: 10mm; }
  //         body { text-align: center; }
  //         img { max-width: 100%; height: auto; }
  //       </style>
  //     </head>
  //     <body>
  //       <img src="${imgData}" />
  //     </body>
  //   </html>
  // `);

  //   printWindow.document.close();
  //   printWindow.focus();
  //   printWindow.print();
  // };

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

  // Pay Modal Options
  const showPayModal = () => {
    setIsPayModalOpen(true);
  };
  const handlePayOk = () => {
    setIsPayModalOpen(false);
  };
  const handlePayCancel = () => {
    setIsPayModalOpen(false);
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

  let duePay = Number(
    cartData
      ?.reduce((sum, item) => sum + item.salePrice * item.quantity, 0)
      ?.toFixed(0) -
      discountAmount +
      Number(
        cartData
          ?.reduce(
            (sum, item) => sum + getDiscountedPrice(item) * (item?.VAT / 100),
            0,
          )
          ?.toFixed(2),
      ) -
      Number(adjustment) -
      Number(payment),
  )?.toFixed(2);

  //   Update Functional
  const handleChange = async (id, field, data) => {
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/sales/SalesPOS/update/${id}`,
          { [field]: data },
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          },
        )
        .then(async (res) => {
          if (field === "payments.adjustment") {
            message.success(res.data.message);
            setAdjustment(data);
          }
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  // update Payment
  const handlePaySubmit = async (values) => {
    setLoading(true);
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/sales/SalesPOS/update-payment/${data?._id}`,
          values,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          },
        )
        .then((res) => {
          const newpay = payment + Number(values.amount);
          setPayment(newpay);
          // Append new payment to existing payList array
          const newPaymentEntry = {
            ...values,
            amount: Number(values.amount),
            receBy: user?.id,
            createdAt: moment().toISOString(),
          };
          setPayList((prevPayList) =>
            Array.isArray(prevPayList)
              ? [...prevPayList, newPaymentEntry]
              : [newPaymentEntry],
          );
          message.success(res.data.message);
          formPay.resetFields();
          setIsPayModalOpen(false);
          setLoading(true);
        });
    } catch (error) {
      message.error(error.response?.data?.error || "Error submitting payment");
      setLoading(true);
    }
  };
  return (
    <>
      <Button type="link" onClick={showModal}>
        {data?.code}
      </Button>
      <Modal
        title={`Invoice-${data?.code}`}
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            className="no-print"
            disabled={data?.products?.length > 0 ? false : true}
            icon={<PrinterOutlined />}
            onClick={() =>
              handlePrint(data?.code, user?.orgName, user?.orgAddress)
            }>
            Print
          </Button>,
          <Button
            className="no-print"
            type="primary"
            icon={<DiffOutlined />}
            onClick={showPayModal}>
            Take Pay
          </Button>,
        ]}>
        <Card
          ref={printRef}
          className="print-page-modal"
          style={{ padding: "0" }}>
          <div style={{ textAlign: "center" }}></div>
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
                initialValues={{ ...data?.billing }}
                layout="vertical"
                onValuesChange={(changedValues, allValues) =>
                  handleChange(data?._id, "billing", allValues)
                }>
                <Form.Item name="number" style={{ marginBottom: "10px" }}>
                  <Input variant="filled" placeholder="Customer Mobile" />
                </Form.Item>
                <Form.Item name="name" style={{ marginBottom: "10px" }}>
                  <Input variant="filled" placeholder="Name" />
                </Form.Item>
                <Form.Item name="address" style={{ marginBottom: "0px" }}>
                  <Input.TextArea
                    variant="filled"
                    rows={3}
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
                  <Text>{discountAmount}</Text>
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
                        onChange: (value) =>
                          handleChange(
                            data?._id,
                            "payments.adjustment",
                            Number(value).toFixed(2),
                          ),
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
                  <Text strong>{duePay}</Text>
                </Flex>
              </Flex>
              <Barcode128 value={String(data?.code)} />
            </div>
          </Flex>
          <div>
            <Text strong>Payment History</Text>
            {payList?.map(
              (item, j) =>
                item?.amount !== 0 && (
                  <Flex key={j} gap={6}>
                    <Text>
                      {+j}. {moment(item?.payAt).format("DD-MM-YY hh:mm A")}
                    </Text>
                    <Text>{item?.amount} BDT</Text>
                    <Text>{item?.payBy}</Text>
                    <Text>{item?.payRef}</Text>
                  </Flex>
                ),
            )}
          </div>
        </Card>
      </Modal>
      <Modal
        title={`Payment - ${data?.code}`}
        closable={{ "aria-label": "Custom Close Button" }}
        open={isPayModalOpen}
        // onOk={handleOk}
        footer={false}
        onCancel={handlePayCancel}>
        <div>
          <Form
            layout="vertical"
            form={formPay}
            name="formPay"
            onFinish={handlePaySubmit}
            initialValues={{ amount: duePay, payBy: "Cash", payRef: "" }}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: "Amount is required" }]}>
              <InputNumber
                placeholder="Amount"
                min={0}
                max={duePay}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item name="payBy" label="Pay By">
              <Input placeholder="Cash, Card, Bank" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="payRef" label="Payment Ref.">
              <Input
                placeholder="Reference (Optional)"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" block danger>
                Confirm Payment
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};
export default PosSalesView;
