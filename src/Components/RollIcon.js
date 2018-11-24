import React from "react";

import { humanize } from "../DataFunctions/Cuts";
const coreHeight = 3;

const getHeight = length => {
  return 20 * (length / 30) + coreHeight;
};

const wrapperStyle = {
  padding: "5vw 10vw"
};

const dataStyle = {
  display: "inline-block"
};

const labelStyle = {
  backgroundColor: "#fff",
  color: "#000",
  border: "1px dashed black",
  display: "inline-block",
  padding: "1vw",
  position: "absolute",
  transform: "translate(-50%, -50%)",
  top: "50%",
  left: "50%",
  zIndex: 1
};

const RollIcon = ({ originalLength, swatchUrl, remaining, glenRavenId }) => {
  const height = getHeight(remaining) + "vw";
  const endWidth = getHeight(remaining) / 2 + "vw";

  return (
    <div style={wrapperStyle}>
      <div
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.26) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0.32) 100%), url(" +
            swatchUrl +
            ")",
          display: "inline-block",
          textAlign: "center",
          backgroundRepeat: "repeat",
          backgroundSize: "5vw",
          width: "calc(70% + " + getHeight(remaining) / 2 + "vw)",
          height: height,
          position: "relative"
        }}
      >
        <div
          style={{
            borderRadius: "50%",
            background: "#8E6033",
            transform: "translateX(-" + getHeight(remaining) / 4 + "vw)",
            width: endWidth,
            position: "absolute",
            height: height,
            left: 0
          }}
        >
          <div
            style={{
              position: "absolute",
              background: "#333",
              transform: "translateX(-50%) translateY(-50%)",
              top: "50%",
              left: "50%",
              borderRadius: "50%",
              height: coreHeight + "vw",
              width: coreHeight / 2 + "vw"
            }}
          />
        </div>
        <div style={labelStyle}>{glenRavenId}</div>
        <div
          style={{
            overflow: "hidden",
            right: "-1px",
            top: "-1px",
            bottom: "-1px",
            position: "absolute",
            width: endWidth,
            padding: "1px 1px 1px 0"
          }}
        >
          <div
            style={{
              borderRadius: "50%",
              background: "transparent",
              transform: "translateX(-" + getHeight(remaining) / 4 + "vw)",
              width: endWidth,
              position: "absolute",
              height: height,
              boxShadow: "0 0 0 20vw white"
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            height: 0,
            width: "90%",
            boxShadow: "rgba(0, 0, 0, 1) 0px 0px 20px 5px"
          }}
        />
      </div>
      <div style={dataStyle}>
        {humanize(remaining)}/{originalLength} yard
        {originalLength === 1 ? "" : "s"}
      </div>
    </div>
  );
};

export default RollIcon;
