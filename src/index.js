import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import WebApp from "./WebApp";
import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(<WebApp />, document.getElementById("root"));
registerServiceWorker();
