import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button, Input, Modal, Table } from "antd";

import { ProductOutlined } from "@ant-design/icons";

const StockCheckModal = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [itemList, setItemList] = useState([]);

  // Modal options
  const showLoading = () => {
    getItems();
    setOpen(true);
    // setLoading(true);
    // Simple loading mock. You should add cleanup logic in real world.
    // setTimeout(() => {
    //   setLoading(false);
    // }, 2000);
  };

  // Table Options
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
      title: "Location (Unit)",
      dataIndex: "location",
      key: "location",
      render: (text, record, index) =>
        Array.isArray(text)
          ? text?.map(
              (st, i) =>
                st?.onHandQty > 0 && (
                  <p key={i} style={{ display: "block" }}>
                    {`${st?.location} (${st?.onHandQty})`}
                  </p>
                ),
            )
          : null,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
  ];

  // Get item details
  const getItems = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemInfo/view`,
        { scope: "all" },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        },
      );
      const tableArr = res?.data?.items?.map((item, index) => ({
        key: index + 1,
        SKU: item.SKU,
        name: item.name,
        UOM: item.UOM?.code,
        location: item.stock,
        stock: item.stock?.reduce((acc, curr) => acc + curr.onHandQty, 0),
        search: `${item.SKU} ${item.name}`,
      }));
      setItemList(tableArr);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Button
        onClick={showLoading}
        icon={<ProductOutlined />}
        type="primary"
        className="borderBrand"
        style={{ borderRadius: "0px" }}>
        Check Stock
      </Button>
      <Modal
        title="On-Hand Stock Status"
        footer={false}
        loading={loading}
        open={open}
        width={900}
        onCancel={() => setOpen(false)}>
        <Input
          placeholder="Name / SKU"
          variant="filled"
          style={{ marginBottom: "10px", borderRadius: "0px" }}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Table
          columns={columns}
          bordered
          scroll={{
            x: columns.reduce((sum, col) => sum + (col.width || 150), 0),
          }}
          dataSource={
            search !== "" &&
            itemList.filter((item) =>
              item?.search?.toLowerCase().includes(search?.toLowerCase()),
            )
          }
        />
      </Modal>
    </>
  );
};

export default StockCheckModal;
