import React from "react";
import BarCodeScanUI from "../../../components/barCodeScanUI";
import { Flex } from "antd";
import BarCodeListScanUI from "../../../components/barCodeListScanUI";

const Ecommerce = () => {
  return (
    <Flex>
      <BarCodeScanUI />
      <BarCodeListScanUI />
    </Flex>
  );
};

export default Ecommerce;
