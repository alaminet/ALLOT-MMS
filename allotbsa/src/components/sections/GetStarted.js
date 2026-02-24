"use client";
import React from "react";
import { Button, Card, Col, Form, Input, Row } from "antd";
import Title from "antd/es/typography/Title";
import FormItem from "antd/es/form/FormItem";
import Compact from "antd/es/space/Compact";
import TextArea from "antd/es/input/TextArea";

const GetStarted = () => {
  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };
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
              শুরু করুন ALLOT-এ
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
        <Row justify="center" style={{ marginTop: "50px" }}>
          <Col lg={10} ld={12} xs={24}>
            <Card hoverable>
              <Form
                name="getStarted"
                onFinish={onFinish}
                style={{ paddingTop: "30px" }}
              >
                <FormItem
                  name="name"
                  rules={[{ required: true, message: "Name is required" }]}
                >
                  <Input placeholder="Full Name" />
                </FormItem>
                <FormItem
                  name="email"
                  rules={[{ required: true, message: "Email is required" }]}
                >
                  <Input type="email" placeholder="Email Address" />
                </FormItem>
                <FormItem
                  name="phone"
                  rules={[{ required: true, message: "Contact is required" }]}
                >
                  <Input type="email" placeholder="Phone/Contact Number" />
                </FormItem>
                <FormItem
                  name="orgName"
                  rules={[
                    { required: true, message: "Organization is required" },
                  ]}
                >
                  <Input placeholder="Organization Name" />
                </FormItem>
                <FormItem
                  name={["address", "house"]}
                  rules={[
                    { required: true, message: "House/Road is required" },
                  ]}
                >
                  <TextArea placeholder="Hose/Road, Area Name" rows={2} />
                </FormItem>
                <FormItem>
                  <Compact style={{ width: "100%" }}>
                    <FormItem
                      name={["address", "district"]}
                      noStyle
                      rules={[
                        { required: true, message: "District is required" },
                      ]}
                    >
                      <Input placeholder="District" />
                    </FormItem>
                    <FormItem
                      name={["address", "division"]}
                      noStyle
                      rules={[
                        { required: true, message: "Division is required" },
                      ]}
                    >
                      <Input placeholder="Division" />
                    </FormItem>
                    <FormItem
                      name={["address", "country"]}
                      initialValue="Bangladesh"
                      noStyle
                      rules={[
                        { required: true, message: "Country is required" },
                      ]}
                    >
                      <Input placeholder="Country" />
                    </FormItem>
                  </Compact>
                </FormItem>
                <FormItem name="note">
                  <TextArea placeholder="Write your note" rows={2} />
                </FormItem>
                <FormItem>
                  <Button
                    size="large"
                    type="primary"
                    htmlType="submit"
                    block
                    style={{ borderRadius: "1px" }}
                  >
                    Book a call
                  </Button>
                </FormItem>
              </Form>
            </Card>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default GetStarted;
