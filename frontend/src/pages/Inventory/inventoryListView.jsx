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

  const data = [
    {
      name: "Shirt",
      code: "C001",
      size: "M",
      sizeStock: 100,
      totalStock: 100,
      sizeProduction: 100,
      totalProduction: 100,
      rating: "Regular",
    },
    {
      name: "Shirt",
      code: "C002",
      size: "XXL",
      sizeStock: 100,
      totalStock: 100,
      sizeProduction: 100,
      totalProduction: 100,
      rating: "Best",
    },
    {
      name: "Shirt",
      code: "C001",
      size: "L",
      sizeStock: 100,
      totalStock: 100,
      sizeProduction: 100,
      totalProduction: 100,
      rating: "Regular",
    },
    {
      name: "Shirt",
      code: "C001",
      size: "M",
      sizeStock: 100,
      totalStock: 100,
      sizeProduction: 100,
      totalProduction: 100,
      rating: "Regular",
    },
    {
      name: "Shirt",
      code: "C002",
      size: "XXL",
      sizeStock: 100,
      totalStock: 100,
      sizeProduction: 100,
      totalProduction: 100,
      rating: 100,
    },
    {
      name: "Shirt",
      code: "C001",
      size: "L",
      sizeStock: 100,
      totalStock: 100,
      sizeProduction: 100,
      totalProduction: 100,
      rating: "Regular",
    },
  ];

  //   Table Row Span Functionality
  const processedData = [];
  const codeCountMap = {};

  data.forEach((item) => {
    const code = item.code;
    if (!codeCountMap[code]) {
      codeCountMap[code] = 1;
    } else {
      codeCountMap[code]++;
    }
  });

  const seen = {};

  data.forEach((item) => {
    const code = item.code;
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
      title: "Code",
      dataIndex: "code",
      key: "code",
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
      title: "Size",
      dataIndex: "size",
      key: "size",
      responsive: ["lg"],
    },
    {
      title: "Size Stock",
      dataIndex: "sizeStock",
      key: "sizeStock",
      responsive: ["lg"],
    },
    {
      title: "Total Stock",
      dataIndex: "totalStock",
      key: "totalStock",
      responsive: ["lg"],
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "Size Production",
      dataIndex: "sizeProduction",
      key: "sizeProduction",
      responsive: ["lg"],
    },
    {
      title: "Total Production",
      dataIndex: "totalProduction",
      key: "totalProduction",
      responsive: ["lg"],
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "ratig",
      responsive: ["lg"],
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <>
    //       <Flex gap={4} justify="end">
    //         {(canDoOther(lastSegment, "view") ||
    //           (canDoOwn(lastSegment, "view") && user.id == record.action)) && (
    //           <Tooltip title="View">
    //             <Button
    //               //   onClick={() => handleEdit(item)}
    //               icon={<EyeTwoTone />}
    //             />
    //           </Tooltip>
    //         )}
    //         {(canDoOther(lastSegment, "edit") ||
    //           (canDoOwn(lastSegment, "edit") && user.id == record.action)) && (
    //           <Tooltip title="Edit">
    //             <Button
    //               //   onClick={() => handleEdit(item)}
    //               icon={<EditTwoTone />}
    //             />
    //           </Tooltip>
    //         )}
    //         {(canDoOwn(lastSegment, "delete") && user.id == record.action) ||
    //         (canDoOther(lastSegment, "delete") && user.id !== record.action) ? (
    //           <Tooltip title="Delete">
    //             <Button
    //               //   onClick={() => handleDelete(record)}
    //               icon={<DeleteTwoTone twoToneColor="#eb2f96" />}
    //             />
    //           </Tooltip>
    //         ) : (
    //           ""
    //         )}
    //       </Flex>
    //     </>
    //   ),
    // },
  ];
  const getUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/member/view`,
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        }
      );
      message.success(res.data.message);
      const tableArr = res?.data?.members?.map((item, index) => ({
        key: index,
        name: item?.name,
        email: item?.email,
        phone: item?.phone,
        status: item?.status,
        createdAt: moment(item?.createdAt).format("MMM DD, YYYY h:mm A"),
        updatedAt: moment(item?.updatedAt).format("MMM DD, YYYY h:mm A"),
        role: item?.isAdmin,
        access: item,
        action: item?._id,
      }));
      // if (!canDoOther("user", "view")) {
      //   const wonData = tableArr.filter((item) => item.action == user.id);
      //   setQueryData(wonData);
      // } else {
      //   console.log("can");
      //   setQueryData(tableArr);
      // }
      setQueryData(tableArr);
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);
  return (
    <>
      <Table
        bordered
        columns={columns}
        dataSource={processedData
          ?.filter((item) =>
            item?.code?.toLowerCase().includes(search?.toLowerCase())
          )
          .sort((a, b) => a.code.localeCompare(b.code))} //.sort((a, b) => a.code.localeCompare(b.code))
        // title={() => "Header"}
        pagination={{ position: ["bottomRight"] }}
      />
    </>
  );
};

export default InventoryListView;
