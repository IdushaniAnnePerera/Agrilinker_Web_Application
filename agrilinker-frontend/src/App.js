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

import MyProducts from "./components/farmer/MyProducts";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";

// Fertilizer Pages
import FertilizerList from "./components/Fertilizers/FertilizerList";
import AddFertilizer from "./components/Fertilizers/AddFertilizer";
import UpdateFertilizer from "./components/Fertilizers/UpdateFertilizer";

// Auth Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminAnalysis from "./pages/admin/AdminAnalysis";
import AdminSettings from "./pages/admin/AdminSettings";
import SupportPage from "./pages/support/SupportPage";
import ProfilePage from "./pages/profile/ProfilePage";


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CartProvider } from "./context/CartContext";

//----farmer
import FarmerDashboard from "./components/farmer/FarmerDashboard";
import AddProduct from "./components/farmer/AddProduct";

import { AuthProvider } from "./context/AuthContext";
function App() {
  const location = useLocation();

  // Hide Header & Footer on auth pages
  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

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
          <Route path="/register" element={<Register />} />

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
          <Route path="/fertilizers/recommend" element={<FertilizerRecommendation />} />

          {/* FARMER PAGES */}
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/farmer/add-product" element={<AddProduct />} />
          <Route path="/farmer/my-products" element={<MyProducts />} />

          {/* ADMIN PAGES */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/analysis" element={<AdminAnalysis />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* SUPPORT */}
          <Route path="/support" element={<SupportPage />} />

          {/* PROFILE */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* CART & CHECKOUT */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
        </Routes>

        {!hideLayout && <Footer />}
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
