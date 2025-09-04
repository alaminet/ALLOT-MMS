import React, { useMemo, useState } from "react";
import { Checkbox, Table } from "antd";
const { Column, ColumnGroup } = Table;

const UserRoleTable = ({ data, setData }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Row Data
  const initialData = [
    {
      key: "dashboard",
      module: "Dashboard",
      pageAccess: { view: true },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "user",
      module: "User",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "master",
      module: "Master Access",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "item-list",
      module: "Master Item",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "item-details",
      module: "Item Details",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "item-uom",
      module: "Master UOM",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "item-group",
      module: "Master Item Group",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "item-type",
      module: "Master Item Type",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "costcenter",
      module: "Master Cost Center",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "store-name",
      module: "Master Store",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "store-location",
      module: "Master Store Location",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "transaction-type",
      module: "Master Transaction Type",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
  ];

  const normalizeData = (data) => {
    return initialData.map((template) => {
      const override = data.find((d) => d.key === template.key) || {};
      return {
        key: template.key,
        module: template.module,
        pageAccess: { ...template.pageAccess, ...override?.pageAccess },
        own: { ...template.own, ...override?.own },
        other: { ...template.other, ...override?.other },
      };
    });
  };

  const mergedValue = useMemo(() => {
    return initialData.map((item) => {
      const override = data.find((d) => d.key === item.key);
      if (!override) return item;
      return {
        ...item,
        ...override,
        other: { ...item.other, ...override?.other },
        own: { ...item.own, ...override?.own },
        pageAccess: { ...item.pageAccess, ...override?.pageAccess },
      };
    });
  }, [data]);

  // Handle checkbox change
  const handleCheckboxChange = (rowKey, type, permission) => (e) => {
    const normalized = normalizeData(data);
    const newData = normalized.map((row) => {
      if (row.key === rowKey) {
        return {
          ...row,
          [type]: {
            ...row[type],
            [permission]: e.target.checked,
          },
        };
      }
      return row;
    });
    setData(newData);
  };

  // Table Row Selection
  const onSelectChange = (newSelectedRowKeys) => {
    const normalized = normalizeData(data);

    const newData = normalized.map((row) => {
      const wasSelected = selectedRowKeys.includes(row.key);
      const isSelected = newSelectedRowKeys.includes(row.key);

      if (!wasSelected && isSelected) {
        // Newly selected: grant full permissions
        return {
          ...row,
          pageAccess: { view: true },
          own: { create: true, edit: true, view: true, delete: true },
          other: { create: true, edit: true, view: true, delete: true },
        };
      }

      if (wasSelected && !isSelected) {
        // Newly deselected: reset permissions
        return {
          ...row,
          pageAccess: { view: false },
          own: { create: false, edit: false, view: false, delete: false },
          other: { create: false, edit: false, view: false, delete: false },
        };
      }

      // No change: preserve current state
      return row;
    });

    setSelectedRowKeys(newSelectedRowKeys);
    setData(newData);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <>
      <Table
        bordered
        pagination={false}
        // dataSource={data}
        dataSource={mergedValue}
        rowSelection={rowSelection}>
        <ColumnGroup title="Access Point">
          <Column title="Module" dataIndex="module" key="module" />
          <Column
            align="center"
            title="Page Access"
            dataIndex="pageAccess"
            key="pageAccess"
            render={(_, record) => (
              <Checkbox
                checked={record.pageAccess.view}
                onChange={handleCheckboxChange(
                  record.key,
                  "pageAccess",
                  "view"
                )}
              />
            )}
          />
        </ColumnGroup>
        <ColumnGroup title="Own Data">
          <Column
            align="center"
            title="Create"
            dataIndex="own-create"
            key="own-create"
            render={(_, record) => (
              <Checkbox
                checked={record?.own?.create}
                onChange={handleCheckboxChange(record?.key, "own", "create")}
              />
            )}
          />
          <Column
            align="center"
            title="Edit"
            dataIndex="own-edit"
            key="own-edit"
            render={(_, record) => (
              <Checkbox
                checked={record?.own?.edit}
                onChange={handleCheckboxChange(record?.key, "own", "edit")}
              />
            )}
          />
          <Column
            align="center"
            title="View"
            dataIndex="own-view"
            key="own-view"
            render={(_, record) => (
              <Checkbox
                checked={record?.own?.view}
                onChange={handleCheckboxChange(record?.key, "own", "view")}
              />
            )}
          />
          <Column
            align="center"
            title="Delete"
            dataIndex="own-delete"
            key="own-delete"
            render={(_, record) => (
              <Checkbox
                checked={record?.own?.delete}
                onChange={handleCheckboxChange(record?.key, "own", "delete")}
              />
            )}
          />
        </ColumnGroup>
        <ColumnGroup title="Others Data">
          <Column
            align="center"
            title="Create"
            dataIndex="other-create"
            key="other-create"
            render={(_, record) => (
              <Checkbox
                checked={record?.other?.create}
                onChange={handleCheckboxChange(record?.key, "other", "create")}
              />
            )}
          />
          <Column
            align="center"
            title="Edit"
            dataIndex="other-edit"
            key="other-edit"
            render={(_, record) => (
              <Checkbox
                checked={record?.other?.edit}
                onChange={handleCheckboxChange(record?.key, "other", "edit")}
              />
            )}
          />
          <Column
            align="center"
            title="View"
            dataIndex="other-view"
            key="other-view"
            render={(_, record) => (
              <Checkbox
                checked={record?.other?.view}
                onChange={handleCheckboxChange(record?.key, "other", "view")}
              />
            )}
          />
          <Column
            align="center"
            title="Delete"
            dataIndex="other-delete"
            key="other-delete"
            render={(_, record) => (
              <Checkbox
                checked={record?.other?.delete}
                onChange={handleCheckboxChange(record?.key, "other", "delete")}
              />
            )}
          />
        </ColumnGroup>
      </Table>
    </>
  );
};

export default UserRoleTable;
