import React, { useEffect, useState } from "react";
import { Button, Flex, message, Table, Grid, Input } from "antd";
const { Search } = Input;
const { useBreakpoint } = Grid;
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import { usePermission } from "../../hooks/usePermission";
import {
  DeleteTwoTone,
  EditTwoTone,
  EyeTwoTone,
  FileExcelOutlined,
  InfoCircleTwoTone,
  UnorderedListOutlined,
} from "@ant-design/icons";
import NotAuth from "../notAuth";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import useExcelExport from "../../hooks/useExcelExport";

const InventoryListView = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [queryData, setQueryData] = useState([]);
  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("inventory")) {
    return <NotAuth />;
  }
  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  //   Table Row Span Functionality
  const processedData = [];
  const codeCountMap = {};

  queryData.forEach((item) => {
    const code = item?.code;
    if (!codeCountMap[code]) {
      codeCountMap[code] = 1;
    } else {
      codeCountMap[code]++;
    }
  });

  const seen = {};

  queryData.forEach((item) => {
    const code = item?.code;
    if (!seen[code]) {
      processedData.push({ ...item, rowSpan: codeCountMap[code] });
      seen[code] = true;
    } else {
      processedData.push({ ...item, rowSpan: 0 });
    }
  });

  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 80,
      render: (text, record, index) => index + 1,
      responsive: ["lg"],
    },

    {
      title: "SKU/Part",
      dataIndex: "SKU",
      key: "SKU",
      width: 150,
      responsive: ["lg"],
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
      render: (_, record) => (
        <>
          <Flex gap={5}>{_}</Flex>
        </>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      responsive: ["lg"],
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "UOM",
      dataIndex: "UOM",
      key: "UOM",
      width: 100,
      responsive: ["lg"],
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      responsive: ["lg"],
    },
    {
      title: "On-Hand Qty",
      dataIndex: "locQty",
      key: "locQty",
      width: 150,
      responsive: ["lg"],
    },
    {
      title: "Closing Qty",
      dataIndex: "onHandQty",
      key: "onHandQty",
      width: 150,
      responsive: ["lg"],
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
    },
  ];
  const getTableData = async () => {
    const payload = { scope: "all" };
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}/api/master/itemInfo/view`,
          payload,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user.token,
            },
          }
        )
        .then((res) => {
          // message.success(res.data.message);
          const tableArr = res?.data?.items?.flatMap((item) =>
            item.stock?.map(
              (stock) =>
                stock?.onHandQty > 0 && {
                  key: stock?._id,
                  code: item?.code,
                  SKU: item?.SKU,
                  name: item?.name,
                  UOM: item?.UOM?.code,
                  lastPrice: item?.lastPrice,
                  avgPrice: item?.avgPrice,
                  location: stock?.location,
                  locQty: stock?.onHandQty || 0,
                  onHandQty:
                    item?.stock?.reduce(
                      (sum, stock) => sum + (Number(stock?.onHandQty) || 0),
                      0
                    ) || 0,
                  safetyStock: item?.safetyStock || 0,
                  group: item?.group?.name,
                  type: item?.type?.name,
                  access: item,
                  action: item?._id,
                }
            )
          );
          setQueryData(tableArr);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  // Excel Export Function
  const handleExportExcel = useExcelExport(
    queryData?.filter((item) => item && item !== false),
    {
      filename: "Location_stock_report",
      sheetName: "Location Stock Report",
      excludedKeys: ["key", "onHandQty", "access", "action"], // Exclude internal fields
      columnWidths: {
        code: 15,
        SKU: 15,
        name: 30,
        UOM: 10,
        avgPrice: 10,
        lastPrice: 10,
        location: 20,
        locQty: 10,
        safetyStock: 10,
        group: 20,
        type: 20,
      },
    }
  );

  useEffect(() => {
    getTableData();
  }, []);

  return (
    <>
      <div
        style={{
          marginBottom: "10px",
          display: lastSegment === "new" && "none",
        }}>
        <Flex
          justify="space-between"
          gap={10}
          style={{ flexDirection: screens.md ? "row" : "column" }}>
          <Flex gap={10}>
            <Button
              className="borderBrand"
              style={{ borderRadius: "0px" }}
              type={lastSegment === "inventory" ? "primary" : "default"}
              onClick={() => navigate("/inventory")}>
              Stock
            </Button>
            <Button
              className="borderBrand"
              style={{ borderRadius: "0px" }}
              type={lastSegment === "list" ? "primary" : "default"}
              onClick={() => navigate(lastSegment === "list" ? "" : "list")}
              icon={<UnorderedListOutlined />}>
              Listview
            </Button>
            <Button
              type="default"
              className="borderBrand"
              style={{ borderRadius: "0px" }}
              onClick={handleExportExcel}>
              <FileExcelOutlined />
              Excel
            </Button>
          </Flex>
          <Flex>
            <Search
              className="search-field"
              style={{
                width: "350px",
                display: !["inventory", "list"].includes(lastSegment) && "none",
              }}
              placeholder="Search by Name"
              onChange={(e) => setSearch(e.target.value)}
              enterButton
            />
          </Flex>
        </Flex>
      </div>
      <Table
        bordered
        columns={columns}
        dataSource={processedData
          ?.filter((item) =>
            item?.name?.toLowerCase().includes(search?.toLowerCase())
          )
          .sort((a, b) => a.name.localeCompare(b.name))} //.sort((a, b) => a.code.localeCompare(b.code))
        // title={() => "Header"}
        sticky
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: [
            "10",
            "20",
            "50",
            processedData?.length?.toString() || "100",
          ],
          // showTotal: (total) => `Total ${total} items`,
          defaultPageSize: 10,
        }}
        scroll={{
          x: columns.reduce((sum, col) => sum + (col.width || 150), 0),
        }}
      />
    </>
  );
};

export default InventoryListView;
