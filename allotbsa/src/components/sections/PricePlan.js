"use client";
import React from "react";
import { Button, Card, Col, Flex, Row } from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import { Meta } from "antd/es/list/Item";
import { CheckSquareTwoTone } from "@ant-design/icons";
import Link from "next/link";

const PricePlan = () => {
  const planItem = [
    {
      cardTitle: "Purchase",
      regularPrice: "1250",
      salePrice: "1000",
      discount: "20%",
      metaTitle: "Purchasing Team Choice",
      offers: [
        "100 Product SKUs",
        "5 Users",
        "30 Purchase / Month",
        "2 Cost Center",
        "5 Supplier Enlisted",
        "Purchase Request & Order",
        "Dashboard & Reprot Panel",
        "Training & User Manual",
      ],
    },
    {
      cardTitle: "Warehouse",
      regularPrice: "1500",
      salePrice: "1000",
      discount: "20%",
      metaTitle: "Warehouse Team Choice",
      offers: [
        "100 Product SKUs",
        "5 Users",
        "300 Warhouse Order / Month",
        "2 Cost Center",
        "10 Storage Location",
        "Goods GRN & Reservation",
        "Dashboard & Reprot Panel",
        "Training & User Manual",
      ],
    },
    {
      cardTitle: "Lite",
      regularPrice: "5250",
      salePrice: "3000",
      discount: "43%",
      metaTitle: "Small Businesses Mangement",
      offers: [
        "500 Product SKUs",
        "5 Users",
        "5 Cost Center",
        "50 Purchase / Month",
        "10 Supplier Enlisted",
        "500 Warhouse Order / Month",
        "100 Storage Location",
        "Authorize Automation",
        "Purchase Request & Order",
        "Goods GRN & Reservation",
        "Dashboard & Reprot Panel",
        "Training & User Manual",
        "1 Month Free Support",
      ],
    },
    {
      cardTitle: "Basic",
      regularPrice: "10250",
      salePrice: "5000",
      discount: "51%",
      metaTitle: "Growing Businesses Mangement",
      offers: [
        "1000 Product SKUs",
        "10 Users",
        "10 Cost Center",
        "100 Purchase / Month",
        "15 Supplier Enlisted",
        "1000 Warhouse Order / Month",
        "200 Storage Location",
        "Authorize Automation",
        "Purchase Request & Order",
        "Goods GRN & Reservation",
        "Dashboard & Reprot Panel",
        "Training & User Manual",
        "2 Month Free Support",
      ],
    },
    {
      cardTitle: "Pro",
      regularPrice: "18000",
      salePrice: "10000",
      discount: "44%",
      metaTitle: "Established Businesses Mangement",
      offers: [
        "1700 Product SKUs",
        "20 Users",
        "15 Cost Center",
        "300 Purchase / Month",
        "20 Supplier Enlisted",
        "1500 Warhouse Order / Month",
        "400 Storage Location",
        "Authorize Automation",
        "Purchase Request & Order",
        "Goods GRN & Reservation",
        "Dashboard & Reprot Panel",
        "Training & User Manual",
        "3 Month Free Support",
      ],
    },
    {
      cardTitle: "Advanced",
      regularPrice: "26750",
      salePrice: "15000",
      discount: "44%",
      metaTitle: "Scaling Operation Mangement",
      offers: [
        "2500 Product SKUs",
        "40 Users",
        "25 Cost Center",
        "500 Purchase / Month",
        "30 Supplier Enlisted",
        "2000 Warhouse Order / Month",
        "600 Storage Location",
        "Authorize Automation",
        "Purchase Request & Order",
        "Goods GRN & Reservation",
        "Dashboard & Reprot Panel",
        "Training & User Manual",
        "6 Month Free Support",
        "Free Installation Support",
      ],
    },
  ];
  return (
    <>
      <section>
        <Row justify="center">
          <Col lg={8} md={12} xs={24}>
            <Title
              level={2}
              style={{
                fontWeight: "500",
                display: "block",
                textAlign: "center",
              }}
            >
              সহজ প্রাইস প্ল্যান
            </Title>
            <div
              style={{
                height: "1px",
                width: "80%",
                backgroundColor: "#247f93",
                margin: "0 auto",
              }}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ paddingTop: "50px" }}>
          {planItem.map((item, i) => (
            <Col lg={8} md={12} key={i} xs={24}>
              <Card
                hoverable
                title={item?.cardTitle}
                className="price-plan-card"
                actions={[
                  <Link href="contact">
                    <Text
                      style={{
                        display: "block",
                        fontSize: "18px",
                        color: "#247f93",
                        fontWeight: "bold",
                      }}
                    >
                      Get Started
                    </Text>
                  </Link>,
                ]}
              >
                <Meta
                  title={
                    <>
                      <Text style={{ fontSize: "22px", display: "block" }}>
                        {item?.salePrice} BDT/Month{" "}
                        <span
                          style={{ fontWeight: "lighter", fontSize: "16px" }}
                        >
                          ({item?.discount} off)
                        </span>
                      </Text>
                      <s
                        style={{
                          fontSize: "14px",
                          display: "block",
                          fontWeight: "lighter",
                        }}
                      >
                        {item?.regularPrice} BDT/Month
                      </s>
                    </>
                  }
                  description={
                    <>
                      <Text
                        style={{
                          fontWeight: "lighter",
                          display: "block",
                          fontSize: "16px",
                        }}
                      >
                        {item?.metaTitle}
                      </Text>
                      <div>
                        {item.offers.map((offer, j) => (
                          <Flex gap={4} key={j}>
                            <CheckSquareTwoTone />
                            <Text>{offer}</Text>
                          </Flex>
                        ))}
                      </div>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </>
  );
};

export default PricePlan;
