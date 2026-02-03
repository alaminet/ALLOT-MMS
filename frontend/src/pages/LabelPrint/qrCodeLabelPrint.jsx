import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Checkbox,
  Col,
  Flex,
  InputNumber,
  Row,
  Typography,
  Slider,
  QRCode,
  Button,
} from "antd";
import Barcode from "react-barcode";
import TextArea from "antd/es/input/TextArea";
import { PrinterOutlined } from "@ant-design/icons";
const { Text } = Typography;

const QRCodeLabelPrint = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [itemList, setItemList] = useState([]);
  const [SKUs, setSKUs] = useState([]);
  const [isRandom, setIsRandom] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showName, setShowName] = useState(false);
  const [size, setSize] = useState(140);
  const [pageWidth, setPageWidth] = useState(210);
  const [codeFontSize, setCodeFontSize] = useState(12);
  const [nameFontSize, setNameFontSize] = useState(12);
  const [gutterKey, setGutterKey] = useState(1);
  const [vgutterKey, setVgutterKey] = useState(1);
  const [colCountKey, setColCountKey] = useState(0);

  const gutters = {};
  const vgutters = {};
  const colCounts = {};
  const cols = [];
  [8, 16, 24, 32, 40, 48].forEach((value, i) => {
    gutters[i] = value;
  });
  [8, 16, 24, 32, 40, 48].forEach((value, i) => {
    vgutters[i] = value;
  });
  [1, 2, 3, 4, 6, 8, 12].forEach((value, i) => {
    colCounts[i] = value;
  });
  const colCount = colCounts[colCountKey];

  const handleValueChanges = (values) => {
    const arr = values
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item);
    setSKUs(arr);
  };

  // Text Suffix
  const EllipsisMiddle = ({ suffixCount, children }) => {
    const start = children.slice(0, children.length - suffixCount);
    const suffix = children.slice(-suffixCount).trim();
    return (
      <Text
        style={{ maxWidth: "100%", fontSize: nameFontSize }}
        ellipsis={{ suffix }}>
        {start}
      </Text>
    );
  };
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
        },
      );
      const tableArr = res?.data?.items?.map((item, index) => ({
        name: item?.name,
        SKU: item?.SKU,
        code: item?.code,
        UOM: item?.UOM?.code,
        price: item?.salePrice,
      }));
      setItemList(tableArr);
    } catch (error) {
      console.log(error);
    }
  };
  const filterItems = itemList?.filter((p) => SKUs.includes(p.SKU));
  useEffect(() => {
    getItems();
  }, []);

  return (
    <>
      <TextArea rows={4} onChange={(e) => handleValueChanges(e.target.value)} />
      <Row gutter={16} style={{ margin: "10px 0" }}>
        <Col md={6} sm={24}>
          <span>Horizontal Gutter (px): </span>
          <div>
            <Slider
              min={0}
              max={Object.keys(gutters).length - 1}
              value={gutterKey}
              onChange={setGutterKey}
              marks={gutters}
              step={null}
              tooltip={{ formatter: (value) => gutters[value] }}
            />
          </div>
        </Col>
        <Col md={6} sm={24}>
          <span>Vertical Gutter (px): </span>
          <div>
            <Slider
              min={0}
              max={Object.keys(vgutters).length - 1}
              value={vgutterKey}
              onChange={setVgutterKey}
              marks={vgutters}
              step={null}
              tooltip={{ formatter: (value) => vgutters[value] }}
            />
          </div>
        </Col>
        <Col md={6} sm={24}>
          <span>Column Count:</span>
          <div>
            <Slider
              min={0}
              max={Object.keys(colCounts).length - 1}
              value={colCountKey}
              onChange={setColCountKey}
              marks={colCounts}
              step={null}
              tooltip={{ formatter: (value) => colCounts[value] }}
            />
          </div>
        </Col>
        <Col
          span={6}
          style={{ display: "flex", flexFlow: "column", gap: "4px" }}>
          <div>
            <Checkbox
              checked={showCode}
              onChange={(e) => setShowCode(e.target.checked)}>
              Show Code/SKU,
            </Checkbox>
            <span>
              <label>Font size: </label>
              <InputNumber
                style={{ width: "60px" }}
                size="small"
                value={codeFontSize}
                onChange={(e) => setCodeFontSize(e)}
              />
            </span>
          </div>
          <div>
            <Checkbox
              checked={showName}
              onChange={(e) => setShowName(e.target.checked)}>
              Show Name,
            </Checkbox>
            <span>
              <label>Font size: </label>
              <InputNumber
                style={{ width: "60px" }}
                size="small"
                value={nameFontSize}
                onChange={(e) => setNameFontSize(e)}
              />
            </span>
          </div>
          <Flex gap={4} align="center">
            <div>
              <label>Size </label>
              <InputNumber
                style={{ width: "60px" }}
                size="small"
                value={size}
                onChange={(e) => setSize(e)}
              />
            </div>
          </Flex>
          <div>
            <Checkbox
              checked={isRandom}
              onChange={(e) => setIsRandom(e.target.checked)}>
              Random Label,
            </Checkbox>
          </div>
          <div>
            <Flex gap={4} align="center">
              <div>
                <label>Page Width </label>
                <InputNumber
                  style={{ width: "60px" }}
                  size="small"
                  value={pageWidth}
                  onChange={(e) => setPageWidth(e)}
                />
              </div>
              <label>mm</label>
              <Button
                size="small"
                onClick={() => window.print()}
                icon={<PrinterOutlined />}
                type="primary">
                Print
              </Button>
            </Flex>
          </div>
        </Col>
      </Row>

      <Row
        style={{ width: `${pageWidth}mm` }}
        gutter={[gutters[gutterKey], vgutters[vgutterKey]]}
        className="print-page">
        {isRandom
          ? SKUs?.map((item, i) => (
              <Col span={24 / colCount} key={i} style={{ textAlign: "center" }}>
                <Flex justify="center" align="center">
                  <QRCode
                    value={String(item)}
                    size={size}
                    bgColor="#fff"
                    style={{ height: "auto" }}
                    type="svg"
                  />
                </Flex>
                {showCode && (
                  <Text style={{ fontSize: codeFontSize, display: "block" }}>
                    {item}
                  </Text>
                )}
                {showName && (
                  <EllipsisMiddle suffixCount={4}>{item}</EllipsisMiddle>
                )}
              </Col>
            ))
          : filterItems?.map((item, i) => (
              <Col span={24 / colCount} key={i} style={{ textAlign: "center" }}>
                <Flex justify="center" align="center">
                  <QRCode
                    value={String(item?.SKU)}
                    size={size}
                    bgColor="#fff"
                    style={{ height: "auto" }}
                    type="svg"
                  />
                </Flex>
                {showCode && (
                  <Text style={{ fontSize: codeFontSize, display: "block" }}>
                    {item?.SKU}
                  </Text>
                )}
                {showName && (
                  <EllipsisMiddle suffixCount={4}>
                    {item?.name + "," + item?.UOM}
                  </EllipsisMiddle>
                )}
              </Col>
            ))}
      </Row>
    </>
  );
};

export default QRCodeLabelPrint;
