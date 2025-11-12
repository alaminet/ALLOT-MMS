import React, { useState } from "react";
import {
  Button,
  Col,
  Row,
  Image,
  Upload,
  Table,
  Typography,
  Input,
  InputNumber,
  message,
  QRCode,
  Flex,
} from "antd";
import { PlusOutlined, PrinterOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import moment from "moment";
import { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { usePermission } from "../../../hooks/usePermission";
import NotAuth from "../../notAuth";
import NotFound from "../../notFound";
import numberToWords from "../../../hooks/useNumberToWords";
const { Title, Text } = Typography;
const { Column, ColumnGroup } = Table;

// Print layout
function handlePrint(layout = "A4 portrait") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    @media print {
        @page {
        size: ${layout};
      }
        p, div {
        font-size: 12px !important;
      }
    }
  `;
  document.head.appendChild(styleTag);
  window.print();
}

const PurchaseOrderPrintView = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const location = useLocation();
  const { refData } = location.state || {};
  const [inputValues, setInputValues] = useState({});
  const [businessDetails, setBusinessDetails] = useState();
  const [queryData, setQueryData] = useState([]);

  // User Permission Check
  const { canDoOwn, canDoOther, canAuthOther, canAuthOwn } = usePermission();
  const own = canDoOwn("purchase-order", "view");
  const others = canDoOther("purchase-order", "view");
  const ownCheck = canAuthOwn("purchase-order", "check");
  const othersCheck = canAuthOther("purchase-order", "check");
  const ownConfirm = canAuthOwn("purchase-order", "confirm");
  const othersConfirm = canAuthOther("purchase-order", "confirm");
  const ownApprove = canAuthOwn("purchase-order", "approve");
  const othersApprove = canAuthOther("purchase-order", "approve");
  const ownHold = canAuthOwn("purchase-order", "hold");
  const othersHold = canAuthOther("purchase-order", "hold");
  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 20,
      align: "center",
      render: (text, record, index) => index + 1,
    },
    {
      title: "PR Ref.",
      dataIndex: "PRCode",
      key: "PRCode",
      className: "cell-top-left",
    },
    {
      title: "Part Code",
      dataIndex: "code",
      key: "code",
      className: "cell-top-left",
      render: (text, record, index) => text?.SKU,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 300,
      className: "cell-top-left text-nowrap",
    },
    {
      title: "Spec.",
      dataIndex: "spec",
      key: "spec",
      width: 200,
      className: "cell-top-left",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      responsive: ["md"],
      className: "cell-top-left",
    },
    {
      title: "UOM",
      dataIndex: "UOM",
      key: "UOM",
      className: "cell-top-left",
    },
    {
      title: `Unit Price (${queryData?.POCurrency || "BDT"})`,
      dataIndex: "POPrice",
      key: "POPrice",
      responsive: ["md"],
      className: "cell-top-right",
      render: (text, record) =>
        new Intl.NumberFormat("en-BD", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record?.POPrice || 0),
    },
    {
      title: `% of VAT`,
      dataIndex: "reqPOVAT",
      key: "reqPOVAT",
      responsive: ["md"],
      className: "cell-top-right",
      render: (text, record) =>
        new Intl.NumberFormat("en-BD", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(text || 0),
    },
    {
      title: "PO Qty",
      dataIndex: "POQty",
      key: "POQty",
      responsive: ["md"],
      className: "cell-top-right",
    },

    {
      title: `PO Value (${queryData?.POCurrency || "BDT"})`,
      dataIndex: "POValue",
      key: "POValue",
      responsive: ["md"],
      className: "cell-top-right",
      render: (text, record) =>
        new Intl.NumberFormat("en-BD", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record?.POPrice * record?.POQty || 0),
    },
  ];

  // Get print data
  const getData = async () => {
    // const scope =
    //   own && others ? "all" : own ? "own" : others ? "others" : null;
    // if (!scope) {
    //   setQueryData([]);
    //   // message.warning("You are not authorized");
    //   return; // stop execution
    // }
    const payload = { scope: "all", POId: refData };
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/purchase/order/view-single`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          }
        )
        .then((res) => {
          // message.success(res?.data?.message);
          setQueryData(res?.data?.items);
        });
    } catch (error) {
      console.log(error);
    }
  };

  // Get Business Details
  const getBusinessDetails = async () => {
    try {
      await axios
        .get(`${import.meta.env.VITE_API_URL}/api/orgUser/view`, {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        })
        .then((res) => {
          const settings = res.data?.businessSettings;
          setBusinessDetails(settings);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  // Handle Status Update
  const handleStatusUpdate = async (values) => {
    const timeNow = moment(new Date());
    const payload = {
      status: values,
    };

    if (values == "Checked") {
      payload.checkedBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    if (values == "Confirmed") {
      payload.confirmedBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    if (values == "Approved") {
      payload.approvedBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    if (values == "Hold") {
      payload.holdBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    if (values == "Closed") {
      payload.closedBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/purchase/order/update/${
            queryData?._id
          }`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          }
        )
        .then((res) => {
          message.success(res.data.message);
          getData();
          getBusinessDetails();
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getData(), getBusinessDetails();
  }, []);

  // calculate total PO Value
  const TOtalPOValue = queryData?.itemDetails
    ?.reduce(
      (sum, item) =>
        sum +
        ((((item?.POPrice || 0) * (item?.reqPOVAT || 0)) / 100) *
          (item?.POQty || 0) +
          (item?.POPrice || 0) * (item?.POQty || 0)),
      0
    )
    .toFixed(2);

  return (
    <>
      {queryData.length == 0 ? (
        <NotFound />
      ) : (
        <>
          <div
            className="print-page"
            style={{ backgroundColor: "#fff", padding: "20px" }}>
            <Row justify="space-between">
              <Col span={6}></Col>
              <Col span={12}>
                <Typography style={{ textAlign: "center" }}>
                  <Title level={2} style={{ margin: "0", textWrap: "nowrap" }}>
                    {businessDetails?.orgName}
                  </Title>
                  <Text style={{ display: "block" }}>
                    {businessDetails?.businessAddress?.street}
                  </Text>
                  <Text style={{ display: "block" }}>
                    {businessDetails?.businessAddress?.city +
                      ", " +
                      businessDetails?.businessAddress?.country +
                      "-" +
                      businessDetails?.businessAddress?.postal +
                      ". #" +
                      businessDetails?.phone?.office}
                  </Text>
                  <Title level={4} style={{ margin: "0" }}>
                    PURCHASE ORDER (PO)
                  </Title>
                </Typography>
              </Col>
              <Col span={6}>
                <QRCode
                  value={`${window.location.href}?ref=${refData}`}
                  type="svg"
                  size={100}
                  style={{ margin: "0 0 0 auto" }}
                  bordered={false}
                />
              </Col>
            </Row>
            <Row justify="space-between" style={{ padding: "10px" }}>
              <Col span={8}>
                <p>
                  <strong>PO No.: </strong>
                  {queryData?.code}
                </p>
                <p>
                  <strong>Supplier Name: </strong>
                  {queryData?.supplier?.name}
                </p>
                <p>
                  <strong>Supplier Address: </strong>
                  {Object.values(queryData?.supplier?.officeAddress || {}).join(
                    ", "
                  )}
                  .
                </p>
                <p>
                  <strong>VAT No.: </strong>
                  {queryData?.supplier?.taxInfo?.BIN}
                </p>
                <p>
                  <strong>TIN No.: </strong>
                  {queryData?.supplier?.TIN}
                </p>
                <p>
                  <strong>Email: </strong>
                  {queryData?.supplier?.email?.office}
                </p>
                <p>
                  <strong>Contact: </strong>
                  {queryData?.supplier?.phone?.office}
                </p>
              </Col>
              <Col span={8}>
                <p>
                  <strong>Buyer Name: </strong>
                  {businessDetails?.orgName}
                </p>
                <p>
                  <strong>Buyer Address: </strong>
                  {Object.values(businessDetails?.officeAddress || {}).join(
                    ", "
                  )}
                  .
                </p>
                <p>
                  <strong>Buyer BIN Name: </strong>
                  {businessDetails?.taxInfo?.name}
                </p>
                <p>
                  <strong>Buyer BIN No.: </strong>
                  {businessDetails?.taxInfo?.BIN}
                </p>
                <p>
                  <strong>Buyer BIN Address: </strong>
                  {businessDetails?.taxInfo?.address}
                </p>
              </Col>
              <Col span={8}>
                <p>
                  <strong>Issue Date: </strong>
                  {moment(queryData?.createdAt).format("DD-MMM-YYYY")}
                </p>
                <p>
                  <strong>Delivery Date: </strong>
                  {moment(
                    queryData?.deliveryTarget || queryData?.createdAt
                  ).format("DD-MMM-YYYY")}
                </p>
                <p>
                  <strong>PO Status: </strong>
                  {queryData?.status}
                </p>
                <p>
                  <strong>Currency: </strong>
                  {queryData?.POCurrency || "BDT"}
                </p>
                <p>
                  <strong>Requested by: </strong>
                  {queryData?.requestedBy?.name}
                </p>
                <p>
                  <strong>Contact No.: </strong>
                  {queryData?.requestedBy?.contact}
                </p>
                <p>
                  <strong>PO Note: </strong>
                  {queryData?.note}
                </p>
              </Col>
            </Row>
            <Table
              bordered
              className="purchase-table"
              columns={columns}
              dataSource={queryData?.itemDetails}
              // title={() => "Header"}
              pagination={false}
              summary={() => {
                const totalQty = queryData?.itemDetails?.reduce(
                  (sum, item) => sum + (item?.POQty || 0),
                  0
                );
                const totalValue = queryData?.itemDetails?.reduce(
                  (sum, item) =>
                    sum + (item?.POPrice || 0) * (item?.POQty || 0),
                  0
                );
                const totalVat = queryData?.itemDetails?.reduce(
                  (sum, item) =>
                    sum +
                    (((item?.POPrice || 0) * (item?.reqPOVAT || 0)) / 100) *
                      (item?.POQty || 0),
                  0
                );
                return (
                  <>
                    <Table.Summary.Row style={{ textAlign: "right" }}>
                      <Table.Summary.Cell index={0} colSpan={9}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <strong>{totalQty}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>
                          {new Intl.NumberFormat("en-BD", {
                            minimumFractionDigits: 2,
                          }).format(totalValue)}
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row style={{ textAlign: "right" }}>
                      <Table.Summary.Cell index={0} colSpan={9}>
                        <strong>VAT Amount</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} colSpan={2}>
                        <strong>
                          {new Intl.NumberFormat("en-BD", {
                            minimumFractionDigits: 2,
                          }).format(totalVat)}
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row style={{ textAlign: "right" }}>
                      <Table.Summary.Cell index={0} colSpan={9}>
                        <strong>Grand Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} colSpan={2}>
                        <strong>
                          {new Intl.NumberFormat("en-BD", {
                            minimumFractionDigits: 2,
                          }).format(totalValue + totalVat)}
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                );
              }}
            />
            <Row style={{ margin: "10px 0" }}>
              <Col span={24}>
                <strong>Total Amount In Word:</strong>{" "}
                {numberToWords(TOtalPOValue).toUpperCase()}{" "}
                {queryData?.POCurrency || "BDT"} ONLY.
              </Col>
            </Row>
            <Row>
              <Col
                span={6}
                style={{ border: "1px solid black", padding: "5px" }}>
                <strong>Delivery Terms:</strong>
              </Col>
              <Col
                span={18}
                style={{ border: "1px solid black", padding: "5px" }}>
                {queryData?.delveryTerms?.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Col>
            </Row>
            <Row>
              <Col
                span={6}
                style={{ border: "1px solid black", padding: "5px" }}>
                <strong>Delivery Location:</strong>
              </Col>
              <Col
                span={18}
                style={{ border: "1px solid black", padding: "5px" }}>
                {queryData?.deliveryLocation?.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Col>
            </Row>
            <Row>
              <Col
                span={6}
                style={{ border: "1px solid black", padding: "5px" }}>
                <strong>Bill Submission:</strong>
              </Col>
              <Col
                span={18}
                style={{ border: "1px solid black", padding: "5px" }}>
                {queryData?.billingLocation?.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Col>
            </Row>
            <Row>
              <Col
                span={6}
                style={{ border: "1px solid black", padding: "5px" }}>
                <strong>Documents to be submitted with the bill:</strong>
              </Col>
              <Col
                span={18}
                style={{ border: "1px solid black", padding: "5px" }}>
                {queryData?.requiredDoc?.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Col>
            </Row>
            <Row>
              <Col
                span={6}
                style={{ border: "1px solid black", padding: "5px" }}>
                <strong>Payment Terms:</strong>
              </Col>
              <Col
                span={18}
                style={{ border: "1px solid black", padding: "5px" }}>
                {queryData?.paymentTerms?.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Col>
            </Row>
            <Row>
              <Col
                span={6}
                style={{ border: "1px solid black", padding: "5px" }}>
                <strong>Payment Mode:</strong>
              </Col>
              <Col
                span={18}
                style={{ border: "1px solid black", padding: "5px" }}>
                {queryData?.paymentMode?.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Col>
            </Row>
            <Row justify="space-between" style={{ marginTop: "50px" }}>
              <Col
                span={4}
                style={{
                  textAlign: "center",
                  borderTop: "1px solid black",
                }}>
                Prepared By
                <span style={{ display: "block" }}>
                  {queryData?.createdBy?.name}
                </span>
                <span style={{ display: "block" }}>
                  {businessDetails?.orgName}
                </span>
              </Col>
              <Col
                span={4}
                style={{ textAlign: "center", borderTop: "1px solid black" }}>
                Checked By
                <span style={{ display: "block" }}>
                  {queryData?.checkedBy?.name}
                </span>
                <span style={{ display: "block" }}>
                  {businessDetails?.orgName}
                </span>
              </Col>
              <Col
                span={4}
                style={{ textAlign: "center", borderTop: "1px solid black" }}>
                Confirmed By
                <span style={{ display: "block" }}>
                  {queryData?.confirmedBy?.name}
                </span>
                <span style={{ display: "block" }}>
                  {businessDetails?.orgName}
                </span>
              </Col>
              <Col
                span={4}
                style={{ textAlign: "center", borderTop: "1px solid black" }}>
                Approved By
                <span style={{ display: "block" }}>
                  {queryData?.approvedBy?.name}
                </span>
                <span style={{ display: "block" }}>
                  {businessDetails?.orgName}
                </span>
              </Col>
              <Col
                span={4}
                style={{ textAlign: "center", borderTop: "1px solid black" }}>
                Accepted By
                <span style={{ display: "block" }}>
                  {queryData?.supplier?.name}
                </span>
              </Col>
            </Row>
            <Flex gap={16} style={{ marginTop: "16px" }}>
              <Button
                type="dashed"
                className="no-print"
                onClick={() => handlePrint("A4 portrait")}>
                <PrinterOutlined />
              </Button>
              {((ownCheck && user?.id === queryData?.createdBy?._id) ||
                (othersCheck && user?.id !== queryData?.createdBy?._id)) &&
              queryData?.status == "In-Process" ? (
                <Button
                  type="primary"
                  className="no-print"
                  onClick={() => handleStatusUpdate("Checked")}>
                  Checked
                </Button>
              ) : ((ownConfirm && user?.id === queryData?.createdBy?._id) ||
                  (othersConfirm && user?.id !== queryData?.createdBy?._id)) &&
                queryData?.status == "Checked" ? (
                <Button
                  type="primary"
                  className="no-print"
                  onClick={() => handleStatusUpdate("Confirmed")}>
                  Confirmed
                </Button>
              ) : ((ownApprove && user?.id === queryData?.createdBy?._id) ||
                  (othersApprove && user?.id !== queryData?.createdBy?._id)) &&
                queryData?.status == "Confirmed" ? (
                <Button
                  type="primary"
                  className="no-print"
                  onClick={() => handleStatusUpdate("Approved")}>
                  Approved
                </Button>
              ) : null}
              {((ownHold && user?.id === queryData?.createdBy?._id) ||
                (othersHold && user?.id !== queryData?.createdBy?._id)) &&
              queryData?.status !== "Hold" &&
              queryData?.status !== "Closed" &&
              queryData?.status !== "Approved" ? (
                <Button
                  className="no-print"
                  color="danger"
                  variant="outlined"
                  onClick={() => handleStatusUpdate("Hold")}>
                  Hold
                </Button>
              ) : null}
              {queryData?.createdBy?._id === user?.id &&
              queryData?.status !== "Closed" ? (
                <Button
                  className="no-print"
                  color="danger"
                  variant="outlined"
                  onClick={() => handleStatusUpdate("Closed")}>
                  Closed
                </Button>
              ) : null}
            </Flex>
          </div>
        </>
      )}
    </>
  );
};

export default PurchaseOrderPrintView;
