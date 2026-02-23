import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";
import { message, Table } from "antd";
import { useSelector } from "react-redux";
import moment from "moment";
import NotAuth from "../pages/notAuth";

const LogActivites = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const location = useLocation();
  const { model } = location.state || {};

  // Get pathname
  const pathname = location.pathname;
  const firstSegment = pathname.split("/")[1];

  // User Permission Check
  const { canViewPage, canDoOther } = usePermission();
  if (!canViewPage(firstSegment)) {
    return <NotAuth />;
  }

  //   table details
  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 20,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
    },
    {
      title: "By",
      key: "actionBy",
      dataIndex: "actionBy",
      width: 200,
      filters: [...new Set(queryData?.map((item) => item?.actionBy))].map(
        (item) => ({
          text: item,
          value: item,
        }),
      ),
      onFilter: (value, record) => record?.actionBy === value,
      filterSearch: true,
    },
  ];
  const getLogs = async () => {
    const payload = { model };
    if (!user.isAdmin) {
      payload.userId = user.id;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/logs`,
        payload,
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        },
      );
      // message.success(res.data.message);
      const tableArr = res?.data?.logs?.map((item, index) => ({
        key: index,
        action: item?.action,
        actionBy: item?.actionBy?.name,
        createdAt: moment(item?.createdAt).format("MMM DD, YYYY h:mm A"),
      }));

      setQueryData(tableArr);
    } catch (error) {
      // message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getLogs();
  }, []);

  return (
    <>
      <Table
        columns={columns}
        dataSource={queryData}
        pagination={{ position: ["bottomRight"] }}
      />
    </>
  );
};

export default LogActivites;
