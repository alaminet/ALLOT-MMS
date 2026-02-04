import { Button, Col, Flex, Row } from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <>
      <section>
        <Row justify="space-between" gutter={[16, 16]}>
          <Col lg={12} xs={24}>
            <Title style={{ color: "#247f93", fontSize: "60px" }}>
              ওয়্যারহাউজ আটোমেশনে ব্যবহার করুন - ALLOT
            </Title>
            <Text
              style={{
                fontSize: "22px",
                textAlign: "justify",
                display: "block",
              }}
            >
              পার্চেজ চাহিদা থেকে শুরু করে ওয়্যারহাউজ ব্যবস্থাপনা সবকিছু হবে
              পেপারলেস ভাবে। প্রতিষ্ঠানের প্রতিটা পণ্যের ব্যবহার নিখুঁতভাবে
              হিসাব করুন এবং নির্দিষ্ট সময়ে পণ্য অর্ডার করুন। একই প্লাটফর্মে
              ডিপার্টমেন্টের চাহিদাগুলো নিয়ন্ত্রণ করুন। নির্ভুল লোকেশনে মালামাল
              সংরক্ষণ করুন, এবং কর্মী ব্যয় কমিয়ে আনুন।
            </Text>
            <Flex gap={16} style={{ marginTop: "10px" }}>
              <Button
                size="large"
                type="primary"
                style={{ borderRadius: "1px", fontSize: "18px" }}
              >
                ডেমো বুক করুন
              </Button>
              <Link href="https://wa.me/+8801339933034">
                <Button
                  size="large"
                  type="primary"
                  style={{
                    borderRadius: "1px",
                    fontSize: "18px",
                  }}
                >
                  WhatsApp করুন
                </Button>
              </Link>
            </Flex>
          </Col>
          <Col lg={12} xs={24}>right</Col>
        </Row>
      </section>
    </>
  );
};

export default Hero;
