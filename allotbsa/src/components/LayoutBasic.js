"use client";
import React, { useState } from "react";
import { Col, Layout, Menu, Row } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Text from "antd/es/typography/Text";
import { useRouter } from "next/navigation";

const items = [
  {
    key: "/",
    label: "Home",
  },
  {
    key: "feature",
    label: "Feature",
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
    key: "faqs",
    label: "FAQs",
  },
];

const LayoutBasic = ({ children }) => {
  const router = useRouter();
  const [current, setCurrent] = useState("/");
  const onClick = (e) => {
    setCurrent(e.key);
    router.push(e.key);
  };
  return (
    <Layout>
      <Header>
        <Row align="middle">
          <Col md={4} xs={8}>
            <Text style={{ fontWeight: "bolder", fontSize: "32px" }}>
              ALLOT
            </Text>
          </Col>
          <Col md={16} xs={8}>
            <Menu
              theme="light"
              mode="horizontal"
              selectedKeys={[current]}
              items={items}
              onClick={onClick}
              style={{
                flex: 1,
                minWidth: 0,
                textTransform: "uppercase",
                justifyContent: "center",
                borderWidth: "0",
              }}
            />
          </Col>
          <Col md={4} xs={8} style={{ textAlign: "right" }}>
            EN | BN
          </Col>
        </Row>
      </Header>
      <Content style={{ padding: "0 48px" }}>{children}</Content>
      <Footer style={{ textAlign: "center" }}>
        ALLOT BSA ©{new Date().getFullYear()} Developed by{" "}
        <span style={{ color: "#247f93" }}>Al Amin ET</span>
      </Footer>
    </Layout>
  );
};

export default LayoutBasic;
