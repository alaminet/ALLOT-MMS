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
const { Title, Text } = Typography;
const Dashboard = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [dashboardData, setDashboardData] = useState();

  const getDashboardData = async () => {
    try {
      await axios
        .get(`${import.meta.env.VITE_API_URL}/api/dashboard/view`, {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        })
        .then((res) => {
          // message.success(res.data.message);
          setDashboardData(res?.data?.data);
          const leqItems = res?.data?.data?.liqStock?.map((item) => {
            return {
              name: item.name,
              SKU: item.SKU,
              onHand: item.stock?.reduce(
                (acc, s) => acc + (s.onHandQty || 0),
                0
              ),
            };
          });
          setDashboardData((prevData) => ({
            ...prevData,
            liqStock: leqItems,
          }));
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);
  console.log(dashboardData);

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
            style={{
              marginBottom: "10px",
            }}>
            <Button
              icon={<PlusCircleOutlined />}
              type="primary"
              lassName="borderBrand"
              style={{ borderRadius: "0px" }}>
              Create Order
            </Button>
          </Flex>
        </Col>
      </Row>
      <Row
        style={{ marginTop: "16px" }}
        justify="space-between"
        gutter={[16, 16]}>
        <Col xs={12} md={8} lg={4}>
          <Card variant="borderless">
            <Statistic
              title="Today Order(Qty)"
              value={Math.abs(dashboardData?.daily?.value)}
              precision={0}
              valueStyle={{ color: "#cf1322" }}
              // prefix={<ArrowUpOutlined />}
              suffix={`(${Math.abs(dashboardData?.daily?.qty)})`}
            />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card variant="borderless">
            <Statistic
              title="Lastday Order(Qty)"
              value={Math.abs(dashboardData?.last7Days[6]?.value)}
              precision={0}
              valueStyle={{ color: "#cf1322" }}
              // prefix={<ArrowDownOutlined />}
              suffix={`(${Math.abs(dashboardData?.last7Days[6]?.qty)})`}
            />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card variant="borderless">
            <Statistic
              title="Weekly Order(Qty)"
              value={Math.abs(dashboardData?.weekly?.value)}
              precision={0}
              valueStyle={{ color: "#cf1322" }}
              // prefix={<ArrowDownOutlined />}
              suffix={`(${Math.abs(dashboardData?.weekly?.qty)})`}
            />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card variant="borderless">
            <Statistic
              title="Monthly Order(Qty)"
              value={Math.abs(dashboardData?.monthly?.value)}
              precision={0}
              valueStyle={{ color: "#cf1322" }}
              // prefix={<ArrowDownOutlined />}
              suffix={`(${Math.abs(dashboardData?.monthly?.qty)})`}
            />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card variant="borderless">
            <Statistic
              title="Weekly PR(Qty)"
              value={Math.abs(dashboardData?.weeklyPR?.value)}
              precision={0}
              valueStyle={{ color: "#cf1322" }}
              // prefix={<ArrowDownOutlined />}
              suffix={`(${Math.abs(dashboardData?.weeklyPR?.qty)})`}
            />
          </Card>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <Card variant="borderless">
            <Statistic
              title="Monthly PR(Qty)"
              value={Math.abs(dashboardData?.monthlyPR?.value)}
              precision={0}
              valueStyle={{ color: "#cf1322" }}
              // prefix={<ArrowDownOutlined />}
              suffix={`(${Math.abs(dashboardData?.monthlyPR?.qty)})`}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col xs={24} lg={12}>
          <Card>
            <DualAxesChart
              title="Weekly Order"
              height={460}
              cartData={dashboardData?.last7Days}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <LineChart
              title="Monthly Order"
              height={460}
              cartData={dashboardData?.yearly}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col lg={8}>
          <Card>
            <WaterWaveChart
              title={`${
                dashboardData?.liqStock[1]?.name
              } (${dashboardData?.liqStock[1]?.onHand.toFixed(0)} Ltr)`}
              height={350}
              percent={Number(
                (
                  (dashboardData?.liqStock?.find(
                    (item) => item.SKU === "3100000147"
                  )?.onHand || 0) / 10600
                ).toFixed(2)
              )}
            />
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <WaterWaveChart
              title={`${
                dashboardData?.liqStock[0]?.name
              } (${dashboardData?.liqStock[0]?.onHand.toFixed(0)} Ltr)`}
              height={350}
              percent={Number(
                (
                  (dashboardData?.liqStock?.find(
                    (item) => item.SKU === "3100000143"
                  )?.onHand || 0) / 5300
                ).toFixed(2)
              )}
            />
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <PaiChart height={350} cartData={dashboardData?.typeWiseStock} />
          </Card>
        </Col>
      </Row>
      <Row
        style={{ marginTop: "16px" }}
        justify="space-between"
        gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            <LastOrderedTbl tableData={dashboardData?.recentTransactions} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <LastPRTbl tableData={dashboardData?.recentPurchaseReqs} />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
