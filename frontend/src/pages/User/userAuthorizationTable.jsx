import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Checkbox, Table, Divider } from "antd";
import useModuleFilter from "../../hooks/useModuleFilter";
const { Column, ColumnGroup } = Table;

const UserAuthorizationTable = ({ data, setData }) => {
  const user = useSelector((user) => user.loginSlice.login);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Row Data
  const basicData = [
    {
      key: "purchase-requisition",
      module: "Purchase Requisition",
      own: { check: false, confirm: false, approve: false, hold: false },
      other: { check: false, confirm: false, approve: false, hold: false },
    },
    {
      key: "purchase-order",
      module: "Purchase Order",
      own: { check: false, confirm: false, approve: false, hold: false },
      other: { check: false, confirm: false, approve: false, hold: false },
    },
    {
      key: "move-order",
      module: "Move Order",
      own: { check: false, confirm: false, approve: false, hold: false },
      other: { check: false, confirm: false, approve: false, hold: false },
    },
  ];

  const initialData = useModuleFilter(basicData, user?.authorizationList);
  const normalizeData = (data) => {
    return initialData.map((template) => {
      const override = data?.find((d) => d.key === template.key) || {};
      return {
        key: template.key,
        module: template.module,
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
      {mergedValue?.length > 0 && (
        <>
          <Divider>User Authorization Access</Divider>
          <Table
            bordered
            pagination={false}
            // dataSource={data}
            dataSource={mergedValue}
            rowSelection={rowSelection}
            sticky
            scroll={{ x: 1200 }}>
            <ColumnGroup title="Authorization Point">
              <Column
                title="Module"
                dataIndex="module"
                key="module"
                fixed="left"
              />
            </ColumnGroup>
            <ColumnGroup title="Own Cost-Center">
              <Column
                align="center"
                title="Check"
                dataIndex="own-check"
                key="own-check"
                render={(_, record) => {
                  const hasField =
                    record?.own &&
                    Object.prototype.hasOwnProperty.call(record.own, "check");
                  return hasField ? (
                    <Checkbox
                      checked={Boolean(record?.own?.check)}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "own",
                        "check"
                      )}
                    />
                  ) : (
                    "-"
                  );
                }}
              />
              <Column
                align="center"
                title="Confirm"
                dataIndex="own-confirm"
                key="own-confirm"
                render={(_, record) => {
                  const hasField =
                    record?.own &&
                    Object.prototype.hasOwnProperty.call(record.own, "confirm");
                  return hasField ? (
                    <Checkbox
                      checked={Boolean(record?.own?.confirm)}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "own",
                        "confirm"
                      )}
                    />
                  ) : (
                    "-"
                  );
                }}
              />
              <Column
                align="center"
                title="Approve"
                dataIndex="own-approve"
                key="own-approve"
                render={(_, record) => {
                  const hasField =
                    record?.own &&
                    Object.prototype.hasOwnProperty.call(record.own, "approve");
                  return hasField ? (
                    <Checkbox
                      checked={Boolean(record?.own?.approve)}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "own",
                        "approve"
                      )}
                    />
                  ) : (
                    "-"
                  );
                }}
              />
              <Column
                align="center"
                title="Hold"
                dataIndex="own-hold"
                key="own-hold"
                render={(_, record) => {
                  const hasField =
                    record?.own &&
                    Object.prototype.hasOwnProperty.call(record.own, "hold");
                  return hasField ? (
                    <Checkbox
                      checked={Boolean(record?.own?.hold)}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "own",
                        "hold"
                      )}
                    />
                  ) : (
                    "-"
                  );
                }}
              />
            </ColumnGroup>
            <ColumnGroup title="Others Cost-Center">
              <Column
                align="center"
                title="Check"
                dataIndex="other-check"
                key="other-check"
                render={(_, record) => {
                  const hasField =
                    record?.other &&
                    Object.prototype.hasOwnProperty.call(record.other, "check");
                  return hasField ? (
                    <Checkbox
                      checked={Boolean(record?.other?.check)}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "other",
                        "check"
                      )}
                    />
                  ) : (
                    "-"
                  );
                }}
              />
              <Column
                align="center"
                title="Confirm"
                dataIndex="other-confirm"
                key="other-confirm"
                render={(_, record) => {
                  const hasField =
                    record?.other &&
                    Object.prototype.hasOwnProperty.call(
                      record.other,
                      "confirm"
                    );
                  return hasField ? (
                    <Checkbox
                      checked={Boolean(record?.other?.confirm)}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "other",
                        "confirm"
                      )}
                    />
                  ) : (
                    "-"
                  );
                }}
              />
              <Column
                align="center"
                title="Approve"
                dataIndex="other-approve"
                key="other-approve"
                render={(_, record) => {
                  const hasField =
                    record?.other &&
                    Object.prototype.hasOwnProperty.call(
                      record.other,
                      "approve"
                    );
                  return hasField ? (
                    <Checkbox
                      checked={Boolean(record?.other?.approve)}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "other",
                        "approve"
                      )}
                    />
                  ) : (
                    "-"
                  );
                }}
              />
              <Column
                align="center"
                title="Hold"
                dataIndex="other-hold"
                key="other-hold"
                render={(_, record) => {
                  const hasField =
                    record?.other &&
                    Object.prototype.hasOwnProperty.call(record.other, "hold");
                  return hasField ? (
                    <Checkbox
                      checked={Boolean(record?.other?.hold)}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "other",
                        "hold"
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
      )}
    </>
  );
};

export default UserAuthorizationTable;
