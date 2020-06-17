import React from "react";

const FormError = (props) => {
  const { errorMsg } = props;

  const errorStyle = {
    color: "red",
    fontSize: "small",
    visibility: !!errorMsg ? "visible" : "hidden",
  };

  return <div style={errorStyle}>{errorMsg}</div>;
};

export default FormError;
