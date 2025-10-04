import React, { useEffect, useState } from "react";
import { Button, Flex, message, Table, Tooltip } from "antd";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import { usePermission } from "../../hooks/usePermission";
import {
  DeleteTwoTone,
  EditTwoTone,
  EyeTwoTone,
  InfoCircleTwoTone,
} from "@ant-design/icons";
import NotAuth from "../notAuth";
import { useOutletContext } from "react-router-dom";

const InventoryListView = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const search = useOutletContext();
  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("inventory")) {
    return <NotAuth />;
  }
  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  //   Table Row Span Functionality
  const processedData = [];
  const codeCountMap = {};

  queryData.forEach((item) => {
    const code = item?.code;
    if (!codeCountMap[code]) {
      codeCountMap[code] = 1;
    } else {
      codeCountMap[code]++;
    }
  });

  const seen = {};

  queryData.forEach((item) => {
    const code = item?.code;
    if (!seen[code]) {
      processedData.push({ ...item, rowSpan: codeCountMap[code] });
      seen[code] = true;
    } else {
      processedData.push({ ...item, rowSpan: 0 });
    }
  });

  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 20,
      render: (text, record, index) => index + 1,
      responsive: ["lg"],
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      responsive: ["lg"],
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "SKU/Part",
      dataIndex: "SKU",
      key: "SKU",
      responsive: ["lg"],
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
      render: (_, record) => (
        <>
          <Flex gap={5}>
            {_}
            <InfoCircleTwoTone />
          </Flex>
        </>
      ),
    },
    {
      title: "UOM",
      dataIndex: "UOM",
      key: "UOM",
      responsive: ["lg"],
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      responsive: ["lg"],
    },
    {
      title: "On-Hand Qty",
      dataIndex: "locQty",
      key: "locQty",
      responsive: ["lg"],
    },
    {
      title: "Closing Qty",
      dataIndex: "onHandQty",
      key: "onHandQty",
      responsive: ["lg"],
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
    },
  ];
  const getTableData = async () => {
    const payload = { scope: "all" };
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/master/itemInfo/view`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          }
        )
        .then((res) => {
          // message.success(res.data.message);
          const tableArr = res?.data?.items?.flatMap((item) =>
            item.stock?.map((stock) => ({
              key: stock?._id,
              name: item?.name,
              code: item?.code,
              SKU: item?.SKU,
              UOM: item?.UOM?.code,
              location: stock?.location,
              locQty: stock?.onHandQty || 0,
              onHandQty:
                item?.stock?.reduce(
                  (sum, stock) => sum + (Number(stock?.onHandQty) || 0),
                  0
                ) || 0,
              safetyStock: item?.safetyStock || 0,
              type: item?.type?.name,
              access: item,
              action: item?._id,
            }))
          );
          setQueryData(tableArr);
        })
        .catch((err) => console.log(err));
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getTableData();
  }, []);

  return (
    <>
      <Table
        bordered
        columns={columns}
        dataSource={processedData
          ?.filter((item) =>
            item?.name?.toLowerCase().includes(search?.toLowerCase())
          )
          .sort((a, b) => a.name.localeCompare(b.name))} //.sort((a, b) => a.code.localeCompare(b.code))
        // title={() => "Header"}
        pagination={{ position: ["bottomRight"] }}
      />
    </>
  );
};

export default InventoryListView;
