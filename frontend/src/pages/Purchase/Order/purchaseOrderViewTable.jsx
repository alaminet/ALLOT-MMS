import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tooltip,
} from "antd";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";

import {
  DeleteTwoTone,
  EditTwoTone,
  EyeTwoTone,
  InfoCircleTwoTone,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate, useOutletContext } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";
import NotAuth from "../../notAuth";
import PurchaseOrderUpdate from "./purchaseOrderUpdate";

const PurchaseOrderViewTable = () => {
  const navigate = useNavigate();
  const search = useOutletContext();
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editPOId, setEditPOId] = useState(null);

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("purchase-requisition")) {
    return <NotAuth />;
  }
  // const own = canDoOwn(lastSegment, "view");
  // const others = canDoOther(lastSegment, "view");
  const ownView = canDoOwn(lastSegment, "view");
  const othersView = canDoOther(lastSegment, "view");
  const ownEdit = canDoOwn(lastSegment, "edit");
  const othersEdit = canDoOther(lastSegment, "edit");
  const ownDelete = canDoOwn(lastSegment, "delete");
  const othersDelete = canDoOther(lastSegment, "delete");

  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 80,
      render: (text, record, index) => index + 1,
    },
    {
      title: "PO No",
      dataIndex: "PO",
      key: "PR",
      filters: [...new Set(queryData?.map((item) => item.PO))].map((code) => ({
        text: code,
        value: code,
      })),
      onFilter: (value, record) => record?.PO === value,
      filterSearch: true,
    },
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
      title: "PO Price",
      dataIndex: "POPrice",
      key: "POPrice",
      responsive: ["md"],
    },
    {
      title: "PO Qty",
      dataIndex: "POQty",
      key: "POQty",
      responsive: ["md"],
    },
    {
      title: "PO Value",
      dataIndex: "POValue",
      key: "POValue",
      responsive: ["md"],
    },
    {
      title: "GRN Qty",
      dataIndex: "GRNQty",
      key: "GRNQty",
      responsive: ["md"],
    },
    {
      title: "Req. By",
      dataIndex: "reqBy",
      key: "reqBy",
      responsive: ["md"],
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      responsive: ["md"],
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <>
          <Flex gap={4} justify="end">
            <Tooltip title="Print">
              <Button
                onClick={() =>
                  navigate("print", {
                    state: {
                      refData: _.action,
                    },
                  })
                }
                icon={<PrinterOutlined />}
              />
            </Tooltip>

            {/* {(canDoOther(lastSegment, "view") ||
              (canDoOwn(lastSegment, "view") && user.id == record.action)) && (
              <Tooltip title="View">
                <Button
                  onClick={() => handleView(record.access)}
                  icon={<EyeTwoTone />}
                />
              </Tooltip>
            )} */}
            {ownEdit && user.id === record?.createdBy ? (
              <Tooltip title="Edit">
                <Button
                  disabled={record.GRNAvl || record?.status !== "In-Process"}
                  onClick={() => {
                    setEditPOId(record.action);
                    setDrawerOpen(true);
                  }}
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            ) : othersEdit && user.id !== record?.createdBy ? (
              <Tooltip title="Edit">
                <Button
                  disabled={record.GRNAvl || record?.status !== "In-Process"}
                  onClick={() => {
                    setEditPOId(record.action);
                    setDrawerOpen(true);
                  }}
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            ) : null}
            {ownDelete && user.id === record?.createdBy ? (
              <Tooltip title="Delete">
                <Popconfirm
                  disabled={record.GRNQty > 0}
                  title="Sure to delete?"
                  onConfirm={() =>
                    handleChange(record.action, record.key, "isDeleted", true)
                  }>
                  <Button
                    icon={<DeleteTwoTone twoToneColor="#eb2f96" />}
                    disabled={record.GRNQty > 0}
                  />
                </Popconfirm>
              </Tooltip>
            ) : othersDelete && user.id !== record?.createdBy ? (
              <Tooltip title="Delete">
                <Popconfirm
                  disabled={record.GRNQty > 0}
                  title="Sure to delete?"
                  onConfirm={() =>
                    handleChange(record.action, record.key, "isDeleted", true)
                  }>
                  <Button
                    icon={<DeleteTwoTone twoToneColor="#eb2f96" />}
                    disabled={record.GRNQty > 0}
                  />
                </Popconfirm>
              </Tooltip>
            ) : null}
          </Flex>
        </>
      ),
    },
  ];
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
          `${import.meta.env.VITE_API_URL}/api/purchase/order/view`,
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
          const tableArr = res?.data?.items?.flatMap((item) =>
            item.itemDetails.map((list) => ({
              key: list?._id,
              PO: item?.code,
              PR: list?.PRCode,
              SKU: list?.SKU || "NA",
              name: list?.name,
              UOM: list?.UOM,
              POPrice: list?.POPrice,
              POQty: list?.POQty,
              GRNQty: list?.GRNQty,
              supplier: item?.supplier?.name,
              POValue: Number(list?.POQty * list?.POPrice).toFixed(2),
              reqBy: item?.requestedBy.name,
              status: item?.status,
              createdAt: moment(item?.createdAt).format("MMM DD, YYYY h:mm A"),
              updatedAt: moment(item?.updatedAt).format("MMM DD, YYYY h:mm A"),
              createdBy: item?.createdBy?._id,
              access: item,
              action: item?._id,
              GRNAvl: item?.itemDetails.some((itm) => itm.GRNQty > 0),
            }))
          );
          setQueryData(tableArr);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  // Handle Veiw table data
  const handleView = (values) => {
    setSelectedRecord(values);
    setIsModalVisible(true);
  };

  //   Update Functional
  const handleChange = async (id, lineID, field, data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/purchase/order/update/${id}`,
        { lineID, field, data },
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
  }, [drawerOpen]);
  return (
    <>
      {!ownView && !othersView ? (
        <NotAuth />
      ) : (
        <Table
          columns={columns}
          dataSource={queryData?.filter((item) =>
            item.name?.toLowerCase().includes(search?.toLowerCase())
          )}
          // title={() => "Header"}
          sticky
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
          scroll={{
            x: columns.reduce((sum, col) => sum + (col.width || 150), 0),
          }}
        />
      )}

      <Modal
        title="View Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}>
        <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
      </Modal>
      <PurchaseOrderUpdate
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        data={editPOId}
      />
    </>
  );
};

export default PurchaseOrderViewTable;
