import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";
import NotAuth from "../../notAuth";
import { Button, Flex, message, Table, Tooltip } from "antd";
import axios from "axios";
import moment from "moment";
import { DeleteTwoTone, EditTwoTone } from "@ant-design/icons";
import PurchaseOrderReviewForm from "./purchaseOrderReviewForm";

const PurchaseOrderReqTable = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const search = useOutletContext();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [modifiedData, setModifiedData] = useState([]);

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("purchase-order")) {
    return <NotAuth />;
  }
  const own = canDoOwn("purchase-order", "view");
  const others = canDoOther("purchase-order", "view");

  // Table details
  const columns = [
    {
      title: "PR No",
      dataIndex: "PR",
      key: "PR",
      filters: [...new Set(queryData?.map((item) => item.PR))].map((code) => ({
        text: code,
        value: code,
      })),
      onFilter: (value, record) => record?.PR === value,
      filterSearch: true,
    },

    {
      title: "SKU",
      dataIndex: "SKU",
      key: "SKU",
      filters: [...new Set(queryData?.map((item) => item.SKU))].map((code) => ({
        text: code,
        value: code,
      })),
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
      title: "Specification",
      dataIndex: "spec",
      key: "name",
      width: 200,
    },
    {
      title: "Req. Qty",
      dataIndex: "reqQty",
      key: "reqQty",
      // responsive: ["md"],
    },
    {
      title: "PO Qty",
      dataIndex: "POQty",
      key: "POQty",
    },
    {
      title: "Received Qty",
      dataIndex: "recQty",
      key: "recQty",
    },
    {
      title: "Req. By",
      dataIndex: "reqBy",
      key: "reqBy",
    },
    {
      title: "Req. Dept.",
      dataIndex: "reqDpt",
      key: "reqDpt",
    },
  ];

  // Row Selection
  const onSelectChange = (newSelectedRowKeys, modifiedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    const selectedRows = queryData?.filter((row) =>
      newSelectedRowKeys.includes(row.key),
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
          `${import.meta.env.VITE_API_URL}/api/purchase/requisition/view`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          },
        )
        .then((res) => {
          // message.success(res?.data?.message);
          const tableArr = res?.data?.items?.flatMap((item) =>
            item.itemDetails.map(
              (list) =>
                list?.POQty < list?.reqQty && {
                  key: list?._id,
                  PR: item?.code,
                  code: list?.code,
                  SKU: list?.code?.SKU || "NA",
                  name: list?.name,
                  UOM: list?.UOM,
                  spec: list?.spec || "",
                  reqQty: list?.reqQty,
                  reqPOQty: list?.reqQty - list?.POQty,
                  reqPOPrice: list?.unitPrice,
                  PORemarks: null,
                  POQty: list?.POQty,
                  recQty: list?.recQty,
                  POPending: list?.reqQty - list?.POQty,
                  reqBy: item?.requestedBy.name,
                  reqDpt: item?.costCenter?.name,
                  status: item?.status,
                  createdAt: moment(item?.createdAt).format(
                    "MMM DD, YYYY h:mm A",
                  ),
                  updatedAt: moment(item?.updatedAt).format(
                    "MMM DD, YYYY h:mm A",
                  ),
                  PRId: item?._id,
                },
            ),
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
          {hasSelected ? (
            <>
              <span>Selected {selectedRowKeys.length} items</span>
              <Button
                type="primary"
                onClick={() => setDrawerOpen(!drawerOpen)}
                style={{ borderRadius: "0px", padding: "10px 30px" }}>
                Make PO
              </Button>
            </>
          ) : (
            <Button
              disabled
              style={{ borderRadius: "0px", padding: "10px 30px" }}>
              Make PO
            </Button>
          )}
        </Flex>
        {!own && !others ? (
          <NotAuth />
        ) : (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={queryData?.filter((item) =>
              item.name?.toLowerCase().includes(search?.toLowerCase()),
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
      <PurchaseOrderReviewForm
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        data={modifiedData?.length > 0 ? modifiedData : selectedRowData}
        onSelectChange={onSelectChange}
      />
    </>
  );
};

export default PurchaseOrderReqTable;
