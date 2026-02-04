import React from "react";
import { Card, Col, Row } from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import { Meta } from "antd/es/list/Item";

const Features = () => {
  return (
    <>
      <section style={{ padding: "50px 0" }}>
        <Row justify="center">
          <Col span={6}>
            <Title
              level={2}
              style={{
                fontWeight: "500",
                display: "block",
                textAlign: "center",
              }}
            >
              ওয়্যারহাউজ ব্যবস্থাপনা
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
          <Col span={6}>
            <Card
              hoverable
              cover={
                <img
                  draggable={false}
                  alt="example"
                  src="Images/order-box-chart.png"
                  style={{ height: "250px", width: "100%", objectFit: "cover" }}
                />
              }
            >
              <Meta
                title="পার্চেজ চাহিদা"
                description="প্রতিষ্টানে সকলেই চাহিদা হবে একই প্লাটফর্মে। এপ্রুভ, রিজেক্ট বা হোল্ড করে রাখার সুবিধা।"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              hoverable
              cover={
                <img
                  draggable={false}
                  alt="example"
                  src="Images/order-call-pc.png"
                  style={{ height: "250px", width: "100%", objectFit: "cover" }}
                />
              }
            >
              <Meta
                title="পার্চেজ অর্ডার"
                description="পার্চেজ অর্ডার হবে চাহিদা অনুসারে, নির্দিষ্ট সাপ্লায়ারের কাছে।"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              hoverable
              cover={
                <img
                  draggable={false}
                  alt="example"
                  src="Images/stock-check-receive.png"
                  style={{ height: "250px", width: "100%", objectFit: "cover" }}
                />
              }
            >
              <Meta
                title="স্টক রিসিভ"
                description="অর্ডার অনুযায়ী মালামাল রিসিভ হবে একই প্লাটফর্মে। পেন্ডিং বা ইন-প্রসেস স্ট্যাটাস জানা যাবে সহজেই।"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              hoverable
              cover={
                <img
                  draggable={false}
                  alt="example"
                  src="Images/location-box.png"
                  style={{ height: "250px", width: "100%", objectFit: "cover" }}
                />
              }
            >
              <Meta
                title="ওয়্যারহাউজ ব্যবস্থাপনা"
                description="নির্ভুল ভাবে নির্দিষ্ট স্থানে মালামাল সংরক্ষন, সেই সাথে নির্দিষ্ট স্থান থেকে স্টক আউট।"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              hoverable
              cover={
                <img
                  draggable={false}
                  alt="example"
                  src="Images/role-management.png"
                  style={{ height: "250px", width: "100%", objectFit: "cover" }}
                />
              }
            >
              <Meta
                title="ইউজার ব্যবস্থাপনা"
                description="আলাদা আলাদা ইউজার, আলাদা আলাদা প্যানেল/এক্সেস ব্যবস্থাপনা।"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              hoverable
              cover={
                <img
                  draggable={false}
                  alt="example"
                  src="Images/transfer-file-phn-pc.png"
                  style={{ height: "250px", width: "100%", objectFit: "cover" }}
                />
              }
            >
              <Meta
                title="পেপারলেস ওয়ার্ক"
                description="স্বয়ংক্রিয় ও সঠিক ব্যবস্থাপনায় প্রতিষ্ঠান হবে পেপারলেস। ফাইলিং জটিলতা থাকবে না।"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              hoverable
              cover={
                <img
                  draggable={false}
                  alt="example"
                  src="Images/report-page.png"
                  style={{ height: "250px", width: "100%", objectFit: "cover" }}
                />
              }
            >
              <Meta
                title="রিপোর্ট প্যানেল"
                description="সকল ধরনের মডিউলের জন্য আলাদা আলাদা রিপোর্ট প্যানেল, এক্সেল এক্সপোর্ট সুবিধা।"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              hoverable
              cover={
                <img
                  draggable={false}
                  alt="example"
                  src="Images/dashboard-chart.png"
                  style={{ height: "250px", width: "100%", objectFit: "cover" }}
                />
              }
            >
              <Meta
                title="কনফিগারেশন ও সেটিংস"
                description="ডায়নামিক বিজনেস ও ওয়েব সেটিং এবং কনফিগারেশন, সাথে এক্সেস অনুযায়ী ড্যাশবোর্ড।"
              />
            </Card>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default Features;
