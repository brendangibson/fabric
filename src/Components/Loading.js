import React from "react";

const wrapperStyle = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const imgStyle = {
  height: "25%",
  opacity: 0.5,
  animation: `pulse 2s infinite`,
  display: "block",
};

const Loading = () => (
  <div style={wrapperStyle}>
    <img src="/textLogo.svg" alt="Loading..." style={imgStyle} />
  </div>
);

export default Loading;
