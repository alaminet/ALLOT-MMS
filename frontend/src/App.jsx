import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import LoggedInUser from "./router/LoggedInUser";
import LoggedOutUser from "./router/LoggedOutUser";
import BasicLayout from "./components/basicLayout";
import NotFound from "./pages/notFound";
import Login from "./pages/login";
import Home from "./pages/home";
import User from "./pages/User";
import UserNew from "./pages/User/userNew";
import UserTable from "./pages/User/userTable";
import LogActivites from "./components/logActivites";
import UserUpdate from "./pages/User/userUpdate";
import Inventory from "./pages/Inventory";
import InventoryViewTable from "./pages/Inventory/inventoryViewTable";
import InventoryAdd from "./pages/Inventory/inventoryAdd";
import InventoryListView from "./pages/Inventory/inventoryListView";
import Items from "./pages/Master";
import ItemInfo from "./pages/Master/ItemInfo";
import ItemAdd from "./pages/Master/ItemInfo/itemAdd";
import ItemViewTable from "./pages/Master/ItemInfo/itemViewTable";
import ItemUpdate from "./pages/Master/ItemInfo/itemUpdate";
import ItemDetailsAdd from "./pages/Master/ItemDetails/itemDetailsAdd";
import ItemDetails from "./pages/Master/ItemDetails";
import ItemDetailsView from "./pages/Master/ItemDetails/ItemDetailsView";
import ItemDetailsUpdate from "./pages/Master/ItemDetails/itemDetailsUpdate";
import Supplier from "./pages/Supplier";
import SupplierAdd from "./pages/Supplier/supplierAdd";
import SupplierViewTable from "./pages/Supplier/supplierViewTable";
import SupplierUpdate from "./pages/Supplier/supplierUpdate";
import Purchase from "./pages/Purchase";
import PurchaseRequisitiion from "./pages/Purchase/purchaseRequisitiion";
import PurchaseReqViewTable from "./pages/Purchase/purchaseReqViewTable";
import PurchaseRequisitiionUpdate from "./pages/Purchase/purchaseRequisitiionUpdate";
import PurchaseReqPrintView from "./pages/Purchase/purchaseReqPrintView";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route element={<LoggedInUser />}>
          <Route path="/" element={<BasicLayout />}>
            <Route path="*" element={<NotFound />} />
            <Route path="" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/user" element={<User />}>
              <Route path="" element={<UserTable />} />
              <Route path="new" element={<UserNew />} />
              <Route path="update" element={<UserUpdate />} />
              <Route path="logs" element={<LogActivites />} />
            </Route>
            <Route path="/inventory" element={<Inventory />}>
              <Route path="" element={<InventoryViewTable />} />
              <Route path="new" element={<InventoryAdd />} />
              <Route path="list" element={<InventoryListView />} />
              <Route path="logs" element={<LogActivites />} />
            </Route>
            <Route path="/supplier" element={<Supplier />}>
              <Route path="" element={<SupplierViewTable />} />
              <Route path="new" element={<SupplierAdd />} />
              <Route path="update" element={<SupplierUpdate />} />
              <Route path="logs" element={<LogActivites />} />
            </Route>
            <Route path="/purchase" element={<Purchase />}>
              <Route path="" element={<PurchaseReqViewTable />} />
              <Route path="new" element={<PurchaseRequisitiion />} />
              <Route path="update" element={<PurchaseRequisitiionUpdate />} />
              <Route path="print" element={<PurchaseReqPrintView />} />
              <Route path="logs" element={<LogActivites />} />
            </Route>
            <Route path="" element={<Items />}>
              <Route path="/item-list" element={<ItemInfo />}>
                <Route path="" element={<ItemViewTable />} />
                <Route path="new" element={<ItemAdd />}></Route>
                <Route path="update" element={<ItemUpdate />}></Route>
                <Route path="logs" element={<LogActivites />} />
              </Route>
              <Route path="/item-details" element={<ItemDetails />}>
                <Route path="" element={<ItemDetailsView />} />
                <Route path="new" element={<ItemDetailsAdd />}></Route>
                <Route path="update" element={<ItemDetailsUpdate />}></Route>
                <Route path="logs" element={<LogActivites />} />
              </Route>
            </Route>
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
