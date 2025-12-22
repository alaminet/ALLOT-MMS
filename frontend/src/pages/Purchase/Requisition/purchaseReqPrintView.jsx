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
import { usePermission } from "../../../hooks/usePermission";
import NotAuth from "../../notAuth";
import { useSelector } from "react-redux";
import NotFound from "../../notFound";
const { Title, Text } = Typography;
const { Column, ColumnGroup } = Table;

// Print layout
function handlePrint(layout = "A4 landscape") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    @media print {
      @page {
        size: ${layout};
      }
      p{
      font-size: 12px;
      }
    }
  `;
  document.head.appendChild(styleTag);
  window.print();
}

const PurchaseReqPrintView = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const location = useLocation();
  const { refData } = location.state || {};
  const [inputValues, setInputValues] = useState({});
  const [businessDetails, setBusinessDetails] = useState();
  const [queryData, setQueryData] = useState([]);

  // User Permission Check
  const { canDoOwn, canDoOther, canAuthOther, canAuthOwn } = usePermission();
  const own = canDoOwn("purchase-requisition", "view");
  const others = canDoOther("purchase-requisition", "view");
  const ownCheck = canAuthOwn("purchase-requisition", "check");
  const othersCheck = canAuthOther("purchase-requisition", "check");
  const ownConfirm = canAuthOwn("purchase-requisition", "confirm");
  const othersConfirm = canAuthOther("purchase-requisition", "confirm");
  const ownApprove = canAuthOwn("purchase-requisition", "approve");
  const othersApprove = canAuthOther("purchase-requisition", "approve");
  const ownHold = canAuthOwn("purchase-requisition", "hold");
  const othersHold = canAuthOther("purchase-requisition", "hold");

  // image upload
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
  const uploadButton = (
    <button
      className="no-print"
      style={{ border: 0, background: "none" }}
      type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

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
      title: "Part Code",
      dataIndex: "code",
      key: "code",
      className: "cell-top-left",
      render: (text, record, index) => text?.SKU || record?.SKU || "NA",
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
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      className: "cell-top-left",
    },
    {
      title: "UOM",
      dataIndex: "UOM",
      key: "UOM",
      className: "cell-top-left",
    },
    {
      title: "Unit Price (BDT)",
      dataIndex: "unitPrice",
      key: "unitPrice",
      responsive: ["md"],
      className: "cell-top-right",
      render: (text, record) =>
        new Intl.NumberFormat("en-BD", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record?.unitPrice || 0),
    },
    {
      title: "Req. Qty",
      dataIndex: "reqQty",
      key: "reqQty",
      responsive: ["md"],
      className: "cell-top-right",
    },

    {
      title: "Req. Value (BDT)",
      dataIndex: "reqValue",
      key: "reqValue",
      responsive: ["md"],
      className: "cell-top-right",
      render: (text, record) =>
        new Intl.NumberFormat("en-BD", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record?.unitPrice * record?.reqQty || 0),
    },
    {
      title: "On-Hand Stock",
      dataIndex: "onHandQty",
      key: "onHandQty",
      responsive: ["md"],
      className: "cell-top-right",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      responsive: ["md"],
      className: "cell-top-left",
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
    const id = window.location.search
      ? new URLSearchParams(window.location.search).get("ref")
      : refData;
    const payload = { scope: "all", prId: id };
    try {
      await axios
        .post(
          `${
            import.meta.env.VITE_API_URL
          }/api/purchase/requisition/view-single`,
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
          if (settings) {
            form.setFieldsValue(settings);
          }
        });
    } catch (error) {
      setLoading(false);
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
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/purchase/requisition/update/${
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
    getData();
    getBusinessDetails();
  }, []);

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
                  <Title level={2} style={{ margin: "0" }}>
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
                    PURCHASE REQUISITION FORM
                  </Title>
                </Typography>
              </Col>
              <Col span={6}>
                <QRCode
                  value={
                    window.location.search
                      ? window.location.href
                      : `${window.location.href}?ref=${refData}`
                  }
                  type="svg"
                  size={100}
                  style={{ margin: "0 0 0 auto" }}
                  bordered={false}
                />
              </Col>
            </Row>
            <Row justify="space-between" style={{ padding: "10px" }}>
              <Col>
                <p>
                  <strong>PR No.: </strong>
                  {queryData?.code}
                </p>
                <p>
                  <strong>Referance: </strong>
                  {queryData?.reference}
                </p>
                <p>
                  <strong>Requested By: </strong>
                  {queryData?.requestedBy?.name}
                </p>
              </Col>
              <Col>
                <p>
                  <strong>Department: </strong>
                  {queryData?.costCenter?.name}
                </p>
                <p>
                  <strong>Email: </strong>
                  {queryData?.requestedBy?.email}
                </p>
                <p>
                  <strong>Phone No.: </strong>
                  {queryData?.requestedBy?.contact}
                </p>
              </Col>
              <Col>
                <p>
                  <strong>Req. Date: </strong>
                  {moment(queryData?.createdAt).format("DD-MMM-YYYY")}
                </p>
                <p>
                  <strong>PR Status: </strong>
                  {queryData?.status}
                </p>
                <p>
                  <strong>Update On: </strong>
                  {moment(queryData?.updatedAt).format("DD-MMM-YYYY")}
                </p>
              </Col>
            </Row>
            <Table
              // bordered
              className="purchase-table"
              columns={columns}
              dataSource={queryData?.itemDetails}
              // title={() => "Header"}
              pagination={false}
              summary={() => {
                const totalQty = queryData?.itemDetails?.reduce(
                  (sum, item) => sum + (item?.reqQty || 0),
                  0
                );
                const totalValue = queryData?.itemDetails?.reduce(
                  (sum, item) =>
                    sum + (item?.unitPrice || 0) * (item?.reqQty || 0),
                  0
                );

                return (
                  <Table.Summary.Row style={{ textAlign: "right" }}>
                    <Table.Summary.Cell index={0} colSpan={7}>
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
                    <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
            <Row style={{ margin: "10px 0" }}>
              <Col span={6}>
                <span style={{ display: "block" }}>
                  <strong>Note:</strong> {queryData?.note}
                </span>
              </Col>
              <Col>
                <div>
                  <Upload
                    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}>
                    {fileList.length >= 8 ? null : uploadButton}
                  </Upload>
                  {previewImage && (
                    <Image
                      wrapperStyle={{ display: "none" }}
                      preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) =>
                          !visible && setPreviewImage(""),
                      }}
                      src={previewImage}
                    />
                  )}
                </div>
              </Col>
            </Row>
            <Row justify="space-between" style={{ marginTop: "50px" }}>
              <Col
                span={5}
                style={{
                  textAlign: "center",
                  borderTop: "1px solid black",
                  fontSize: "12px",
                }}>
                Prepared By
                <span style={{ display: "block" }}>
                  {queryData?.createdBy?.name}
                </span>
              </Col>
              <Col
                span={5}
                style={{
                  textAlign: "center",
                  borderTop: "1px solid black",
                  fontSize: "12px",
                }}>
                Checked By
                <span style={{ display: "block" }}>
                  {queryData?.confirmedBy?.name}
                </span>
              </Col>
              <Col
                span={5}
                style={{
                  textAlign: "center",
                  borderTop: "1px solid black",
                  fontSize: "12px",
                }}>
                Confirmed By
                <span style={{ display: "block" }}>
                  {queryData?.checkedBy?.name}
                </span>
              </Col>
              <Col
                span={5}
                style={{
                  textAlign: "center",
                  borderTop: "1px solid black",
                  fontSize: "12px",
                }}>
                Approved By
                <span style={{ display: "block" }}>
                  {queryData?.approvedBy?.name}
                </span>
              </Col>
            </Row>
            <Table
              // bordered
              className="justification-table"
              pagination={false}
              // dataSource={data}
              dataSource={queryData?.itemDetails}>
              <ColumnGroup title="Justification of Purchage Requisition">
                <Column
                  title="Item Name"
                  dataIndex="name"
                  key="name"
                  width={200}
                  // render={(text, record, index) => index + 1}
                />
                <Column
                  align="center"
                  title="Last 6M Used"
                  dataIndex="sixMonthUsed"
                  key="sixMonthUsed"
                  render={(_, record, index) => (
                    <InputNumber
                      min={0}
                      defaultValue={_ || 0}
                      onChange={(value) =>
                        setInputValues((prev) => ({
                          ...prev,
                          [index]: {
                            ...prev[index],
                            sixMonthUsed: value,
                          },
                        }))
                      }
                      variant="borderless"
                    />
                  )}
                />
                <Column
                  align="center"
                  title="Consumption Rate"
                  dataIndex="consumptionRate"
                  key="consumptionRate"
                  render={(_, record) => <Input variant="borderless" />}
                />
                <Column
                  align="center"
                  title="Stock in Hand [A]"
                  dataIndex="stockInHand"
                  key="stockInHand"
                  render={(_, record, index) => (
                    <InputNumber
                      min={0}
                      defaultValue={0}
                      variant="borderless"
                      onChange={(value) =>
                        setInputValues((prev) => ({
                          ...prev,
                          [index]: {
                            ...prev[index],
                            stockInHand: value,
                          },
                        }))
                      }
                    />
                  )}
                />
                <Column
                  align="center"
                  title="Stock in Store [B]"
                  dataIndex="onHandQty"
                  key="onHandQty"
                  render={(_, record, index) => (
                    <InputNumber
                      min={0}
                      defaultValue={_}
                      onChange={(value) =>
                        setInputValues((prev) => ({
                          ...prev,
                          [index]: {
                            ...prev[index],
                            onHandQty: value,
                          },
                        }))
                      }
                      variant="borderless"
                    />
                  )}
                />
                <Column
                  align="center"
                  title="Ordered Qty [C]"
                  dataIndex="POQty"
                  key="POQty"
                  render={(_, record, index) => (
                    <InputNumber
                      min={0}
                      defaultValue={_}
                      onChange={(value) =>
                        setInputValues((prev) => ({
                          ...prev,
                          [index]: {
                            ...prev[index],
                            POQty: value,
                          },
                        }))
                      }
                      variant="borderless"
                    />
                  )}
                />
                <Column
                  align="center"
                  title="Total [D=A+B+C]"
                  dataIndex="totalStock"
                  key="totalStock"
                  render={(_, record, index) => {
                    const values = inputValues[index] || {};
                    const stockInHand = values?.stockInHand || 0; // A
                    const onHandQty =
                      values?.onHandQty || record?.onHandQty || 0; // B
                    const POQty = values?.POQty || record?.POQty || 0; // C
                    const total = stockInHand + onHandQty + POQty;
                    return new Intl.NumberFormat("en-BD", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(total);
                  }}
                />
                <Column
                  align="center"
                  title="Purpose"
                  dataIndex="consumePlan"
                  key="consumePlan"
                  render={(_, record) => (
                    <Input defaultValue={_} variant="borderless" />
                  )}
                />
                <Column
                  align="center"
                  title="Approved Design [Y/N]"
                  dataIndex="appDesign"
                  key="appDesign"
                  render={(_, record) => <Input variant="borderless" />}
                />
              </ColumnGroup>
            </Table>
            <Flex gap={16} style={{ marginTop: "16px" }}>
              <Button
                type="dashed"
                className="no-print"
                onClick={() => handlePrint("A4 landscape")}>
                <PrinterOutlined />
              </Button>
              {((ownCheck &&
                user?.costCenterName == queryData?.costCenter?.name) ||
                (othersCheck &&
                  user?.costCenterName !== queryData?.costCenter?.name)) &&
              queryData?.status == "In-Process" ? (
                <Button
                  type="primary"
                  className="no-print"
                  onClick={() => handleStatusUpdate("Checked")}>
                  Checked
                </Button>
              ) : ((ownConfirm &&
                  user?.costCenterName == queryData?.costCenter?.name) ||
                  (othersConfirm &&
                    user?.costCenterName !== queryData?.costCenter?.name)) &&
                queryData?.status == "Checked" ? (
                <Button
                  type="primary"
                  className="no-print"
                  onClick={() => handleStatusUpdate("Confirmed")}>
                  Confirmed
                </Button>
              ) : ((ownApprove &&
                  user?.costCenterName == queryData?.costCenter?.name) ||
                  (othersApprove &&
                    user?.costCenterName !== queryData?.costCenter?.name)) &&
                queryData?.status == "Confirmed" ? (
                <Button
                  type="primary"
                  className="no-print"
                  onClick={() => handleStatusUpdate("Approved")}>
                  Approved
                </Button>
              ) : null}
              {((ownHold &&
                user?.costCenterName == queryData?.costCenter?.name) ||
                (othersHold &&
                  user?.costCenterName !== queryData?.costCenter?.name)) &&
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

export default PurchaseReqPrintView;
