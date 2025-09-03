import React, { useEffect, useState } from "react";
import { Button, Flex, message, Select, Table, Tooltip } from "antd";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import { usePermission } from "../../../hooks/usePermission";
import {
  DeleteTwoTone,
  EditTwoTone,
  EyeTwoTone,
  InfoCircleTwoTone,
} from "@ant-design/icons";
import NotAuth from "../../notAuth";
import { useNavigate, useOutletContext } from "react-router-dom";

const ItemViewTable = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const search = useOutletContext();
  const navigate = useNavigate();
  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("product")) {
    return <NotAuth />;
  }
  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 20,
      render: (text, record, index) => index + 1,
      responsive: ["lg"],
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      responsive: ["lg"],
    },
    {
      title: "SKU",
      dataIndex: "SKU",
      key: "SKU",

      responsive: ["lg"],
      render: (_, record) => (
        <>
          <Flex gap={5}>
            {_}
            <InfoCircleTwoTone />
          </Flex>
        </>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      responsive: ["lg"],
    },
    {
      title: "Purchase Price",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      responsive: ["lg"],
    },
    {
      title: "Sale Price",
      dataIndex: "salePrice",
      key: "salePrice",
      responsive: ["lg"],
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      responsive: ["lg"],
    },
    {
      title: "Low Stock",
      dataIndex: "lowStock",
      key: "lowStock",
      responsive: ["lg"],
    },
    {
      title: "Total Production",
      dataIndex: "totalProduction",
      key: "totalProduction",
      responsive: ["lg"],
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      responsive: ["lg"],
      // render: (_, record) => (
      //   <Select
      //     showSearch
      //     placeholder="Category"
      //     optionFilterProp="label"
      //     defaultValue={_}
      //     onChange={(e) => handleChange(record.action, "rating", e)}
      //     style={{ width: "100px" }}
      //     options={[
      //       { label: "Best", value: "Best" },
      //       { label: "Good", value: "Good" },
      //       { label: "Regular", value: "Regular" },
      //       { label: "Low", value: "Low" },
      //     ]}
      //   />
      // ),
    },
    {
      title: "Action",
      align: "center",
      width: 100,
      key: "action",
      render: (_, record) => (
        <>
          <Flex gap={4} justify="end">
            {/* {(canDoOther(lastSegment, "view") ||
              (canDoOwn(lastSegment, "view") && user.id == record.action)) && (
              <Tooltip title="View">
                <Button
                  //   onClick={() => handleEdit(item)}
                  icon={<EyeTwoTone />}
                />
              </Tooltip>
            )} */}
            {(canDoOther(lastSegment, "edit") ||
              (canDoOwn(lastSegment, "edit") && user.id == record.action)) && (
              <Tooltip title="Edit">
                <Button
                  onClick={() =>
                    navigate("update", {
                      state: {
                        productInfo: record.access,
                      },
                    })
                  }
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            )}
            {(canDoOwn(lastSegment, "delete") && user.id == record.action) ||
            (canDoOther(lastSegment, "delete") && user.id !== record.action) ? (
              <Tooltip title="Delete">
                <Button
                  onClick={(e) => handleChange(record.action, "deleted", true)}
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
  const getTableData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/product/view`,
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        }
      );
      message.success(res.data.message);
      const tableArr = res?.data?.products?.map((item, index) => ({
        key: index,
        name: item?.name,
        SKU: item?.code,
        category: item?.category?.name,
        purchasePrice: item?.purchasePrice,
        salePrice: item?.salePrice,
        currentStock: item?.closingStock,
        lowStock: item?.safetyStock,
        totalProduction: item?.totalProduction,
        rating: item?.rating,
        createdAt: moment(item?.createdAt).format("MMM DD, YYYY h:mm A"),
        updatedAt: moment(item?.updatedAt).format("MMM DD, YYYY h:mm A"),
        access: item,
        action: item?._id,
      }));
      if (!canDoOwn(lastSegment, "view") && canDoOther(lastSegment, "view")) {
        setQueryData(tableArr.filter((item) => item.action !== user.id));
      } else if (
        canDoOwn(lastSegment, "view") &&
        !canDoOther(lastSegment, "view")
      ) {
        setQueryData(tableArr.filter((item) => item.action === user.id));
      } else if (
        canDoOther(lastSegment, "view") &&
        canDoOwn(lastSegment, "view")
      ) {
        setQueryData(tableArr);
      } else {
        setQueryData([]);
      }
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  //   Update Functional
  const handleChange = async (id, field, data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/product/update/${id}`,
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
      <Table
        columns={columns}
        dataSource={queryData?.filter((item) =>
          item?.SKU?.toLowerCase().includes(search?.toLowerCase())
        )}
        // title={() => "Header"}
        pagination={{ position: ["bottomRight"] }}
      />
    </>
  );
};

export default ItemViewTable;
