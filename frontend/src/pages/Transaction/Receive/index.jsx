import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Flex, Input } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import BreadCrumbCustom from "../../../components/breadCrumbCustom";
import NotAuth from "../../notAuth";
const { Search } = Input;
const Receive = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  // Get pathname
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  // User Permission Check
  const { canViewPage, canDoOther, canDoOwn } = usePermission();
  if (!canViewPage("receive")) {
    return <NotAuth />;
  }

  return (
    <>
      <Flex justify="space-between">
        <BreadCrumbCustom />
        {lastSegment !== "new" && (
          <Button
            type="primary"
            onClick={() => navigate("new")}
            disabled={!canDoOwn("receive", "create")}
            style={{ borderRadius: "0px", padding: "10px 30px" }}>
            Manual GRN
          </Button>
        )}
      </Flex>
      <Flex
        justify="space-between"
        style={{
          marginBottom: "10px",
          display: lastSegment === "new" && "none",
        }}>
        {/* <Flex gap={10}>
          <Button
            className="borderBrand"
            style={{ borderRadius: "0px" }}
            type={lastSegment === "logs" ? "primary" : "default"}
            onClick={() =>
              navigate("logs", {
                state: {
                  model: "Purchase-Requisition",
                },
              })
            }>
            Logs
          </Button>
        </Flex> */}
        <Search
          className="search-field"
          style={{
            width: "300px",
            display: lastSegment !== "PR" && "none",
          }}
          placeholder="Search by name"
          onChange={(e) => setSearch(e.target.value)}
          enterButton
        />
      </Flex>
      <Outlet context={search} /> {/* Outlet for New and update layout */}
    </>
  );
};

export default Receive;
