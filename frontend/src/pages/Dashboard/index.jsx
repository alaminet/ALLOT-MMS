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
      <Row justify="space-between">
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
      <Row style={{ marginTop: "16px" }} justify="space-between">
        <Col>
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
        <Col>
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
        <Col>
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
        <Col>
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
        <Col span={4}>
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
        <Col span={4}>
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
      <Row gutter={16} style={{ marginTop: "16px" }}>
        <Col span={12}>
          <Card>
            <BarChart
              title="Weekly Order"
              height={460}
              cartData={dashboardData?.last7Days}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Flex style={{ flexFlow: "column" }} gap={16}>
            <Card>
              <LineChart
                title="Monthly Order"
                height={140}
                cartData={dashboardData?.yearly}
              />
            </Card>
            <Row gutter={16}>
              <Col span={12}>
                <Card>
                  <WaterWaveChart
                    title={
                      dashboardData?.liqStock?.find(
                        (item) => item.SKU === "3100000143"
                      )?.name
                    }
                    height={250}
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
              <Col span={12}>
                <Card>
                  <WaterWaveChart
                    title={
                      dashboardData?.liqStock?.find(
                        (item) => item.SKU === "3100000147"
                      )?.name
                    }
                    height={250}
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
            </Row>
          </Flex>
        </Col>
      </Row>
      <Row style={{ marginTop: "16px" }} justify="space-between" gutter={16}>
        <Col span={12}>
          <Card>
            <LastOrderedTbl tableData={dashboardData?.recentTransactions} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <LastPRTbl tableData={dashboardData?.recentPurchaseReqs} />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
