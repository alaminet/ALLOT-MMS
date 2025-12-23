import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Flex,
  message,
  Row,
  Statistic,
  Tooltip,
  Typography,
} from "antd";
import { ArrowDownOutlined, PlusCircleOutlined } from "@ant-design/icons";
import BarChart from "./barChart";
import LineChart from "./lineChart";
import WaterWaveChart from "./waterWaveChart";
import LastPRTbl from "./lastPRTbl";
import LastOrderedTbl from "./lastOrderedTable";
import PaiChart from "./paiChart";
import DualAxesChart from "./dualAxesChart";
import { useNavigate } from "react-router-dom";
import ApprovalTable from "./approvalTable";
import { usePermission } from "../../hooks/usePermission";
import MoveOrderReq from "../../components/moveOrderReq";
import StockCheckModal from "../../components/stockCheckModal";
const { Title, Text } = Typography;
const Dashboard = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [dashboardData, setDashboardData] = useState();
  const navigate = useNavigate();

  // User Permission Check
  const { canDoOwn, canDoOther, canAuthOther, canAuthOwn } = usePermission();
  //Data View
  const ownView = canDoOwn("dashboard", "view");
  const othersView = canDoOther("dashboard", "view");
  // PO Access
  const ownPOCheck = canAuthOwn("purchase-order", "check");
  const othersPOCheck = canAuthOther("purchase-order", "check");
  const ownPOConfirm = canAuthOwn("purchase-order", "confirm");
  const othersPOConfirm = canAuthOther("purchase-order", "confirm");
  const ownPOApprove = canAuthOwn("purchase-order", "approve");
  const othersPOApprove = canAuthOther("purchase-order", "approve");
  const ownPOHold = canAuthOwn("purchase-order", "hold");
  const othersPOHold = canAuthOther("purchase-order", "hold");
  // PR Access
  const ownPRCheck = canAuthOwn("purchase-requisition", "check");
  const othersPRCheck = canAuthOther("purchase-requisition", "check");
  const ownPRConfirm = canAuthOwn("purchase-requisition", "confirm");
  const othersPRConfirm = canAuthOther("purchase-requisition", "confirm");
  const ownPRApprove = canAuthOwn("purchase-requisition", "approve");
  const othersPRApprove = canAuthOther("purchase-requisition", "approve");
  const ownPRHold = canAuthOwn("purchase-requisition", "hold");
  const othersPRHold = canAuthOther("purchase-requisition", "hold");
  // MO Access
  const ownMOCheck = canAuthOwn("move-order", "check");
  const othersMOCheck = canAuthOther("move-order", "check");
  const ownMOConfirm = canAuthOwn("move-order", "confirm");
  const othersMOConfirm = canAuthOther("move-order", "confirm");
  const ownMOApprove = canAuthOwn("move-order", "approve");
  const othersMOApprove = canAuthOther("move-order", "approve");
  const ownMOHold = canAuthOwn("move-order", "hold");
  const othersMOHold = canAuthOther("move-order", "hold");

  // Number Formatting
  const formatNumber = (num) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  function getScopeValue(own, others) {
    if (own && others) return "all";
    if (own) return "own";
    if (others) return "others";
    return null;
  }
  const getDashboardData = async () => {
    // Report View Scope
    const scope =
      ownView && othersView
        ? "all"
        : ownView
        ? "own"
        : othersView
        ? "others"
        : null;

    // PO Scope
    const scopePOCheck = getScopeValue(ownPOCheck, othersPOCheck);
    const scopePOConfirm = getScopeValue(ownPOConfirm, othersPOConfirm);
    const scopePOApprove = getScopeValue(ownPOApprove, othersPOApprove);
    const scopePOHold = getScopeValue(ownPOHold, othersPOHold);
    // PR Scope
    const scopePRCheck = getScopeValue(ownPRCheck, othersPRCheck);
    const scopePRConfirm = getScopeValue(ownPRConfirm, othersPRConfirm);
    const scopePRApprove = getScopeValue(ownPRApprove, othersPRApprove);
    const scopePRHold = getScopeValue(ownPRHold, othersPRHold);
    // MO Scope
    const scopeMOCheck = getScopeValue(ownMOCheck, othersMOCheck);
    const scopeMOConfirm = getScopeValue(ownMOConfirm, othersMOConfirm);
    const scopeMOApprove = getScopeValue(ownMOApprove, othersMOApprove);
    const scopeMOHold = getScopeValue(ownMOHold, othersMOHold);

    // Assign only if not null
    const payload = {
      scope,
      ...(scopePOCheck && { scopePOCheck }),
      ...(scopePOConfirm && { scopePOConfirm }),
      ...(scopePOApprove && { scopePOApprove }),
      ...(scopePOHold && { scopePOHold }),
      ...(scopePRCheck && { scopePRCheck }),
      ...(scopePRConfirm && { scopePRConfirm }),
      ...(scopePRApprove && { scopePRApprove }),
      ...(scopePRHold && { scopePRHold }),
      ...(scopeMOCheck && { scopeMOCheck }),
      ...(scopeMOConfirm && { scopeMOConfirm }),
      ...(scopeMOApprove && { scopeMOApprove }),
      ...(scopeMOHold && { scopeMOHold }),
    };
    try {
      await axios
        .post(`${import.meta.env.VITE_API_URL}/api/dashboard/view`, payload, {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        })
        .then((res) => {
          // message.success(res.data.message);
          setDashboardData(res?.data?.data);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);
  // console.log(dashboardData);

  return (
    <>
      <Row justify="space-between" gutter={16}>
        <Col>
          <Title
            style={{ textAlign: "center", margin: "0" }}
            className="colorLink form-title">
            Hi, {user?.name}!
          </Title>
          <Text type="secondary">
            {moment(new Date()).format("MMMM DD, YYYY h:mm A")}
          </Text>
        </Col>
        <Col>
          <Flex
            justify="space-between"
            gap={16}
            style={{
              marginBottom: "10px",
            }}>
            <StockCheckModal />
            <MoveOrderReq />
          </Flex>
        </Col>
      </Row>
      {ownView || othersView ? (
        <Row
          style={{ marginTop: "16px" }}
          justify="space-between"
          gutter={[16, 16]}>
          <Col xs={12} md={8} lg={4}>
            <Card variant="borderless">
              <Tooltip
                title={`${Math.abs(dashboardData?.daily?.value)}(${Math.abs(
                  dashboardData?.daily?.qty
                )})`}>
                <Statistic
                  title="Today Order(Qty)"
                  value={formatNumber(Math.abs(dashboardData?.daily?.value))}
                  precision={0}
                  valueStyle={{ color: "#cf1322" }}
                  // prefix={<ArrowUpOutlined />}
                  suffix={`(${formatNumber(
                    Math.abs(dashboardData?.daily?.qty)
                  )})`}
                />
              </Tooltip>
            </Card>
          </Col>
          <Col xs={12} md={8} lg={4}>
            <Card variant="borderless">
              <Tooltip
                title={`${Math.abs(
                  dashboardData?.last7Days[6]?.value
                )}(${Math.abs(dashboardData?.last7Days[6]?.qty)})`}>
                <Statistic
                  title="Lastday Order(Qty)"
                  value={formatNumber(
                    Math.abs(dashboardData?.last7Days[6]?.value)
                  )}
                  precision={0}
                  valueStyle={{ color: "#cf1322" }}
                  // prefix={<ArrowDownOutlined />}
                  suffix={`(${formatNumber(
                    Math.abs(dashboardData?.last7Days[6]?.qty)
                  )})`}
                />
              </Tooltip>
            </Card>
          </Col>
          <Col xs={12} md={8} lg={4}>
            <Card variant="borderless">
              <Tooltip
                title={`${Math.abs(dashboardData?.weekly?.value)}(${Math.abs(
                  dashboardData?.weekly?.qty
                )})`}>
                <Statistic
                  title="Weekly Order(Qty)"
                  value={formatNumber(Math.abs(dashboardData?.weekly?.value))}
                  precision={0}
                  valueStyle={{ color: "#cf1322" }}
                  // prefix={<ArrowDownOutlined />}
                  suffix={`(${formatNumber(
                    Math.abs(dashboardData?.weekly?.qty)
                  )})`}
                />
              </Tooltip>
            </Card>
          </Col>
          <Col xs={12} md={8} lg={4}>
            <Card variant="borderless">
              <Tooltip
                title={`${Math.abs(dashboardData?.monthly?.value)}(${Math.abs(
                  dashboardData?.monthly?.qty
                )})`}>
                <Statistic
                  title="Monthly Order(Qty)"
                  value={formatNumber(Math.abs(dashboardData?.monthly?.value))}
                  precision={0}
                  valueStyle={{ color: "#cf1322" }}
                  // prefix={<ArrowDownOutlined />}
                  suffix={`(${formatNumber(
                    Math.abs(dashboardData?.monthly?.qty)
                  )})`}
                />
              </Tooltip>
            </Card>
          </Col>
          <Col xs={12} md={8} lg={4}>
            <Card variant="borderless">
              <Tooltip
                title={`${Math.abs(dashboardData?.weeklyPR?.value)}(${Math.abs(
                  dashboardData?.weeklyPR?.qty
                )})`}>
                <Statistic
                  title="Weekly PR(Qty)"
                  value={formatNumber(Math.abs(dashboardData?.weeklyPR?.value))}
                  precision={0}
                  valueStyle={{ color: "#cf1322" }}
                  // prefix={<ArrowDownOutlined />}
                  suffix={`(${formatNumber(
                    Math.abs(dashboardData?.weeklyPR?.qty)
                  )})`}
                />
              </Tooltip>
            </Card>
          </Col>
          <Col xs={12} md={8} lg={4}>
            <Card variant="borderless">
              <Tooltip
                title={`${Math.abs(dashboardData?.monthlyPR?.value)}(${Math.abs(
                  dashboardData?.monthlyPR?.qty
                )})`}>
                <Statistic
                  title="Monthly PR(Qty)"
                  value={formatNumber(
                    Math.abs(dashboardData?.monthlyPR?.value)
                  )}
                  precision={0}
                  valueStyle={{ color: "#cf1322" }}
                  // prefix={<ArrowDownOutlined />}
                  suffix={`(${formatNumber(
                    Math.abs(dashboardData?.monthlyPR?.qty)
                  )})`}
                />
              </Tooltip>
            </Card>
          </Col>
        </Row>
      ) : null}

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        {dashboardData?.PRApprovalList?.length > 0 && (
          <Col xs={24} lg={8}>
            <Card>
              <ApprovalTable
                title="PR Approval"
                scope={"PR"}
                tableData={dashboardData?.PRApprovalList}
              />
            </Card>
          </Col>
        )}
        {dashboardData?.POApprovalList?.length > 0 && (
          <Col xs={24} lg={8}>
            <Card>
              <ApprovalTable
                title="PO Approval"
                scope={"PO"}
                tableData={dashboardData?.POApprovalList}
              />
            </Card>
          </Col>
        )}
        {dashboardData?.MOApprovalList?.length > 0 && (
          <Col xs={24} lg={8}>
            <Card>
              <ApprovalTable
                title="MO Approval"
                scope={"MO"}
                tableData={dashboardData?.MOApprovalList}
              />
            </Card>
          </Col>
        )}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        {dashboardData?.webSettings?.dashboard?.weeklyOrder?.status ? (
          <Col xs={24} lg={12}>
            <Card>
              <DualAxesChart
                title="Weekly Order"
                height={460}
                cartData={dashboardData?.last7Days}
              />
            </Card>
          </Col>
        ) : null}
        {dashboardData?.webSettings?.dashboard?.monthlyOrder?.status ? (
          <Col xs={24} lg={12}>
            <Card>
              <LineChart
                title="Monthly Order"
                height={460}
                cartData={dashboardData?.yearly}
              />
            </Card>
          </Col>
        ) : null}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        {dashboardData?.webSettings?.dashboard?.waterChart[1]?.status ? (
          <Col xs={24} lg={8}>
            <Card>
              <WaterWaveChart
                title={`${
                  dashboardData?.liqStock[1]?.name
                } (${dashboardData?.liqStock[1]?.onHand?.toFixed(0)})`}
                height={350}
                percent={Number(
                  (
                    (dashboardData?.liqStock[1]?.onHand || 0) /
                    (dashboardData?.liqStock[1]?.limit || 1)
                  ).toFixed(2)
                )}
              />
            </Card>
          </Col>
        ) : null}
        {dashboardData?.webSettings?.dashboard?.waterChart[0]?.status ? (
          <Col xs={24} lg={8}>
            <Card>
              <WaterWaveChart
                title={`${
                  dashboardData?.liqStock[0]?.name
                } (${dashboardData?.liqStock[0]?.onHand?.toFixed(0)})`}
                height={350}
                percent={Number(
                  (
                    (dashboardData?.liqStock[0]?.onHand || 0) /
                    (dashboardData?.liqStock[0]?.limit || 1)
                  ).toFixed(2)
                )}
              />
            </Card>
          </Col>
        ) : null}
        {dashboardData?.webSettings?.dashboard?.safetyChart?.status ? (
          <Col xs={24} lg={8}>
            <Card>
              <PaiChart height={350} cartData={dashboardData?.typeWiseStock} />
            </Card>
          </Col>
        ) : null}
      </Row>
      <Row
        style={{ marginTop: "16px" }}
        justify="space-between"
        gutter={[16, 16]}>
        {dashboardData?.webSettings?.dashboard?.moveOrderTable?.status ? (
          <Col xs={24} lg={12}>
            <Card>
              <LastOrderedTbl tableData={dashboardData?.recentTransactions} />
            </Card>
          </Col>
        ) : null}
        {dashboardData?.webSettings?.dashboard?.PRTable?.status ? (
          <Col xs={24} lg={12}>
            <Card>
              <LastPRTbl tableData={dashboardData?.recentPurchaseReqs} />
            </Card>
          </Col>
        ) : null}
      </Row>
    </>
  );
};

export default Dashboard;
