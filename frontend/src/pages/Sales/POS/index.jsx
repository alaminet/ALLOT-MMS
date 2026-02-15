import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Card, Flex } from "antd";
import cart_bucket from "../../../assets/images/cart-bucket.png";
import cart_list from "../../../assets/images/cart-list.png";
import BreadCrumbCustom from "../../../components/breadCrumbCustom";
const { Meta } = Card;

const POS = () => {
  const navigate = useNavigate();
  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  return (
    <>
      <Flex justify="space-between">
        <BreadCrumbCustom />
      </Flex>
      {lastSegment === "POS" && (
        <Flex gap={16}>
          <Card
            onClick={() => navigate("new")}
            hoverable
            style={{ width: 240 }}
            cover={
              <img
                draggable={false}
                alt="Cart"
                src={cart_bucket}
                style={{ padding: "10px" }}
              />
            }>
            <Meta title="POS Cart" description="Sale throw POS module" />
          </Card>
          <Card
            onClick={() => navigate("orders")}
            hoverable
            style={{ width: 240 }}
            cover={
              <img
                draggable={false}
                alt="POS Orders"
                src={cart_list}
                style={{ padding: "10px" }}
              />
            }>
            <Meta title="POS Orders" description="Details of POS Order" />
          </Card>
        </Flex>
      )}
      <Outlet />
    </>
  );
};

export default POS;
