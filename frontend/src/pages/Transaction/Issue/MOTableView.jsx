import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import { Button, Flex, message, Table, Input } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import NotAuth from "../../notAuth";
import MOIssueForm from "./MOIssueForm";
const { Search } = Input;

const MOTableView = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [modifiedData, setModifiedData] = useState([]);

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("issue")) {
    return <NotAuth />;
  }
  const own = canDoOwn(lastSegment, "view");
  const others = canDoOther(lastSegment, "view");

  // Table details
  const columns = [
    {
      title: "MO No",
      dataIndex: "MO",
      key: "MO",
      filters: [...new Set(queryData?.map((item) => item?.MO))].map((code) => ({
        text: code,
        value: code,
      })),
      onFilter: (value, record) => record?.MO === value,
      filterSearch: true,
    },

    {
      title: "SKU",
      dataIndex: "SKU",
      key: "SKU",
      filters: [...new Set(queryData?.map((item) => item?.SKU))].map(
        (code) => ({
          text: code,
          value: code,
        })
      ),
      onFilter: (value, record) => record?.SKU === value,
      filterSearch: true,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "MO Qty",
      dataIndex: "reqQty",
      key: "reqQty",
      responsive: ["md"],
    },
    {
      title: "Issue Qty",
      dataIndex: "issuedQty",
      key: "issuedQty",
      responsive: ["md"],
    },
    {
      title: "Req. Dept.",
      dataIndex: "costCenter",
      key: "costCenter",
      responsive: ["md"],
    },
    {
      title: "Req. By",
      dataIndex: "reqBy",
      key: "reqBy",
      responsive: ["md"],
    },
  ];

  // Row Selection
  const onSelectChange = (newSelectedRowKeys, modifiedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    const selectedRows = queryData?.filter((row) =>
      newSelectedRowKeys.includes(row.key)
    );
    setSelectedRowData(selectedRows);

    // If we receive modified rows from the drawer, use those
    if (modifiedRows) {
      setModifiedData(modifiedRows);
    } else {
      // For initial selection, copy the selected rows
      setModifiedData(selectedRows);
    }
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  // Get Table Data
  const getTableData = async () => {
    const scope =
      own && others ? "all" : own ? "own" : others ? "others" : null;
    if (!scope) {
      setQueryData([]);
      message.warning("You are not authorized");
      return; // stop execution
    }
    const payload = { scope, status: "Approved" };
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/transaction/move-order/view`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          }
        )
        .then((res) => {
          // message.success(res?.data?.message);
          const tableArr = res?.data?.items?.flatMap((item) =>
            item?.itemDetails?.map(
              (list) =>
                list?.reqQty > list?.issueQty && {
                  key: list._id,
                  MO: item.code,
                  code: list?.code?.code,
                  SKU: list?.SKU || "NA",
                  name: list?.name,
                  UOM: list?.UOM,
                  reqQty: list?.reqQty,
                  issuedQty: list?.issueQty,
                  issueQty: list?.reqQty - list?.issueQty,
                  issuePrice: list?.code?.avgPrice,
                  remarks: list?.remarks,
                  stock: list?.code?.stock,
                  reference: item?.reference,
                  headerText: item?.headerText,
                  costCenter: item?.costCenter?.name,
                  reqBy: item?.requestedBy?.name,
                  createdAt: moment(item?.createdAt).format(
                    "MMM DD, YYYY h:mm A"
                  ),
                  MOid: item?._id,
                  MOLineid: list?._id,
                }
            )
          );

          setQueryData(tableArr);
        });
    } catch (error) {
      message.error(error?.response?.data?.error);
    }
  };

  useEffect(() => {
    getTableData();
  }, [drawerOpen]);
  return (
    <>
      <Flex gap="middle" vertical>
        <Flex align="center" gap="middle" justify="space-between">
          <Flex gap={16} align="center">
            {hasSelected ? (
              <>
                <span>Selected {selectedRowKeys?.length} items</span>
                <Button
                  type="primary"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  style={{ borderRadius: "0px", padding: "10px 30px" }}>
                  MO Issue
                </Button>
              </>
            ) : (
              <Button
                disabled
                style={{ borderRadius: "0px", padding: "10px 30px" }}>
                MO Issue
              </Button>
            )}
          </Flex>
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
        {!own && !others ? (
          <NotAuth />
        ) : (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={queryData?.filter((item) =>
              item?.name?.toLowerCase().includes(search?.toLowerCase())
            )}
            // title={() => "Header"}
            sticky
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: [
                ...(queryData?.length > 10 ? ["10"] : []),
                ...(queryData?.length > 20 ? ["20"] : []),
                ...(queryData?.length > 50 ? ["50"] : []),
                queryData?.length?.toString() || "100",
              ],
              defaultPageSize: 10,
              // showTotal: (total) => `Total ${total} items`,
            }}
            scroll={{
              x: columns.reduce((sum, col) => sum + (col.width || 150), 0),
            }}
          />
        )}
      </Flex>
      <MOIssueForm
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        data={modifiedData.length > 0 ? modifiedData : selectedRowData}
        onSelectChange={onSelectChange}
      />
    </>
  );
};

export default MOTableView;
