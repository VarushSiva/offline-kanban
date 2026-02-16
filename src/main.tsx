import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store.ts";
import { attachPersistence } from "./features/persistence/persistListener.ts";
import App from "./App.tsx";
import "./index.css";

attachPersistence(store);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
