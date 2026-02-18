import React from "react";
import moment from "moment";
import { Table } from "antd";
import Title from "antd/es/typography/Title";
import { Link } from "react-router-dom";

const LastOrderedTbl = ({ tableData }) => {
  const dataArr = Object.values(tableData || {})?.map((item, key) => ({
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
      width: 30,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 110,
    },
    {
      title: "Tnx.No",
      dataIndex: "order",
      key: "order",
      render: (text) => (
        <Link to={`/tnx-report/view?tnxType=issue&tnxId=${text}`}>{text}</Link>
      ),
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
        className="colorLink form-title">
        Latest Move orders
      </Title>
      <Table
        columns={columns}
        dataSource={[...dataArr].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB - dateA; // sort by date descending
          }
          return b.order - a.order; // then by PRno descending
        })}
        pagination={false}
        scroll={{
          x: columns.reduce((sum, col) => sum + (col.width || 150), 0),
        }}
      />
    </>
  );
};

export default LastOrderedTbl;
