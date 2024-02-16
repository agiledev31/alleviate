import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./style/css/normalize.css";
import "./style/css/webflow.css";
import "./style/index.scss";

import AntInit from "./AntInit";
import { persistor, store } from "./redux/store";

if (process.env.NODE_ENV === "development") {
  // Hide development error overlay of react
  const style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = "body > iframe { display: none; }";
  document.head.appendChild(style);
}

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AntInit />
        {/* <LanguageSwitcher /> */}
      </PersistGate>
    </Provider>
  );
};

export default App;
