import React from "react";
import moment from "moment";
import { Button, Space, Table, Tag } from "antd";
import Title from "antd/es/typography/Title";
import { Link, useNavigate } from "react-router-dom";

const LastPRTbl = ({ tableData }) => {
  const navigate = useNavigate();
  const dataArr = Object.values(tableData || {}).map((item, key) => ({
    key: ++key,
    id: item._id,
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
      title: "PR No",
      dataIndex: "PRno",
      key: "PRno",
      render: (text, record) => (
        <Button
          type="link"
          onClick={() =>
            navigate("/purchase-requisition/print", {
              state: {
                refData: record.id,
              },
            })
          }>
          {text}
        </Button>
      ),
    },
    {
      title: "Requested By",
      dataIndex: "createdBy",
      key: "createdBy",
      responsive: ["lg"],
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
