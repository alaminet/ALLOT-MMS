import React from "react";
import moment from "moment";
import { Button, Table } from "antd";
import Title from "antd/es/typography/Title";
import MoveOrderDrawer from "../../components/moveOrderDrawer";

const ApprovalTable = ({ tableData, title, scope }) => {
  const qtyFiled =
    scope === "PR"
      ? "reqQty"
      : scope === "PO"
      ? "POQty"
      : scope === "MO"
      ? "reqQty"
      : null;
  const priceField =
    scope === "PR"
      ? "unitPrice"
      : scope === "PO"
      ? "POPrice"
      : scope === "MO"
      ? "avgPrice"
      : null;
  const printBaseURL =
    scope === "PR"
      ? "/purchase-requisition/print"
      : scope === "PO"
      ? "/purchase-order/print"
      : scope === "MO"
      ? "/move-order/print"
      : null;

  const dataArr = Object.values(tableData || {}).map((item, key) => ({
    key: key,
    id: item._id,
    date: moment(item?.createdAt).format("DD-MMM-YY"),
    refNo: item?.code,
    qty: item?.itemDetails
      ?.filter((detail) => detail.isDeleted === false)
      .reduce((sum, detail) => sum + (detail[qtyFiled] || 0), 0),
    value: item?.itemDetails
      ?.filter((detail) => detail.isDeleted === false)
      .reduce((sum, detail) => {
        const price =
          scope === "MO"
            ? detail.code?.[priceField] || 0 // nested in code
            : detail[priceField] || 0; // direct property

        return sum + (detail[qtyFiled] || 0) * price;
      }, 0)
      .toFixed(0),
  }));
  console.log(dataArr);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 110,
    },
    {
      title: "Ref.No",
      dataIndex: "refNo",
      key: "refNo",
      render: (text, record) =>
        // <Button
        //   type="link"
        //   onClick={() =>
        //     navigate(printBaseURL, {
        //       state: {
        //         refData: record.id,
        //       },
        //     })
        //   }>
        //   {text}
        // </Button>
        scope === "MO" ? (
          <MoveOrderDrawer title={text} MOid={record.id} />
        ) : (
          <Button
            type="link"
            onClick={() =>
              window.open(`${printBaseURL}?ref=${record.id}`, "_blank")
            }>
            {text}
          </Button>
        ),
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      align: "right",
    },
  ];

  return (
    <>
      <Title
        level={4}
        style={{
          textAlign: "left",
          margin: "0",
        }}
        className="colorLink">
        {title}
      </Title>
      <Table
        columns={columns}
        dataSource={dataArr}
        pagination={false}
        sticky
        style={{ height: "250px", overflowY: "auto" }}
      />
    </>
  );
};

export default ApprovalTable;
