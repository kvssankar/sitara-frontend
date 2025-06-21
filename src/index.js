import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@cloudscape-design/global-styles/index.css";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Suppress ResizeObserver loop limit exceeded warning
// This is a harmless warning that occurs with complex UI components
const resizeObserverErr = window.console.error;
window.console.error = (...args) => {
  if (
    args.length > 0 &&
    typeof args[0] === "string" &&
    args[0].includes(
      "ResizeObserver loop completed with undelivered notifications"
    )
  ) {
    return; // Suppress this specific error
  }
  resizeObserverErr(...args);
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
