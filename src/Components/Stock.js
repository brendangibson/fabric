import React from "react";

import { Query } from "react-apollo";
import QueryGetStyleColourPages from "../GraphQL/QueryGetStyleColourPages";
import Loading from "./Loading";
import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";

const swatchStyle = {
  height: "20vw",
  width: "20vw",
};

const renderStyleColour = (styleColourPage) => {
  const name =
    styleColourPage.styleColour.style.name +
    " " +
    styleColourPage.styleColour.colour.name;
  const incomingLength = getTotalIncoming(styleColourPage);
  const holdLength = getTotalHolds(styleColourPage);
  return (
    <tr key={styleColourPage.styleColour.id}>
      <td>
        <Link to={`/stylecolour/${styleColourPage.styleColour.id}`}>
          <img
            style={swatchStyle}
            src={styleColourPage.styleColour.swatchUrl}
            alt={name}
          />
        </Link>
      </td>
      <td>{name}</td>
      <td>{incomingLength && incomingLength.toFixed(1) + "yds"}</td>
      <td>{holdLength && holdLength.toFixed(1) + "yds"}</td>
    </tr>
  );
};

const getTotalIncoming = (styleColourPage) => {
  return styleColourPage.rolls.reduce((outerAccum, outerValue) => {
    return (
      outerAccum +
      outerValue.incoming.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.length;
      }, 0)
    );
  }, 0);
};

const getTotalHolds = (styleColourPage) => {
  return (
    styleColourPage.holds &&
    styleColourPage.holds.reduce(
      (accumulator, hold) => accumulator + hold.length,
      0
    )
  );
};

const Stock = () => (
  <Query query={QueryGetStyleColourPages} fetchPolicy="network-only">
    {({ loading, error, data }) => {
      if (loading) return <Loading />;
      if (error) return `Error! ${error.message}`;

      return (
        <Table>
          <thead>
            <tr>
              <th colSpan={2}>Style Colour</th>
              <th>Incoming</th>
              <th>Holds</th>
            </tr>
          </thead>
          <tbody>{data.styleColourPages.map(renderStyleColour)}</tbody>
        </Table>
      );
    }}
  </Query>
);

export default Stock;
