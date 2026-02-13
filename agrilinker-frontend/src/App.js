import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import FertilizerRecommendation from "./components/Fertilizers/FertilizerRecommendation";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import Benefits from "./components/Benefits";
import Footer from "./components/Footer";
import Marketplace from "./components/Marketplace";
import OrderConfirmation from "./components/OrderConfirmation";
import OrderHistory from "./components/OrderHistory";

import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import Profile from "./components/Profile";

// Fertilizer Pages
import FertilizerList from "./components/Fertilizers/FertilizerList";
import AddFertilizer from "./components/Fertilizers/AddFertilizer";
import UpdateFertilizer from "./components/Fertilizers/UpdateFertilizer";
import FertilizerSupplierDashboard from "./pages/fertilizers/FertilizerSupplierDashboard";

// ✅ ADD THIS (match your filename exactly)
import Loginfertilizer from "./pages/Loginfertilizer";

// Auth Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminAnalysis from "./pages/admin/AdminAnalysis";
import AdminSettings from "./pages/admin/AdminSettings";
import SupportPage from "./pages/support/SupportPage";
import SupportHistory from "./pages/support/SupportHistory";
import ContactUsPage from "./pages/support/ContactUsPage";



import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CartProvider } from "./context/CartContext";

//----farmer
import FarmerDashboard from "./components/farmer/FarmerDashboard";
import AddProduct from "./components/farmer/AddProduct";
import AddProductPage from "./components/farmer/AddProductPage/AddProductPage";
import EditProductPage from "./components/farmer/EditProductPage";
import MyProducts from "./components/farmer/MyProducts";

import { AuthProvider } from "./context/AuthContext";

function App() {
  const location = useLocation();

  // Hide Header & Footer on auth pages
  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/loginfertilizer"; // ✅ ADD THIS

  return (
    <AuthProvider>
      <CartProvider>
        {/* ✅ Toast system (GLOBAL) */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />

        {!hideLayout && <Header />}

        <Routes>
          {/* Auth */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* ✅ Fertilizer Supplier Login */}
          <Route path="/loginfertilizer" element={<Loginfertilizer />} />

          <Route path="/register" element={<Register />} />
<Route path="/profile" element={<Profile />} />

          {/* Home */}
          <Route
            path="/home"
            element={
              <>
                <HeroSection />
                <HowItWorks />
                <Benefits />
              </>
            }
          />

          {/* Marketplace */}
          <Route path="/marketplace" element={<Marketplace />} />

          {/* Fertilizers */}
          <Route path="/fertilizers" element={<FertilizerList />} />
          <Route path="/fertilizers/add" element={<AddFertilizer />} />
          <Route path="/fertilizers/edit/:id" element={<UpdateFertilizer />} />
          <Route
            path="/fertilizers/recommend"
            element={<FertilizerRecommendation />}
          />
          <Route
            path="/fertilizer-dashboard"
            element={<FertilizerSupplierDashboard />}
          />

          {/* FARMER PAGES */}
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/farmer/add-product" element={<AddProduct />} />
          <Route path="/farmer/add-product2" element={<AddProductPage />} />
          <Route path="/farmer/my-products" element={<MyProducts />} />
          <Route path="/edit-product/:id" element={<EditProductPage />} />

          {/* ADMIN PAGES */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/inquiries" element={<AdminInquiries />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/analysis" element={<AdminAnalysis />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* SUPPORT */}
          <Route path="/support" element={<SupportPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/support/history" element={<SupportHistory />} />

          {/* CART & CHECKOUT */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/orders" element={<OrderHistory />} />
        </Routes>

        {!hideLayout && <Footer />}
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
