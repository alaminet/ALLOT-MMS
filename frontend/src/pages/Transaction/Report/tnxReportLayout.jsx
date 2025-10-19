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
import { useNavigate, useOutletContext } from "react-router-dom";

const TnxReportLayout = () => {
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
    let startDate = new Date(values?.startDate?.$d).setHours(0, 0, 0);
    let endDate = new Date(values?.endDate?.$d).setHours(23, 59, 59);
    const findData = {
      tnxType: values?.tnxType,
      startDate: moment(startDate).format(),
      endDate: moment(endDate).format(),
      scope: scope,
      code: values.item || null,
    };

    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/transaction/tnx-details`,
          findData,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          }
        )
        .then((res) => {
          message.success(res?.data.message);
          const tableArr = res?.data?.transactions?.map((item, index) => ({
            key: index,
            tnxType: item?.tnxType,
            docRef: item?.reference,
            tnxRef: item?.tnxRef,
            code: item?.itemCode,
            SKU: item?.itemSKU,
            name: item?.itemName,
            UOM: item?.itemUOM,
            location: item?.location,
            remarks: item?.remarks,
            costCenter: item?.costCenter,
            unitPrice: Number(item?.itemPrice).toFixed(2),
            tnxQty: Number(item?.tnxQty).toFixed(2),
            tnxPrice: Number(item?.tnxQty * item?.itemPrice).toFixed(2),
            createdAt: moment(item?.createdAt).format("DD-MMM-YY h:mm A"),
            documentAt: moment(item?.documentAt).format("DD-MMM-YY"),
            createdBy: item?.createdBy?.name,
            status: item?.status,
            action: item,
          }));
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
      width: 50,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Tnx. Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
    },
    {
      title: "Doc. Date",
      dataIndex: "documentAt",
      key: "documentAt",
      width: 120,
    },
    {
      title: "Tnx. Ref.",
      dataIndex: "tnxRef",
      key: "tnxRef",
    },
    {
      title: "Tnx. Type",
      dataIndex: "tnxType",
      key: "tnxType",
      filters: [...new Set(queryData?.map((item) => item?.tnxType))].map(
        (item) => ({
          text: item,
          value: item,
        })
      ),
      onFilter: (value, record) => record?.tnxType === value,
      filterSearch: true,
    },
    {
      title: "Doc.Ref",
      dataIndex: "docRef",
      key: "docRef",
      filters: [...new Set(queryData?.map((item) => item?.docRef))].map(
        (item) => ({
          text: item,
          value: item,
        })
      ),
      onFilter: (value, record) => record?.code === value,
      filterSearch: true,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      filters: [...new Set(queryData?.map((item) => item?.code))].map(
        (code) => ({
          text: code,
          value: code,
        })
      ),
      onFilter: (value, record) => record?.code === value,
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
      filters: [...new Set(queryData?.map((item) => item?.UOM))].map(
        (code) => ({
          text: code,
          value: code,
        })
      ),
      onFilter: (value, record) => record?.UOM === value,
      filterSearch: true,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
    },
    {
      title: "Trnx. Qty",
      dataIndex: "tnxQty",
      key: "tnxQty",
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
      title: "Trnx. Value",
      dataIndex: "tnxPrice",
      key: "tnxPrice",
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
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
    },
    {
      title: "Used On",
      dataIndex: "costCenter",
      key: "costCenter",
      filters: [...new Set(queryData?.map((item) => item?.costCenter))].map(
        (item) => ({
          text: item,
          value: item,
        })
      ),
      onFilter: (value, record) => record?.costCenter === value,
      filterSearch: true,
    },
    {
      title: "Trnx. By",
      dataIndex: "createdBy",
      key: "createdBy",
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
        value: item?.code,
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
                  (current > dayjs().endOf("day") ||
                    current < endDate.subtract(31, "day"))
                );
              }}
            />
          </Form.Item>
          <Form.Item
            name="endDate"
            initialValue={dayjs()}
            rules={[
              {
                validator: (_, value) => {
                  const startDate = form.getFieldValue("startDate");
                  if (!startDate || !value) return Promise.resolve();

                  const diffInDays = value.diff(startDate, "days");
                  if (diffInDays > 31) {
                    return Promise.reject(new Error("Date 1 month"));
                  }
                  if (value.isAfter(dayjs(), "day")) {
                    return Promise.reject(
                      new Error("End date cannot be after today")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}>
            <DatePicker
              placeholder="End Date"
              disabledDate={(current) => {
                const startDate = form.getFieldValue("startDate");
                if (!startDate)
                  return current && current > dayjs().endOf("day");
                return (
                  current &&
                  (current > dayjs().endOf("day") ||
                    current < startDate ||
                    current > startDate.add(31, "day"))
                );
              }}
            />
          </Form.Item>
          <Form.Item
            name="tnxType"
            initialValue="All"
            rules={[{ required: true }]}>
            <Select
              showSearch
              style={{ minWidth: "200px" }}
              placeholder="Transaction Type"
              optionFilterProp="label"
              options={[
                {
                  value: "All",
                  label: "All",
                },
                {
                  value: "PO GRN",
                  label: "PO GRN",
                },
                {
                  value: "Initial Balance",
                  label: "Initial Balance",
                },
                {
                  value: "Move Order",
                  label: "Move Order",
                },
                {
                  value: "Others",
                  label: "Others",
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
        pagination
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

export default TnxReportLayout;
