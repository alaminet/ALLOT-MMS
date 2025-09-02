import React from "react";
import { Table } from "antd";
const SizeTable = ({ data }) => {
  // Step 1: Extract all unique attributes
  const allAttributes = Array.from(
    new Set(data?.flatMap((item) => item.attribute?.map((a) => a.name)))
  );

  // Step 2: Build table columns
  const columns = [
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      width: 50,
    },
    ...allAttributes?.map((attr) => ({
      title: attr.charAt(0).toUpperCase() + attr.slice(1),
      dataIndex: attr,
      key: attr,
      width: 50,
    })),
  ];

  // Step 3: Build table rows
  const dataSource = data?.map((item, index) => {
    const row = { key: index, size: item.name };
    item.attribute?.forEach((att) => {
      const key = att.name;
      row[key] = att.value;
    });
    return row;
  });
  return (
    <>
      <Table
        className="size-table"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        size="small"
        style={{ padding: "10px" }}
      />
    </>
  );
};

export default SizeTable;
