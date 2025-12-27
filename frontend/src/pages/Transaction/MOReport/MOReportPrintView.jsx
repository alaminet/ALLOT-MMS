import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";
import NotFound from "../../notFound";
import NotAuth from "../../notAuth";
import { Col, Row, Table, Typography, Flex, Button, QRCode } from "antd";
import moment from "moment";
import { PrinterOutlined } from "@ant-design/icons";
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
    }
  `;
  document.head.appendChild(styleTag);
  window.print();
}

const MOReportPrintView = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const code = query.get("mo");
  const [queryData, setQueryData] = useState();
  const [businessDetails, setBusinessDetails] = useState();

  // User Permission Check
  const { canDoOwn, canDoOther, canAuthOther, canAuthOwn } = usePermission();
  const own = canDoOwn("move-order", "view");
  const others = canDoOther("move-order", "view");
  const ownCheck = canAuthOwn("move-order", "check");
  const othersCheck = canAuthOther("move-order", "check");
  const ownConfirm = canAuthOwn("move-order", "confirm");
  const othersConfirm = canAuthOther("move-order", "confirm");
  const ownApprove = canAuthOwn("move-order", "approve");
  const othersApprove = canAuthOther("move-order", "approve");
  const ownHold = canAuthOwn("move-order", "hold");
  const othersHold = canAuthOther("move-order", "hold");

  // Get the transaction details
  const getDetails = async () => {
    setQueryData(null);
    const payload = { scope: "all", code: code };
    try {
      await axios
        .post(
          `${
            import.meta.env.VITE_API_URL
          }/api/transaction/move-order/view-single`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          }
        )
        .then((res) => {
          setQueryData(res?.data?.items || null);
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
          `${import.meta.env.VITE_API_URL}/api/transaction/move-order/update/${
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
          setOpen(false);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };
  useEffect(() => {
    getDetails();
    getBusinessDetails();
  }, []);
  console.log(queryData);

  return (
    <>
      {!queryData ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <NotFound />
        </div>
      ) : (
        <div
          className="print-page"
          style={{ backgroundColor: "#fff", padding: "20px" }}>
          <Row justify="center">
            <Col span={4}></Col>
            <Col span={16}>
              <Typography style={{ textAlign: "center" }}>
                <Title style={{ margin: "0" }}>
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
                <Title level={3} style={{ margin: "0" }}>
                  Move Order Details Report
                </Title>
              </Typography>
            </Col>
            <Col span={4}>
              <QRCode
                value={`${window.location.href}`}
                type="svg"
                size={100}
                style={{ margin: "0 0 0 auto" }}
                bordered={false}
              />
            </Col>
          </Row>
          <Row justify="space-between" style={{ padding: "20px" }}>
            <Col span={8}>
              <p>
                <strong>MO.ID: </strong>
                {queryData?.code}
              </p>
              <p>
                <strong>MO.Type: </strong>
                Move Order
              </p>
              <p>
                <strong>Ref.: </strong>
                {queryData?.reference}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <strong>Req. Date: </strong>
                {moment(queryData?.createdAt).format("DD-MMM-YYYY")}
              </p>
              <p>
                <strong>Req. By: </strong>
                {queryData?.requestedBy?.name}
              </p>
              <p>
                <strong>Dept.: </strong>
                {queryData?.costCenter?.name}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <strong>Updated At: </strong>
                {moment(queryData?.updatedAt).format("DD-MMM-YYYY")}
              </p>
              <p>
                <strong>Status: </strong>
                {queryData?.status}
              </p>
              <p>
                <strong>Updated By: </strong>
                {queryData?.updatedBy?.name}
              </p>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                bordered
                className="justification-table"
                pagination={false}
                dataSource={queryData?.itemDetails}
                summary={() => {
                  const totalQty = queryData?.itemDetails.reduce(
                    (sum, item) => sum + (item?.reqQty || 0),
                    0
                  );
                  const totalTnxQty = queryData?.itemDetails.reduce(
                    (sum, item) => sum + (item?.issueQty || 0),
                    0
                  );
                  const totalValue = queryData?.itemDetails.reduce(
                    (sum, item) =>
                      sum + (item?.code?.avgPrice || 0) * (item?.reqQty || 0),
                    0
                  );

                  return (
                    <Table.Summary.Row style={{ textAlign: "right" }}>
                      <Table.Summary.Cell index={0} colSpan={7}>
                        <strong>Total=</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <strong>
                          {new Intl.NumberFormat("en-BD", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(totalQty || 0)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>
                          {new Intl.NumberFormat("en-BD", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(totalTnxQty || 0)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>
                          {new Intl.NumberFormat("en-BD", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(totalValue || 0)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={4}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}>
                <ColumnGroup>
                  <Column
                    title="SL"
                    dataIndex="key"
                    key="key"
                    width={30}
                    align="center"
                    render={(text, record, index) => index + 1}
                  />
                  <Column
                    title="Available"
                    dataIndex="code"
                    key="code"
                    render={(text, record, index) =>
                      text?.stock?.map((st) => (
                        <p
                          style={{
                            display: "block",
                          }}>{`${st?.location}(${st?.onHandQty})`}</p>
                      ))
                    }
                  />
                  <Column title="Item SKU" dataIndex="SKU" key="SKU" />
                  <Column
                    title="Item Name"
                    dataIndex="name"
                    key="name"
                    width={350}
                  />
                  <Column title="UOM" dataIndex="UOM" key="UOM" />
                  <Column
                    title="Unit Price"
                    align="right"
                    render={(text, record, index) =>
                      new Intl.NumberFormat("en-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(record?.code?.avgPrice || 0)
                    }
                  />
                  <Column
                    title="On-Hand"
                    align="right"
                    render={(text, record, index) =>
                      new Intl.NumberFormat("en-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(
                        record?.code?.stock.reduce(
                          (sum, item) => sum + (item.onHandQty || 0),
                          0
                        )
                      )
                    }
                  />
                  <Column
                    title="Req. Qty"
                    align="right"
                    render={(text, record, index) =>
                      new Intl.NumberFormat("en-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(record?.reqQty || 0)
                    }
                  />
                  <Column
                    title="Tnx. Qty"
                    align="right"
                    render={(text, record, index) =>
                      new Intl.NumberFormat("en-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(record?.issueQty || 0)
                    }
                  />
                  <Column
                    title="Tnx. Value"
                    align="right"
                    render={(text, record, index) =>
                      new Intl.NumberFormat("en-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(record?.code?.avgPrice * record?.issueQty)
                    }
                  />
                  <Column
                    title="1M Used"
                    align="right"
                    dataIndex="runningMonthUsed"
                    key="runningMonthUsed"
                    render={(text, record, index) =>
                      new Intl.NumberFormat("en-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(text || 0)
                    }
                  />
                  <Column
                    title="6M Used"
                    align="right"
                    dataIndex="sixMonthUsed"
                    key="sixMonthUsed"
                    render={(text, record, index) =>
                      new Intl.NumberFormat("en-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(text || 0)
                    }
                  />
                  <Column title="Remarks" dataIndex="remarks" key="remarks" />
                </ColumnGroup>
              </Table>
            </Col>
          </Row>
          <Row justify="space-between" style={{ marginTop: "50px" }}>
            <Col
              span={5}
              style={{
                textAlign: "center",
                borderTop: "1px solid black",
              }}>
              Prepared By
              <span style={{ display: "block" }}>
                {queryData?.createdBy.name}
              </span>
            </Col>
            <Col
              span={5}
              style={{ textAlign: "center", borderTop: "1px solid black" }}>
              Checked By
              <span style={{ display: "block" }}>
                {queryData?.confirmedBy?.name}
              </span>
            </Col>
            <Col
              span={5}
              style={{ textAlign: "center", borderTop: "1px solid black" }}>
              Confirmed By
              <span style={{ display: "block" }}>
                {queryData?.checkedBy?.name}
              </span>
            </Col>
            <Col
              span={5}
              style={{ textAlign: "center", borderTop: "1px solid black" }}>
              Approved By
              <span style={{ display: "block" }}>
                {queryData?.approvedBy?.name}
              </span>
            </Col>
          </Row>
          <Flex style={{ marginTop: "10px" }} gap={16}>
            <Button
              className="no-print"
              type="primary"
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
            {(queryData?.createdBy?._id === user?.id &&
              queryData?.status !== "Closed") ||
            (ownHold &&
              user?.id === queryData?.createdBy?._id &&
              queryData?.status !== "Closed") ||
            (othersHold &&
              user?.id !== queryData?.createdBy?._id &&
              queryData?.status !== "Closed") ? (
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
      )}
    </>
  );
};

export default MOReportPrintView;
