import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PulseProvider } from "./lib/pulse-store";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PulseProvider>
      <App />
    </PulseProvider>
  </React.StrictMode>
);
