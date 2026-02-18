// ✅ FULL src/App.js (/, /landing, /login, /register, /loginfertilizer are public)
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import Benefits from "./components/Benefits";

import FertilizerList from "./components/Fertilizers/FertilizerList";
import AddFertilizer from "./components/Fertilizers/AddFertilizer";
import UpdateFertilizer from "./components/Fertilizers/UpdateFertilizer";
import FertilizerSupplierDashboard from "./pages/fertilizers/FertilizerSupplierDashboard";
import CropAdvisor from "./components/Advisor/CropAdvisor";

import Landing from "./pages/Landing";
import IntroHome from "./pages/IntroHome"; // ✅ NEW (Intro first page)
import Login from "./pages/Login";
import Register from "./pages/Register";

import Profile from "./components/Profile";
import Marketplace from "./components/Marketplace";
import CartPage from "./components/CartPage";

import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";

import FarmerDashboard from "./components/farmer/FarmerDashboard";
import AddProduct from "./components/farmer/AddProduct";
import MyProducts from "./components/farmer/MyProducts";
import EditProductPage from "./components/farmer/EditProductPage";
import FarmerOrders from "./components/farmer/FarmerOrders";
import InquiryList from "./components/farmer/FarmerInquiryPage/InquiryList";
import AddProductPage from "./components/farmer/AddProductPage/AddProductPage";
import SalesHistory from "./components/farmer/SalesHistory";
import FarmerHub from "./components/farmer/FarmerHub";

import SupportPage from "./pages/support/SupportPage";
import SupportHistory from "./pages/support/SupportHistory";
import ContactUsPage from "./pages/support/ContactUsPage";

import CheckoutPage from "./components/CheckoutPage";
import OrderConfirmation from "./components/OrderConfirmation";
import OrderHistory from "./components/OrderHistory";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminAnalysis from "./pages/admin/AdminAnalysis";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminInquiries from "./pages/admin/AdminInquiries";

// ✅ Security
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";
import AccessDenied from "./pages/AccessDenied";

//Chatbot
import ChatBot from "./components/ChatBot";

function App() {
  const location = useLocation();

  // ✅ hide layout on public pages (intro + landing + auth)
  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/landing" || // ✅ NEW (Landing is public and layout hidden)
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/loginfertilizer";

  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
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
            {/* ===================== PUBLIC ONLY ===================== */}
            <Route path="/" element={<IntroHome />} />{" "}
            {/* ✅ Intro page first */}
            <Route path="/landing" element={<Landing />} />{" "}
            {/* ✅ then your Landing */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* ===================== PROTECTED UTILS ===================== */}
            <Route
              path="/access-denied"
              element={
                <ProtectedRoute>
                  <AccessDenied />
                </ProtectedRoute>
              }
            />
            <Route
              path="/go"
              element={
                <ProtectedRoute>
                  <RoleRedirect />
                </ProtectedRoute>
              }
            />
            {/* ===================== PROTECTED (ANY LOGGED-IN USER) ===================== */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <>
                    <HeroSection />
                    <HowItWorks />
                    <Benefits />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fertilizers"
              element={
                <ProtectedRoute>
                  <FertilizerList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crop-advisor"
              element={
                <ProtectedRoute>
                  <CropAdvisor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-confirmation"
              element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            {/* ===================== SUPPORT (BUYER + ADMIN ONLY) ===================== */}
            <Route
              path="/support"
              element={
                <ProtectedRoute allowedRoles={["BUYER", "ADMIN"]}>
                  <SupportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support/history"
              element={
                <ProtectedRoute allowedRoles={["BUYER", "ADMIN"]}>
                  <SupportHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contact-us"
              element={
                <ProtectedRoute>
                  <ContactUsPage />
                </ProtectedRoute>
              }
            />
            {/* ===================== FARMER ONLY ===================== */}
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["FARMER"]}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/add-product"
              element={
                <ProtectedRoute allowedRoles={["FARMER"]}>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/add-product2"
              element={
                <ProtectedRoute allowedRoles={["FARMER"]}>
                  <AddProductPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/my-products"
              element={
                <ProtectedRoute allowedRoles={["FARMER"]}>
                  <MyProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-product/:id"
              element={
                <ProtectedRoute allowedRoles={["FARMER"]}>
                  <EditProductPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/FarmerHub"
              element={
                <ProtectedRoute allowedRoles={["FARMER"]}>
                  <FarmerHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/orders"
              element={
                <ProtectedRoute allowedRoles={["FARMER"]}>
                  <FarmerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/inquiries"
              element={
                <ProtectedRoute allowedRoles={["FARMER"]}>
                  <InquiryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/sales-history"
              element={
                <ProtectedRoute allowedRoles={["FARMER"]}>
                  <SalesHistory />
                </ProtectedRoute>
              }
            />
            {/* ===================== FERTILIZER SUPPLIER ONLY ===================== */}
            <Route
              path="/fertilizer-dashboard"
              element={
                <ProtectedRoute allowedRoles={["FERTILIZERSUPPLIER"]}>
                  <FertilizerSupplierDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fertilizers/add"
              element={
                <ProtectedRoute allowedRoles={["FERTILIZERSUPPLIER"]}>
                  <AddFertilizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fertilizers/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["FERTILIZERSUPPLIER"]}>
                  <UpdateFertilizer />
                </ProtectedRoute>
              }
            />
            {/* ===================== ADMIN ONLY ===================== */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inquiries"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminInquiries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analysis"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            {/* ===================== FALLBACK ===================== */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {!hideLayout && <ChatBot />}
          {!hideLayout && <Footer />}
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
