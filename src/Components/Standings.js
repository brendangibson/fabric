import React from "react";

import { Query } from "react-apollo";
import QueryGetStyleColourPages from "../GraphQL/QueryGetStyleColourPages";
import Loading from "./Loading";
import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";

const swatchStyle = {
  height: '20vw',
  width: '20vw'
}

const renderStyleColour = styleColourPage => {

  const name = styleColourPage.styleColour.style.name + ' ' + styleColourPage.styleColour.colour.name
  const cutLength = getTotalCuts(styleColourPage)
  const holdLength = getTotalHolds(styleColourPage)
  return (
        <tr key={styleColourPage.styleColour.id}>
          <td>
            <Link to={`/stylecolour/${styleColourPage.styleColour.id}`}>
              <img style={swatchStyle} src={styleColourPage.styleColour.swatchUrl} alt={name} />
            </Link>
          </td>
          <td>{name}</td>
          <td>{cutLength && (cutLength.toFixed(1) + 'yds')}</td>
          <td>{holdLength && (holdLength.toFixed(1) + 'yds')}</td>
        </tr>
      
  );
};

const getTotalCuts = (styleColourPage) => {
  return styleColourPage.rolls.reduce(
    (outerAccum, outerValue) => {
      return (
        outerAccum +
        outerValue.cuts.reduce(
          (accumulator, currentValue) =>{

            return accumulator + currentValue.length},
          0
        )
      );
    },
    0
  )
}

const getTotalHolds = (styleColourPage) => {
  return styleColourPage.rolls.reduce(
    (outerAccum, outerValue) => {
      return (
        outerAccum +
        outerValue.holds.reduce(
          (accumulator, currentValue) =>
            accumulator + currentValue.length,
          0
        )
      );
    },
    0
  )
}

const Standings = () => (
  <Query query={QueryGetStyleColourPages}>
    {({ loading, error, data }) => {
      if (loading) return <Loading />;
      if (error) return `Error! ${error.message}`;

      const styleColourPagesCopy = data && data.styleColourPages && Object.assign([], data.styleColourPages)
      const ordered = styleColourPagesCopy && styleColourPagesCopy.sort((a,b) => {
        const cutLengthA = getTotalCuts(a)
        const cutLengthB = getTotalCuts(b)    
        if (cutLengthA < cutLengthB)
          return 1;
        if (cutLengthA > cutLengthB)
          return -1;
        return 0;
      })

      return (
        <Table>
          <thead>
            <tr>
              <th colSpan={2}>Style Colour</th>
              <th>Cuts</th>
              <th>Holds</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map(renderStyleColour)}
          </tbody>
        </Table>
      );
    }}
  </Query>
);

export default Standings;
