import React from "react";
import moment from "moment";
import { Space, Table, Tag } from "antd";
import Title from "antd/es/typography/Title";

const LastOrderedTbl = ({ tableData }) => {
  const dataArr = Object.values(tableData || {}).map((item, key) => ({
    key: ++key,
    date: moment(item?.issuedAt).format("DD-MMM-YY"),
    order: item?.tnxRef,
    name: item?.itemName,
    qty: Math.abs(item?.tnxQty),
    value: Math.abs(item?.itemPrice * item?.tnxQty).toFixed(0),
  }));
  const columns = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Order No",
      dataIndex: "order",
      key: "order",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Item Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  return (
    <>
      <Title
        style={{ textAlign: "left", margin: "0" }}
        className="colorLink form-title"
      >
        Latest orders
      </Title>
      <Table columns={columns} dataSource={dataArr} pagination={false} />
    </>
  );
};

export default LastOrderedTbl;
