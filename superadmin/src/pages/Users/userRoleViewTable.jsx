import { Table } from "antd";
import { CheckSquareTwoTone, CloseSquareTwoTone } from "@ant-design/icons";
import { useMemo } from "react";
const { Column, ColumnGroup } = Table;

const UserRoleViewTable = ({ data }) => {
  // Row Data
  const initialData = [
    {
      key: "dashboard",
      module: "Dashboard",
      pageAccess: { view: true },
      own: { view: false },
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
      key: "organization/org-package",
      module: "ORG-Package",
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

    // {
    //   key: "settings",
    //   module: "Settings",
    //   pageAccess: { view: false },
    //   own: { create: false, edit: false, view: false, delete: false },
    //   other: { create: false, edit: false, view: false, delete: false },
    // },
  ];

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
      <Table bordered pagination={false} dataSource={mergedValue} sticky>
        <ColumnGroup title="Access Point">
          <Column title="Module" dataIndex="module" key="module" />
          <Column
            align="center"
            title="Page Access"
            dataIndex="pageAccess"
            key="pageAccess"
            render={(_, record) =>
              record?.pageAccess ? (
                record.pageAccess?.view ? (
                  <CheckSquareTwoTone />
                ) : (
                  <CloseSquareTwoTone twoToneColor="#eb2f96" />
                )
              ) : (
                "-"
              )
            }
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
                Object.prototype.hasOwnProperty.call(record.other, "create");
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
                Object.prototype.hasOwnProperty.call(record.other, "delete");
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
  );
};

export default UserRoleViewTable;
