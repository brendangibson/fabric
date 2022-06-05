import React from "react";

import { Query } from "react-apollo";
import QueryGetStylesColours from "../GraphQL/QueryGetStylesColours";
import Loading from "./Loading";
import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";
import { humanize } from "../DataFunctions/Cuts";

const swatchStyle = {
  height: "20vw",
  width: "20vw",
};

const renderStyleColour = (styleColour) => {
  const name = styleColour.name;

  console.log(
    (styleColour.remaining +
      styleColour.incomingLength +
      styleColour.standbyLength -
      styleColour.holdLength) /
      styleColour.rate,
    styleColour.remaining,
    styleColour.incomingLength,
    styleColour.standbyLength,
    styleColour.holdsLength,
    styleColour.rate
  );

  return (
    <tr key={styleColour.id}>
      <td>
        <Link to={`/stylecolour/${styleColour.id}`}>
          <img style={swatchStyle} src={styleColour.swatchUrl} alt={name} />
        </Link>
      </td>
      <td>{name}</td>
      <td>{humanize(styleColour.remaining)}</td>
      <td>{humanize(styleColour.incomingLength)}</td>
      <td>{humanize(styleColour.standbyLength)}</td>
      <td>{humanize(styleColour.holdsLength)}</td>
      <td>{humanize(styleColour.rate)}</td>
      <td>
        {humanize(
          (styleColour.remaining +
            styleColour.incomingLength +
            styleColour.standbyLength -
            styleColour.holdsLength) /
            styleColour.rate
        )}
      </td>
    </tr>
  );
};

const Standings = () => (
  <Query query={QueryGetStylesColours} fetchPolicy="no-cache">
    {({ loading, error, data }) => {
      if (loading) return <Loading />;
      if (error) return `Error! ${error.message}`;

      const ordered = data.stylesColours;

      return (
        <Table>
          <thead>
            <tr>
              <th colSpan={2}>Style Colour</th>
              <th>Remaining (yds)</th>
              <th>Incoming (yds)</th>
              <th>Standby (yds)</th>
              <th>Holds (yds)</th>
              <th>Daily Rate (1 yr)</th>
              <th>Days remaining</th>
            </tr>
          </thead>
          <tbody>{ordered.map(renderStyleColour)}</tbody>
        </Table>
      );
    }}
  </Query>
);

export default Standings;
