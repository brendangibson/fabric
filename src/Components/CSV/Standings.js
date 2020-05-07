import React from "react";

import { Query } from "react-apollo";
import QueryGetStyleColourPages from "../../GraphQL/QueryGetStyleColourPages";
import Loading from "../Loading";


const swatchStyle = {
  height: '20vw',
  width: '20vw'
}

const renderStyleColour = styleColourPage => {

  const cutLength = getTotalCuts(styleColourPage)
  const nonSampleCutLength = getNonSampleCuts(styleColourPage)
  return (<p>
    {styleColourPage.styleColour.style.name},{styleColourPage.styleColour.colour.name},{cutLength},{nonSampleCutLength} 
  </p>);
};

const getNonSampleCuts = (styleColourPage) => {
  return styleColourPage.rolls.reduce(
    (outerAccum, outerValue) => {
      return (
        outerAccum +
        outerValue.cuts.reduce(
          (accumulator, currentValue) =>{
            return accumulator + (currentValue.reason !== 'samples' ? currentValue.length: 0)},
          0
        )
      );
    },
    0
  )
}

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
  return styleColourPage.holds && styleColourPage.holds.reduce(
    (accumulator, hold) =>
      accumulator + hold.length,
    0
  )
}


const Standings = () => (
  <Query query={QueryGetStyleColourPages} fetchPolicy='no-cache'>
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
        <code>
          Style, Colour, Sample Cuts, Non-sample Cuts
          {ordered.map(renderStyleColour)}
        </code>
      );
    }}
  </Query>
);

export default Standings;
