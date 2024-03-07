import React from "react";
import ReactDOM from "react-dom/client";
import { AppRoot } from "@dynatrace/strato-components-preview";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/App";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <AppRoot>
      <BrowserRouter basename="ui">
        <App />
      </BrowserRouter>
    </AppRoot>
  </React.StrictMode>
);
