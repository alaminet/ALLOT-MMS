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

const InventoryViewTable = () => {
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

  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 80,
      render: (text, record, index) => index + 1,
      responsive: ["lg"],
    },
    {
      title: "Code",
      dataIndex: "SKU",
      key: "SKU",

      // responsive: ["lg"],
      render: (_, record) => (
        <>
          <Flex gap={5}>{_}</Flex>
        </>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 300,
      // responsive: ["lg"],
    },
    {
      title: "UOM",
      dataIndex: "UOM",
      key: "UOM",
      width: 80,
      // responsive: ["lg"],
    },
    {
      title: "Received Qty",
      dataIndex: "recQty",
      key: "recQty",
      // responsive: ["lg"],
    },
    {
      title: "Issued Qty",
      dataIndex: "issueQty",
      key: "issueQty",
      // responsive: ["lg"],
    },
    {
      title: "On-Hand Qty",
      dataIndex: "onHandQty",
      key: "onHandQty",
      // responsive: ["lg"],
    },
    {
      title: "Safety Stock",
      dataIndex: "safetyStock",
      key: "safetyStock",
      // responsive: ["lg"],
    },
    {
      title: "Item Group",
      dataIndex: "group",
      key: "group",
      responsive: ["lg"],
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
          const tableArr = res?.data?.items?.flatMap((item) => ({
            key: item._id,
            name: item?.name,
            SKU: item?.SKU,
            UOM: item?.UOM?.code,
            group: item?.group?.name,
            issueQty:
              item?.stock?.reduce(
                (sum, stock) => sum + (Number(stock?.issueQty) || 0),
                0
              ) || 0,
            recQty:
              item?.stock?.reduce(
                (sum, stock) => sum + (Number(stock?.recQty) || 0),
                0
              ) || 0,
            onHandQty:
              item?.stock?.reduce(
                (sum, stock) => sum + (Number(stock?.onHandQty) || 0),
                0
              ) || 0,
            safetyStock: item?.safetyStock || 0,
            type: item?.type.name,
            access: item,
            action: item?._id,
          }));
          setQueryData(tableArr);
        });
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
        columns={columns}
        dataSource={queryData?.filter((item) =>
          item?.name?.toLowerCase().includes(search?.toLowerCase())
        )}
        // title={() => "Header"}
        sticky
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: [
            "10",
            "20",
            "50",
            queryData?.length?.toString() || "100",
          ],
          // showTotal: (total) => `Total ${total} items`,
          defaultPageSize: 10,
        }}
        scroll={{
          x: columns.reduce((sum, col) => sum + (col.width || 150), 0),
        }}
      />
    </>
  );
};

export default InventoryViewTable;
