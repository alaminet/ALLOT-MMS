import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import {
  Button,
  DatePicker,
  Drawer,
  Flex,
  Form,
  Input,
  message,
  Select,
  Space,
  Typography,
  Table,
} from "antd";
import {
  FileExcelOutlined,
  PhoneFilled,
  UnorderedListOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import PosSalesView from "./posSalesView";
import useExcelExport from "../hooks/useExcelExport";
const { Title, Text } = Typography;

const SalesListDrawer = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [form] = Form.useForm();
  const [queryData, setQueryData] = useState([]);
  const [formFind, setFormFind] = useState();
  const [itemList, setItemList] = useState([]);
  const [open, setOpen] = useState(false);

  // Modal Open
  const onOpen = () => {
    setOpen(true);
    // setQueryData([]);
    getItems();
  };

  // Table Column
  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 50,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Tnx. Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
    },
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      width: 150,
      filters: [...new Set(queryData?.map((item) => item?.invoice))].map(
        (item) => ({
          text: item,
          value: item,
        }),
      ),
      onFilter: (value, record) => record?.invoice === value,
      filterSearch: true,
      render: (text, record) => <PosSalesView data={record?.action} />,
    },
    {
      title: "Products",
      dataIndex: "products",
      key: "products",
      width: 350,
      render: (text, record) =>
        text.map((prod, index) => (
          <p key={index}>
            {++index + ". " + prod.name + ", " + prod.quantity + prod.UOM}
          </p>
        )),
    },
    {
      title: "Billing",
      dataIndex: "billing",
      key: "billing",
      width: 200,
      render: (text, record) => {
        const invoice = record?.action?.code;
        const orderAt = moment(record?.action?.createdAt).format(
          "DD-MMM-YY hh:mm A",
        );
        let billAmount = record?.action?.payments?.totalBill;
        let payAmount = record?.action?.payments?.payment?.reduce(
          (sum, item) => sum + item?.amount,
          0,
        );
        const dueAmount = Number(billAmount) - Number(payAmount);
        return (
          <>
            <p>{text?.name}</p>
            <p>{text?.number} </p>
            <p>{text?.address}</p>
            <Flex gap={8}>
              <a
                href={`https://wa.me/${text?.number}?text=${encodeURIComponent(
                  `Hi ${text?.name},\nYour Order ${invoice} at ${orderAt}, \nTotal Bill-${billAmount}, \n*Due-${dueAmount}*\n-${user.orgName}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer">
                <Button type="primary" icon={<WhatsAppOutlined />} />
              </a>
              <a href={`tel:${text?.number}`}>
                <Button type="primary" icon={<PhoneFilled />} />
              </a>
            </Flex>
          </>
        );
      },
    },
    {
      title: "Payments",
      dataIndex: "payments",
      key: "payments",
      width: 180,
      render: (text, record) => {
        const paymentDone = text?.payment?.reduce(
          (sum, item) => sum + item?.amount,
          0,
        );
        return (
          <>
            <p>
              Total Bill:{" "}
              {(
                text?.totalBill +
                text?.vat -
                text?.discount -
                text?.adjustment
              ).toFixed(2)}
            </p>
            <p>
              Total Due:{" "}
              {(
                text?.totalBill +
                text?.vat -
                text?.discount -
                text?.adjustment -
                paymentDone
              ).toFixed(2)}
            </p>
          </>
        );
      },
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

  // Table data get form
  const onFinish = async (values) => {
    setQueryData([]);
    const findData = {};
    findData.startDate = moment(
      new Date(values?.startDate?.$d).setHours(0, 0, 0, 0),
    ).format();
    findData.endDate = moment(
      new Date(values?.endDate?.$d).setHours(23, 59, 59, 999),
    ).format();
    findData.number = values?.number;
    findData.code = Number(values?.code);
    findData.SKU = values?.SKU;
    findData.payStatus = values?.payStatus;

    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/sales/SalesPOS/view`,
          findData,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          },
        )
        .then((res) => {
          message.success(res?.data.message);
          const tableArr = res?.data?.items?.flatMap((item, index) => ({
            key: ++index,
            createdAt: moment(item?.createdAt).format("DD-MMM-YY h:mm A"),
            invoice: item?.code,
            products: item?.products,
            productList: item?.products.map(
              (prd) => prd.name + "; " + prd.quantity + " " + prd.UOM,
            ),
            payments: item?.payments,
            billing: item?.billing,
            createdBy: item?.createdBy?.name,
            updatedAt: moment(item?.updatedAt).format("DD-MMM-YY h:mm A"),
            updatedBy: item?.updatedBy?.name,
            action: item,
          }));
          setQueryData(tableArr);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };
  // Get item details
  const getItems = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemInfo/view`,
        { scope: "all", isSaleable: true },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        },
      );
      const tableArr = res?.data?.items?.map((item, index) => ({
        label: item?.name + ";" + item.SKU,
        value: item?.SKU,
      }));
      setItemList(tableArr);
    } catch (error) {
      console.log(error);
    }
  };

  // Excel Export Function
  const handleExportExcel = useExcelExport(queryData, {
    filename: "pos_sales",
    sheetName: "POS Sales",
    excludedKeys: ["key", "action", "products"], // Exclude internal fields
    columnWidths: {
      createdAt: 20,
      invoice: 20,
      productList: 50,
      payments: 12,
      billing: 25,
      createdBy: 20,
      updatedBy: 20,
    },
  });

  return (
    <>
      <Button
        type="default"
        onClick={() => onOpen(true)}
        icon={<UnorderedListOutlined />}>
        Orders
      </Button>
      <Drawer
        title={`Sales List`}
        placement="bottom"
        size="100%"
        onClose={() => setOpen(false)}
        open={open}
        extra={
          <Space>
            <Button
              disabled={queryData?.length > 0 ? false : true}
              type="primary"
              className="borderBrand"
              style={{ borderRadius: "0px" }}
              onClick={handleExportExcel}>
              <FileExcelOutlined />
              Excel
            </Button>
            <Button
              danger
              onClick={() => setOpen(false)}
              style={{ borderRadius: "0px" }}>
              Close
            </Button>
          </Space>
        }>
        <Flex justify="center" style={{ marginBottom: "10px" }}>
          <Form
            form={form}
            name="find"
            layout="inline"
            onFinish={onFinish}
            onValuesChange={(changedValues, allValues) =>
              setFormFind(allValues)
            }>
            <Form.Item name="number">
              <Input placeholder="Phone No." />
            </Form.Item>
            <Form.Item name="code">
              <Input placeholder="Order No." />
            </Form.Item>
            <Form.Item name="startDate" initialValue={dayjs()}>
              <DatePicker
                style={{ width: "130px" }}
                placeholder="Start Date"
                disabledDate={(current) => {
                  const endDate = form.getFieldValue("endDate");
                  if (!endDate)
                    return current && current > dayjs().endOf("day");
                  return (
                    current &&
                    (current > dayjs().endOf("day") || current > endDate)
                  );
                }}
              />
            </Form.Item>
            <Form.Item name="endDate" initialValue={dayjs()}>
              <DatePicker
                style={{ width: "130px" }}
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
              name="payStatus"
              initialValue="All"
              rules={[{ required: true }]}>
              <Select
                showSearch
                style={{ minWidth: "100px" }}
                placeholder="Transaction Type"
                options={[
                  {
                    value: "All",
                    label: "All",
                  },
                  {
                    value: "due",
                    label: "Due",
                  },
                  {
                    value: "paid",
                    label: "Paid",
                  },
                ]}
              />
            </Form.Item>
            <Form.Item name="SKU">
              <Select
                showSearch
                allowClear
                style={{ minWidth: "300px" }}
                placeholder="SKU"
                optionFilterProp="label"
                options={itemList}
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
          bordered
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
      </Drawer>
    </>
  );
};

export default SalesListDrawer;
