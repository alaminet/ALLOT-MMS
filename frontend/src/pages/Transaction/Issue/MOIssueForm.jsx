import React, { useContext, useEffect, useRef, useState } from "react";
import { DeleteTwoTone } from "@ant-design/icons";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Popconfirm,
  Table,
  Typography,
  message,
  notification,
} from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
const { Option } = Select;

// Table Edit Syntex
const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}>
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingInlineEnd: 24 }}
        onClick={toggleEdit}>
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

const MOIssueForm = ({ drawerOpen, setDrawerOpen, data, onSelectChange }) => {
  const user = useSelector((user) => user.loginSlice.login);
  const [dataSource, setDataSource] = useState(data);
  const [costCenter, setCostCenter] = useState();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Get CostCenter List
  const getCostCenter = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemDetails/viewAll`,
        {
          model: ["CostCenter"],
        },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        }
      );
      const tableArr = res?.data?.items?.map((item, index) => {
        item.data = item?.data?.map((i) => ({
          value: item?.modelName === "ItemUOM" ? i.code : i.name,
          label: item?.modelName === "ItemUOM" ? i.code : i.name,
        }));
        return { ...item };
      });
      setCostCenter(tableArr);
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  // Update dataSource when drawer data changes
  useEffect(() => {
    setDataSource(data);
    getCostCenter();
  }, [data]);

  const handleDelete = (key) => {
    const newData = dataSource?.filter((item) => item.key !== key);
    setDataSource(newData);
    // Pass modified data back to parent after deletion
    onSelectChange(
      newData.map((item) => item.key),
      newData
    );
  };

  const defaultColumns = [
    {
      title: "SKU",
      dataIndex: "SKU",
      //   editable: true,
      width: 150,
    },
    {
      title: "name",
      dataIndex: "name",
      width: "25%",
    },
    {
      title: "UOM",
      dataIndex: "UOM",
      width: 100,
    },
    {
      title: "Unit Price",
      dataIndex: "issuePrice",
      width: 100,
    },
    {
      title: "Req. Qty",
      dataIndex: "reqQty",
      width: 100,
    },
    {
      title: "Issued Qty",
      dataIndex: "issuedQty",
      width: 100,
    },
    {
      title: "Tnx. Qty",
      dataIndex: "issueQty",
      editable: true,
      width: 100,
    },
    {
      title: "Issue Location",
      dataIndex: "location",
      width: 200,
      render: (_, record) => (
        <Select
          variant="borderless"
          style={{ width: "100%" }}
          allowClear
          showSearch
          options={
            Array.isArray(record.stock)
              ? record.stock
                  .filter((item) => item.location && item.onHandQty > 0)
                  .map((item) => ({
                    label: `${item.location}(${item.onHandQty})`, // what user sees
                    value: item.location, // what is stored
                  }))
              : []
          }
          placeholder="Select Location"
          onChange={(value) => {
            const newData = [...dataSource];
            const index = newData.findIndex((item) => record.key === item.key);
            if (index > -1) {
              newData[index] = { ...newData[index], location: value };
              setDataSource(newData);
              // Pass modified data back to parent
              onSelectChange(
                newData.map((item) => item.key),
                newData
              );
            }
          }}
        />
      ),
    },
    {
      title: "Used Dept.",
      dataIndex: "costCenter",
      width: 200,
      render: (_, record) => (
        <Select
          variant="borderless"
          style={{ width: "100%" }}
          allowClear
          defaultValue={_}
          showSearch
          options={
            costCenter?.filter((item) => item.modelName === "CostCenter")[0]
              ?.data
          }
          placeholder="Select Used Dept."
          onChange={(value) => {
            const newData = [...dataSource];
            const index = newData.findIndex((item) => record.key === item.key);
            if (index > -1) {
              newData[index] = { ...newData[index], costCenter: value };
              setDataSource(newData);
              // Pass modified data back to parent
              onSelectChange(
                newData.map((item) => item.key),
                newData
              );
            }
          }}
        />
      ),
    },

    {
      title: "Remarks",
      dataIndex: "remarks",
      editable: true,
      width: 200,
      render: (text) => <Input variant="borderless" value={text} />,
    },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      width: 100,
      render: (_, record) =>
        dataSource?.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key)}>
            <DeleteTwoTone twoToneColor="#eb2f96" />
          </Popconfirm>
        ) : null,
    },
  ];

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
    // Pass modified data back to parent
    onSelectChange(
      newData.map((item) => item.key),
      newData
    );
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  // Drwaer Options
  const onClose = () => {
    setDrawerOpen(false);
  };

  const handleFormSubmit = async (values) => {
    // setLoading(true);
    // Validate required fields before submission
    if (dataSource?.some((item) => !item.location)) {
      message.error("Please select location for all items");
      setLoading(false);
      return;
    }
    // Validate GRN Qty before submission
    if (
      dataSource?.some(
        (item) =>
          typeof Number(item.issueQty) !== "number" ||
          Number(item.issueQty) <= 0
      )
    ) {
      message.error("Please check MO Qty for all items");
      setLoading(false);
      return;
    }

    // Group items by PO and create proper payload structure
    const POGroups = dataSource.reduce((acc, item) => {
      const poNumber = item.MO; // Assuming PO is the purchase order number
      if (!acc[poNumber]) {
        acc[poNumber] = {
          itemDetails: [],
          headerText: item?.headerText,
          reference: item?.reference,
          costCenter: item?.costCenter,
          tnxType: "Move Order",
          tnxRef: item.MO,
        };
      }

      // Add this item to the PO's itemDetails array
      acc[poNumber].itemDetails.push({
        MOid: item?.MOid,
        MOLineid: item?.MOLineid,
        code: item?.code || null,
        SKU: item?.SKU || null,
        name: item?.name,
        UOM: item?.UOM,
        issuePrice: Number(item?.issuePrice) || 0,
        issueQty: Number(item?.issueQty) || 0,
        location: item?.location,
        remarks: item?.remarks || null,
      });

      return acc;
    }, {});

    // Convert the grouped data into an array of payloads
    const payloads = Object.values(POGroups);
    // console.log("submit", payloads);

    try {
      // Send each PO group as a separate GRN sequentially so backend
      // assigns unique incrementing codes reliably.
      const responses = [];
      for (const payload of payloads) {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/transaction/issue/MO-Issue`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          }
        );
        // show notification per successful creation
        notification.success({
          message: "Success",
          description: res.data.message,
          duration: 0,
        });
        responses.push(res);
      }

      // Check if all requests were successful
      const allSuccess = responses.every((res) => res.status === 201);

      if (allSuccess) {
        setDataSource([]);
        onSelectChange([], []);
        form.resetFields();
        setLoading(false);
        onClose();
      } else {
        throw new Error("Some MO issue failed to create");
      }
    } catch (error) {
      setLoading(false);
      message.error(error.response?.data?.error || "Error creating");
    }
  };

  return (
    <>
      <Drawer
        title="Materials Movemement Form"
        width="90%"
        onClose={onClose}
        open={drawerOpen}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        extra={
          <Space>
            <Button
              onClick={onClose}
              style={{ borderRadius: "0px", padding: "10px 30px" }}>
              Cancel
            </Button>
            <Button
              loading={loading}
              onClick={() => form.submit()}
              type="primary"
              style={{ borderRadius: "0px", padding: "10px 30px" }}>
              Submit
            </Button>
          </Space>
        }>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{}}>
          <Row>
            <Col span={24}>
              <Table
                components={components}
                rowClassName={() => "editable-row"}
                bordered
                dataSource={dataSource}
                columns={columns}
              />
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default MOIssueForm;
