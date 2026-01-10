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
import UserRoleViewTable from "../Users/userRoleViewTable";
import UserAuthorizationViewTable from "../Users/userAuthorizationViewTable";
import axios from "axios";
import Search from "antd/es/input/Search";
import { useNavigate } from "react-router-dom";
import PasswordUpdateModal from "../../components/passwordUpdateModal";
import { DeleteTwoTone, EditTwoTone } from "@ant-design/icons";

const OrgListTable = () => {
  const navigate = useNavigate();
  const user = useSelector((user) => user.loginSlice.login);
  const [search, setSearch] = useState("");
  const [queryData, setQueryData] = useState([]);

  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("organization")) {
    return <NotAuth />;
  }
  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  const own = canDoOwn(lastSegment, "view");
  const others = canDoOther(lastSegment, "view");

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
      title: "Organization Name",
      dataIndex: "orgName",
      key: "orgName",
      fixed: "left",
      // responsive: ["lg"],
    },
    {
      title: "Phone(s)",
      dataIndex: "phone",
      key: "phone",
      width: 220,
      // responsive: ["lg"],
    },
    {
      title: "Email(s)",
      dataIndex: "email",
      key: "email",
      width: 220,
      // responsive: ["lg"],
    },
    {
      title: "Business Address",
      dataIndex: "businessAddress",
      key: "businessAddress",
      width: 220,
      // responsive: ["lg"],
    },
    {
      title: "Office Address",
      dataIndex: "officeAddress",
      key: "officeAddress",
      width: 220,
      // responsive: ["lg"],
    },

    // Table.EXPAND_COLUMN,

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
      // responsive: ["lg"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // responsive: ["lg"],
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
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <>
          <Flex gap={4} justify="end">
            {(canDoOther("user", "edit") ||
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

  // Get Table Data
  const getTableData = async () => {
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
        .post(
          `${import.meta.env.VITE_API_URL}/api/super/SUOrganization/view`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          }
        )
        .then((res) => {
          message.success(res.data.message);
          const tableArr = res?.data?.organization?.map((item, index) => ({
            key: index,
            orgId: item?.orgId,
            orgName: item?.orgName,
            phone: (
              <>
                Office: {item?.phone?.office || "—"} <br />
                Contact: {item?.phone?.contact || "—"} <br />
                Alternate: {item?.phone?.alternate || "—"}
              </>
            ),
            email: (
              <>
                Office: {item?.email?.office || "—"} <br />
                Contact: {item?.email?.contact || "—"} <br />
                Alternate: {item?.email?.alternate || "—"}
              </>
            ),
            trade: item?.trade,
            TIN: item?.TIN,
            taxInfo: item?.taxInfo,
            businessAddress: Object.values(item?.businessAddress)
              .reverse()
              .join(" ,"),
            officeAddress: Object.values(item?.officeAddress)
              .reverse()
              .join(" ,"),
            paymentInfo: item?.paymentInfo,
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
        `${import.meta.env.VITE_API_URL}/api/super/SUmember/update/${id}`,
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
      {!own && !others ? (
        <NotAuth />
      ) : (
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
                disabled={!canDoOwn("organization", "create")}
                style={{ borderRadius: "0px", padding: "10px 30px" }}>
                Add Organization
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
              item?.orgName?.toLowerCase().includes(search?.toLowerCase())
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
            // expandable={{
            //   expandedRowRender: (record) => (
            //     <>
            //       <Divider>User Role Access</Divider>
            //       <UserRoleViewTable data={record?.access?.access} />
            //       <Divider>User Authorization Access</Divider>
            //       <UserAuthorizationViewTable
            //         data={record?.access?.authorization}
            //       />
            //     </>
            //   ),
            //   rowExpandable: (record) => record.access !== "Not Expandable",
            // }}
          />
        </>
      )}
    </>
  );
};

export default OrgListTable;
