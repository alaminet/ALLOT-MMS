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
import Product from "./pages/Product";
import ProductAdd from "./pages/Product/productAdd";
import ProductViewTable from "./pages/Product/productViewTable";
import InventoryListView from "./pages/Inventory/inventoryListView";
import Category from "./pages/Category";
import CategoryViewTable from "./pages/Category/categoryViewTable";
import CategoryAdd from "./pages/Category/categoryAdd";
import CategoryUpdate from "./pages/Category/categoryUpdate";
import ProductUpdate from "./pages/Product/productUpdate";

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
            <Route path="/product" element={<Product />}>
              <Route path="" element={<ProductViewTable />} />
              <Route path="new" element={<ProductAdd />} />
              <Route path="update" element={<ProductUpdate />} />
              <Route path="logs" element={<LogActivites />} />
            </Route>
            <Route path="/category" element={<Category />}>
              <Route path="" element={<CategoryViewTable />} />
              <Route path="new" element={<CategoryAdd />} />
              <Route path="update" element={<CategoryUpdate />} />
              <Route path="logs" element={<LogActivites />} />
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
