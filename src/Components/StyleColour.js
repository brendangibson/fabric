import React, { Component } from "react";
import { Query } from "react-apollo";
import { Link } from "react-router-dom";

import QueryGetStyleColour from "../GraphQL/QueryGetStyleColour";
import RollIcon from "./RollIcon";
import AddRoll from "./AddRoll";
import Loading from "./Loading";
import Swatch from "./Swatch";

import { humanize } from "../DataFunctions/Cuts";

const topStyle = {
  padding: "5vw 0 5vw 0",
  display: "grid",
  gridTemplateColumns: "50% auto",
  gridGap: "5vw"
};

const labelStyle = {
  fontSize: "6vw",
  display: "inline-block",
  verticalAlign: "top"
};

const rollStyle = {
  display: "block"
};

const lengthStyle = {};

class StyleColour extends Component {
  render() {
    const { match } = this.props;

    return (
      <Query query={QueryGetStyleColour} variables={{ id: match.params.id }}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return `Error! ${error.message}`;
          const styleColourPage = data.styleColourPage;
          if (!styleColourPage) return null;
          const styleColour = styleColourPage.styleColour;
          const label = styleColour.style.name + " " + styleColour.colour.name;
          const remaining = styleColourPage.rolls.reduce(
            (outerAccum, outerValue) => {
              return (
                outerAccum +
                outerValue.originalLength -
                outerValue.cuts.reduce(
                  (accumulator, currentValue) =>
                    accumulator + currentValue.length,
                  0
                )
              );
            },
            0
          );
          return (
            <div>
              <div style={topStyle}>
                <Swatch src={styleColour.swatchUrl} />
                <div style={{ display: "inline-block" }}>
                  <div style={labelStyle}>{label}</div>
                  <div style={lengthStyle}>
                    {humanize(remaining)} yard{remaining === 1 ? "" : "s"}{" "}
                    remaining
                  </div>
                  <i style={{ fontSize: "smaller" }}>
                    {styleColour.glenRavenName}
                  </i>
                </div>
              </div>
              {styleColourPage.rolls.map(roll => {
                return (
                  <Link to={`/roll/${roll.id}`} key={roll.id} style={rollStyle}>
                    <RollIcon
                      originalLength={roll.originalLength}
                      swatchUrl={styleColour.swatchUrl}
                      glenRavenId={roll.glenRavenId}
                      remaining={
                        roll.originalLength -
                        roll.cuts.reduce(
                          (accumulator, currentValue) =>
                            accumulator + currentValue.length,
                          0
                        )
                      }
                    />
                  </Link>
                );
              })}

              <AddRoll
                shipments={styleColourPage.shipments}
                styleColourId={match.params.id}
                refetchQueries={[
                  {
                    query: QueryGetStyleColour,
                    variables: { id: match.params.id }
                  }
                ]}
              />
            </div>
          );
        }}
      </Query>
    );
  }
}

export default StyleColour;
