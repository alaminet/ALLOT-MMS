import React, { useContext, useEffect, useRef, useState } from "react";
import {
  DeleteColumnOutlined,
  DeleteTwoTone,
  PlusOutlined,
} from "@ant-design/icons";
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
  DatePicker,
  notification,
} from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";

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

const POReceiveFormView = ({
  drawerOpen,
  setDrawerOpen,
  data,
  onSelectChange,
}) => {
  const user = useSelector((user) => user.loginSlice.login);
  const [dataSource, setDataSource] = useState(data);
  const [supplierData, setSuppierData] = useState();
  const [selectSupplier, setSelectSupplier] = useState();
  const [loading, setLoading] = useState(false);
  const [costCenter, setCostCenter] = useState();
  const [form] = Form.useForm();

  // Get Supplier data
  const getSupplierData = async () => {
    const payload = { scope: "all" };
    try {
      await axios
        .post(`${import.meta.env.VITE_API_URL}/api/supplier/view`, payload, {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        })
        .then((res) => {
          const tableArr = res?.data?.items?.map((item, index) => ({
            key: item._id,
            value: item._id,
            code: item?.code,
            label: item?.name + " (" + item?.code + ")",
            email: item?.email,
            phone: item?.phone,
            officeAddress: item?.officeAddress,
          }));
          setSuppierData(tableArr);
        });
    } catch (error) {
      // console.log(error);

      message.error(error.response.data.error);
    }
  };

  const onSupplierChange = (value) => {
    const selectSupplier = supplierData?.filter((item) => item.key === value);
    setSelectSupplier(selectSupplier[0]);
  };

  // Get Category List
  const getItemInfo = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/master/itemDetails/viewAll`,
        {
          model: ["StoreLocation"],
          scope: "all",
        },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        },
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
    getSupplierData();
    getItemInfo();
  }, [data]);

  const handleDelete = (key) => {
    const newData = dataSource?.filter((item) => item.key !== key);
    setDataSource(newData);
    // Pass modified data back to parent after deletion
    onSelectChange(
      newData.map((item) => item.key),
      newData,
    );
  };

  const defaultColumns = [
    {
      title: "SKU",
      dataIndex: "SKU",
      // editable: true,
      width: 150,
    },
    {
      title: "name",
      dataIndex: "name",
      width: 300,
    },
    {
      title: "UOM",
      dataIndex: "UOM",
      width: 100,
    },
    {
      title: "PO Qty",
      dataIndex: "POQty",
      width: 100,
    },
    {
      title: "Already Recevied",
      dataIndex: "GRNQty",
      width: 100,
    },
    {
      title: "GRN Price",
      dataIndex: "reqPOPrice",
      editable: true,
      width: 150,
    },
    {
      title: "GRN Qty",
      dataIndex: "reqGRNQty",
      editable: true,
      width: 150,
    },
    {
      title: "Receive Location",
      dataIndex: "location",
      width: 200,
      render: (_, record) => (
        <Select
          variant="borderless"
          style={{ width: "100%" }}
          allowClear
          showSearch={{
            filterOption: (input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
          }}
          value={record.location}
          options={
            costCenter?.filter((item) => item.modelName === "StoreLocation")[0]
              ?.data
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
                newData,
              );
            }
          }}
        />
      ),
    },

    {
      title: "GRN Remarks",
      dataIndex: "GRNRemarks",
      editable: true,
      width: 250,
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
      newData,
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
    // console.log(dataSource);

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
          typeof Number(item.reqGRNQty) !== "number" ||
          Number(item.reqGRNQty) <= 0 ||
          Number(item.reqGRNQty) > Number(item.POQty),
      )
    ) {
      message.error("Please check GRN Qty for all items");
      setLoading(false);
      return;
    }

    // Group items by PO and create proper payload structure
    const POGroups = dataSource.reduce((acc, item) => {
      const poNumber = item.PO; // Assuming PO is the purchase order number
      if (!acc[poNumber]) {
        acc[poNumber] = {
          itemDetails: [],
          headerText: values?.headerText,
          invoiceNo: values?.invoiceNo,
          sourceRef: poNumber,
          sourceType: item?.type,
          tnxType: "PO GRN",
          TaxNo: values?.TaxNo,
          documentAt: values.documentAt.$d,
          receivedAt: values.receivedAt.$d,
          createdBy: user?.id,
        };
      }

      // Add this item to the PO's itemDetails array
      acc[poNumber].itemDetails.push({
        POLineID: item?.key, // Original line ID from PO
        PRLineId: item?.PRLineId, // Original line ID from PR
        PRRef: item?.PRRef, // Original line ID from PR
        code: item?.code?.code || null,
        SKU: item?.SKU || null,
        name: item?.name,
        UOM: item?.UOM,
        unitPrice: Number(item?.reqPOPrice) || 0,
        receiveQty: Number(item?.reqGRNQty) || 0,
        location: item?.location,
        remarks: item?.GRNRemarks || null,
        POQty: Number(item?.POQty) || 0, // Original PO quantity for reference
      });

      return acc;
    }, {});

    // Convert the grouped data into an array of payloads
    const payloads = Object.values(POGroups);
    // console.log(payloads);

    try {
      // Send each PO group as a separate GRN
      const responses = await Promise.all(
        payloads.map((payload) =>
          axios.post(
            `${import.meta.env.VITE_API_URL}/api/transaction/receive/PO-GRN`,
            payload,
            {
              headers: {
                Authorization: import.meta.env.VITE_SECURE_API_KEY,
                token: user?.token,
              },
            },
          ),
        ),
      );

      // Check if all requests were successful
      responses.map((res) => {
        // Build notification content safely
        const respMessage = res.data?.message || res.data?.status || "success";
        const respSteps = res.data?.steps || [];
        const notiDescription = respSteps.length
          ? respSteps.map((item, i) => <p key={i}>{item?.message}</p>)
          : null;

        if (res.data?.status === "failed") {
          notification.error({
            message: respMessage,
            description: notiDescription,
            duration: 0,
          });
        } else if (res.data?.status === "partial") {
          notification.warning({
            message: respMessage,
            description: notiDescription,
            duration: 0,
          });
        } else {
          notification.success({
            message: respMessage,
            description: notiDescription,
            duration: 0,
          });
        }
        setDataSource([]);
        onSelectChange([], []);
        form.resetFields();
        setLoading(false);
        onClose();
      });
    } catch (error) {
      setLoading(false);
      message.error(error.response?.data?.error || "Error creating GRNs");
    }
  };

  return (
    <>
      <Drawer
        title="Make a Gate Receive Note(GRN)"
        size="100%"
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
          initialValues={{ receivedAt: dayjs(), documentAt: dayjs() }}>
          <Row gutter={16}>
            <Col lg={4} xs={24}>
              <Form.Item
                label="Document Date"
                name="documentAt"
                rules={[
                  {
                    required: true,
                  },
                ]}
                style={{ width: "100%" }}>
                <DatePicker
                  defaultValue={dayjs()}
                  maxDate={dayjs()}
                  format={dateFormat}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col lg={4} xs={24}>
              <Form.Item
                label="Receive Date"
                name="receivedAt"
                rules={[
                  {
                    required: true,
                  },
                ]}
                style={{ width: "100%" }}>
                <DatePicker
                  defaultValue={dayjs()}
                  minDate={dayjs().subtract(1, "month")}
                  maxDate={dayjs()}
                  format={dateFormat}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col lg={5} xs={24}>
              <Form.Item
                label="Header Text"
                name="headerText"
                style={{ width: "100%" }}>
                <Input placeholder="Source Ref." maxLength={50} showCount />
              </Form.Item>
            </Col>
            <Col lg={5} xs={24}>
              <Form.Item
                label="Invoice No"
                name="invoiceNo"
                style={{ width: "100%" }}>
                <Input placeholder="Invoice Ref." maxLength={50} showCount />
              </Form.Item>
            </Col>
            <Col lg={6} xs={24}>
              <Form.Item
                label="BL/MUSHOK No"
                name="TaxNo"
                style={{ width: "100%" }}>
                <Input placeholder="BL/MUSHOK Ref." maxLength={50} showCount />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                components={components}
                rowClassName={() => "editable-row"}
                bordered
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                scroll={{
                  x: columns.reduce((sum, col) => sum + (col.width || 150), 0),
                }}
              />
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default POReceiveFormView;
