import { HomeFilled } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const BreadCrumbCustom = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeFilled />
        </Link>
      ),
    },
    ...pathSnippets.map((snippet, idx) => {
      const url = `/${pathSnippets.slice(0, idx + 1).join("/")}`;
      return {
        title: (
          <Link
            to={url}
            className="colorLink"
            style={{ textTransform: "uppercase" }}>
            {snippet.charAt(0).toUpperCase() + snippet.slice(1)}
          </Link>
        ),
      };
    }),
  ];
  return (
    <>
      <Breadcrumb style={{ margin: "16px 0" }} items={breadcrumbItems} />
    </>
  );
};

export default BreadCrumbCustom;
