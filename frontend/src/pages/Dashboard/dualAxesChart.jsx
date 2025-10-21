import React from "react";
import { DualAxes } from "@ant-design/plots";

const DualAxesChart = ({ title, height, cartData }) => {
  const qtyArr = Object.values(cartData || {}).map((item) => {
    const issued = new Date(item.name);
    const day = issued.getDate().toString().padStart(2, "0"); // "21"
    const weekday = issued.toLocaleDateString("en-US", { weekday: "short" }); // "Tue"
    return {
      Date: `${day}-${weekday}`, // "21-Tue"
      Qty: Math.abs(item.qty),
      Value: Math.abs(item.value),
    };
  });

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
    </>
  );
};

export default DualAxesChart;
