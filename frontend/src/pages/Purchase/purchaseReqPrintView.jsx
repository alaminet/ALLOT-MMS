import React, { useState } from "react";
import {
  Button,
  Col,
  Row,
  Image,
  Upload,
  Table,
  Typography,
  Checkbox,
  Input,
  InputNumber,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import moment from "moment";
const { Title, Text } = Typography;
const { Column, ColumnGroup } = Table;
const PurchaseReqPrintView = () => {
  const location = useLocation();
  const { refData } = location.state || {};
  const [inputValues, setInputValues] = useState({});
  console.log(refData);

  // image upload
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
  const uploadButton = (
    <button
      className="no-print"
      style={{ border: 0, background: "none" }}
      type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 20,
      align: "center",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Part Code",
      dataIndex: "code",
      key: "code",
      className: "cell-top-left",
      render: (text, record, index) => text?.SKU,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 300,
      className: "cell-top-left text-nowrap",
    },
    {
      title: "Spec.",
      dataIndex: "spec",
      key: "spec",
      width: 200,
      className: "cell-top-left",
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      className: "cell-top-left",
    },
    {
      title: "UOM",
      dataIndex: "UOM",
      key: "UOM",
      className: "cell-top-left",
    },
    {
      title: "Unit Price (BDT)",
      dataIndex: "unitPrice",
      key: "unitPrice",
      responsive: ["md"],
      className: "cell-top-right",
      render: (text, record) =>
        new Intl.NumberFormat("en-BD", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record?.unitPrice || 0),
    },
    {
      title: "Req. Qty",
      dataIndex: "reqQty",
      key: "reqQty",
      responsive: ["md"],
      className: "cell-top-right",
    },

    {
      title: "Req. Value (BDT)",
      dataIndex: "reqValue",
      key: "reqValue",
      responsive: ["md"],
      className: "cell-top-right",
      render: (text, record) =>
        new Intl.NumberFormat("en-BD", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record?.unitPrice * record?.reqQty || 0),
    },
    {
      title: "On-Hand Stock",
      dataIndex: "onHandQty",
      key: "onHandQty",
      responsive: ["md"],
      className: "cell-top-right",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      responsive: ["md"],
      className: "cell-top-left",
    },
  ];
  return (
    <>
      <div
        className="print-page"
        style={{ backgroundColor: "#fff", padding: "20px" }}>
        <Row justify="center">
          <Col>
            <Typography style={{ textAlign: "center" }}>
              <Title style={{ margin: "0" }}>Fair Technology Limited</Title>
              <Text style={{ display: "block" }}>
                Plot- 12/A & 12/B, Block-C, Kaliakoir Hi-Tech Park
              </Text>
              <Text style={{ display: "block" }}>
                Kaliakoir, Gazipur, Dhaka. #+880 1787-670 786
              </Text>
              <Title level={3} style={{ margin: "0" }}>
                PURCHASE REQUISITION FORM
              </Title>
            </Typography>
          </Col>
        </Row>
        <Row justify="space-between" style={{ padding: "10px" }}>
          <Col>
            <p>
              <strong>PR Ref.: </strong>
              {refData.code}
            </p>
            <p>
              <strong>Requested By: </strong>
              {refData.requestedBy?.name}
            </p>
          </Col>
          <Col>
            <p>
              <strong>Department: </strong>
              {refData.costCenter?.name}
            </p>
            <p>
              <strong>Email: </strong>
              {refData.requestedBy?.contact}
            </p>
          </Col>
          <Col>
            <p>
              <strong>Date: </strong>
              {moment(refData?.createdAt).format("DD-MMM-YYYY")}
            </p>
            <p>
              <strong>Phone No.: </strong>
              {refData.requestedBy?.contact}
            </p>
          </Col>
        </Row>
        <Table
          bordered
          className="purchase-table"
          columns={columns}
          dataSource={refData.itemDetails}
          // title={() => "Header"}
          pagination={false}
          summary={() => {
            const totalQty = refData.itemDetails.reduce(
              (sum, item) => sum + (item.reqQty || 0),
              0
            );
            const totalValue = refData.itemDetails.reduce(
              (sum, item) => sum + (item.unitPrice || 0) * (item.reqQty || 0),
              0
            );

            return (
              <Table.Summary.Row style={{ textAlign: "right" }}>
                <Table.Summary.Cell index={0} colSpan={7}>
                  <strong>Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <strong>{totalQty}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <strong>
                    {new Intl.NumberFormat("en-BD", {
                      minimumFractionDigits: 2,
                    }).format(totalValue)}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
        <Row style={{ margin: "10px 0" }}>
          <Col span={6}>
            <span style={{ display: "block" }}>
              <strong>Note:</strong> {refData.note}
            </span>
            <span>
              <strong>Referance: </strong>
              {refData.reference}
            </span>
          </Col>
          <Col>
            <div>
              <Upload
                action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}>
                {fileList.length >= 8 ? null : uploadButton}
              </Upload>
              {previewImage && (
                <Image
                  wrapperStyle={{ display: "none" }}
                  preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                    afterOpenChange: (visible) =>
                      !visible && setPreviewImage(""),
                  }}
                  src={previewImage}
                />
              )}
            </div>
          </Col>
        </Row>
        <Row justify="space-between" style={{ marginTop: "50px" }}>
          <Col
            span={5}
            style={{
              textAlign: "center",
              borderTop: "1px solid black",
            }}>
            Prepared By
            <span style={{ display: "block" }}>{refData.createdBy.name}</span>
          </Col>
          <Col
            span={5}
            style={{ textAlign: "center", borderTop: "1px solid black" }}>
            Checked By
            <span style={{ display: "block" }}>
              {refData.confirmedBy?.name}
            </span>
          </Col>
          <Col
            span={5}
            style={{ textAlign: "center", borderTop: "1px solid black" }}>
            Confirmed By
            <span style={{ display: "block" }}>{refData.checkedBy?.name}</span>
          </Col>
          <Col
            span={5}
            style={{ textAlign: "center", borderTop: "1px solid black" }}>
            Approved By
            <span style={{ display: "block" }}>{refData.approvedBy?.name}</span>
          </Col>
        </Row>
        <Table
          bordered
          className="justification-table"
          pagination={false}
          // dataSource={data}
          dataSource={refData.itemDetails}>
          <ColumnGroup title="Justification of Purchage Requisition">
            <Column
              title="Item Name"
              dataIndex="name"
              key="name"
              width={200}
              // render={(text, record, index) => index + 1}
            />
            <Column
              align="center"
              title="Last 6M Used"
              dataIndex="L6MUsed"
              key="L6MUsed"
              render={(_, record) => <Input variant="borderless" />}
            />
            <Column
              align="center"
              title="Consumption Rate"
              dataIndex="consumptionRate"
              key="consumptionRate"
              render={(_, record) => <Input variant="borderless" />}
            />
            <Column
              align="center"
              title="Stock in Hand [A]"
              dataIndex="stockInHand"
              key="stockInHand"
              render={(_, record, index) => (
                <InputNumber
                  min={0}
                  defaultValue={0}
                  variant="borderless"
                  onChange={(value) =>
                    setInputValues((prev) => ({
                      ...prev,
                      [index]: {
                        ...prev[index],
                        stockInHand: value,
                      },
                    }))
                  }
                />
              )}
            />
            <Column
              align="center"
              title="Stock in Store [B]"
              dataIndex="onHandQty"
              key="onHandQty"
              render={(_, record, index) => (
                <InputNumber
                  min={0}
                  defaultValue={_}
                  onChange={(value) =>
                    setInputValues((prev) => ({
                      ...prev,
                      [index]: {
                        ...prev[index],
                        onHandQty: value,
                      },
                    }))
                  }
                  variant="borderless"
                />
              )}
            />
            <Column
              align="center"
              title="Ordered Qty [C]"
              dataIndex="POQty"
              key="POQty"
              render={(_, record, index) => (
                <InputNumber
                  min={0}
                  defaultValue={_}
                  onChange={(value) =>
                    setInputValues((prev) => ({
                      ...prev,
                      [index]: {
                        ...prev[index],
                        POQty: value,
                      },
                    }))
                  }
                  variant="borderless"
                />
              )}
            />
            <Column
              align="center"
              title="Total [D=A+B+C]"
              dataIndex="totalStock"
              key="totalStock"
              render={(_, record, index) => {
                const values = inputValues[index] || {};
                const stockInHand = values.stockInHand || 0; // A
                const onHandQty = values.onHandQty || record?.onHandQty || 0; // B
                const POQty = values.POQty || record?.POQty || 0; // C
                const total = stockInHand + onHandQty + POQty;
                return new Intl.NumberFormat("en-BD", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(total);
              }}
            />
            <Column
              align="center"
              title="Production Target"
              dataIndex="consumePlan"
              key="consumePlan"
              render={(_, record) => (
                <Input defaultValue={_} variant="borderless" />
              )}
            />
            <Column
              align="center"
              title="Approved Design [Y/N]"
              dataIndex="appDesign"
              key="appDesign"
              render={(_, record) => <Input variant="borderless" />}
            />
          </ColumnGroup>
        </Table>
      </div>
      <Button
        type="primary"
        className="no-print"
        onClick={() => window.print()}>
        Print
      </Button>
    </>
  );
};

export default PurchaseReqPrintView;
