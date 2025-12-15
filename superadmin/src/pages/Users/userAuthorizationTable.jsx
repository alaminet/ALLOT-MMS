import React, { useMemo, useState } from "react";
import { Checkbox, Table } from "antd";
const { Column, ColumnGroup } = Table;

const UserAuthorizationTable = ({ data, setData }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Row Data
  const initialData = [
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
        // Newly selected: grant full permissions
        return {
          ...row,
          // Only set own/other if those groups exist for this module; otherwise keep null
          own: row.own
            ? { check: true, confirm: true, approve: true, hold: true }
            : null,
          other: row.other
            ? { check: true, confirm: true, approve: true, hold: true }
            : null,
        };
      }

      if (wasSelected && !isSelected) {
        // Newly deselected: reset permissions
        return {
          ...row,

          own: row.own
            ? { check: false, confirm: false, approve: false, hold: false }
            : null,
          other: row.other
            ? { check: false, confirm: false, approve: false, hold: false }
            : null,
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
        scroll={{ x: 1200 }}
      >
        <ColumnGroup title="Authorization Point">
          <Column title="Module" dataIndex="module" key="module" fixed="left" />
        </ColumnGroup>
        <ColumnGroup title="Own Cost-Center">
          <Column
            align="center"
            title="Check"
            dataIndex="own-check"
            key="own-check"
            render={(_, record) => {
              return (
                <>
                  {record?.own ? (
                    <Checkbox
                      checked={record?.own?.check}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "own",
                        "check"
                      )}
                    />
                  ) : null}
                </>
              );
            }}
          />
          <Column
            align="center"
            title="Confirm"
            dataIndex="own-confirm"
            key="own-confirm"
            render={(_, record) => {
              return (
                <>
                  {record?.own ? (
                    <Checkbox
                      checked={record?.own?.confirm}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "own",
                        "confirm"
                      )}
                    />
                  ) : null}
                </>
              );
            }}
          />
          <Column
            align="center"
            title="Approve"
            dataIndex="own-approve"
            key="own-approve"
            render={(_, record) => {
              return (
                <>
                  {record?.own ? (
                    <Checkbox
                      checked={record?.own?.approve}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "own",
                        "approve"
                      )}
                    />
                  ) : null}
                </>
              );
            }}
          />
          <Column
            align="center"
            title="Hold"
            dataIndex="own-hold"
            key="own-hold"
            render={(_, record) => {
              return (
                <>
                  {record?.own ? (
                    <Checkbox
                      checked={record?.own?.hold}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "own",
                        "hold"
                      )}
                    />
                  ) : null}
                </>
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
              return (
                <>
                  {record?.other ? (
                    <Checkbox
                      checked={record?.other?.check}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "other",
                        "check"
                      )}
                    />
                  ) : null}
                </>
              );
            }}
          />
          <Column
            align="center"
            title="Confirm"
            dataIndex="other-confirm"
            key="other-confirm"
            render={(_, record) => {
              return (
                <>
                  {record?.other ? (
                    <Checkbox
                      checked={record?.other?.confirm}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "other",
                        "confirm"
                      )}
                    />
                  ) : null}
                </>
              );
            }}
          />
          <Column
            align="center"
            title="Approve"
            dataIndex="other-approve"
            key="other-approve"
            render={(_, record) => {
              return (
                <>
                  {record?.other ? (
                    <Checkbox
                      checked={record?.other?.approve}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "other",
                        "approve"
                      )}
                    />
                  ) : null}
                </>
              );
            }}
          />
          <Column
            align="center"
            title="Hold"
            dataIndex="other-hold"
            key="other-hold"
            render={(_, record) => {
              return (
                <>
                  {record?.other ? (
                    <Checkbox
                      checked={record?.other?.hold}
                      onChange={handleCheckboxChange(
                        record?.key,
                        "other",
                        "hold"
                      )}
                    />
                  ) : null}
                </>
              );
            }}
          />
        </ColumnGroup>
      </Table>
    </>
  );
};

export default UserAuthorizationTable;
