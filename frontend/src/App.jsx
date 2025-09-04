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
import ItemUOM from "./pages/Master/ItemUOM";
import UOMAdd from "./pages/Master/ItemUOM/UOMAdd";
import UOMViewTable from "./pages/Master/ItemUOM/UOMViewTable";
import UOMUpdate from "./pages/Master/ItemUOM/UOMUpdate";
import ItemGroup from "./pages/Master/ItemGroup";

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
            <Route path="" element={<Items />}>
              <Route path="/item-list" element={<ItemInfo />}>
                <Route path="" element={<ItemViewTable />} />
                <Route path="new" element={<ItemAdd />}></Route>
                <Route path="update" element={<ItemUpdate />}></Route>
                <Route path="logs" element={<LogActivites />} />
              </Route>
              <Route path="/item-uom" element={<ItemUOM />}>
                <Route path="" element={<UOMViewTable />} />
                <Route path="new" element={<UOMAdd />}></Route>
                <Route path="update" element={<UOMUpdate />}></Route>
                <Route path="logs" element={<LogActivites />} />
              </Route>
              <Route path="/item-group" element={<ItemGroup />}>
                <Route path="" element={<UOMViewTable />} />
                <Route path="new" element={<UOMAdd />}></Route>
                <Route path="update" element={<UOMUpdate />}></Route>
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
