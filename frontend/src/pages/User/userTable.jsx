import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Flex,
  Input,
  message,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import useLogout from "../../hooks/useLogout";
import { DeleteTwoTone, EditTwoTone, LockTwoTone } from "@ant-design/icons";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";
import UserRoleViewTable from "./userRoleViewTable";
import { useNavigate, useOutletContext } from "react-router-dom";
import UserAuthorizationViewTable from "./userAuthorizationViewTable";
import PasswordUpdateModal from "../../components/passwordUpdateModal";

const UserTable = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const navigate = useNavigate();
  const logout = useLogout();
  const [queryData, setQueryData] = useState([]);
  const [findData, setFindData] = useState();
  const search = useOutletContext();

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("user")) {
    return <NotAuth />;
  }
  const own = canDoOwn(lastSegment, "view");
  const others = canDoOther(lastSegment, "view");

  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      render: (text, record, index) => index + 1,
      responsive: ["lg"],
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      // responsive: ["lg"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["lg"],
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      responsive: ["lg"],
    },
    Table.EXPAND_COLUMN,
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      responsive: ["lg"],
      render: (_, action) =>
        _ ? (
          <>
            <Tag color="#f50">Admin</Tag>
          </>
        ) : (
          <>
            <Tag color="#2db7f5">User</Tag>
          </>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      responsive: ["lg"],
      render: (_, action) => (
        <Switch
          disabled={!user.isAdmin}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          defaultValue={_}
          onChange={(e) => handleUserChange(action.action, "status", e)}
        />
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      responsive: ["lg"],
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Flex gap={4} justify="end">
            {((canDoOther("pwdr", "edit") && user.id !== record.action) ||
              (canDoOwn("pwdr", "edit") && user.id == record.action)) && (
              <PasswordUpdateModal data={record.action} />
            )}
            {((canDoOther("user", "edit") && user.id !== record.action) ||
              (canDoOwn("user", "edit") && user.id == record.action)) && (
              <Tooltip title="Edit">
                <Button
                  onClick={() =>
                    navigate("update", {
                      state: {
                        userInfo: record.access,
                      },
                    })
                  }
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            )}
            {(canDoOwn("user", "delete") && user.id == record.action) ||
            (canDoOther("user", "delete") && user.id !== record.action) ? (
              <Tooltip title="Delete">
                <Button
                  disabled={record.role}
                  onClick={(e) =>
                    handleUserChange(record.action, "deleted", true)
                  }
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
    const scope =
      own && others ? "all" : own ? "own" : others ? "others" : null;
    if (!scope) {
      setQueryData([]);
      message.warning("You are not authorized");
      return; // stop execution
    }
    const payload = { scope };

    try {
      await axios
        .post(`${import.meta.env.VITE_API_URL}/api/member/view`, payload, {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        })
        .then((res) => {
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
        `${import.meta.env.VITE_API_URL}/api/member/update/${id}`,
        { [field]: data },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        }
      );
      message.success(res.data.message);
      getUsers();
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);
  return (
    <>
      {!own && !others ? (
        <NotAuth />
      ) : (
        <Table
          columns={columns}
          dataSource={queryData?.filter((item) =>
            item?.name?.toLowerCase().includes(search?.toLowerCase())
          )}
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
                <UserRoleViewTable data={record?.access?.access} />
                <UserAuthorizationViewTable
                  data={record?.access?.authorization}
                />
              </>
            ),
            rowExpandable: (record) => record.access !== "Not Expandable",
          }}
        />
      )}
    </>
  );
};

export default UserTable;
