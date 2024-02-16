import React from "react";

import { ConfigProvider } from "antd";
import { useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import PublicPages from "./PublicPages";
import { brandColor } from "./data/constants";
import Dashboard from "./pages/Dashboard";
import { selectUser } from "./redux/auth/selectors";

const AntInit = () => {
  const user = useSelector(selectUser);
  return (
    <>
      <ConfigProvider
        theme={{ token: { colorPrimary: user?.themeColor ?? brandColor } }}
      >
        <Router>
          <Routes>
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/*" element={<PublicPages />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </>
  );
};

export default AntInit;
