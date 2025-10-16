import React from "react";
import { Column } from "@ant-design/plots";
import { Card } from "antd";

const BarChart = ({ title, height, cartData }) => {
  const dataArr = Object.values(cartData || {}).map((item) => ({
    date: item.name,
    value: Math.abs(item.value),
  }));

  const config = {
    data: dataArr,
    legend: false,
    height: height,
    title: {
      title: title,
      titleFill: "#247f93",
      titleFontSize: 22,
    },
    xField: "date",
    yField: "value",
    colorField: "date",
    scale: {
      color: {
        range: [
          "#f4664a",
          "#faad14",
          "#a0d911",
          "#52c41a",
          "#13c2c2",
          "#1890ff",
          "#2f54eb",
          "#722ed1",
        ],
      },
    },
  };
  return (
    <>
      <Column {...config} />
    </>
  );
};

export default BarChart;
