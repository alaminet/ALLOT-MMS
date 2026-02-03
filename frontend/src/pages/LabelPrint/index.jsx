import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Card, Flex } from "antd";
import barcode_scanner from "../../assets/images/barcode-reader.png";
import qrcode_scanner from "../../assets/images/qr-code.png";
import BreadCrumbCustom from "../../components/breadCrumbCustom";
const { Meta } = Card;

const LabelPrint = () => {
  const navigate = useNavigate();
  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  return (
    <>
      <Flex justify="space-between">
        <BreadCrumbCustom />
      </Flex>
      {lastSegment === "label" && (
        <Flex gap={16}>
          <Card
            onClick={() => navigate("barcode")}
            hoverable
            style={{ width: 240 }}
            cover={
              <img
                draggable={false}
                alt="barcode"
                src={barcode_scanner}
                style={{ padding: "10px" }}
              />
            }>
            <Meta
              title="Barcode Generator"
              description="Barcode for your products"
            />
          </Card>
          <Card
            onClick={() => navigate("qrcode")}
            hoverable
            style={{ width: 240 }}
            cover={
              <img
                draggable={false}
                alt="barcode"
                src={qrcode_scanner}
                style={{ padding: "10px" }}
              />
            }>
            <Meta
              title="QR Code Generator"
              description="QR code for your products"
            />
          </Card>
        </Flex>
      )}
      <Outlet />
    </>
  );
};

export default LabelPrint;
