import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { loadApiConfig } from "@/lib/apiConfig";
import { DashboardProvider } from "@/lib/dashboardStore";
import { DeviceProvider } from "@/lib/device";
import App from "./App";
import "./index.css";

loadApiConfig().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <DeviceProvider>
          <AuthProvider>
            <DashboardProvider>
              <App />
            </DashboardProvider>
          </AuthProvider>
        </DeviceProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
});
