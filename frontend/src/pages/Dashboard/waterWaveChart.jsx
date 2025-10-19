import React from "react";
import { Liquid } from "@ant-design/plots";

const WaterWaveChart = ({ title, height, percent }) => {
  const config = {
    percent: percent,
    height: height,
    title: {
      title: title,
      align: "center",
      titleFill: "#247f93",
      titleFontSize: 14,
    },
    style: {
      outlineBorder: 4,
      outlineDistance: 4,
      waveLength: 128,
    },
  };
  return <Liquid {...config} />;
};

export default WaterWaveChart;
