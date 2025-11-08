import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";
import NotFound from "../../notFound";
import NotAuth from "../../notAuth";
import {
  Col,
  Row,
  Table,
  Typography,
  Input,
  InputNumber,
  Button,
  QRCode,
} from "antd";
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

const TnxReportView = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const tnxId = query.get("tnxId");
  const tnxType = query.get("tnxType");
  const [queryData, setQueryData] = useState();
  const [businessDetails, setBusinessDetails] = useState();

  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("tnx-report")) {
    return <NotAuth />;
  }
  const own = canDoOwn("tnx-report", "view");
  const others = canDoOther("tnx-report", "view");

  // Get the transaction details
  const getDetails = async () => {
    setQueryData(null);
    const scope =
      own && others ? "all" : own ? "own" : others ? "others" : null;
    if (!scope) {
      setQueryData(null);
      message.warning("You are not authorized");
      return; // stop execution
    }
    const payload = {
      tnxId,
      tnxType,
      scope,
    };
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/transaction/tnx-details/view`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          }
        )
        .then((res) => {
          setQueryData(res?.data?.transactions || null);
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

  useEffect(() => {
    getDetails();
    getBusinessDetails();
  }, []);

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
                  Transaction Details Report
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
                <strong>Tnx.ID: </strong>
                {queryData?.code}
              </p>
              <p>
                <strong>Tnx.Type: </strong>
                {queryData?.tnxType}
              </p>
              <p>
                <strong>Ref.: </strong>
                {queryData?.sourceRef || queryData?.reference}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <strong>Doc. Date: </strong>
                {moment(queryData?.documentAt).format("DD-MMM-YYYY")}
              </p>
              {queryData?.costCenter && (
                <p>
                  <strong>Dept.: </strong>
                  {queryData?.costCenter}
                </p>
              )}
              {queryData?.sourceType && (
                <p>
                  <strong>Source Type: </strong>
                  {queryData?.sourceType}
                </p>
              )}
            </Col>
            <Col span={8}>
              <p>
                <strong>Tnx.Date: </strong>
                {moment(queryData?.createdAt).format("DD-MMM-YYYY")}
              </p>
              <p>
                <strong>Header: </strong>
                {queryData?.headerText}
              </p>
              <p>
                <strong>Tnx.By: </strong>
                {queryData?.createdBy?.name}
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
                    (sum, item) =>
                      sum + (item?.issueQty || item?.receiveQty || 0),
                    0
                  );
                  const totalValue = queryData?.itemDetails.reduce(
                    (sum, item) =>
                      sum +
                      (item?.unitPrice || item?.issuePrice || 0) *
                        (item?.issueQty || item?.receiveQty || 0),
                    0
                  );

                  return (
                    <Table.Summary.Row style={{ textAlign: "right" }}>
                      <Table.Summary.Cell index={0} colSpan={6}>
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
                    title="Location"
                    dataIndex="location"
                    key="location"
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
                      }).format(record?.unitPrice || record?.issuePrice || 0)
                    }
                  />
                  <Column
                    title="Tnx. Qty"
                    align="right"
                    render={(text, record, index) =>
                      new Intl.NumberFormat("en-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(record?.issueQty || record?.receiveQty || 0)
                    }
                  />
                  <Column
                    title="Tnx. Value"
                    align="right"
                    render={(text, record, index) =>
                      new Intl.NumberFormat("en-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(
                        (record?.unitPrice || record?.issuePrice) *
                          (record?.issueQty || record?.receiveQty)
                      )
                    }
                  />
                  <Column
                    title="6M Used (Dept)"
                    align="right"
                    dataIndex="sixMonthUsedDept"
                    key="sixMonthUsedAll"
                    render={(text, record, index) =>
                      new Intl.NumberFormat("en-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(text || 0)
                    }
                  />
                  <Column
                    title="6M Used (All)"
                    align="right"
                    dataIndex="sixMonthUsedAll"
                    key="sixMonthUsedAll"
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
          <Button
            className="no-print"
            type="primary"
            onClick={() => handlePrint("A4 portrait")}>
            <PrinterOutlined />
          </Button>
        </div>
      )}
    </>
  );
};

export default TnxReportView;
