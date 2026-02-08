import ExcelJS from "exceljs";
import { message } from "antd";

const useExcelExport = (data, options = {}) => {
  const {
    filename = "export",
    sheetName = "Sheet1",
    headers = null, // Custom headers, if not provided, will use object keys
    excludedKeys = [], // Keys to exclude from export
    columnWidths = {}, // Custom column widths {key: width}
    dateFormat = "DD-MMM-YYYY", // Date format for date values
    numberFormat = null, // Number format for numeric values
  } = options;

  const exportToExcel = async () => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        message.error("No data available to export");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Determine headers
      let headerKeys;
      if (headers && Array.isArray(headers)) {
        headerKeys = headers;
      } else {
        // Extract unique keys from all objects
        const allKeys = new Set();
        data.forEach((item) => {
          if (item && typeof item === "object") {
            Object.keys(item).forEach((key) => {
              if (!excludedKeys.includes(key)) {
                allKeys.add(key);
              }
            });
          }
        });
        headerKeys = Array.from(allKeys);
      }

      // Add headers row
      worksheet.addRow(headerKeys);

      // Style headers
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE6E6FA" }, // Light lavender background
      };
      headerRow.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      // Set column widths
      headerKeys?.forEach((key, index) => {
        const column = worksheet?.getColumn(index + 1);
        column.width = columnWidths[key] || 15; // Default width 15
      });

      // Add data rows
      data.forEach((item, rowIndex) => {
        const rowData = headerKeys?.map((key) => {
          const value = item[key];

          // Handle different data types
          if (value === null || value === undefined) {
            return "";
          }

          if (typeof value === "boolean") {
            return value ? "Yes" : "No";
          }

          if (typeof value === "number") {
            return value;
          }

          if (value instanceof Date) {
            return value.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          }

          // Handle nested objects (take first string property or convert to string)
          if (typeof value === "object") {
            if (value.name) return value.name;
            if (value.title) return value.title;
            if (value.label) return value.label;
            return JSON.stringify(value);
          }

          return String(value);
        });

        worksheet.addRow(rowData);

        // Style data rows
        const dataRow = worksheet.getRow(rowIndex + 2); // +2 because header is row 1
        dataRow.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Auto-fit columns if no custom widths provided
      if (Object.keys(columnWidths).length === 0) {
        worksheet.columns.forEach((column) => {
          let maxLength = 0;
          column.eachCell((cell) => {
            const cellValue = cell.value ? cell.value.toString() : "";
            if (cellValue.length > maxLength) {
              maxLength = cellValue.length;
            }
          });
          column.width = Math.min(Math.max(maxLength + 2, 10), 50); // Min 10, Max 50
        });
      }

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      message.success("Excel file exported successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      message.error("Failed to export Excel file");
    }
  };

  return exportToExcel;
};

export default useExcelExport;
