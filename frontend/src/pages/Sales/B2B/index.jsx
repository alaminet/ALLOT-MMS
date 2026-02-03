import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button, Card, Flex } from "antd";
import BreadCrumbCustom from "../../../components/breadCrumbCustom";
import newInvoice from "../../../assets/images/invoice-new.png";
import listInvoice from "../../../assets/images/invoice-list.png";
import listCustomer from "../../../assets/images/customer-list.png";

const { Meta } = Card;

const B2B = () => {
  const navigate = useNavigate();
  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  return (
    <>
      <Flex justify="space-between">
        <BreadCrumbCustom />
      </Flex>
      {lastSegment === "B2B" && (
        <Flex gap={16}>
          <Card
            onClick={() => navigate("new")}
            hoverable
            style={{ width: 240 }}
            cover={
              <img
                draggable={false}
                alt="New Invoice"
                src={newInvoice}
                style={{ padding: "10px" }}
              />
            }>
            <Meta title="New Invoice" description="Make a new invoice" />
          </Card>
          <Card
            onClick={() => navigate("invoice")}
            hoverable
            style={{ width: 240 }}
            cover={
              <img
                draggable={false}
                alt="Invoice List"
                src={listInvoice}
                style={{ padding: "10px" }}
              />
            }>
            <Meta title="Invoice List" description="Check out the invoices" />
          </Card>
          <Card
            onClick={() => navigate("customer")}
            hoverable
            style={{ width: 240 }}
            cover={
              <img
                draggable={false}
                alt="Customer List"
                src={listCustomer}
                style={{ padding: "10px" }}
              />
            }>
            <Meta
              title="Customer Details"
              description="Register your customers"
            />
          </Card>
        </Flex>
      )}
      <Outlet />
    </>
  );
};

export default B2B;
