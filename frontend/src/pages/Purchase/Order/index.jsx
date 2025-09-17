import React from "react";
import { usePermission } from "../../../hooks/usePermission";
import NotAuth from "../../notAuth";

const PurchaseOrder = () => {
  // User Permission Check
  const { canViewPage, canDoOther } = usePermission();
  if (!canViewPage("purchase-order")) {
    return <NotAuth />;
  }
  return <div>PurchaseOrder</div>;
};

export default PurchaseOrder;
