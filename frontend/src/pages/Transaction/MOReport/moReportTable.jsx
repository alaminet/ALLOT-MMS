import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
  Table,
  Tooltip,
} from "antd";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { usePermission } from "../../../hooks/usePermission";
import NotAuth from "../../notAuth";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import MoveOrderDrawer from "../../../components/moveOrderDrawer";

const MoReportTable = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [findModel, setFindModel] = useState("");
  const search = useOutletContext();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  const own = canDoOwn(lastSegment, "view");
  const others = canDoOther(lastSegment, "view");

  // Table data get form
  const onFinish = async (values) => {
    setQueryData([]);
    const scope =
      own && others ? "all" : own ? "own" : others ? "others" : null;
    if (!scope) {
      setQueryData([]);
      message.warning("You are not authorized");
      return; // stop execution
    }
    let startDate = new Date(values?.startDate?.$d).setHours(0, 0, 0, 0);
    let endDate = new Date(values?.endDate?.$d).setHours(23, 59, 59, 999);
    const findData = {
      status: values?.status,
      startDate: moment(startDate).format(),
      endDate: moment(endDate).format(),
      scope: scope,
      code: values.item || null,
    };
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/transaction/move-order/view`,
          findData,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          }
        )
        .then((res) => {
          console.log(res);

          message.success(res?.data.message);
          const tableArr = res?.data?.items?.flatMap((item, index) =>
            item?.itemDetails.map((subItem, subIndex) => ({
              key: subItem._id,
              createdAt: moment(item?.createdAt).format("DD-MMM-YY h:mm A"),
              referance: item?.reference,
              docRef: item?.code,
              SKU: subItem?.SKU || subItem?.code?.SKU,
              name: subItem?.name,
              UOM: subItem?.UOM,
              qty: subItem?.reqQty,
              issueQty: subItem?.issueQty,
              unitPrice: Number(subItem?.code?.avgPrice || 0).toFixed(2),
              status: item?.status,
              createdBy: item?.createdBy?.name,
              updatedBy: item?.updatedBy?.name,
              action: item,
            }))
          );
          setQueryData(tableArr);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 80,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
    },
    {
      title: "MO Ref",
      dataIndex: "referance",
      key: "referance",
      filters: [...new Set(queryData?.map((item) => item?.referance))].map(
        (item) => ({
          text: item,
          value: item,
        })
      ),
      onFilter: (value, record) => record?.referance === value,
      filterSearch: true,
    },
    {
      title: "MO No",
      dataIndex: "docRef",
      key: "docRef",
      filters: [...new Set(queryData?.map((item) => item?.docRef))].map(
        (item) => ({
          text: item,
          value: item,
        })
      ),
      onFilter: (value, record) => record?.docRef === value,
      filterSearch: true,
      render: (text, record) => (
        // <MoveOrderDrawer title={text} MOid={record?.action?._id} />
        <Link to={`view?mo=${text}`} target="_blank">
          {text}
        </Link>
      ),
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
      width: 250,
      filters: [...new Set(queryData?.map((item) => item?.name))].map(
        (code) => ({
          text: code,
          value: code,
        })
      ),
      onFilter: (value, record) => record?.name === value,
      filterSearch: true,
    },
    {
      title: "UOM",
      dataIndex: "UOM",
      key: "UOM",
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
    },
    {
      title: "MO Qty",
      dataIndex: "qty",
      key: "qty",
      render: (value) => (
        <div
          style={{
            backgroundColor: value < 0 ? "#ffe6e6" : "transparent", // light red background
            padding: "4px 8px", // optional for spacing
          }}>
          {value}
        </div>
      ),
    },
    {
      title: "MO Value",
      dataIndex: "tnxPrice",
      key: "tnxPrice",
      render: (value, record) => (
        <div
          style={{
            backgroundColor: value < 0 ? "#ffe6e6" : "transparent", // light red background
            padding: "4px 8px", // optional for spacing
          }}>
          {Number(record.qty * record.unitPrice || 0)?.toFixed(2)}
        </div>
      ),
    },
    {
      title: "Issue Qty",
      dataIndex: "issueQty",
      key: "issueQty",
    },
    {
      title: "Issue Value",
      dataIndex: "tnxPrice",
      key: "tnxPrice",
      render: (value, record) => (
        <div
          style={{
            backgroundColor: value < 0 ? "#ffe6e6" : "transparent", // light red background
            padding: "4px 8px", // optional for spacing
          }}>
          {Number(record.issueQty * record.unitPrice || 0)?.toFixed(2)}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Updated By",
      dataIndex: "updatedBy",
      key: "updatedBy",
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
        }
      );
      const tableArr = res?.data?.items?.map((item, index) => ({
        label: item?.name + ";" + item.SKU,
        name: item?.name,
        value: item?._id,
      }));
      setItemList(tableArr);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getItems();
  }, []);

  return (
    <>
      <Flex justify="center" style={{ marginBottom: "10px" }}>
        <Form form={form} name="find" layout="inline" onFinish={onFinish}>
          <Form.Item name="item">
            <Select
              showSearch
              allowClear
              style={{ minWidth: "350px" }}
              placeholder="Items"
              optionFilterProp="label"
              options={itemList}
            />
          </Form.Item>
          <Form.Item name="startDate" initialValue={dayjs()}>
            <DatePicker
              placeholder="Start Date"
              disabledDate={(current) => {
                const endDate = form.getFieldValue("endDate");
                if (!endDate) return current && current > dayjs().endOf("day");
                return (
                  current &&
                  (current > dayjs().endOf("day") || current > endDate)
                );
              }}
            />
          </Form.Item>
          <Form.Item name="endDate" initialValue={dayjs()}>
            <DatePicker
              placeholder="End Date"
              disabledDate={(current) => {
                const startDate = form.getFieldValue("startDate");
                if (!startDate)
                  return current && current > dayjs().endOf("day");
                return (
                  current &&
                  (current > dayjs().endOf("day") || current < startDate)
                );
              }}
            />
          </Form.Item>

          <Form.Item
            name="status"
            initialValue="All"
            rules={[{ required: true }]}>
            <Select
              showSearch
              style={{ minWidth: "200px" }}
              placeholder="Status"
              optionFilterProp="label"
              options={[
                {
                  value: "All",
                  label: "All",
                },
                {
                  value: "In-Process",
                  label: "In-Process",
                },
                {
                  value: "Checked",
                  label: "Checked",
                },
                {
                  value: "Approved",
                  label: "Approved",
                },
                {
                  value: "Hold",
                  label: "Hold",
                },
                {
                  value: "Closed",
                  label: "Closed",
                },
              ]}
            />
          </Form.Item>
          <Form.Item shouldUpdate>
            <Button type="primary" htmlType="submit">
              Find
            </Button>
          </Form.Item>
        </Form>
      </Flex>
      <Table
        columns={columns}
        dataSource={queryData}
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
    </>
  );
};

export default MoReportTable;
