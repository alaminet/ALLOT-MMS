import React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import { useEffect } from "react";
import axios from "axios";
import { Button, Divider, Flex, message, Switch, Table, Tooltip } from "antd";
import Search from "antd/es/input/Search";
import { DeleteTwoTone, EditTwoTone } from "@ant-design/icons";
import moment from "moment";
import UserRoleViewTable from "./userRoleViewTable";
import UserAuthorizationViewTable from "./userAuthorizationViewTable";

const OrgUserTable = () => {
  const navigate = useNavigate();
  const user = useSelector((user) => user.loginSlice.login);
  const [search, setSearch] = useState("");
  const [queryData, setQueryData] = useState([]);

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  const accessName = "organization/org-user";
  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage(accessName)) {
    return <NotAuth />;
  }

  const ownView = canDoOwn(accessName, "view");
  const othersView = canDoOther(accessName, "view");
  const ownCreate = canDoOwn(accessName, "create");
  const othersCreate = canDoOther(accessName, "create");
  const ownEdit = canDoOwn(accessName, "edit");
  const othersEdit = canDoOther(accessName, "edit");
  const ownDelete = canDoOwn(accessName, "delete");
  const othersDelete = canDoOther(accessName, "delete");

  // Table Column
  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 50,
      render: (text, record, index) => index + 1,
      // responsive: ["lg"],
    },
    {
      title: "ORG ID",
      dataIndex: "orgId",
      key: "orgId",
      width: 100,
      // responsive: ["lg"],
    },
    {
      title: "User Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      // responsive: ["lg"],
    },
    {
      title: "User Email",
      dataIndex: "email",
      key: "email",
      // responsive: ["lg"],
    },
    {
      title: "Phoe",
      dataIndex: "phone",
      key: "phone",
      // responsive: ["lg"],
    },
    Table.EXPAND_COLUMN,
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      // responsive: ["lg"],
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      // responsive: ["lg"],
    },
    {
      title: "Updated By",
      dataIndex: "updatedBy",
      key: "updatedBy",
      // responsive: ["lg"],
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 120,
      // responsive: ["lg"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // responsive: ["lg"],
      render: (_, action) => (
        <Switch
          checkedChildren={true}
          unCheckedChildren={false}
          defaultValue={_}
          onChange={(e) => handleUserChange(action.action, "status", e)}
        />
      ),
    },
    {
      title: "Deleted",
      dataIndex: "deleted",
      key: "deleted",
      // responsive: ["lg"],
      render: (_, action) => (
        <Switch
          checkedChildren={true}
          unCheckedChildren={false}
          defaultValue={_}
          onChange={(e) => handleUserChange(action.action, "deleted", e)}
        />
      ),
    },
    {
      title: "Admin",
      dataIndex: "isAdmin",
      key: "isAdmin",
      // responsive: ["lg"],
      render: (_, action) => (
        <Switch
          checkedChildren={true}
          unCheckedChildren={false}
          defaultValue={_}
          onChange={(e) => handleUserChange(action.action, "isAdmin", e)}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <>
          <Flex gap={4} justify="end">
            {(othersEdit || (ownEdit && user.id == record.action)) && (
              <Tooltip title="Edit">
                <Button
                  // onClick={() =>
                  //   navigate("update", {
                  //     state: {
                  //       userInfo: record.access,
                  //     },
                  //   })
                  // }
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            )}
            {(ownDelete && user.id == record.action) ||
            (othersDelete && user.id !== record.action) ? (
              <Tooltip title="Delete">
                <Button
                  // onClick={(e) =>
                  //   handleUserChange(record.action, "deleted", true)
                  // }
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
          `${import.meta.env.VITE_API_URL}/api/super/SUOrgMember/view`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          }
        )
        .then((res) => {
          // console.log(res?.data?.data);
          message.success(res.data.message);
          const tableArr = res?.data?.data?.map((item, index) => ({
            key: index,
            orgId: item?.orgId,
            name: item?.name,
            email: item?.email,
            phone: item?.phone,
            deleted: item?.deleted,
            isAdmin: item?.isAdmin,
            status: item?.status,
            createdBy: item?.createdBy?.name,
            createdAt: moment(item?.createdAt).format("MMM DD, YYYY h:mm A"),
            updatedBy: item?.updatedBy?.name,
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
        `${import.meta.env.VITE_API_URL}/api/super/SUOrgMember/update/${id}`,
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
            style={{ borderRadius: "0px", padding: "10px 30px" }}>
            Add Org-Member
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
      <Table
        columns={columns}
        dataSource={queryData?.filter((item) =>
          item?.name?.toLowerCase().includes(search?.toLowerCase())
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
        expandable={{
          expandedRowRender: (record) => (
            <>
              <Divider>User Role Access</Divider>
              <UserRoleViewTable data={record?.access?.access} />
              <Divider>User Authorization Access</Divider>
              <UserAuthorizationViewTable
                data={record?.access?.authorization}
              />
            </>
          ),
          rowExpandable: (record) => record.access !== "Not Expandable",
        }}
      />
    </>
  );
};

export default OrgUserTable;
