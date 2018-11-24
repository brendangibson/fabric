import React from "react";

import Header from "./Components/Header";
import ScrollToTop from "./Components/ScrollToTop";

const wrapperStyle = {
  padding: "0 5vw 5vw 5vw"
};

const App = props => (
  <ScrollToTop>
    <div style={wrapperStyle} className="fabricApp">
      <Header />
      {props.children}
    </div>
  </ScrollToTop>
);

export default App;
