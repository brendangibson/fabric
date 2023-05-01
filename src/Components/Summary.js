import React, { useState } from "react";

import { Query } from "react-apollo";
import QueryGetStylesColoursSummary from "../GraphQL/QueryGetStylesColoursSummary";
import { humanize } from "../DataFunctions/Cuts";
import Loading from "./Loading";
import Swatch from "./Swatch";
import moment from "moment";
import AddHold from "./AddHold";
import Button from "react-bootstrap/Button";

const wrapperStyle = {
  display: "flex",
  flexDirection: "column",
  padding: "5vw 0",
};

const rowStyle = {
  display: "flex",
};

const leftColumnStyle = {
  width: "33vw",
  padding: "1vw",
};

const rightColumnStyle = {
  padding: "1vw 5vw",
  width: "67vw",
};

const holdModalStyle = {
  position: "absolute",
  background: "#FFF",
  padding: 8,
  border: "1px solid grey",
};

const StyleColour = ({ styleColour }) => {
  const [addingHoldId, setAddingHoldId] = useState();

  const openHold = (id) => () => {
    setAddingHoldId((value) => (value === id ? undefined : id));
  };

  const handleAddedHold = () => {
    setAddingHoldId(undefined);
  };

  return (
    <div style={rowStyle}>
      <div style={leftColumnStyle}>
        <a
          href={
            "https://www.sienandco.com/products/" +
            styleColour.name.toLowerCase().replace(" ", "-") +
            "-fabric"
          }
          target="_blank"
        >
          <Swatch src={styleColour.swatchUrl} />
        </a>
      </div>
      <div style={rightColumnStyle}>
        <strong>{styleColour.name}</strong>{" "}
        <div>
          <strong>
            {humanize(styleColour.remaining)} yard
            {styleColour.remaining === 1 ? "" : "s"}
          </strong>{" "}
          in stock
        </div>
        {styleColour.holdsLength ? (
          <div style={{ color: "sienna" }}>
            {humanize(styleColour.holdsLength)} yards reserved
          </div>
        ) : null}
        {styleColour.incoming &&
          styleColour.incoming
            .sort((a, b) => moment(a.expected) - moment(b.expected))
            .map((i) => (
              <div key={i.id} style={{ color: "#58735F" }}>
                {i.length} yards expected{" "}
                {i.expected ? moment(i.expected).format("MM/DD/YY") : ""}
              </div>
            ))}
        {styleColour.incomingLength && !styleColour.incoming ? (
          <div style={{ color: "#58735F" }}>
            {styleColour.incomingLength} yards on their way
          </div>
        ) : null}
        {styleColour.standby &&
          styleColour.standby.map((i) => (
            <div key={i.id} style={{ color: "#58735F" }}>
              {i.length} yards on standby{" "}
            </div>
          ))}
        {styleColour.standbyLength && !styleColour.standby ? (
          <div style={{ color: "#58735F" }}>
            {styleColour.standbyLength} yards on standby
          </div>
        ) : null}
        <Button
          variant="dark"
          size="sm"
          onClick={openHold(styleColour.id)}
          style={{ marginTop: "1vh" }}
        >
          Request a reserve
        </Button>
        {addingHoldId === styleColour.id ? (
          <div style={holdModalStyle}>
            <AddHold
              colourStyleId={addingHoldId}
              refetchQueries={[
                {
                  query: QueryGetStylesColoursSummary,
                },
              ]}
              onComplete={handleAddedHold}
              onClose={openHold(styleColour.id)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Summary = () => (
  <Query query={QueryGetStylesColoursSummary} fetchPolicy="network-only">
    {(stylesColoursResponse) => {
      if (stylesColoursResponse.loading) return <Loading />;

      if (stylesColoursResponse.error)
        return `ZZError! ${stylesColoursResponse.error.message}`;

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
