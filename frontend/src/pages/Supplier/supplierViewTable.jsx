import React, { useEffect, useState } from "react";
import { Button, Flex, message, Modal, Select, Table, Tooltip } from "antd";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";

import {
  DeleteTwoTone,
  EditTwoTone,
  EyeTwoTone,
  InfoCircleTwoTone,
} from "@ant-design/icons";

import { useNavigate, useOutletContext } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";
import NotAuth from "../notAuth";

const SupplierViewTable = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const search = useOutletContext();
  const navigate = useNavigate();

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("supplier")) {
    return <NotAuth />;
  }

  const ownView = canDoOwn(lastSegment, "view");
  const othersView = canDoOther(lastSegment, "view");
  const ownEdit = canDoOwn(lastSegment, "edit");
  const othersEdit = canDoOther(lastSegment, "edit");
  const ownDelete = canDoOwn(lastSegment, "delete");
  const othersDelete = canDoOther(lastSegment, "delete");

  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 80,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Code",
      dataIndex: "code",
      width: 130,
      key: "code",
      filters: [...new Set(queryData?.map((item) => item.code))].map(
        (code) => ({
          text: code,
          value: code,
        })
      ),
      onFilter: (value, record) => record?.code === value,
      filterSearch: true,
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 300,
      // responsive: ["md"],
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 250,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 80,
    },

    {
      title: "Action",
      align: "center",
      width: 150,
      key: "action",
      render: (_, record) => (
        <>
          <Flex gap={4} justify="end">
            {/* {(canDoOther(lastSegment, "view") ||
              (canDoOwn(lastSegment, "view") && user.id == record.action)) && (
              <Tooltip title="View">
                <Button
                  onClick={() => handleView(record.access)}
                  icon={<EyeTwoTone />}
                />
              </Tooltip>
            )} */}
            {ownEdit && user.id === record?.createdBy ? (
              <Tooltip title="Edit">
                <Button
                  onClick={() =>
                    navigate("update", {
                      state: {
                        refData: record.access,
                      },
                    })
                  }
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            ) : othersEdit && user.id !== record?.createdBy ? (
              <Tooltip title="Edit">
                <Button
                  onClick={() =>
                    navigate("update", {
                      state: {
                        refData: record.access,
                      },
                    })
                  }
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            ) : null}
            {ownDelete && user.id === record?.createdBy ? (
              <Tooltip title="Delete">
                <Button
                  onClick={(e) =>
                    handleChange(record.action, "isDeleted", true)
                  }
                  icon={<DeleteTwoTone twoToneColor="#eb2f96" />}
                />
              </Tooltip>
            ) : othersDelete && user.id !== record?.createdBy ? (
              <Tooltip title="Delete">
                <Button
                  onClick={(e) =>
                    handleChange(record.action, "isDeleted", true)
                  }
                  icon={<DeleteTwoTone twoToneColor="#eb2f96" />}
                />
              </Tooltip>
            ) : null}
          </Flex>
        </>
      ),
    },
  ];
  const getTableData = async () => {
    const scope =
      ownView && othersView
        ? "all"
        : ownView
        ? "own"
        : othersView
        ? "others"
        : null;
    if (!scope) {
      setQueryData([]);
      message.warning("You are not authorized");
      return; // stop execution
    }
    const payload = { scope };
    try {
      await axios
        .post(`${import.meta.env.VITE_API_URL}/api/supplier/view`, payload, {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        })
        .then((res) => {
          message.success(res.data.message);
          const tableArr = res?.data?.items?.map((item, index) => ({
            key: index,
            code: item?.code,
            name: item?.name,
            email: (
              <>
                Office: {item?.email?.office || "—"} <br />
                Contact: {item?.email?.contact || "—"} <br />
                Alternate: {item?.email?.alternate || "—"}
              </>
            ),
            phone: (
              <>
                Office: {item?.phone?.office || "—"} <br />
                Contact: {item?.phone?.contact || "—"} <br />
                Alternate: {item?.phone?.alternate || "—"}
              </>
            ),
            type: item?.type,
            status: item?.status,
            createdAt: moment(item?.createdAt).format("MMM DD, YYYY h:mm A"),
            updatedAt: moment(item?.updatedAt).format("MMM DD, YYYY h:mm A"),
            createdBy: item?.createdBy?._id,
            access: item,
            action: item?._id,
          }));
          setQueryData(tableArr);
        });
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  // Handle Veiw table data
  const handleView = (values) => {
    setSelectedRecord(values);
    setIsModalVisible(true);
  };

  //   Update Functional
  const handleChange = async (id, field, data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/supplier/update/${id}`,
        { [field]: data },
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user?.token,
          },
        }
      );
      message.success(res.data.message);
      getTableData();
    } catch (error) {
      message.error(error.response.data.error);
    }
  };

  useEffect(() => {
    getTableData();
  }, []);
  return (
    <>
      <Table
        columns={columns}
        dataSource={queryData?.filter((item) =>
          item.name?.toLowerCase().includes(search?.toLowerCase())
        )}
        // title={() => "Header"}
        sticky
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: [
            "10",
            "20",
            "50",
            queryData?.length?.toString() || "100",
          ],
          // showTotal: (total) => `Total ${total} items`,
          defaultPageSize: 10,
        }}
        scroll={{
          x: columns.reduce((sum, col) => sum + (col.width || 150), 0),
        }}
      />
      <Modal
        title="View Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}>
        <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
      </Modal>
    </>
  );
};

export default SupplierViewTable;
