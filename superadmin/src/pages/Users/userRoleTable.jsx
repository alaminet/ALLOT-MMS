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
      own: { view: true },
      other: { view: false },
    },
    {
      key: "organization",
      module: "Organization",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { edit: false, view: false, delete: false },
    },
    {
      key: "organization/org-user",
      module: "ORG-User",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "user",
      module: "User",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { edit: false, view: false, delete: false },
    },
    {
      key: "pwdr",
      module: "Password Reset",
      // pageAccess: { view: false },
      own: { edit: false },
      other: { edit: false },
    },

    // {
    //   key: "settings",
    //   module: "Settings",
    //   pageAccess: { view: false },
    //   own: { create: false, edit: false, view: false, delete: false },
    //   other: { create: false, edit: false, view: false, delete: false },
    // },
  ];

  const normalizeData = (data) => {
    return initialData.map((template) => {
      const override = data?.find((d) => d.key === template.key) || {};
      return {
        key: template.key,
        module: template.module,
        pageAccess: { ...template.pageAccess, ...override?.pageAccess },
        // Preserve null/undefined for modules that don't have 'own' or 'other'
        own: template.own
          ? { ...template.own, ...override?.own }
          : override?.own ?? null,
        other: template.other
          ? { ...template.other, ...override?.other }
          : override?.other ?? null,
      };
    });
  };

  const mergedValue = useMemo(() => {
    return initialData.map((item) => {
      const override = data?.find((d) => d.key === item.key);
      if (!override) return item;
      return {
        ...item,
        ...override,
        // Keep null for other/own when the base item doesn't define them
        other: item.other
          ? { ...item.other, ...override?.other }
          : override?.other ?? null,
        own: item.own
          ? { ...item.own, ...override?.own }
          : override?.own ?? null,
        pageAccess: { ...item.pageAccess, ...override?.pageAccess },
      };
    });
  }, [data]);

  // Handle checkbox change
  const handleCheckboxChange = (rowKey, type, permission) => (e) => {
    const normalized = normalizeData(data);
    const newData = normalized.map((row) => {
      if (row.key !== rowKey) return row;

      // If this permission group doesn't exist for the module, keep it as-is (null)
      if (!row[type]) return row;

      return {
        ...row,
        [type]: {
          ...row[type],
          [permission]: e.target.checked,
        },
      };
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
        // Newly selected: grant permissions only for existing keys
        const grantPermissions = (group) =>
          group
            ? Object.fromEntries(Object.keys(group).map((k) => [k, true]))
            : null;

        return {
          ...row,
          pageAccess: { view: true },
          own: grantPermissions(row.own),
          other: grantPermissions(row.other),
        };
      }

      if (wasSelected && !isSelected) {
        // Newly deselected: reset permissions only for existing keys
        const revokePermissions = (group) =>
          group
            ? Object.fromEntries(Object.keys(group).map((k) => [k, false]))
            : null;

        return {
          ...row,
          pageAccess: { view: false },
          own: revokePermissions(row.own),
          other: revokePermissions(row.other),
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
        rowSelection={rowSelection}
        sticky
        scroll={{ x: 1200 }}>
        <ColumnGroup title="Access Point">
          <Column title="Module" dataIndex="module" key="module" fixed="left" />
          <Column
            align="center"
            title="Page Access"
            dataIndex="pageAccess"
            key="pageAccess"
            // render={(_, record) => (
            //   <Checkbox
            //     checked={record?.pageAccess?.view}
            //     onChange={handleCheckboxChange(
            //       record.key,
            //       "pageAccess",
            //       "view"
            //     )}
            //   />
            // )}
            render={(_, record) => {
              const hasCreate =
                record?.pageAccess &&
                Object.prototype.hasOwnProperty.call(record.pageAccess, "view");
              return hasCreate ? (
                <Checkbox
                  checked={Boolean(record?.pageAccess?.view)}
                  onChange={handleCheckboxChange(
                    record?.key,
                    "pageAccess",
                    "view"
                  )}
                />
              ) : (
                "-"
              );
            }}
          />
        </ColumnGroup>
        <ColumnGroup title="Own Data">
          <Column
            align="center"
            title="Create"
            dataIndex="own-create"
            key="own-create"
            render={(_, record) => {
              const hasCreate =
                record?.own &&
                Object.prototype.hasOwnProperty.call(record.own, "create");
              return hasCreate ? (
                <Checkbox
                  checked={Boolean(record?.own?.create)}
                  onChange={handleCheckboxChange(record?.key, "own", "create")}
                />
              ) : (
                "-"
              );
            }}
          />
          <Column
            align="center"
            title="Edit"
            dataIndex="own-edit"
            key="own-edit"
            render={(_, record) => {
              const hasEdit =
                record?.own &&
                Object.prototype.hasOwnProperty.call(record.own, "edit");
              return hasEdit ? (
                <Checkbox
                  checked={Boolean(record?.own?.edit)}
                  onChange={handleCheckboxChange(record?.key, "own", "edit")}
                />
              ) : (
                "-"
              );
            }}
          />
          <Column
            align="center"
            title="View"
            dataIndex="own-view"
            key="own-view"
            render={(_, record) => {
              const hasView =
                record?.own &&
                Object.prototype.hasOwnProperty.call(record.own, "view");
              return hasView ? (
                <Checkbox
                  checked={Boolean(record?.own?.view)}
                  onChange={handleCheckboxChange(record?.key, "own", "view")}
                />
              ) : (
                "-"
              );
            }}
          />
          <Column
            align="center"
            title="Delete"
            dataIndex="own-delete"
            key="own-delete"
            render={(_, record) => {
              const hasDelete =
                record?.own &&
                Object.prototype.hasOwnProperty.call(record.own, "delete");
              return hasDelete ? (
                <Checkbox
                  checked={Boolean(record?.own?.delete)}
                  onChange={handleCheckboxChange(record?.key, "own", "delete")}
                />
              ) : (
                "-"
              );
            }}
          />
        </ColumnGroup>
        <ColumnGroup title="Others Data">
          <Column
            align="center"
            title="Create"
            dataIndex="other-create"
            key="other-create"
            render={(_, record) => {
              const hasCreate =
                record?.other &&
                Object.prototype.hasOwnProperty.call(record.other, "create");
              return hasCreate ? (
                <Checkbox
                  checked={Boolean(record?.other?.create)}
                  onChange={handleCheckboxChange(
                    record?.key,
                    "other",
                    "create"
                  )}
                />
              ) : (
                "-"
              );
            }}
          />
          <Column
            align="center"
            title="Edit"
            dataIndex="other-edit"
            key="other-edit"
            render={(_, record) => {
              const hasEdit =
                record?.other &&
                Object.prototype.hasOwnProperty.call(record.other, "edit");
              return hasEdit ? (
                <Checkbox
                  checked={Boolean(record?.other?.edit)}
                  onChange={handleCheckboxChange(record?.key, "other", "edit")}
                />
              ) : (
                "-"
              );
            }}
          />
          <Column
            align="center"
            title="View"
            dataIndex="other-view"
            key="other-view"
            render={(_, record) => {
              const hasView =
                record?.other &&
                Object.prototype.hasOwnProperty.call(record.other, "view");
              return hasView ? (
                <Checkbox
                  checked={Boolean(record?.other?.view)}
                  onChange={handleCheckboxChange(record?.key, "other", "view")}
                />
              ) : (
                "-"
              );
            }}
          />
          <Column
            align="center"
            title="Delete"
            dataIndex="other-delete"
            key="other-delete"
            render={(_, record) => {
              const hasDelete =
                record?.other &&
                Object.prototype.hasOwnProperty.call(record.other, "delete");
              return hasDelete ? (
                <Checkbox
                  checked={Boolean(record?.other?.delete)}
                  onChange={handleCheckboxChange(
                    record?.key,
                    "other",
                    "delete"
                  )}
                />
              ) : (
                "-"
              );
            }}
          />
        </ColumnGroup>
      </Table>
    </>
  );
};

export default UserRoleTable;
