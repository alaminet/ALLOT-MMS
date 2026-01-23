import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import {
  Button,
  Divider,
  Flex,
  message,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import moment from "moment";
import axios from "axios";
import Search from "antd/es/input/Search";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleTwoTone,
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import BreadCrumbCustom from "../../components/breadCrumbCustom";
const OrgPackageTable = () => {
  const navigate = useNavigate();
  const user = useSelector((user) => user.loginSlice.login);
  const [search, setSearch] = useState("");
  const [queryData, setQueryData] = useState([]);

  // User Permission Check
  const pathname = location.pathname;
  const lastSegment = "organization/org-package";
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage(lastSegment)) {
    return <NotAuth />;
  }
  // Get pathname
  const ownView = canDoOwn(lastSegment, "view");
  const othersView = canDoOther(lastSegment, "view");
  const ownCreate = canDoOwn(lastSegment, "create");
  const othersCreate = canDoOther(lastSegment, "create");
  const ownEdit = canDoOwn(lastSegment, "edit");
  const othersEdit = canDoOther(lastSegment, "edit");
  const ownDelete = canDoOwn(lastSegment, "delete");
  const othersDelete = canDoOther(lastSegment, "delete");

  // Table Column
  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 50,
      render: (text, record, index) => index + 1,
    },
    {
      title: "ORG ID",
      dataIndex: "orgId",
      key: "orgId",
      width: 100,
      fixed: "left",
    },
    {
      title: "Organization Name",
      dataIndex: "orgName",
      key: "orgName",
      fixed: "left",
    },
    {
      title: "Affiliater (%)",
      dataIndex: "affiliater",
      key: "affiliater",
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
    },

    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Updated By",
      dataIndex: "updatedBy",
      key: "updatedBy",
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <>
          <Flex gap={4} justify="end">
            {othersEdit && user.id !== record.access?.createdBySU?._id ? (
              <Tooltip title="Edit">
                <Button
                  onClick={() =>
                    navigate("update", {
                      state: {
                        orgPackageDetails: record.access,
                      },
                    })
                  }
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            ) : ownEdit && user.id === record.access?.createdBySU?._id ? (
              <Tooltip title="Edit">
                <Button
                  onClick={() =>
                    navigate("update", {
                      state: {
                        orgPackageDetails: record.access,
                      },
                    })
                  }
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            ) : null}
            {/* {othersDelete && user.id !== record.access?.createdBySU?._id ? (
              <Tooltip title={record.access?.isDeleted ? "Recovery" : "Delete"}>
                <Button
                  onClick={(e) =>
                    handleUserChange(
                      record.action,
                      "isDeleted",
                      !record.access?.isDeleted,
                    )
                  }
                  icon={
                    record.access?.isDeleted ? (
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                    ) : (
                      <DeleteTwoTone twoToneColor="#eb2f96" />
                    )
                  }
                />
              </Tooltip>
            ) : ownDelete && user.id === record.access?.createdBySU?._id ? (
              <Tooltip title={record.access?.isDeleted ? "Recovery" : "Delete"}>
                <Button
                  onClick={(e) =>
                    handleUserChange(
                      record.action,
                      "isDeleted",
                      !record.access?.isDeleted,
                    )
                  }
                  icon={
                    record.access?.isDeleted ? (
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                    ) : (
                      <DeleteTwoTone twoToneColor="#eb2f96" />
                    )
                  }
                />
              </Tooltip>
            ) : null} */}
          </Flex>
        </>
      ),
    },
  ];

  // Get Table Data
  const getTableData = async () => {
    const scope =
      ownView && othersView
        ? "all"
        : ownView
          ? "own"
          : othersView
            ? "others"
            : null;
    if (!scope) {
      setQueryData([]);
      message.warning("You are not authorized");
      return; // stop execution
    }
    const payload = { scope };

    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/super/SUOrgPackage/view`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          },
        )
        .then((res) => {
          message.success(res.data.message);
          const tableArr = res?.data?.queryData?.map((item, index) => ({
            key: index,
            orgId: item?.organization?.orgId,
            orgName: item?.organization?.orgName,
            affiliater:
              item?.affiliater?.name + " (" + item?.affaliteAmount + "%)",
            dueDate: moment(item?.dueDate).format("MMM DD, YYYY h:mm A"),
            createdBy: item?.createdBy?.name || item?.createdBySU?.name,
            createdAt: moment(item?.createdAt).format("MMM DD, YYYY h:mm A"),
            updatedBy: item?.updatedBy?.name || item?.updatedBySU?.name,
            updatedAt: moment(item?.updatedAt).format("MMM DD, YYYY h:mm A"),
            access: item,
            action: item?._id,
          }));
          setQueryData(tableArr);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  //   Member Update Functional
  const handleUserChange = async (id, field, data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/super/SUOrgPackage/update/${id}`,
        { [field]: data },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        },
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
      {!ownView && !othersView ? (
        <NotAuth />
      ) : (
        <>
          <Flex justify="space-between">
            <BreadCrumbCustom />
            <Flex
              justify="end"
              style={{
                marginBottom: "10px",
                gap: "10px",
                display:
                  (lastSegment === "new" || lastSegment === "update") && "none",
              }}>
              {lastSegment !== "new" && (
                <Button
                  type="primary"
                  onClick={() => navigate("new")}
                  disabled={!ownCreate && !othersCreate}
                  style={{ borderRadius: "0px", padding: "21px 30px" }}>
                  Add Org Package
                </Button>
              )}
              <Search
                className="search-field"
                style={{
                  width: "300px",
                }}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name"
                // onSearch={onSearch}
                enterButton
              />
            </Flex>
          </Flex>

          <Table
            columns={columns}
            dataSource={queryData?.filter((item) =>
              item?.orgName?.toLowerCase().includes(search?.toLowerCase()),
            )}
            sticky
            scroll={{
              x: columns.reduce((sum, col) => sum + (col.width || 150), 0),
            }}
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
          />
        </>
      )}
    </>
  );
};

export default OrgPackageTable;
