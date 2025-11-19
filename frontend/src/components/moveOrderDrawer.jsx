import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button, Flex, Modal, Table, Typography } from "antd";
const { Text } = Typography;

const MoveOrderDrawer = ({ title, MOid }) => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const [open, setOpen] = useState(false);

  // Get data
  const getData = async (id) => {
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
          // message.success(res?.data?.message);
          setQueryData(res?.data?.items);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData(MOid);
  }, []);
  console.log(queryData);

  // Table Content
  const columns = [
    {
      title: "SKU",
      dataIndex: "SKU",
      key: "SKU",
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
    },
    {
      title: "Unit Price",
      dataIndex: "code",
      key: "code",
      render: (_, record) => <span>{_?.avgPrice}</span>,
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

  return (
    <Flex vertical gap="middle" align="flex-start">
      <Button type="link" onClick={() => setOpen(true)}>
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
          lg: "65%",
          xl: "65%",
          xxl: "565%",
        }}>
        <Table
          columns={columns}
          dataSource={queryData?.itemDetails}
          pagination={false}
          summary={() => {
            const totalQty = queryData?.itemDetails?.reduce(
              (sum, item) => sum + (item?.reqQty || 0),
              0
            );
            const totalValue = queryData?.itemDetails?.map(
              (item) => (item?.code?.avgPrice || 0) * (item?.reqQty || 0)
            );
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} />
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
