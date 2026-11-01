import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import AdminProducts from "./pages/AdminProducts";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminOrders from "./pages/AdminOrders";
import Profile from "./pages/Profile";
import AddProduct from "./pages/AddProduct";

import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />

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
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;