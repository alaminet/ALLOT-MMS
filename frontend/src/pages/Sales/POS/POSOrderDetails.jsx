import React, { useEffect, useState } from "react";
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
import PosSalesView from "../../../components/posSalesView";
import useExcelExport from "../../../hooks/useExcelExport";
import { usePermission } from "../../../hooks/usePermission";
import NotAuth from "../../notAuth";
import Barcode from "react-barcode";
import ReactDOM from "react-dom/client";
const { Title, Text } = Typography;

const POSOrderDetails = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [form] = Form.useForm();
  const [queryData, setQueryData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [formFind, setFormFind] = useState();
  const [itemList, setItemList] = useState([]);
  const [loading, setLoading] = useState(false);

  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("POS")) {
    return <NotAuth />;
  }
  const ownView = canDoOwn("POS", "view");
  const othersView = canDoOther("POS", "view");

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
    setLoading(true);
    const scope =
      ownView && othersView
        ? "all"
        : ownView
          ? "own"
          : othersView
            ? "others"
            : null;
    if (!scope) {
      setLoading(false);
      message.warning("You are not authorized");
      return; // stop execution
    }
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
          setLoading(false);
        });
    } catch (error) {
      message.error(error.response.data.error);
      setLoading(false);
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

  useEffect(() => {
    getItems();
  }, []);

  // Discount calculation
  const getDiscountedPrice = (item) => {
    const base = item.salePrice;
    const quantity = item.quantity;
    const discount = item.discount || 0;
    const type = item.discountType;

    const perUnit =
      type === "percent" ? base - (base * discount) / 100 : base - discount;

    const total = perUnit * quantity;

    return Math.max(0, total);
  };

  const handlePrintSelected = async () => {
    if (!selectedRows || selectedRows.length === 0) {
      message.warning("Please select at least one row to print");
      return;
    }

    const orgName = user?.orgName || "Organization";
    const orgAddr = user?.orgAddress || {};
    const orgAdd =
      orgAddr && typeof orgAddr === "object"
        ? Object.values(orgAddr).reverse().join(", ")
        : orgAddr || "";

    const style = `
      <style>
        body{font-family: Arial, Helvetica, sans-serif; color:#111}
        .invoice{page-break-after: always; width:auto; margin:0 auto; padding:2px}
        .inv-header{text-align:center}
        .inv-header .org{font-weight:700; font-size:14px}
        .inv-header .addr{font-size:11px; margin-top:4px}
        .inv-header .invoice-no{font-weight:600; margin-top:8px;font-size:12px}
        .sep{border-top:2px solid #000; margin:6px 0}
        .line{display:flex; justify-content:space-between; align-items:center; padding:6px 0}
        .item-name{font-weight:600;font-size:10px}
        .item-meta{font-size:11px; color:#555}
        .totals{display:flex; justify-content:space-between; padding:2px 0; font-size:12px; border-bottom:1px dotted #0000001f}
        .columns{display:flex; justify-content:space-between; gap:8px; margin-top:8px}
        .col{width:48%}
        // .barcode{height:40px; border-top:1px solid #000; margin-top:8px; display:flex; justify-content:center; align-items:center}
        .footer{font-size:11px; text-align:center; margin-top:8px; padding-top:4px; border-top:1px dotted #00000073;}
        table{width:100%; border-collapse:collapse}
        .items td{padding:4px 0}
      </style>
    `;

    // Render react-barcode components off-screen to capture their SVG markup
    const svgMap = {};
    const offscreen = document.createElement("div");
    offscreen.style.position = "fixed";
    offscreen.style.left = "-10000px";
    offscreen.style.top = "-10000px";
    document.body.appendChild(offscreen);

    for (let idx = 0; idx < selectedRows.length; idx++) {
      const row = selectedRows[idx];
      const data = row.action || {};
      const invoice = data?.code || "";
      const child = document.createElement("div");
      offscreen.appendChild(child);
      try {
        const root = ReactDOM.createRoot(child);
        root.render(
          <Barcode
            value={String(invoice)}
            format="CODE128"
            width={2}
            height={20}
            displayValue={false}
          />,
        );
        // wait for render
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 80));
        const svg = child.querySelector("svg");
        svgMap[idx] = svg
          ? svg.outerHTML
          : `<svg data-code="${invoice}"></svg>`;
        root.unmount();
      } catch (e) {
        svgMap[idx] = `<svg data-code="${invoice}"></svg>`;
      }
      child.remove();
    }
    offscreen.remove();

    const bodyHtml = selectedRows
      .map((row, idx) => {
        const data = row.action || {};
        const createdAt = data?.createdAt
          ? moment(data.createdAt).format("DD-MMM-YY hh:mm A")
          : "";
        const invoice = data?.code || "";
        const billing = data?.billing || {};
        const payments = data?.payments || {};
        const paid = (payments?.payment || []).reduce(
          (s, p) => s + (p?.amount || 0),
          0,
        );
        const totalBill =
          Number(payments?.totalBill || 0) +
          Number(payments?.vat || 0) -
          Number(payments?.discount || 0) -
          Number(payments?.adjustment || 0);

        const itemsHtml = (data?.products || [])
          .map((item, i) => {
            const lineTotal = item.salePrice * item.quantity || 0;
            const salePrice = Number(item?.salePrice)?.toFixed(2);
            const discountedTotal = getDiscountedPrice(item);

            return `
                  <div
                    style="display:flex; justify-content:space-between; padding-bottom:10px; border-bottom:1px solid #0505050f;"
                  >
                    <div style="display:flex; flex-flow:column; width:auto;">
                      <strong style="font-size:12px;">${item.name}(${item.SKU})</strong>
                      <p style="color: #00000073; padding:0; margin:0; font-size:10px; margin-top:2px;">
                        ${item.quantity} ${item.UOM} X ${salePrice}
                      </p>
                    </div>
                    <div>
                      ${
                        lineTotal !== discountedTotal
                          ? `<strike style="font-size:10px; display:block; text-align:right;">
                              ${lineTotal?.toFixed(2)}
                            </strike>`
                          : ""
                      }
                      <strong style="font-size:12px; display:block; text-align:right;">
                        ${discountedTotal?.toFixed(2)}
                      </strong>
                      ${
                        item?.VAT > 0
                          ? `<p style="font-size:10px; color:#00000073; text-align:right; padding:0; margin:0;">
                              VAT: ${Number(discountedTotal * (item?.VAT / 100)).toFixed(2)}%
                            </p>`
                          : ""
                      }
                    </div>
                  </div>
                `;
          })
          .join("");

        const paymentList = (payments?.payment || [])
          .map((item, i) =>
            item?.amount !== 0
              ? `<div style="display:flex; gap:6px; font-size:10px;">
                      <p style="margin:0; padding:0;">
                        # ${moment(item?.payAt).format("DD-MM-YY hh:mm A")}
                      </p>
                      <p style="margin:0; padding:0;">${item?.amount?.toFixed(2)}</p>
                      <p style="margin:0; padding:0;">${item?.payBy || ""}</p>
                      <p style="margin:0; padding:0;">${item?.payRef || ""}</p>
                    </div>`
              : "",
          )
          .join("");

        return `
          <div class="invoice">
            <div class="inv-header">
              <div class="org">${orgName}</div>
              <div class="addr">${orgAdd}</div>
              <div class="invoice-no">Invoice: ${invoice} @ ${createdAt}</div>
            </div>
            <div class="sep"></div>
            <div style="width:100%;">${itemsHtml}</div>
            <div class="sep"></div>
            <div class="columns">
              <div class="col" style="display:flex; flex-flow:column; justify-content:space-between;">
                <div>
                  <div style="font-weight:700; margin-bottom:6px; font-size:12px;">Billing Details</div>
                  <div style="font-size:12px; padding-bottom:2px;">${billing?.name || ""}</div>
                  <div style="font-size:12px; padding-bottom:2px;">${billing?.number || ""}</div>
                  <div style="white-space:pre-wrap; font-size:12px;">${billing?.address || ""}</div>
                </div>
                <div>
                  ${svgMap[idx]}
                </div>
              </div>
              <div class="col">
                <div style="font-weight:700; margin-bottom:6px; font-size:12px;">Payment Details</div>
                <div class="totals"><div>Sub Total :</div><div>${(payments?.totalBill || 0).toFixed(2)}</div></div>
                <div class="totals"><div>Discount :</div><div>${(payments?.discount || 0).toFixed(2)}</div></div>
                <div class="totals"><div>VAT :</div><div>${(payments?.vat || 0).toFixed(2)}</div></div>
                <div class="totals"><div>Adjust :</div><div>${(payments?.adjustment || 0).toFixed(2)}</div></div>
                <div class="totals"><div>Payment :</div><div>${paid.toFixed(2)}</div></div>
                <div style="display:flex; justify-content:space-between; padding:2px 0; font-size:12px; font-weight:700"><div>Due Pay :</div><div>${(totalBill - paid).toFixed(2)}</div></div>
              </div>
            </div>
            <div>
              <p style="font-weight:700; margin-top:6px; font-size:12px;"> Payment History</p>
              <div>${paymentList}</div>
            </div>
            <div class="footer">©ALLOT 2026 | Developed by Al Amin ET</div>
          </div>
        `;
      })
      .join("");

    const newWin = window.open("", "_blank");
    if (!newWin) {
      message.error("Unable to open print window (blocked by browser)");
      return;
    }
    const initScript = `
      <script>
        function initBarcodes(){
          var svgs = document.querySelectorAll('svg[data-code]');
          svgs.forEach(function(s){
            var code = s.getAttribute('data-code') || '';
            if(window.JsBarcode){
              try{ JsBarcode(s, code, {format: 'CODE128', width:1, height:40, displayValue:false}); }catch(e){}
            }
          });
        }
        if(!window.JsBarcode){
          var scr = document.createElement('script');
          scr.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
          scr.onload = function(){ initBarcodes(); };
          document.head.appendChild(scr);
        } else { initBarcodes(); }
        window.onafterprint = function(){ try{ window.close(); }catch(e){} };
        // fallback close in case afterprint not supported
        function doPrintAndClose(){
          window.print();
          setTimeout(function(){ try{ window.close(); }catch(e){} }, 1000);
        }
        // delay to ensure barcodes render
        setTimeout(doPrintAndClose, 600);
      <\/script>
    `;

    const fullHtml = `<!doctype html><html><head><title>POS Print</title>${style}</head><body>${bodyHtml}${initScript}</body></html>`;
    newWin.document.open();
    newWin.document.write(fullHtml);
    newWin.document.close();
    newWin.focus();
  };

  return (
    <>
      <div className="no-print">
        <Flex justify="space-between" style={{ margin: "10px 0" }}>
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
                style={{ minWidth: "130px" }}
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
                style={{ minWidth: "130px" }}
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
                style={{ minWidth: "260px" }}
                placeholder="SKU"
                optionFilterProp="label"
                options={itemList}
              />
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button type="primary" htmlType="submit" loading={loading}>
                Find
              </Button>
            </Form.Item>
          </Form>
        </Flex>
        {queryData.length > 0 ? (
          <>
            <Flex justify="end" style={{ marginBottom: "10px" }}>
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
                disabled={queryData?.length > 0 ? false : true}
                type="default"
                style={{ marginLeft: 8 }}
                onClick={() => handlePrintSelected()}>
                Print
              </Button>
            </Flex>
            <Table
              bordered
              columns={columns}
              dataSource={queryData}
              rowSelection={{
                selectedRowKeys,
                onChange: (keys, rows) => {
                  setSelectedRowKeys(keys);
                  setSelectedRows(rows);
                },
              }}
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
          </>
        ) : null}
      </div>
    </>
  );
};

export default POSOrderDetails;
