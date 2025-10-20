import React from "react";
import { DualAxes } from "@ant-design/plots";

const DualAxesChart = ({ title, height, cartData }) => {
  const qtyArr = Object.values(cartData || {}).map((item) => ({
    Date: item.name,
    Qty: Math.abs(item.qty),
    Value: Math.abs(item.value),
  }));

  const config = {
    xField: "Date",
    height: height,
    title: {
      title: title,
      titleFill: "#247f93",
      titleFontSize: 22,
    },
    legend: false,
    children: [
      {
        data: qtyArr,
        type: "interval",
        yField: "Value",
        stack: true,
        colorField: "Value",
        color: {
          range: [
            "#f4664a",
            "#faad14",
            "#a0d911",
            "#52c41a",
            "#13c2c2",
            "#1890ff",
            "#2f54eb",
          ],
        },
        style: { maxWidth: 80 },
        // scale: { y: { key: "key1", independent: false } },
        interaction: { elementHighlight: { background: true } },
      },
      {
        data: qtyArr,
        type: "line",
        yField: "Qty",
        style: { lineWidth: 3, stroke: "#FE911E" },
        scale: { y: { key: "key1", independent: false } },
      },
    ],
  };
  return (
    <>
      <DualAxes {...config} />
      {/* <Column {...config} /> */}
    </>
  );
};

export default DualAxesChart;
