import React from "react";
import { Pie } from "@ant-design/plots";
const PaiChart = ({ height, cartData }) => {
  const dataArr = Object.values(cartData || {})
    .map((item) => ({
      type: item._id,
      value: Math.floor(Math.abs(item.totalValue || 0)),
    }))
    .sort((a, b) => a.value - b.value);
  const config = {
    data: dataArr,
    angleField: "value",
    colorField: "type",
    innerRadius: 0.6,
    height: height,
    // label: {
    //   text: ({ value }) => {
    //     if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    //     if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    //     if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    //     return `${value}`;
    //   },
    //   style: {
    //     fontWeight: "bold",
    //   },
    // },
    // label: {
    //   type: "spider",
    //   content: ({ value }) => {
    //     if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    //     if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    //     if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    //     return `${value}`;
    //   },
    // },

    legend: {
      color: {
        title: true,
        position: "bottom",
        rowPadding: 5,
      },
    },
    annotations: [
      {
        type: "text",
        style: {
          text: "Stock\nTypes",
          x: "50%",
          y: "50%",
          textAlign: "center",
          fontSize: 28,
          fontStyle: "bold",
        },
      },
    ],
  };
  return <Pie {...config} />;
};

export default PaiChart;
