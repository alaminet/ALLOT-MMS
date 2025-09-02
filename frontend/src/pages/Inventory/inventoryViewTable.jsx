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

  const data = [
    {
      name: "Shirt",
      code: "C001",
      stockProcess: 100,
      stockAvailable: 100,
      stockShipping: 100,
      stockReturn: 100,
      stockValue: 100,
      purchaseCost: 100,
      category: "MEN",
    },
    {
      name: "Pant",
      code: "C002",
      stockProcess: 100,
      stockAvailable: 100,
      stockShipping: 100,
      stockReturn: 100,
      stockValue: 100,
      purchaseCost: 100,
      category: "WOMEN",
    },
  ];
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
      // responsive: ["lg"],
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",

      // responsive: ["lg"],
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
      title: "Processing Stock",
      dataIndex: "stockProcess",
      key: "stockProcess",
      responsive: ["lg"],
    },
    {
      title: "Avilable Stock",
      dataIndex: "stockAvailable",
      key: "stockAvailable",
      // responsive: ["lg"],
    },
    {
      title: "Shipping Stock",
      dataIndex: "stockShipping",
      key: "stockShipping",
      responsive: ["lg"],
    },
    {
      title: "Return Stock",
      dataIndex: "stockReturn",
      key: "stockReturn",
      responsive: ["lg"],
    },
    {
      title: "Stock Value",
      dataIndex: "stockValue",
      key: "stockValue",
      responsive: ["lg"],
    },
    {
      title: "Purchase Cost",
      dataIndex: "purchaseCost",
      key: "purchaseCost",
      responsive: ["lg"],
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      responsive: ["lg"],
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   responsive: ["lg"],
    //   render: (_, action) => (
    //     <Switch
    //       disabled={action.role}
    //       checkedChildren="Active"
    //       unCheckedChildren="Inactive"
    //       defaultValue={_}
    //       onChange={(e) => handleUserChange(action.action, "status", e)}
    //     />
    //   ),
    // },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Flex gap={4} justify="end">
            {(canDoOther(lastSegment, "view") ||
              (canDoOwn(lastSegment, "view") && user.id == record.action)) && (
              <Tooltip title="View">
                <Button
                  //   onClick={() => handleEdit(item)}
                  icon={<EyeTwoTone />}
                />
              </Tooltip>
            )}
            {(canDoOther(lastSegment, "edit") ||
              (canDoOwn(lastSegment, "edit") && user.id == record.action)) && (
              <Tooltip title="Edit">
                <Button
                  //   onClick={() => handleEdit(item)}
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            )}
            {(canDoOwn(lastSegment, "delete") && user.id == record.action) ||
            (canDoOther(lastSegment, "delete") && user.id !== record.action) ? (
              <Tooltip title="Delete">
                <Button
                  //   onClick={() => handleDelete(record)}
                  icon={<DeleteTwoTone twoToneColor="#eb2f96" />}
                />
              </Tooltip>
            ) : (
              ""
            )}
          </Flex>
        </>
      ),
    },
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
        columns={columns}
        dataSource={data?.filter((item) =>
          item?.code?.toLowerCase().includes(search?.toLowerCase())
        )}
        // title={() => "Header"}
        pagination={{ position: ["bottomRight"] }}
      />
    </>
  );
};

export default InventoryViewTable;
