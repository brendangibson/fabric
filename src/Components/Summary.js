import React from "react";

import { Query } from "react-apollo";
import QueryGetStylesColours from "../GraphQL/QueryGetStylesColours";
import { humanize } from "../DataFunctions/Cuts";
import Loading from "./Loading";
import Swatch from "./Swatch";
import { Link } from "react-router-dom";

const wrapperStyle = {
  display: "flex",
  flexDirection: "column",
  padding: "5vw 0",
};

const rowStyle = {
  display: "flex",
};

const leftColumnStyle = {
  width: "25vw",
  padding: "2vw 5vw",
};

const rightColumnStyle = {
  padding: "2vw 5vw",
};

const StyleColour = ({ styleColour }) => {
  return (
    <div style={rowStyle}>
      <div style={leftColumnStyle}>
        <Link
          to={
            "https://www.sienandco.com/products/" +
            styleColour.name.toLowerCase().replace(" ", "-") +
            "-fabric"
          }
        >
          <Swatch src={styleColour.swatchUrl} />
        </Link>
      </div>
      <div style={rightColumnStyle}>
        <strong>{styleColour.name}</strong>

        <div>
          <strong>
            {humanize(styleColour.remaining)} yard
            {styleColour.remaining === 1 ? "" : "s"}
          </strong>{" "}
          in stock
        </div>
        {styleColour.holdsLength ? (
          <div style={{ color: "sienna" }}>
            {humanize(styleColour.holdsLength)} yard
            {styleColour.holdsLength === 1 ? "" : "s"} on hold
          </div>
        ) : null}
        {styleColour.incoming &&
          styleColour.incoming.map((i) => (
            <div key={i.id} style={{ color: "olive" }}>
              {i.length} yards expected {i.expected ? "on" + i.expected : ""}
            </div>
          ))}
        {styleColour.incomingLength && !styleColour.incoming ? (
          <div style={{ color: "olive" }}>
            {styleColour.incomingLength} yards on their way
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Summary = () => (
  <Query query={QueryGetStylesColours} fetchPolicy="network-only">
    {(stylesColoursResponse) => {
      if (stylesColoursResponse.loading) return <Loading />;

      if (stylesColoursResponse.error)
        return `Error! ${stylesColoursResponse.error.message}`;

      return (
        <div style={wrapperStyle}>
          {stylesColoursResponse.data.stylesColours.map((styleColour) => (
            <StyleColour styleColour={styleColour} key={styleColour.id} />
          ))}
        </div>
      );
    }}
  </Query>
);

export default Summary;
