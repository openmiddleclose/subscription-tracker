// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 🔹 Page Imports
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import SavingsRecommendations from "./pages/SavingsRecommendations";
import BillingSuccess from "./pages/BillingSuccess";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import StripeCheckoutPage from "./pages/StripeCheckout.jsx";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// 🔹 Component Imports
import ProtectedRoute from "./components/ProtectedRoute";

// ✅ Temporary test line — remove after confirming key loads correctly
console.log("Stripe Publishable Key:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔹 Terms & Privacy */}
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* 🔒 Protected Pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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
          path="/savings"
          element={
            <ProtectedRoute>
              <SavingsRecommendations />
            </ProtectedRoute>
          }
        />

        {/* 🔹 Subscription Flow */}
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <SubscriptionPlans />
            </ProtectedRoute>
          }
        />

        {/* 🔹 Stripe Checkout Page */}
        <Route
          path="/stripe-checkout"
          element={
            <ProtectedRoute>
              <StripeCheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* 🔹 Stripe Success Page */}
        <Route
          path="/success"
          element={
            <ProtectedRoute>
              <BillingSuccess />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
