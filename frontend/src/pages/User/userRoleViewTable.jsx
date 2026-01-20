import { useMemo } from "react";
import { Table,Divider } from "antd";
import { useSelector } from "react-redux";
import { CheckSquareTwoTone, CloseSquareTwoTone } from "@ant-design/icons";
import useModuleFilter from "../../hooks/useModuleFilter";
const { Column, ColumnGroup } = Table;

const UserRoleViewTable = ({ data }) => {
  const user = useSelector((user) => user.loginSlice.login);
  // Row Data
  const basicData = [
    {
      key: "dashboard",
      module: "Dashboard",
      pageAccess: { view: true },
      own: { view: false },
      other: { view: false },
    },
    {
      key: "purchase",
      module: "Purchase",
      pageAccess: { view: false },
      // own: { create: false, edit: false, view: false, delete: false },
      // other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "purchase-requisition",
      module: "Purchase-Requisition",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "purchase-order",
      module: "Purchase-Order",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "supplier",
      module: "Supplier",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "purchase-report",
      module: "Purchase-Report",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "transaction",
      module: "Transaction",
      pageAccess: { view: false },
      // own: { create: false, edit: false, view: false, delete: false },
      // other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "inventory",
      module: "Inventory",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "receive",
      module: "Goods Receive",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "issue",
      module: "Goods Issue",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "tnx-report",
      module: "Tnx-Report",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "mo-report",
      module: "MO-Report",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "master",
      module: "Master Access",
      pageAccess: { view: false },
      // own: { create: false, edit: false, view: false, delete: false },
      // other: { create: false, edit: false, view: false, delete: false },
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
      key: "user",
      module: "User",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
    {
      key: "pwdr",
      module: "Password Reset",
      // pageAccess: { view: false },
      own: { edit: false },
      other: { edit: false },
    },
    {
      key: "settings",
      module: "Settings",
      pageAccess: { view: false },
      own: { create: false, edit: false, view: false, delete: false },
      other: { create: false, edit: false, view: false, delete: false },
    },
  ];

  const initialData = useModuleFilter(basicData, user?.moduleList);
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
  return (
    <>
      {mergedValue?.length > 0 && (
        <>
          <Divider>User Role Access</Divider>
          <Table bordered pagination={false} dataSource={mergedValue} sticky>
            <ColumnGroup title="Access Point">
              <Column title="Module" dataIndex="module" key="module" />
              <Column
                align="center"
                title="Page Access"
                dataIndex="pageAccess"
                key="pageAccess"
                // render={(_, record) =>
                //   record?.pageAccess ? (
                //     record.pageAccess?.view ? (
                //       <CheckSquareTwoTone />
                //     ) : (
                //       <CloseSquareTwoTone twoToneColor="#eb2f96" />
                //     )
                //   ) : (
                //     "-"
                //   )
                // }
                render={(_, record) => {
                  const hasField =
                    record?.pageAccess &&
                    Object.prototype.hasOwnProperty.call(
                      record?.pageAccess,
                      "view"
                    );
                  return hasField ? (
                    record.pageAccess?.view ? (
                      <CheckSquareTwoTone />
                    ) : (
                      <CloseSquareTwoTone twoToneColor="#eb2f96" />
                    )
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
                  const hasField =
                    record?.own &&
                    Object.prototype.hasOwnProperty.call(record.own, "create");
                  return hasField ? (
                    record.own?.create ? (
                      <CheckSquareTwoTone />
                    ) : (
                      <CloseSquareTwoTone twoToneColor="#eb2f96" />
                    )
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
                  const hasField =
                    record?.own &&
                    Object.prototype.hasOwnProperty.call(record.own, "edit");
                  return hasField ? (
                    record.own?.edit ? (
                      <CheckSquareTwoTone />
                    ) : (
                      <CloseSquareTwoTone twoToneColor="#eb2f96" />
                    )
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
                  const hasField =
                    record?.own &&
                    Object.prototype.hasOwnProperty.call(record.own, "view");
                  return hasField ? (
                    record.own?.view ? (
                      <CheckSquareTwoTone />
                    ) : (
                      <CloseSquareTwoTone twoToneColor="#eb2f96" />
                    )
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
                  const hasField =
                    record?.own &&
                    Object.prototype.hasOwnProperty.call(record.own, "delete");
                  return hasField ? (
                    record.own?.delete ? (
                      <CheckSquareTwoTone />
                    ) : (
                      <CloseSquareTwoTone twoToneColor="#eb2f96" />
                    )
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
                  const hasField =
                    record?.other &&
                    Object.prototype.hasOwnProperty.call(
                      record.other,
                      "create"
                    );
                  return hasField ? (
                    record.other?.create ? (
                      <CheckSquareTwoTone />
                    ) : (
                      <CloseSquareTwoTone twoToneColor="#eb2f96" />
                    )
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
                  const hasField =
                    record?.other &&
                    Object.prototype.hasOwnProperty.call(record.other, "edit");
                  return hasField ? (
                    record.other?.edit ? (
                      <CheckSquareTwoTone />
                    ) : (
                      <CloseSquareTwoTone twoToneColor="#eb2f96" />
                    )
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
                  const hasField =
                    record?.other &&
                    Object.prototype.hasOwnProperty.call(record.other, "view");
                  return hasField ? (
                    record.other?.view ? (
                      <CheckSquareTwoTone />
                    ) : (
                      <CloseSquareTwoTone twoToneColor="#eb2f96" />
                    )
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
                  const hasField =
                    record?.other &&
                    Object.prototype.hasOwnProperty.call(
                      record.other,
                      "delete"
                    );
                  return hasField ? (
                    record.other?.delete ? (
                      <CheckSquareTwoTone />
                    ) : (
                      <CloseSquareTwoTone twoToneColor="#eb2f96" />
                    )
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

export default UserRoleViewTable;
