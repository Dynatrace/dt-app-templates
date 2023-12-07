import React from "react";
import ReactDOM from "react-dom";
import { AppRoot } from "@dynatrace/strato-components-preview";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/App";

ReactDOM.render(
  <AppRoot>
    <BrowserRouter basename="ui">
      <App />
    </BrowserRouter>
  </AppRoot>,
  document.getElementById("root")
);
