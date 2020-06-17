import React from "react";
import Popover from "react-bootstrap/Popover";
import DimensionIcon from "./DimensionIcon";

const coreRadius = 1.25;

export default class Dimensions extends React.Component {
  render() {
    const { weight, length, thickness } = this.props;
    const diameter =
      2 *
      Math.sqrt((length * 36 * thickness) / Math.PI + coreRadius * coreRadius);
    return (
      <Popover id="popover-basic" title="Dimensions" {...this.props}>
        <div style={wrapperStyle}>
          <DimensionIcon
            length={54}
            diameter={diameter}
            weight={length * weight}
          />
        </div>
      </Popover>
    );
  }
}

const wrapperStyle = {
  padding: "10%",
  height: 150,
  minWidth: "60vw",
};
