import React, { useState } from "react";

import { Query } from "react-apollo";
import QueryGetStylesColours from "../GraphQL/QueryGetStylesColours";
import { humanize } from "../DataFunctions/Cuts";
import Loading from "./Loading";
import Swatch from "./Swatch";
import moment from "moment";
import AddHold from "./AddHold";

const wrapperStyle = {
  display: "flex",
  flexDirection: "column",
  padding: "5vw 0",
};

const rowStyle = {
  display: "flex",
  height: "35vw",
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

const reserveLinkStyle = {
  color: "lightskyblue",
  cursor: "pointer",
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
        <a onClick={openHold(styleColour.id)} style={reserveLinkStyle}>
          reserve
        </a>
        <div>
          <strong>
            {humanize(styleColour.remaining)} yard
            {styleColour.remaining === 1 ? "" : "s"}
          </strong>{" "}
          in stock
        </div>
        {styleColour.holdsLength ? (
          <div style={{ color: "sienna" }}>
            {humanize(styleColour.holdsLength)} yards on hold
          </div>
        ) : null}
        {styleColour.incoming &&
          styleColour.incoming.map((i) => (
            <div key={i.id} style={{ color: "olive" }}>
              {i.length} yards expected{" "}
              {i.expected ? moment(i.expected).format("MMM D") : ""}
            </div>
          ))}
        {styleColour.incomingLength && !styleColour.incoming ? (
          <div style={{ color: "olive" }}>
            {styleColour.incomingLength} yards on their way
          </div>
        ) : null}
        {addingHoldId === styleColour.id ? (
          <div style={holdModalStyle}>
            <AddHold
              colourStyleId={addingHoldId}
              refetchQueries={[
                {
                  query: QueryGetStylesColours,
                },
              ]}
              onComplete={handleAddedHold}
            />
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
