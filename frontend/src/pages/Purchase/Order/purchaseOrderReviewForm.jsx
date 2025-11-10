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
} from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

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

const PurchaseOrderReviewForm = ({
  drawerOpen,
  setDrawerOpen,
  data,
  onSelectChange,
}) => {
  const user = useSelector((user) => user.loginSlice.login);
  const [dataSource, setDataSource] = useState(data);
  const [supplierData, setSuppierData] = useState();
  const [selectSupplier, setSelectSupplier] = useState();
  const [businessSettings, setBusinessSettings] = useState();
  const [loading, setLoading] = useState(false);
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
            paymentInfo: item?.paymentInfo,
          }));
          setSuppierData(tableArr);
        });
    } catch (error) {
      console.log(error);
      message.error(error.response.data.error);
    }
  };

  const onSupplierChange = (value) => {
    const selectSupplier = supplierData?.filter((item) => item.key === value);
    setSelectSupplier(selectSupplier[0]);
  };

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
      editable: true,
      width: 150,
    },
    {
      title: "name",
      dataIndex: "name",
      width: "25%",
    },
    {
      title: "Specification",
      dataIndex: "spec",
      editable: true,
      width: "20%",
    },
    {
      title: "Req.Qty",
      dataIndex: "reqQty",
      width: 100,
    },
    {
      title: "PO Pending",
      dataIndex: "POPending",
      width: 100,
    },
    {
      title: "PO Qty",
      dataIndex: "reqPOQty",
      editable: true,
      width: 100,
    },
    {
      title: "PO Price",
      dataIndex: "reqPOPrice",
      editable: true,
      width: 100,
    },
    {
      title: "% of VAT",
      dataIndex: "reqPOVAT",
      editable: true,
      width: 100,
      render: (text) => (
        <Input style={{ padding: 0 }} variant="borderless" value={text} />
      ),
    },
    {
      title: "PO Remarks",
      dataIndex: "PORemarks",
      editable: true,
      render: (text) => (
        <Input style={{ padding: 0 }} variant="borderless" value={text} />
      ),
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
    setLoading(true);
    // onSelectChange(
    //   dataSource?.map((item) => item.key),
    //   dataSource // Pass the modified data
    // );
    const itemDetails = dataSource?.map((item) => ({
      PRLineId: item?.key,
      PRCode: item?.PR,
      PRRef: item?.PRId,
      code: item?.code?._id || null,
      SKU: item?.SKU,
      name: item?.name,
      spec: item?.spec,
      UOM: item?.UOM,
      POPrice: Number(item?.reqPOPrice),
      POQty: Number(item?.reqPOQty),
      reqPOVAT: Number(item?.reqPOVAT),
      remarks: item?.PORemarks,
    }));
    const payload = {
      itemDetails,
      ...values,
      deliveryTarget: values.deliveryTarget.$d,
      requestedBy: {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
      },
    };
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/purchase/order/new`,
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
          setDataSource([]);
          setSelectSupplier(null);
          onSelectChange([], []);
          form.resetFields();
          setLoading(false);
          onClose();
        });
    } catch (error) {
      setLoading(false);
      message.error(error.response.data.error);
    }
  };

  // Get Business Settings
  const getBusinessSettings = async () => {
    try {
      await axios
        .get(`${import.meta.env.VITE_API_URL}/api/orgUser/view`, {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        })
        .then((res) => {
          const settings = res.data?.businessSettings;
          setBusinessSettings(settings);
          if (settings) {
            form.setFieldsValue(settings);
          }
        });
    } catch (error) {
      setLoading(false);
      message.error(error.response.data.error);
    }
  };

  // Update dataSource when drawer data changes
  useEffect(() => {
    setDataSource(data);
    getSupplierData();
    getBusinessSettings();
    if (selectSupplier?.paymentInfo) {
      form.setFieldsValue({
        paymentMode: `Bank A/C Name: ${selectSupplier.paymentInfo.name || ""}
Bank A/C Number: ${selectSupplier.paymentInfo.account || ""}
Bank Name: ${selectSupplier.paymentInfo.bank || ""}
Branch Name: ${selectSupplier.paymentInfo.branch || ""}
Routing No.: ${selectSupplier.paymentInfo.routing || ""}
Swift Code: ${selectSupplier.paymentInfo.swift || ""}`,
      });
    }
  }, [data, selectSupplier]);

  return (
    <>
      <Drawer
        title="Make a Purchase Order(PO)"
        width="95%"
        onClose={onClose}
        open={drawerOpen}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              loading={loading}
              onClick={() => form.submit()}
              type="primary">
              Submit
            </Button>
          </Space>
        }>
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
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
          <Row gutter={16}>
            <Col span={8}>
              <Row gutter={[16, 16]}>
                <Col span={18}>
                  <Form.Item
                    name="supplier"
                    label="Supplier"
                    style={{ margin: 0 }}>
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select a Supplier"
                      optionFilterProp="label"
                      onChange={onSupplierChange}
                      options={supplierData}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="type" label="PO Type" style={{ margin: 0 }}>
                    <Select
                      showSearch
                      allowClear
                      placeholder="Source"
                      optionFilterProp="label"
                      options={[
                        { name: "Local", value: "Local" },
                        { name: "Import", value: "Import" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                {selectSupplier && (
                  <>
                    <Col span={20}>
                      <div>
                        <Title style={{ margin: "10px 0 0 0" }} level={5}>
                          Supplier Details
                        </Title>
                      </div>
                      <div>
                        <Text strong>Address: </Text>
                        {`${selectSupplier?.officeAddress?.street}, ${selectSupplier?.officeAddress?.city}, ${selectSupplier?.officeAddress?.country} - ${selectSupplier?.officeAddress?.postal}`}
                      </div>
                      <div>
                        <Text strong>Email: </Text>
                        {`${selectSupplier?.email?.office}`}
                      </div>
                      <div>
                        <Text strong>Contact: </Text>
                        {`${selectSupplier?.phone?.office}`}
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            </Col>
            <Col span={8}>
              <Form.Item name="note" label="PO Note">
                <Input.TextArea
                  rows={7}
                  placeholder="Please enter PO Note..."
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="delveryTerms"
                label="Delivery Terms"
                initialValue={`1. Delivery has to be done within 03 working days after receiving PO by the supplier.\n2. Delivery has to be done as per specification of PO and quotation.\n3. Incase of failure of work within the given time, supplier will be penalized as per company policy.\n4. If any damage or problem occurs with the product, the supplier/seller will immediately replace/make arrangements with a new product.`}>
                <Input.TextArea
                  rows={7}
                  placeholder="Please enter Delivery Terms..."
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                name="deliveryLocation"
                label="Delivery Location"
                initialValue={`Contact Person: \n${businessSettings?.businessAddress?.street}, ${businessSettings?.businessAddress?.city}, ${businessSettings?.businessAddress?.country}, ${businessSettings?.businessAddress?.postal}.`}>
                <Input.TextArea
                  rows={5}
                  placeholder="Please enter Delivery Location..."
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="billingLocation"
                label="Bill Submission"
                initialValue={`Contact Person: \n${businessSettings?.officeAddress?.street}, ${businessSettings?.officeAddress?.city}, ${businessSettings?.officeAddress?.country}, ${businessSettings?.officeAddress?.postal}.`}>
                <Input.TextArea
                  rows={5}
                  placeholder="Please enter Delivery Location..."
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="requiredDoc"
                label="Documents Requied For Billing"
                initialValue={`1. Fully signed PO copy accept by supplier.\n2. Delivery challan with receiving sign from inventory/warehouse officials.\n3. Mushok 6.3.\n4. Price quotation.`}>
                <Input.TextArea
                  rows={5}
                  placeholder="List of required documents during bill submission..."
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="paymentTerms"
                label="Payment Terms"
                initialValue={`1. 100% payment will be made within 30 working days of successful delivery of required .\n2. VAT and AIT applicable as per BD Govt. rules.`}>
                <Input.TextArea
                  rows={5}
                  placeholder="List of required documents during bill submission..."
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="paymentMode" label="Payment Methode">
                <Input.TextArea
                  rows={5}
                  placeholder="Payment methode details..."
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="POCurrency" label="PO Currency">
                <Input placeholder="BDT/USD/..." />
              </Form.Item>
              <Form.Item name="deliveryTarget" label="Delivery Target">
                <DatePicker
                  placeholder="Select a date"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default PurchaseOrderReviewForm;
