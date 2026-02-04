import React from "react";
import { Card, Col, Row } from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import { Meta } from "antd/es/list/Item";

const Features = () => {
  const featureItems = [
    {
      metaTitle: "পার্চেজ চাহিদা",
      metaDisc:
        "প্রতিষ্টানে সকলেই চাহিদা হবে একই প্লাটফর্মে। এপ্রুভ, রিজেক্ট বা হোল্ড করে রাখার সুবিধা।",
      cardImg: "Images/order-box-chart.png",
    },
    {
      metaTitle: "পার্চেজ অর্ডার",
      metaDisc:
        "পার্চেজ অর্ডার হবে চাহিদা অনুসারে, নির্দিষ্ট সাপ্লায়ারের কাছে।",
      cardImg: "Images/order-call-pc.png",
    },
    {
      metaTitle: "স্টক রিসিভ",
      metaDisc:
        "অর্ডার অনুযায়ী মালামাল রিসিভ হবে একই প্লাটফর্মে। পেন্ডিং বা ইন-প্রসেস স্ট্যাটাস জানা যাবে সহজেই।",
      cardImg: "Images/stock-check-receive.png",
    },
    {
      metaTitle: "ওয়্যারহাউজ ব্যবস্থাপনা",
      metaDisc:
        "নির্ভুল ভাবে নির্দিষ্ট স্থানে মালামাল সংরক্ষন, সেই সাথে নির্দিষ্ট স্থান থেকে স্টক আউট।",
      cardImg: "Images/location-box.png",
    },
    {
      metaTitle: "ইউজার ব্যবস্থাপনা",
      metaDisc: "আলাদা আলাদা ইউজার, আলাদা আলাদা প্যানেল/এক্সেস ব্যবস্থাপনা।",
      cardImg: "Images/role-management.png",
    },
    {
      metaTitle: "পেপারলেস ওয়ার্ক",
      metaDisc:
        "স্বয়ংক্রিয় ও সঠিক ব্যবস্থাপনায় প্রতিষ্ঠান হবে পেপারলেস। ফাইলিং জটিলতা থাকবে না।",
      cardImg: "Images/transfer-file-phn-pc.png",
    },
    {
      metaTitle: "রিপোর্ট প্যানেল",
      metaDisc:
        "সকল ধরনের মডিউলের জন্য আলাদা আলাদা রিপোর্ট প্যানেল, এক্সেল এক্সপোর্ট সুবিধা।",
      cardImg: "Images/report-page.png",
    },
    {
      metaTitle: "কনফিগারেশন ও সেটিংস",
      metaDisc:
        "ডায়নামিক বিজনেস ও ওয়েব সেটিং এবং কনফিগারেশন, সাথে এক্সেস অনুযায়ী ড্যাশবোর্ড।",
      cardImg: "Images/dashboard-chart.png",
    },
  ];
  return (
    <>
      <section style={{ padding: "50px 0" }}>
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
          {featureItems.map((item, i) => (
            <Col lg={6} md={12} xs={24} key={i}>
              <Card
                hoverable
                cover={
                  <img
                    draggable={false}
                    alt={item.metaTitle}
                    src={item.cardImg}
                    style={{
                      height: "250px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                }
              >
                <Meta title={item.metaTitle} description={item.metaDisc} />
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </>
  );
};

export default Features;
