import "./bootstrap";
import "../css/app.css";

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";

const appElement = document.getElementById("app");
if (appElement) {
    const root = createRoot(appElement);
    root.render(<App />);
}
