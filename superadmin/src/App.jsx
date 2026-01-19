import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import LoggedInUser from "./router/LoggedInUser";
import LoggedOutUser from "./router/LoggedOutUser";
import BasicLayout from "./components/basicLayout";
import Home from "./pages/Home";
import Login from "./pages/login";
import NotFound from "./pages/notFound";
import Users from "./pages/Users";
import LogActivites from "./components/logActivites";
import UserTable from "./pages/Users/userTable";
import UserUpdate from "./pages/Users/userUpdate";
import UserNew from "./pages/Users/userNew";
import Organization from "./pages/Organization";
import OrgListTable from "./pages/Organization/OrgListTable";
import OrgAdd from "./pages/Organization/OrgAdd";
import OrgUserTable from "./pages/Organization/OrgUserTable";
import OrgUserAdd from "./pages/Organization/OrgUserAdd";
import OrgPackageTable from "./pages/Organization/OrgPackageTable";
import OrgUpdate from "./pages/Organization/OrgUpdate";
function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route element={<LoggedInUser />}>
          <Route path="/" element={<BasicLayout />}>
            <Route path="*" element={<NotFound />} />
            <Route path="" element={<Home />} />
            {/* <Route path="/dashboard" element={<Home />} /> */}
            {/* <Route path="/settings" element={<Settings />} /> */}
            <Route path="/user" element={<Users />}>
              <Route path="" element={<UserTable />} />
              <Route path="new" element={<UserNew />} />
              <Route path="update" element={<UserUpdate />} />
              <Route path="logs" element={<LogActivites />} />
            </Route>
            <Route path="/organization" element={<Organization />}>
              <Route path="" element={<OrgListTable />} />
              <Route path="new" element={<OrgAdd />} />
              <Route path="org-user" element={<OrgUserTable />} />
              <Route path="update" element={<OrgUpdate />} />
              <Route path="org-user/new" element={<OrgUserAdd />} />
              <Route path="org-package" element={<OrgPackageTable />} />
            </Route>
            {/* <Route path="/inventory" element={<Inventory />}>
              <Route path="" element={<InventoryViewTable />} />
              <Route path="list" element={<InventoryListView />} />
              <Route path="logs" element={<LogActivites />} />
            </Route> */}
            {/* <Route path="/supplier" element={<Supplier />}>
              <Route path="" element={<SupplierViewTable />} />
              <Route path="new" element={<SupplierAdd />} />
              <Route path="update" element={<SupplierUpdate />} />
              <Route path="logs" element={<LogActivites />} />
            </Route> */}
            {/* <Route path="" element={<Transaction />}>
              <Route path="receive" element={<Receive />}>
                <Route path="" element={<POReceiveLayout />} />
                <Route path="new" element={<ReceiveLayout />} />
                <Route path="logs" element={<LogActivites />} />
              </Route>
              <Route path="issue" element={<Issue />}>
                <Route path="" element={<MOTableView />} />
                <Route path="logs" element={<LogActivites />} />
                <Route path="new" element={<IssueLayout />} />
              </Route>
              <Route path="tnx-report" element={<TnxReport />}>
                <Route path="" element={<TnxReportLayout />} />
                <Route path="logs" element={<LogActivites />} />
                <Route path="view" element={<TnxReportView />} />
              </Route>
              <Route path="mo-report" element={<MOReport />}>
                <Route path="" element={<MoReportTable />} />
                <Route path="logs" element={<LogActivites />} /> */}
            {/* <Route path="view" element={<TnxReportView />} /> */}
            {/* </Route>
            </Route> */}
            {/* <Route path="" element={<Purchase />}>
              <Route
                path="purchase-requisition"
                element={<PurchaseRequisition />}>
                <Route path="" element={<PurchaseReqViewTable />} />
                <Route path="new" element={<PurchaseRequisitiion />} />
                <Route path="update" element={<PurchaseRequisitiionUpdate />} />
                <Route path="print" element={<PurchaseReqPrintView />} />
                <Route path="logs" element={<LogActivites />} />
              </Route>
              <Route path="purchase-order" element={<PurchaseOrder />}>
                <Route path="" element={<PurchaseOrderViewTable />} />
                <Route path="new" element={<PurchaseOrderReqTable />} />
                <Route path="update" element={<PurchaseRequisitiionUpdate />} />
                <Route path="print" element={<PurchaseOrderPrintView />} />
                <Route path="logs" element={<LogActivites />} />
              </Route>
              <Route path="purchase-report" element={<PurchaseReport />}>
                <Route path="" element={<PurchaseReportView />} />
                <Route path="logs" element={<LogActivites />} />
              </Route>
            </Route> */}

            {/* <Route path="" element={<Items />}>
              <Route path="/item-list" element={<ItemInfo />}>
                <Route path="" element={<ItemViewTable />} />
                <Route path="new" element={<ItemAdd />}></Route>
                <Route path="new-bulk" element={<ItemAddBulk />}></Route>
                <Route path="update" element={<ItemUpdate />}></Route>
                <Route path="logs" element={<LogActivites />} />
              </Route>
              <Route path="/item-details" element={<ItemDetails />}>
                <Route path="" element={<ItemDetailsView />} />
                <Route path="new" element={<ItemDetailsAdd />}></Route>
                <Route path="new-bulk" element={<ItemDetailsBulkAdd />}></Route>
                <Route path="update" element={<ItemDetailsUpdate />}></Route>
                <Route path="logs" element={<LogActivites />} />
              </Route>
            </Route> */}
          </Route>
        </Route>
        <Route element={<LoggedOutUser />}>
          <Route path="/login" element={<Login />}></Route>
        </Route>
      </Route>
    )
  );
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
