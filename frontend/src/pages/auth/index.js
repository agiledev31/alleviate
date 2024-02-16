import React from "react";
import { Route, Routes } from "react-router-dom";
import Business from "./Business";
import Forgot from "./Forgot";
import KYC from "./KYC";
import Login from "./Login";
import OTPEmail from "./OTPEmail";
import OTPPhone from "./OTPPhone";
import Register from "./Register";
import RoleSelection from "./RoleSelection";

const Auth = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otpemail" element={<OTPEmail />} />
      <Route path="/otpphone" element={<OTPPhone />} />
      <Route path="/roleSelect" element={<RoleSelection />} />
      <Route path="/kyc" element={<KYC />} />
      <Route path="/business" element={<Business />} />
      <Route path="/forgot" element={<Forgot />} />
    </Routes>
  );
};

export default Auth;
