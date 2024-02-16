import { message } from "antd";
import Cookies from "js-cookie";
import React, { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Blog from "./pages/Blog";
import Landing from "./pages/Landing";
import HomePage from "./pages/app/HomePage";
import Auth from "./pages/auth";
import Legal from "./pages/legal";
import AuthService from "./service/AuthService";

const PublicPages = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      if (!Cookies.get("accessToken")) return; // User is not authenticated
      const res = await AuthService.me();

      const onboardingStatus = res.data.onboardingStatus;

      if (onboardingStatus.actionRequired) {
        // User is not onboarded

        if (
          onboardingStatus.step === "isEmailVerified" &&
          !location.pathname.includes("/auth/otpemail")
        )
          navigate("/auth/otpemail");
        if (
          onboardingStatus.step === "isPhoneVerified" &&
          !location.pathname.includes("/auth/otpphone")
        )
          navigate("/auth/otpphone");
        if (
          onboardingStatus.step === "isRoleSelected" &&
          !location.pathname.includes("/auth/roleSelect")
        )
          navigate("/auth/roleSelect");
        if (
          onboardingStatus.step === "kycVerified" &&
          !location.pathname.includes("/auth/kyc")
        )
          navigate("/auth/kyc");
        if (
          onboardingStatus.step === "businessIdApproved" &&
          !location.pathname.includes("/auth/business")
        )
          navigate("/auth/business");
        if (
          onboardingStatus.step === "profileCompletion" &&
          !location.pathname.includes("/dashboard/settings")
        ) {
          message.info("Please complete your profile");
          navigate("/dashboard/settings");
        }
      } else if (!location.pathname.includes("dashboard"))
        navigate("/dashboard"); // Authenticated and onboarded user is not on dashboard, so get them onto dashboard
    };
    checkUser();
  }, [location, navigate]);
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/auth/*" element={<Auth />} />
        <Route path="/app/home" element={<HomePage />} />
        <Route path="/legal/*" element={<Legal />} />
        <Route path="/*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
};

export default PublicPages;
