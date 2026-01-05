import React, { useState } from "react";
import {
  Button,
  Col,
  Row,
  Image,
  Upload,
  Table,
  Typography,
  Input,
  InputNumber,
  message,
  QRCode,
  Flex,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { useEffect } from "react";
import axios from "axios";
import { usePermission } from "../../../hooks/usePermission";
import NotAuth from "../../notAuth";
import { useSelector } from "react-redux";
import NotFound from "../../notFound";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ExcelJS from "exceljs";
const { Title, Text } = Typography;
const { Column, ColumnGroup } = Table;

// Print layout
function handlePrint(layout = "A4 landscape") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    @media print {
      @page {
        size: ${layout};
      }
      p{
      font-size: 12px;
      }
    }
  `;
  document.head.appendChild(styleTag);
  window.print();
}

const PurchaseReqPrintView = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const navigate = useNavigate();
  const location = useLocation();
  const { refData } = location.state || {};
  const [inputValues, setInputValues] = useState({});
  const [businessDetails, setBusinessDetails] = useState();
  const [queryData, setQueryData] = useState(null);

  // Export to Excel
  const applyBorder = (worksheet, rowNumber, startCol, endCol) => {
    const row = worksheet.getRow(rowNumber);
    for (let col = startCol; col <= endCol; col++) {
      row.getCell(col).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
  };
  const handleExportExcel = async () => {
    if (!queryData) {
      message.error("No data available to export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Purchase Requisition");

    let currentRow = 1;

    //Column width
    worksheet.getColumn("A").width = 5;
    worksheet.getColumn("B").width = 15;
    worksheet.getColumn("C").width = 20;
    worksheet.getColumn("D").width = 20;
    worksheet.getColumn("E").width = 15;
    worksheet.getColumn("F").width = 15;
    worksheet.getColumn("G").width = 10;
    worksheet.getColumn("H").width = 10;
    worksheet.getColumn("I").width = 15;
    worksheet.getColumn("J").width = 10;
    worksheet.getColumn("K").width = 15;
    worksheet.getColumn("L").width = 15;
    worksheet.getColumn("M").width = 15;

    // Header section with merged cells
    // ROW 1
    worksheet.addRow(new Array(13).fill(""));
    worksheet.mergeCells(currentRow, 1, currentRow, 13); // Merge C1:K1
    worksheet.getCell(currentRow, 1).value = businessDetails?.orgName || "";
    worksheet.getCell(currentRow, 1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(currentRow, 1).font = { bold: true, size: 18 };
    currentRow++;

    // ROW 2
    worksheet.addRow(new Array(13).fill(""));
    worksheet.mergeCells(currentRow, 1, currentRow, 13);
    worksheet.getCell(currentRow, 1).value =
      businessDetails?.businessAddress?.street || "";
    worksheet.getCell(currentRow, 1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(currentRow, 1).font = { bold: false, size: 12 };
    currentRow++;

    // ROW 3
    worksheet.addRow(new Array(13).fill(""));
    worksheet.mergeCells(currentRow, 1, currentRow, 13);
    worksheet.getCell(currentRow, 1).value =
      (businessDetails?.businessAddress?.city || "") +
      ", " +
      (businessDetails?.businessAddress?.country || "") +
      "-" +
      (businessDetails?.businessAddress?.postal || "") +
      ". #" +
      (businessDetails?.phone?.office || "");
    worksheet.getCell(currentRow, 1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(currentRow, 1).font = { bold: false, size: 12 };
    currentRow++;

    // ROW 4
    worksheet.addRow(new Array(13).fill(""));
    worksheet.mergeCells(currentRow, 1, currentRow, 13);
    worksheet.getCell(currentRow, 1).value = "PURCHASE REQUISITION FORM";
    worksheet.getCell(currentRow, 1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(currentRow, 1).font = { bold: true, size: 13 };
    currentRow++;

    // ROW 5
    // Add QR Code using html2canvas to capture the existing QRCode component
    const qrElement = document.querySelector(".ant-qrcode");
    if (qrElement) {
      try {
        const canvas = await html2canvas(qrElement, {
          scale: 2,
          backgroundColor: "#FFFFFF",
          width: 100,
          height: 100,
        });
        const qrImageId = workbook.addImage({
          base64: canvas.toDataURL("image/png"),
          extension: "png",
        });

        worksheet.addImage(qrImageId, {
          tl: { col: 12, row: 0 }, // Column L (12th column, 0-indexed), Row 1
          ext: { width: 100, height: 100 },
        });
      } catch (error) {
        console.log("Error capturing QR code:", error);
        // Fallback: add text placeholder
        worksheet.mergeCells("L1:M5");
        worksheet.getCell(1, 12).value = "QR Code";
        worksheet.getCell(1, 12).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      }
    }
    currentRow++;

    // ROW 6
    worksheet.addRow([]);
    currentRow++;

    // ROW 7
    worksheet.addRow(new Array(13));
    worksheet.getCell(currentRow, 1).value = `PR No.: ${queryData?.code || ""}`;
    worksheet.getCell(currentRow, 5).value = `Department: ${
      queryData?.costCenter?.name || ""
    }`;
    worksheet.getCell(currentRow, 11).value = `Req. Date: ${
      moment(queryData?.createdAt).format("DD-MMM-YYYY") || ""
    }`;
    currentRow++;

    // ROW 8
    worksheet.addRow(new Array(13));
    worksheet.getCell(currentRow, 1).value = `Reference: ${
      queryData?.reference || ""
    }`;
    worksheet.getCell(currentRow, 5).value = `Email: ${
      queryData?.requestedBy?.email || ""
    }`;
    worksheet.getCell(currentRow, 11).value = `PR Status: ${
      queryData?.status || ""
    }`;
    currentRow++;

    // ROW 9
    worksheet.addRow(new Array(13));
    worksheet.getCell(currentRow, 1).value = `Requested By: ${
      queryData?.requestedBy?.name || ""
    }`;
    worksheet.getCell(currentRow, 5).value = `Phone No.: ${
      queryData?.requestedBy?.contact || ""
    }`;
    worksheet.getCell(currentRow, 11).value = `Update On: ${
      moment(queryData?.updatedAt).format("DD-MMM-YYYY") || ""
    }`;
    currentRow++;

    // ROW 10
    worksheet.addRow([]);
    currentRow++;
    // ROW 11
    // Table headers
    worksheet.addRow([
      "SL",
      "Part Code",
      "Name",
      "",
      "Spec.",
      "",
      "Brand",
      "UOM",
      "Unit Price (BDT)",
      "Req. Qty",
      "Req. Value (BDT)",
      "On-Hand Stock",
      "Remarks",
    ]);
    worksheet.mergeCells("C11:D11");
    worksheet.mergeCells("E11:F11");
    worksheet.getRow(currentRow).font = { bold: true, size: 11 };
    worksheet.getRow(currentRow).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    applyBorder(worksheet, currentRow, 1, 13);
    currentRow++;

    // Table data
    if (queryData?.itemDetails && Array.isArray(queryData.itemDetails)) {
      queryData.itemDetails.forEach((item, index) => {
        worksheet.addRow([
          index + 1,
          item?.code?.SKU || item?.SKU || "NA",
          item?.name || "",
          "",
          item?.spec || "",
          "",
          item?.brand || "",
          item?.UOM || "",
          item?.unitPrice || 0,
          item?.reqQty || 0,
          (item?.unitPrice || 0) * (item?.reqQty || 0),
          item?.onHandQty || 0,
          item?.remarks || "",
        ]);
        worksheet.mergeCells(currentRow, 3, currentRow, 4);
        worksheet.mergeCells(currentRow, 5, currentRow, 6);
        applyBorder(worksheet, currentRow, 1, 13);
        currentRow++;
      });

      // Add totals
      const totalQty = queryData.itemDetails.reduce(
        (sum, item) => sum + (item?.reqQty || 0),
        0
      );
      const totalValue = queryData.itemDetails.reduce(
        (sum, item) => sum + (item?.unitPrice || 0) * (item?.reqQty || 0),
        0
      );
      worksheet.addRow([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Total",
        totalQty,
        totalValue,
        "",
        "",
      ]);
      worksheet.mergeCells(currentRow, 1, currentRow, 8);
      worksheet.mergeCells(currentRow, 12, currentRow, 13);
      worksheet.getRow(currentRow).font = { bold: true, size: 11 };
      applyBorder(worksheet, currentRow, 1, 13);
      currentRow++;
    }

    worksheet.addRow([]);
    currentRow++;

    // ROW Note
    worksheet.addRow([]);
    worksheet.getCell(currentRow, 1).value = `Note: ${queryData?.note || ""}`;
    currentRow++;

    worksheet.addRow([]);
    currentRow++;

    //ROW Approval
    worksheet.addRow([]);
    worksheet.getCell(currentRow, 1).value = `Prepared By`;
    worksheet.getCell(currentRow, 5).value = `Checked By`;
    worksheet.getCell(currentRow, 9).value = `Confirmed By`;
    worksheet.getCell(currentRow, 12).value = `Approved By`;
    worksheet.mergeCells(currentRow, 1, currentRow, 2);
    worksheet.mergeCells(currentRow, 5, currentRow, 6);
    worksheet.mergeCells(currentRow, 9, currentRow, 10);
    worksheet.mergeCells(currentRow, 12, currentRow, 13);
    worksheet.getRow(currentRow).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    currentRow++;
    worksheet.addRow([]);
    worksheet.getCell(currentRow, 1).value = `${
      queryData?.createdBy?.name || ""
    }`;
    worksheet.getCell(currentRow, 5).value = `${
      queryData?.checkedBy?.name || ""
    }`;
    worksheet.getCell(currentRow, 9).value = `${
      queryData?.confirmedBy?.name || ""
    }`;
    worksheet.getCell(currentRow, 12).value = `${
      queryData?.approvedBy?.name || ""
    }`;
    worksheet.mergeCells(currentRow, 1, currentRow, 2);
    worksheet.mergeCells(currentRow, 5, currentRow, 6);
    worksheet.mergeCells(currentRow, 9, currentRow, 10);
    worksheet.mergeCells(currentRow, 12, currentRow, 13);
    worksheet.getRow(currentRow).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    currentRow++;

    worksheet.addRow([]);
    currentRow++;

    // ROW Justification
    worksheet.addRow(new Array(13).fill(""));
    worksheet.mergeCells(currentRow, 1, currentRow, 13);
    worksheet.getCell(currentRow, 3).value =
      "Justification of Purchage Requisition";
    worksheet.getCell(currentRow, 3).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell(currentRow, 3).font = { bold: true, size: 11 };
    applyBorder(worksheet, currentRow, 1, 13);
    currentRow++;

    // Table headers
    worksheet.addRow([
      "Item Name",
      "",
      "",
      "Last 6M Used",
      "Consumption Rate",
      "Stock in Hand [A]",
      "Stock in Store [B]",
      "Ordered Qty [C]",
      "Total [D=A+B+C]",
      "Purpose",
      "",
      "Approved Design [Y/N]",
      "",
    ]);
    worksheet.mergeCells(currentRow, 1, currentRow, 3);
    worksheet.mergeCells(currentRow, 10, currentRow, 11);
    worksheet.mergeCells(currentRow, 12, currentRow, 13);
    worksheet.getRow(currentRow).font = { bold: true, size: 11 };
    worksheet.getRow(currentRow).alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    applyBorder(worksheet, currentRow, 1, 13);
    currentRow++;

    // Table data
    if (queryData?.itemDetails && Array.isArray(queryData.itemDetails)) {
      queryData.itemDetails.forEach((item, index) => {
        worksheet.addRow([
          item?.name || "",
          "",
          "",
          item?.sixMonthUsed || 0,
          item?.consumptionRate || "",
          item?.stockInHand || 0,
          item?.onHandQty || 0,
          item?.POQty || 0,
          "",
          item?.consumePlan || "",
          "",
          item?.appDesign || "",
          "",
        ]);
        worksheet.mergeCells(currentRow, 1, currentRow, 3);
        worksheet.mergeCells(currentRow, 10, currentRow, 11);
        worksheet.mergeCells(currentRow, 12, currentRow, 13);
        worksheet.getCell(currentRow, 9).value = {
          formula: `SUM(F${currentRow}:H${currentRow})`,
        };
        applyBorder(worksheet, currentRow, 1, 13);
        currentRow++;
      });
    }

    // Save file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Purchase_Requisition_${queryData?.code || "Export"}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  // Export to PDF
  // const handleExportPDF = () => {
  //   const input = document.getElementById("print-content");
  //   if (!input) {
  //     message.error("Content not available for PDF export");
  //     return;
  //   }

  //   html2canvas(input, { scale: 2 }).then((canvas) => {
  //     const imgData = canvas.toDataURL("image/png");
  //     const pdf = new jsPDF("l", "mm", "a4");
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = pdf.internal.pageSize.getHeight();
  //     const imgWidth = canvas.width;
  //     const imgHeight = canvas.height;
  //     const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  //     const imgX = (pdfWidth - imgWidth * ratio) / 2;
  //     const imgY = 30;

  //     pdf.addImage(
  //       imgData,
  //       "PNG",
  //       imgX,
  //       imgY,
  //       imgWidth * ratio,
  //       imgHeight * ratio
  //     );
  //     pdf.save(`Purchase_Requisition_${queryData?.code || "Export"}.pdf`);
  //   });
  // };
  const handleExportPDF = () => {
    const input = document.getElementById("print-content");
    if (!input) {
      message.error("Content not available for PDF export");
      return;
    }

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4"); // landscape A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Scale image to fit page width
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Extra pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      // Add page numbers
      // const pageCount = pdf.internal.getNumberOfPages();
      // for (let i = 1; i <= pageCount; i++) {
      //   pdf.setPage(i);
      //   pdf.setFontSize(10);
      //   pdf.text(`Page ${i} of ${pageCount}`, pdfWidth / 2, pdfHeight - 5, {
      //     align: "center",
      //   });
      // }

      pdf.save(`Purchase_Requisition_${queryData?.code || "Export"}.pdf`);
    });
  };

  // User Permission Check
  const { canDoOwn, canDoOther, canAuthOther, canAuthOwn } = usePermission();
  const own = canDoOwn("purchase-requisition", "view");
  const others = canDoOther("purchase-requisition", "view");
  const ownEdit = canDoOwn("purchase-requisition", "edit");
  const othersEdit = canDoOther("purchase-requisition", "edit");
  const ownCheck = canAuthOwn("purchase-requisition", "check");
  const othersCheck = canAuthOther("purchase-requisition", "check");
  const ownConfirm = canAuthOwn("purchase-requisition", "confirm");
  const othersConfirm = canAuthOther("purchase-requisition", "confirm");
  const ownApprove = canAuthOwn("purchase-requisition", "approve");
  const othersApprove = canAuthOther("purchase-requisition", "approve");
  const ownHold = canAuthOwn("purchase-requisition", "hold");
  const othersHold = canAuthOther("purchase-requisition", "hold");

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
      type="button"
    >
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
      render: (text, record, index) => text?.SKU || record?.SKU || "NA",
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

  // Get print data
  const getData = async () => {
    // const scope =
    //   own && others ? "all" : own ? "own" : others ? "others" : null;
    // if (!scope) {
    //   setQueryData([]);
    //   // message.warning("You are not authorized");
    //   return; // stop execution
    // }
    const id = window.location.search
      ? new URLSearchParams(window.location.search).get("ref")
      : refData;
    const payload = { scope: "all", prId: id };
    try {
      await axios
        .post(
          `${
            import.meta.env.VITE_API_URL
          }/api/purchase/requisition/view-single`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          }
        )
        .then((res) => {
          // message.success(res?.data?.message);
          setQueryData(res?.data?.items);
        });
    } catch (error) {
      console.log(error);
    }
  };

  // Get Business Details
  const getBusinessDetails = async () => {
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
          setBusinessDetails(settings);
          if (settings) {
            form.setFieldsValue(settings);
          }
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  // Handle Status Update
  const handleStatusUpdate = async (values) => {
    const timeNow = moment(new Date());
    const payload = {
      status: values,
    };

    if (values == "Checked") {
      payload.checkedBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    if (values == "Confirmed") {
      payload.confirmedBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    if (values == "Approved") {
      payload.approvedBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    if (values == "Hold") {
      payload.holdBy = {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
        timeAt: timeNow,
      };
    }
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/purchase/requisition/update/${
            queryData?._id
          }`,
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
          getData();
          getBusinessDetails();
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getData();
    getBusinessDetails();
  }, []);

  return (
    <>
      {!queryData ? (
        <NotFound />
      ) : (
        <>
          <div
            id="print-content"
            className="print-page"
            style={{ backgroundColor: "#fff", padding: "20px" }}
          >
            <Row justify="space-between">
              <Col span={6}></Col>
              <Col span={12}>
                <Typography style={{ textAlign: "center" }}>
                  <Title level={2} style={{ margin: "0" }}>
                    {businessDetails?.orgName}
                  </Title>
                  <Text style={{ display: "block" }}>
                    {businessDetails?.businessAddress?.street}
                  </Text>
                  <Text style={{ display: "block" }}>
                    {businessDetails?.businessAddress?.city +
                      ", " +
                      businessDetails?.businessAddress?.country +
                      "-" +
                      businessDetails?.businessAddress?.postal +
                      ". #" +
                      businessDetails?.phone?.office}
                  </Text>
                  <Title level={4} style={{ margin: "0" }}>
                    PURCHASE REQUISITION FORM
                  </Title>
                </Typography>
              </Col>
              <Col span={6}>
                <QRCode
                  value={
                    window.location.search
                      ? window.location.href
                      : `${window.location.href}?ref=${refData}`
                  }
                  type="svg"
                  size={100}
                  style={{ margin: "0 0 0 auto" }}
                  bordered={false}
                />
              </Col>
            </Row>
            <Row justify="space-between" style={{ padding: "10px" }}>
              <Col>
                <p>
                  <strong>PR No.: </strong>
                  {queryData?.code}
                </p>
                <p>
                  <strong>Reference: </strong>
                  {queryData?.reference}
                </p>
                <p>
                  <strong>Requested By: </strong>
                  {queryData?.requestedBy?.name}
                </p>
              </Col>
              <Col>
                <p>
                  <strong>Department: </strong>
                  {queryData?.costCenter?.name}
                </p>
                <p>
                  <strong>Email: </strong>
                  {queryData?.requestedBy?.email}
                </p>
                <p>
                  <strong>Phone No.: </strong>
                  {queryData?.requestedBy?.contact}
                </p>
              </Col>
              <Col>
                <p>
                  <strong>Req. Date: </strong>
                  {moment(queryData?.createdAt).format("DD-MMM-YYYY")}
                </p>
                <p>
                  <strong>PR Status: </strong>
                  {queryData?.status}
                </p>
                <p>
                  <strong>Update On: </strong>
                  {moment(queryData?.updatedAt).format("DD-MMM-YYYY")}
                </p>
              </Col>
            </Row>
            <Table
              // bordered
              className="purchase-table"
              columns={columns}
              dataSource={queryData?.itemDetails}
              // title={() => "Header"}
              pagination={false}
              summary={() => {
                const totalQty = queryData?.itemDetails?.reduce(
                  (sum, item) => sum + (item?.reqQty || 0),
                  0
                );
                const totalValue = queryData?.itemDetails?.reduce(
                  (sum, item) =>
                    sum + (item?.unitPrice || 0) * (item?.reqQty || 0),
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
                  <strong>Note:</strong> {queryData?.note}
                </span>
              </Col>
              <Col>
                <div>
                  <Upload
                    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                  >
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
                  fontSize: "12px",
                }}
              >
                Prepared By
                <span style={{ display: "block" }}>
                  {queryData?.createdBy?.name}
                </span>
              </Col>
              <Col
                span={5}
                style={{
                  textAlign: "center",
                  borderTop: "1px solid black",
                  fontSize: "12px",
                }}
              >
                Checked By
                <span style={{ display: "block" }}>
                  {queryData?.confirmedBy?.name}
                </span>
              </Col>
              <Col
                span={5}
                style={{
                  textAlign: "center",
                  borderTop: "1px solid black",
                  fontSize: "12px",
                }}
              >
                Confirmed By
                <span style={{ display: "block" }}>
                  {queryData?.checkedBy?.name}
                </span>
              </Col>
              <Col
                span={5}
                style={{
                  textAlign: "center",
                  borderTop: "1px solid black",
                  fontSize: "12px",
                }}
              >
                Approved By
                <span style={{ display: "block" }}>
                  {queryData?.approvedBy?.name}
                </span>
              </Col>
            </Row>
            <Table
              // bordered
              className="justification-table"
              pagination={false}
              // dataSource={data}
              dataSource={queryData?.itemDetails}
            >
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
                  dataIndex="sixMonthUsed"
                  key="sixMonthUsed"
                  render={(_, record, index) => (
                    <InputNumber
                      min={0}
                      defaultValue={_ || 0}
                      onChange={(value) =>
                        setInputValues((prev) => ({
                          ...prev,
                          [index]: {
                            ...prev[index],
                            sixMonthUsed: value,
                          },
                        }))
                      }
                      variant="borderless"
                    />
                  )}
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
                    const stockInHand = values?.stockInHand || 0; // A
                    const onHandQty =
                      values?.onHandQty || record?.onHandQty || 0; // B
                    const POQty = values?.POQty || record?.POQty || 0; // C
                    const total = stockInHand + onHandQty + POQty;
                    return new Intl.NumberFormat("en-BD", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(total);
                  }}
                />
                <Column
                  align="center"
                  title="Purpose"
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
          <Flex gap={16} style={{ marginTop: "16px" }}>
            {/* ownEdit othersEdit */}
            {queryData?.status === "In-Process" &&
            ownEdit &&
            user.id === queryData?.createdBy?._id ? (
              <Button
                type="primary"
                className="no-print"
                onClick={() =>
                  navigate("/purchase-requisition/update", {
                    state: {
                      refData: queryData,
                    },
                  })
                }
              >
                <EditOutlined />
              </Button>
            ) : queryData?.status === "In-Process" &&
              othersEdit &&
              user.id !== queryData?.createdBy?._id ? (
              <Button
                type="primary"
                className="no-print"
                onClick={() =>
                  navigate("/purchase-requisition/update", {
                    state: {
                      refData: queryData,
                    },
                  })
                }
              >
                <EditOutlined />
              </Button>
            ) : null}

            <Button
              type="dashed"
              className="no-print"
              onClick={() => handlePrint("A4 landscape")}
            >
              <PrinterOutlined />
            </Button>

            <Button
              type="dashed"
              className="no-print"
              onClick={handleExportExcel}
            >
              <FileExcelOutlined />
              Excel
            </Button>

            <Button
              type="dashed"
              className="no-print"
              onClick={handleExportPDF}
            >
              <FilePdfOutlined />
              PDF
            </Button>
            {((ownCheck &&
              user?.costCenterName == queryData?.costCenter?.name) ||
              (othersCheck &&
                user?.costCenterName !== queryData?.costCenter?.name)) &&
            queryData?.status == "In-Process" ? (
              <Button
                type="primary"
                className="no-print"
                onClick={() => handleStatusUpdate("Checked")}
              >
                Checked
              </Button>
            ) : ((ownConfirm &&
                user?.costCenterName == queryData?.costCenter?.name) ||
                (othersConfirm &&
                  user?.costCenterName !== queryData?.costCenter?.name)) &&
              queryData?.status == "Checked" ? (
              <Button
                type="primary"
                className="no-print"
                onClick={() => handleStatusUpdate("Confirmed")}
              >
                Confirmed
              </Button>
            ) : ((ownApprove &&
                user?.costCenterName == queryData?.costCenter?.name) ||
                (othersApprove &&
                  user?.costCenterName !== queryData?.costCenter?.name)) &&
              queryData?.status == "Confirmed" ? (
              <Button
                type="primary"
                className="no-print"
                onClick={() => handleStatusUpdate("Approved")}
              >
                Approved
              </Button>
            ) : null}
            {((ownHold &&
              user?.costCenterName == queryData?.costCenter?.name) ||
              (othersHold &&
                user?.costCenterName !== queryData?.costCenter?.name)) &&
            queryData?.status !== "Hold" &&
            queryData?.status !== "Closed" &&
            queryData?.status !== "Approved" ? (
              <Button
                className="no-print"
                color="danger"
                variant="outlined"
                onClick={() => handleStatusUpdate("Hold")}
              >
                Hold
              </Button>
            ) : null}
            {queryData?.createdBy?._id === user?.id &&
            queryData?.status !== "Closed" ? (
              <Button
                className="no-print"
                color="danger"
                variant="outlined"
                onClick={() => handleStatusUpdate("Closed")}
              >
                Closed
              </Button>
            ) : null}
          </Flex>
        </>
      )}
    </>
  );
};

export default PurchaseReqPrintView;
