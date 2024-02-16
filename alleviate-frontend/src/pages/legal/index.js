import React from "react";
import { Route, Routes } from "react-router-dom";
import Privacy from "./Privacy";

const Legal = () => {
  return (
    <>
      <Routes>
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </>
  );
};

export default Legal;
