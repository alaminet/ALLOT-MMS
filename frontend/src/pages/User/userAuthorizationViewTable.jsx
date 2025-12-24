import { Table } from "antd";
import { CheckSquareTwoTone, CloseSquareTwoTone } from "@ant-design/icons";
const { Column, ColumnGroup } = Table;

const UserAuthorizationViewTable = ({ data }) => {
  return (
    <>
      <Table bordered pagination={false} dataSource={data} sticky>
        <ColumnGroup title="Authorization Point">
          <Column title="Module" dataIndex="module" key="module" />
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
                record.own?.check ? (
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
            title="Confirm"
            dataIndex="own-confirm"
            key="own-confirm"
            render={(_, record) => {
              const hasField =
                record?.own &&
                Object.prototype.hasOwnProperty.call(record.own, "confirm");
              return hasField ? (
                record.own?.confirm ? (
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
            title="Approve"
            dataIndex="own-approve"
            key="own-approve"
            render={(_, record) => {
              const hasField =
                record?.own &&
                Object.prototype.hasOwnProperty.call(record.own, "approve");
              return hasField ? (
                record.own?.approve ? (
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
            title="Hold"
            dataIndex="own-hold"
            key="own-hold"
            render={(_, record) => {
              const hasField =
                record?.own &&
                Object.prototype.hasOwnProperty.call(record.own, "hold");
              return hasField ? (
                record.own?.hold ? (
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
                record.other?.check ? (
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
            title="Confirm"
            dataIndex="other-confirm"
            key="other-confirm"
            render={(_, record) => {
              const hasField =
                record?.other &&
                Object.prototype.hasOwnProperty.call(record.other, "confirm");
              return hasField ? (
                record.other?.confirm ? (
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
            title="Approve"
            dataIndex="other-approve"
            key="other-approve"
            render={(_, record) => {
              const hasField =
                record?.other &&
                Object.prototype.hasOwnProperty.call(record.other, "approve");
              return hasField ? (
                record.other?.approve ? (
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
            title="Hold"
            dataIndex="other-hold"
            key="other-hold"
            render={(_, record) => {
              const hasField =
                record?.other &&
                Object.prototype.hasOwnProperty.call(record.other, "hold");
              return hasField ? (
                record.other?.hold ? (
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

export default UserAuthorizationViewTable;
