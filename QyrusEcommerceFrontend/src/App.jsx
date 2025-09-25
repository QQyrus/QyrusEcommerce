// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Signup, ForgotPassword } from './components';
import Products from './components/Products';
import Header from './components/Header';
import Cart from './components/Cart';
import UserProvider from './context/UserContext';
import ProductDetails from './components/ProductDetails';
import AccountPage from './components/AccountPage';
import Wishlist from "./components/Wishlist";
import ContactUs from "./components/ContactUs";
import MyAddress from "./components/MyAddress";
import AddressSelection from "./components/BuyNow";
import PaymentPage from "./components/PaymentsPage";
import MyOrders from "./components/MyOrders";
import ComparePage from "./components/ComparePage";
import TermsAndConditions from "./components/TermsAndConditions";


const App = () => {
  return (
    <UserProvider>
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/products" element={<Products />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/product/:productId" element={<ProductDetails />} /> {/* Product Details Route */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/my-address" element={<MyAddress />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/buy-now" element={<AddressSelection />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/my-orders" element={<MyOrders />} />

      </Routes>
    </Router>
    </UserProvider>
  );
};

export default App;