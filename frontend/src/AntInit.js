import React from "react";

import { ConfigProvider, theme } from "antd";
import { useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import PublicPages from "./PublicPages";
import { brandColor } from "./data/constants";
import Dashboard from "./pages/Dashboard";
import JoinTeamMember from "./pages/JoinTeamMember";
import { selectDarkMode, selectUser } from "./redux/auth/selectors";

const AntInit = () => {
  const user = useSelector(selectUser);
  const darkMode = useSelector(selectDarkMode);
  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <div className={`${darkMode ? "dark" : ""} `}>
      <div className={`dark:bg-gray-900 dark:text-white min-h-[100vh]`}>
        <ConfigProvider
          theme={{
            token: { colorPrimary: user?.themeColor ?? brandColor },
            algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
          }}
        >
          <Router>
            <Routes>
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/join" element={<JoinTeamMember />} />
              <Route path="/*" element={<PublicPages />} />
            </Routes>
          </Router>
        </ConfigProvider>
      </div>
    </div>
  );
};

export default AntInit;
