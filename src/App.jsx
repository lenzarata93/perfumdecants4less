
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";

import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import AdminProducts from "./pages/AdminProducts";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminOrders from "./pages/AdminOrders";
import Profile from "./pages/Profile";
import AddProduct from "./pages/AddProduct";
import AdminFinance from "./pages/AdminFinance";
import AdminRaffles from "./pages/AdminRaffles";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RewardsPage from "./pages/RewardsPage";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route
  path="/rewards"
  element={<RewardsPage />}
/>
          <Route path="/shop" element={<Shop />} />

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/products/new"
            element={<AddProduct />}
          />

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          <Route path="/cart" element={<Cart />} />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/admin/finance"
            element={<AdminFinance />}
          />
          
          <Route
  path="/admin/raffles"
  element={<AdminRaffles />}
/>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
