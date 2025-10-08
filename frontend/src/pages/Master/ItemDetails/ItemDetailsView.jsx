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
import { usePermission } from "../../../hooks/usePermission";
import { DeleteTwoTone, EditTwoTone, EyeTwoTone } from "@ant-design/icons";
import NotAuth from "../../notAuth";
import { useNavigate, useOutletContext } from "react-router-dom";

const ItemDetailsView = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [findModel, setFindModel] = useState("");
  const search = useOutletContext();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("item-details")) {
    return <NotAuth />;
  }
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
    let findModel = values?.model;
    const findData = {
      model: values?.model,
      startDate: moment(startDate).format(),
      endDate: moment(endDate).format(),
      scope: scope,
    };

    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/master/itemDetails/view`,
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
          const tableArr = res?.data?.items?.map((item, index) => ({
            key: index,
            code: item?.code,
            name: item?.name,
            status: item?.status,
            createdAt: moment(item?.createdAt).format("MMM DD, YYYY h:mm A"),
            updatedAt: moment(item?.updatedAt).format("MMM DD, YYYY h:mm A"),
            access: { ...item, model: findModel },
            action: item?._id,
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
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 150,
      filters: [...new Set(queryData?.map((item) => item.code))].map(
        (code) => ({
          text: code,
          value: code,
        })
      ),
      onFilter: (value, record) => record?.code === value,
      filterSearch: true,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => (
        <>
          <Flex gap={4} justify="end">
            {(canDoOther(lastSegment, "view") ||
              (canDoOwn(lastSegment, "view") && user.id == record.action)) && (
              <Tooltip title="View">
                <Button
                  onClick={() => handleView(record.access)}
                  icon={<EyeTwoTone />}
                />
              </Tooltip>
            )}
            {(canDoOther(lastSegment, "edit") ||
              (canDoOwn(lastSegment, "edit") && user.id == record.action)) && (
              <Tooltip title="Edit">
                <Button
                  onClick={() =>
                    navigate("update", {
                      state: {
                        UpdateInfo: record.access,
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
                  onClick={(e) =>
                    handleChange(record.action, "isDeleted", true)
                  }
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

  // Handle Veiw table data
  const handleView = (values) => {
    setSelectedRecord(values);
    setIsModalVisible(true);
  };

  //   Update Functional
  const handleChange = async (id, field, data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemGroup/update/${id}`,
        { [field]: data },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        }
      );
      message.success(res.data.message);
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  return (
    <>
      <Flex justify="center" style={{ marginBottom: "10px" }}>
        <Form form={form} name="find" layout="inline" onFinish={onFinish}>
          <Form.Item name="startDate">
            <DatePicker placeholder="Start Date" />
          </Form.Item>
          <Form.Item name="endDate">
            <DatePicker placeholder="End Date" />
          </Form.Item>
          <Form.Item
            name="model"
            rules={[{ required: true, message: "Select Model!" }]}>
            <Select
              showSearch
              style={{ minWidth: "200px" }}
              placeholder="Select Model"
              optionFilterProp="label"
              // onChange={onChange}
              options={[
                {
                  value: "ItemUOM",
                  label: "Item UOM",
                },
                {
                  value: "ItemGroup",
                  label: "Item Group",
                },
                {
                  value: "ItemType",
                  label: "Item Type",
                },
                {
                  value: "StoreLocation",
                  label: "Store Location",
                },
                {
                  value: "Transaction",
                  label: "Transaction Type",
                },
                {
                  value: "CostCenter",
                  label: "Cost Center",
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
        dataSource={queryData?.filter((item) =>
          item.name?.toLowerCase().includes(search?.toLowerCase())
        )}
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

export default ItemDetailsView;
