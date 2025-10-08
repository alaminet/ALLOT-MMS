import { Table } from "antd";
import { CheckSquareTwoTone, CloseSquareTwoTone } from "@ant-design/icons";
const { Column, ColumnGroup } = Table;

const UserRoleViewTable = ({ data }) => {
  return (
    <>
      <Table bordered pagination={false} dataSource={data} sticky>
        <ColumnGroup title="Access Point">
          <Column title="Module" dataIndex="module" key="module" />
          <Column
            align="center"
            title="Page Access"
            dataIndex="pageAccess"
            key="pageAccess"
            render={(_, record) =>
              record.pageAccess.view ? (
                <CheckSquareTwoTone />
              ) : (
                <CloseSquareTwoTone twoToneColor="#eb2f96" />
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
            render={(_, record) =>
              record.own.create ? (
                <CheckSquareTwoTone />
              ) : (
                <CloseSquareTwoTone twoToneColor="#eb2f96" />
              )
            }
          />
          <Column
            align="center"
            title="Edit"
            dataIndex="own-edit"
            key="own-edit"
            render={(_, record) =>
              record.own.edit ? (
                <CheckSquareTwoTone />
              ) : (
                <CloseSquareTwoTone twoToneColor="#eb2f96" />
              )
            }
          />
          <Column
            align="center"
            title="View"
            dataIndex="own-view"
            key="own-view"
            render={(_, record) =>
              record.own.view ? (
                <CheckSquareTwoTone />
              ) : (
                <CloseSquareTwoTone twoToneColor="#eb2f96" />
              )
            }
          />
          <Column
            align="center"
            title="Delete"
            dataIndex="own-delete"
            key="own-delete"
            render={(_, record) =>
              record.own.delete ? (
                <CheckSquareTwoTone />
              ) : (
                <CloseSquareTwoTone twoToneColor="#eb2f96" />
              )
            }
          />
        </ColumnGroup>
        <ColumnGroup title="Others Data">
          <Column
            align="center"
            title="Create"
            dataIndex="other-create"
            key="other-create"
            render={(_, record) =>
              record.other.create ? (
                <CheckSquareTwoTone />
              ) : (
                <CloseSquareTwoTone twoToneColor="#eb2f96" />
              )
            }
          />
          <Column
            align="center"
            title="Edit"
            dataIndex="other-edit"
            key="other-edit"
            render={(_, record) =>
              record.other.edit ? (
                <CheckSquareTwoTone />
              ) : (
                <CloseSquareTwoTone twoToneColor="#eb2f96" />
              )
            }
          />
          <Column
            align="center"
            title="View"
            dataIndex="other-view"
            key="other-view"
            render={(_, record) =>
              record.other.view ? (
                <CheckSquareTwoTone />
              ) : (
                <CloseSquareTwoTone twoToneColor="#eb2f96" />
              )
            }
          />
          <Column
            align="center"
            title="Delete"
            dataIndex="other-delete"
            key="other-delete"
            render={(_, record) =>
              record.other.delete ? (
                <CheckSquareTwoTone />
              ) : (
                <CloseSquareTwoTone twoToneColor="#eb2f96" />
              )
            }
          />
        </ColumnGroup>
      </Table>
    </>
  );
};

export default UserRoleViewTable;
