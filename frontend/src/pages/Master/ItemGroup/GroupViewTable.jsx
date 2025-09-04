import React, { useEffect, useState } from "react";
import { Button, Flex, message, Modal, Table, Tooltip } from "antd";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import { usePermission } from "../../../hooks/usePermission";
import { DeleteTwoTone, EditTwoTone, EyeTwoTone } from "@ant-design/icons";
import NotAuth from "../../notAuth";
import { useNavigate, useOutletContext } from "react-router-dom";

const GroupViewTable = () => {
  const user = useSelector((user) => user.loginSlice.login);
  const [queryData, setQueryData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const search = useOutletContext();
  const navigate = useNavigate();
  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("item-group")) {
    return <NotAuth />;
  }
  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 20,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 100,
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
    },
    {
      title: "Action",
      align: "center",
      width: 100,
      key: "action",
      render: (_, record) => (
        <>
          <Flex gap={4} justify="end">
            {(canDoOther(lastSegment, "view") ||
              (canDoOwn(lastSegment, "view") && user.id == record.action)) && (
              <Tooltip title="View">
                <Button
                  onClick={() => handleView(record.access)}
                  icon={<EyeTwoTone />}
                />
              </Tooltip>
            )}
            {(canDoOther(lastSegment, "edit") ||
              (canDoOwn(lastSegment, "edit") && user.id == record.action)) && (
              <Tooltip title="Edit">
                <Button
                  onClick={() =>
                    navigate("update", {
                      state: {
                        UpdateInfo: record.access,
                      },
                    })
                  }
                  icon={<EditTwoTone />}
                />
              </Tooltip>
            )}
            {(canDoOwn(lastSegment, "delete") && user.id == record.action) ||
            (canDoOther(lastSegment, "delete") && user.id !== record.action) ? (
              <Tooltip title="Delete">
                <Button
                  onClick={(e) =>
                    handleChange(record.action, "isDeleted", true)
                  }
                  icon={<DeleteTwoTone twoToneColor="#eb2f96" />}
                />
              </Tooltip>
            ) : (
              ""
            )}
          </Flex>
        </>
      ),
    },
  ];
  const getTableData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/master/itemGroup/view`,
        {
          headers: {
            Authorization: import.meta.env.VITE_SECURE_API_KEY,
            token: user.token,
          },
        }
      );
      message.success(res?.data.message);
      const tableArr = res?.data?.items?.map((item, index) => ({
        key: index,
        code: item?.code,
        name: item?.name,
        status: item?.status,
        createdAt: moment(item?.createdAt).format("MMM DD, YYYY h:mm A"),
        updatedAt: moment(item?.updatedAt).format("MMM DD, YYYY h:mm A"),
        access: item,
        action: item?._id,
      }));
      if (!canDoOwn(lastSegment, "view") && canDoOther(lastSegment, "view")) {
        setQueryData(tableArr.filter((item) => item.action !== user.id));
      } else if (
        canDoOwn(lastSegment, "view") &&
        !canDoOther(lastSegment, "view")
      ) {
        setQueryData(tableArr.filter((item) => item.action === user.id));
      } else if (
        canDoOther(lastSegment, "view") &&
        canDoOwn(lastSegment, "view")
      ) {
        setQueryData(tableArr);
      } else {
        setQueryData([]);
      }
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
        `${import.meta.env.VITE_API_URL}/api/master/itemGroup/update/${id}`,
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
        pagination={{ position: ["bottomRight"] }}
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

export default GroupViewTable;
