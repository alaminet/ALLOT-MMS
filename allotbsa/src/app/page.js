import React from "react";
import { Col, Layout, Menu, Row } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Text from "antd/es/typography/Text";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import PricePlan from "@/components/sections/PricePlan";
import GetStarted from "@/components/sections/GetStarted";
import FAQ from "@/components/sections/FAQ";

const items = [
  {
    key: "platform",
    label: "Platform",
  },
  {
    key: "pricing",
    label: "Pricing",
  },
  {
    key: "contact",
    label: "Get in Touch",
  },
  {
    key: "faq",
    label: "FAQ",
  },
];

export default function Home() {
  return (
    <Layout>
      <Header>
        <Row align="middle">
          <Col md={4}>
            <Text style={{ fontWeight: "bolder", fontSize: "32px" }}>
              ALLOT
            </Text>
          </Col>
          <Col md={16}>
            <Menu
              theme="light"
              mode="horizontal"
              items={items}
              style={{
                flex: 1,
                minWidth: 0,
                textTransform: "uppercase",
                justifyContent: "center",
                borderWidth: "0",
              }}
            />
          </Col>
          <Col md={4} style={{ textAlign: "right" }}>
            EN | BN
          </Col>
        </Row>
      </Header>
      <Content style={{ padding: "0 48px" }}>
        <Hero />
        <Features />
        <PricePlan />
        <GetStarted />
        <FAQ/>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        ALLOT BSA ©{new Date().getFullYear()} Developed by{" "}
        <span style={{ color: "#247f93" }}>Al Amin ET</span>
      </Footer>
    </Layout>
  );
}
