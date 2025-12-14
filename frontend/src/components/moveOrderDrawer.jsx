import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button, Flex, message, Modal, Table, Typography, Grid } from "antd";
import { usePermission } from "../hooks/usePermission";
import moment from "moment";
const { Text } = Typography;
const { useBreakpoint } = Grid;

const MoveOrderDrawer = ({ title, MOid }) => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const screens = useBreakpoint();
  const [open, setOpen] = useState(false);

  // User Permission Check
  const { canDoOwn, canDoOther, canAuthOther, canAuthOwn } = usePermission();
  const own = canDoOwn("move-order", "view");
  const others = canDoOther("move-order", "view");
  const ownCheck = canAuthOwn("move-order", "check");
  const othersCheck = canAuthOther("move-order", "check");
  const ownConfirm = canAuthOwn("move-order", "confirm");
  const othersConfirm = canAuthOther("move-order", "confirm");
  const ownApprove = canAuthOwn("move-order", "approve");
  const othersApprove = canAuthOther("move-order", "approve");
  const ownHold = canAuthOwn("move-order", "hold");
  const othersHold = canAuthOther("move-order", "hold");
  // Get data
  const getData = async (id) => {
    setQueryData(null);
    const payload = { scope: "all", MOid: id };
    try {
      await axios
        .post(
          `${
            import.meta.env.VITE_API_URL
          }/api/transaction/move-order/view-single`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          }
        )
        .then((res) => {
          setQueryData(res?.data?.items);
          setOpen(true);
        });
    } catch (error) {
      console.log(error);
    }
  };

  // Table Content
  const columns = [
    {
      title: "SKU",
      dataIndex: "SKU",
      key: "SKU",
      responsive: ["lg"],
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "UOM",
      dataIndex: "UOM",
      key: "UOM",
      responsive: ["lg"],
    },
    {
      title: "Unit Price",
      dataIndex: "code",
      key: "code",
      responsive: ["lg"],
      render: (_, record) => <span>{_?.avgPrice?.toFixed(2)}</span>,
    },
    {
      title: "Req. Qty",
      dataIndex: "reqQty",
      key: "reqQty",
    },
    {
      title: "Req. Value",
      dataIndex: "reqVal",
      key: "reqVal",
      render: (_, record) => {
        const itemPrice = record?.code?.avgPrice;
        const itemReq = record?.reqQty;
        return <span>{Number(itemPrice * itemReq).toFixed(2)}</span>;
      },
    },
    {
      title: "On-Hand",
      dataIndex: "code",
      key: "code",
      responsive: ["lg"],
      render: (_, record) => {
        const totalOnHand = _?.stock.reduce(
          (sum, item) => sum + (item.onHandQty || 0),
          0
        );
        return <span>{totalOnHand}</span>;
      },
    },
    {
      title: "1M Used",
      dataIndex: "runningMonthUsed",
      key: "runningMonthUsed",
    },
    {
      title: "6M Used",
      dataIndex: "sixMonthUsed",
      key: "sixMonthUsed",
    },
  ];

  // Handle Status Update
  const handleStatusUpdate = async (values) => {
    const timeNow = moment(new Date());
    const payload = {
      status: values,
    };

    if (values == "Checked") {
      payload.checkedBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    if (values == "Confirmed") {
      payload.confirmedBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    if (values == "Approved") {
      payload.approvedBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    if (values == "Hold") {
      payload.holdBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    if (values == "Closed") {
      payload.closedBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/transaction/move-order/update/${
            queryData?._id
          }`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          }
        )
        .then((res) => {
          message.success(res.data.message);
          setOpen(false);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  return (
    <Flex vertical gap="middle" align="flex-start">
      <Button type="link" onClick={() => getData(MOid)}>
        {title}
      </Button>
      <Modal
        title="Move Order Approval"
        centered
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width={{
          xs: "95%",
          sm: "85%",
          md: "75%",
          // lg: "65%",
          // xl: "65%",
          // xxl: "65%",
        }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            {/* <OkBtn /> */}
            {((ownCheck && user?.id === queryData?.createdBy?._id) ||
              (othersCheck && user?.id !== queryData?.createdBy?._id)) &&
            queryData?.status == "In-Process" ? (
              <Button
                type="primary"
                className="no-print"
                onClick={() => handleStatusUpdate("Checked")}>
                Checked
              </Button>
            ) : ((ownConfirm && user?.id === queryData?.createdBy?._id) ||
                (othersConfirm && user?.id !== queryData?.createdBy?._id)) &&
              queryData?.status == "Checked" ? (
              <Button
                type="primary"
                className="no-print"
                onClick={() => handleStatusUpdate("Confirmed")}>
                Confirmed
              </Button>
            ) : ((ownApprove && user?.id === queryData?.createdBy?._id) ||
                (othersApprove && user?.id !== queryData?.createdBy?._id)) &&
              queryData?.status == "Confirmed" ? (
              <Button
                type="primary"
                className="no-print"
                onClick={() => handleStatusUpdate("Approved")}>
                Approved
              </Button>
            ) : null}
          </>
        )}>
        <Table
          columns={columns}
          dataSource={queryData?.itemDetails}
          pagination={false}
          summary={() => {
            const totalQty = queryData?.itemDetails?.reduce(
              (sum, item) => sum + (item?.reqQty || 0),
              0
            );
            const totalValue = queryData?.itemDetails?.reduce(
              (sum, item) =>
                sum + (item?.code?.avgPrice || 0) * (item?.reqQty || 0),
              0
            );
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={screens.lg ? 3 : 0} />
                  <Table.Summary.Cell index={1}>
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong>{Number(totalQty).toFixed(2)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <Text strong>{Number(totalValue).toFixed(2)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </Modal>
    </Flex>
  );
};
export default MoveOrderDrawer;
