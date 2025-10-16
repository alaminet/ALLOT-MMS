import React from "react";
import { Line } from "@ant-design/plots";

const LineChart = ({ title, height, cartData }) => {
  const dataArr = Object.values(cartData || {}).map((item) => ({
    month: item.name,
    value: Math.abs(item.value),
  }));

  const config = {
    data: dataArr,
    height: height,
    title: {
      title: title,
      titleFill: "#247f93",
      titleFontSize: 22,
    },
    xField: "month",
    yField: "value",
    point: {
      shapeField: "square",
      sizeField: 4,
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 2,
    },
  };
  return <Line {...config} />;
};

export default LineChart;
