import React from "react";
import moment from "moment";
import { Space, Table, Tag } from "antd";
import Title from "antd/es/typography/Title";

const LastPRTbl = ({ tableData }) => {
  const dataArr = Object.values(tableData || {}).map((item, key) => ({
    key: ++key,
    date: moment(item?.createdAt).format("DD-MMM-YY"),
    PRno: item?.code,
    createdBy: item?.requestedBy?.name,
    qty: item?.itemDetails
      ?.filter((detail) => detail.isDeleted === false)
      .reduce((sum, detail) => sum + (detail.reqQty || 0), 0),
    value: item?.itemDetails
      ?.filter((detail) => detail.isDeleted === false)
      .reduce(
        (sum, detail) => sum + (detail.reqQty || 0) * (detail.unitPrice || 0),
        0
      ),
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
      title: "PR No",
      dataIndex: "PRno",
      key: "PRno",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
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
        Latest PR
      </Title>
      <Table columns={columns} dataSource={dataArr} pagination={false} />
    </>
  );
};

export default LastPRTbl;
