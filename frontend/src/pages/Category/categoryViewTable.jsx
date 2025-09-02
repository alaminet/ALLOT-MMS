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
import { useNavigate, useOutletContext } from "react-router-dom";
import SizeTable from "../../components/sizeTable";

const CategoryViewTable = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const search = useOutletContext();
  const navigate = useNavigate();
  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("category")) {
    return <NotAuth />;
  }
  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  const data = [
    {
      name: "Men",
      code: "C001",
      discription:
        "lorem spam dummy tex, not a discription, it's just value check details",
      size: [
        {
          name: "M",
          value: [{ chest: 39 }, { length: 27.5 }, { sleeve: 8.5 }],
        },
        {
          name: "L",
          value: [{ chest: 39 }, { length: 27.5 }, { sleeves: 8.5 }],
        },
        {
          name: "XL",
          value: [{ chest: 39 }, { lengtht: 27.5 }, { sleeve: 8.5 }],
        },
      ],
      totalStock: 100,
      sizeProduction: 100,
      totalProduction: 100,
      rating: "Regular",
    },
    {
      name: "Child",
      code: "C002",
      discription:
        "lorem spam dummy tex, not a discription, it's just value check details",
      size: [
        {
          name: "M",
          value: [{ cover: 39 }, { solder: 27.5 }, { high: 8.5 }],
        },
        {
          name: "L",
          value: [{ cover: 39 }, { solder: 27.5 }, { high: 8.5 }],
        },
        {
          name: "XL",
          value: [{ cover: 39 }, { solder: 27.5 }, { high: 8.5 }],
        },
      ],
      totalStock: 100,
      sizeProduction: 100,
      totalProduction: 100,
      rating: "Regular",
    },
  ];

  //   Table Row Span Functionality
  const processedData = [];
  const codeCountMap = {};

  queryData?.forEach((item) => {
    const code = item.code;
    if (!codeCountMap[code]) {
      codeCountMap[code] = 1;
    } else {
      codeCountMap[code]++;
    }
  });

  const seen = {};

  queryData?.forEach((item) => {
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
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 50,
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
      title: "Discriptions",
      dataIndex: "discription",
      key: "discription",
      responsive: ["lg"],
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
      render: (_, record) => <div dangerouslySetInnerHTML={{ __html: _ }} />,
    },
    {
      title: "Mesurment Details",
      align: "center",
      dataIndex: "size",
      key: "size",
      width: 300,
      responsive: ["lg"],
      render: (_, record) => (
        <>
          <SizeTable data={_} />
        </>
      ),
    },
    {
      title: "Action",
      width: 50,
      key: "action",
      render: (_, record) => (
        <>
          <Flex gap={4} justify="end">
            {/* {(canDoOther(lastSegment, "view") ||
              (canDoOwn(lastSegment, "view") && user.id == record.action)) && (
              <Tooltip title="View">
                <Button
                  //   onClick={() => handleEdit(item)}
                  icon={<EyeTwoTone />}
                />
              </Tooltip>
            )} */}
            {(canDoOther(lastSegment, "edit") ||
              (canDoOwn(lastSegment, "edit") && user.id == record.action)) && (
              <Tooltip title="Edit">
                <Button
                  onClick={() =>
                    navigate("update", {
                      state: {
                        categoryInfo: record.access,
                      },
                    })
                  }
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            )}
            {(canDoOwn(lastSegment, "delete") && user.id == record.action) ||
            (canDoOther(lastSegment, "delete") && user.id !== record.action) ? (
              <Tooltip title="Delete">
                <Button
                  onClick={(e) => handleChange(record.action, "deleted", true)}
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
  const getTableData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/category/view`,
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        }
      );
      message.success(res.data.message);
      const tableArr = res?.data?.categories?.map((item, index) => ({
        key: index,
        name: item?.name,
        code: item?.code,
        discription: item?.discription,
        size: item?.size,
        status: item?.status,
        createdBy: item?.createdBy,
        createdAt: moment(item?.createdAt).format("MMM DD, YYYY h:mm A"),
        updatedAt: moment(item?.updatedAt).format("MMM DD, YYYY h:mm A"),
        access: item,
        action: item?._id,
      }));
      if (!canDoOwn(lastSegment, "view") && canDoOther(lastSegment, "view")) {
        setQueryData(tableArr.filter((item) => item.action !== user.id));
      } else if (
        canDoOwn(lastSegment, "view") &&
        !canDoOther(lastSegment, "view")
      ) {
        setQueryData(tableArr.filter((item) => item.action === user.id));
      } else if (
        canDoOther(lastSegment, "view") &&
        canDoOwn(lastSegment, "view")
      ) {
        setQueryData(tableArr);
      } else {
        setQueryData([]);
      }
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  //   Update Functional
  const handleChange = async (id, field, data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/category/update/${id}`,
        { [field]: data },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        }
      );
      message.success(res.data.message);
      getTableData();
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
            item?.code?.toLowerCase().includes(search?.toLowerCase())
          )
          .sort((a, b) => a.code.localeCompare(b.code))}
        pagination={{ position: ["bottomRight"] }}
      />
    </>
  );
};

export default CategoryViewTable;
