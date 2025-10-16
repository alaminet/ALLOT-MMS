import React from "react";
import { usePermission } from "../hooks/usePermission";
import NotAuth from "./notAuth";
import Dashboard from "./Dashboard";

const Home = () => {
  // User Permission Check
  const { canViewPage, canDoOther } = usePermission();
  if (!canViewPage("dashboard")) {
    return <NotAuth />;
  }

  return (
    <>
      <Dashboard />
    </>
  );
};

export default Home;
