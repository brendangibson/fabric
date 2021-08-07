import React, { Component } from "react";
import { Query } from "react-apollo";
import { Link } from "react-router-dom";
import Hold from "./Hold";
import Incoming from "./Incoming";
import { humanize } from "../DataFunctions/Cuts";
import { calculateRemaining } from "../DataFunctions/Roll";
import QueryGetStyleColour from "../GraphQL/QueryGetStyleColour";
import RollIcon from "./RollIcon";
import AddRoll from "./AddRoll";
import Loading from "./Loading";
import Swatch from "./Swatch";
import AddHold from "./AddHold";
import AddIncoming from "./AddIncoming";
import moment from "moment";
import AccessControl from "./AccessControl";

const topStyle = {
  padding: "5vw 0 5vw 0",
  display: "grid",
  gridTemplateColumns: "50% auto",
  gridGap: "5vw",
};

const labelStyle = {
  fontSize: "6vw",
  display: "inline-block",
  verticalAlign: "top",
};

const lengthStyle = {};
const holdStyle = { color: "sienna" };
const incomingStyle = { color: "#58735F" };

class StyleColour extends Component {
  constructor(props) {
    super(props);
    this.holdsRef = React.createRef();
  }
  deleteIncoming = (mutator, id) => {
    return () => {
      mutator({
        variables: { id },
      });
    };
  };

  handleAddHoldComplete = () => {
    this.holdsRef.current &&
      this.holdsRef.current.scrollIntoView({ behavior: "smooth" });
  };

  render() {
    const { match } = this.props;
    const styleColourId = match.params.id;

    return (
      <Query
        query={QueryGetStyleColour}
        variables={{ id: styleColourId }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return `Error! ${error.message}`;
          const styleColourPage = data.styleColourPage;
          if (!styleColourPage) return null;
          const styleColour = styleColourPage.styleColour;
          const label = styleColour.style.name + " " + styleColour.colour.name;
          const holdLength = styleColourPage.holds.reduce(
            (accumulator, hold) => accumulator + hold.length,
            0
          );
          const incomingLength = styleColourPage.incoming.reduce(
            (accumulator, incoming) => accumulator + incoming.length,
            0
          );

          const bigRolls = styleColourPage.rolls.filter(
            (roll) => !roll.returned && calculateRemaining(roll) > 0.5
          );
          const smallRolls = styleColourPage.rolls.filter(
            (roll) => roll.returned || calculateRemaining(roll) <= 0.5
          );

          return (
            <div>
              <div style={topStyle}>
                <Swatch src={styleColour.swatchUrl} />
                <div style={{ display: "inline-block" }}>
                  <div style={labelStyle}>{label}</div>
                  <div style={lengthStyle}>
                    {humanize(styleColour.remaining)} yard
                    {styleColour.remaining === 1 ? "" : "s"}
                  </div>
                  {holdLength > 0 ? (
                    <div style={holdStyle}>
                      {humanize(holdLength)} yard{holdLength === 1 ? "" : "s"}{" "}
                      on hold
                    </div>
                  ) : null}
                  {incomingLength ? (
                    <div style={incomingStyle}>
                      {humanize(incomingLength)} yard
                      {incomingLength === 1 ? " on its way" : "s on their way"}
                    </div>
                  ) : null}
                  <i style={{ fontSize: "smaller" }}>
                    {styleColour.glenRavenName}
                  </i>
                </div>
              </div>
              {bigRolls.map((roll) => {
                const rollStyle = {
                  display: "block",
                  opacity: roll.returned ? 0.25 : 1,
                };
                return (
                  <Link to={`/roll/${roll.id}`} key={roll.id} style={rollStyle}>
                    <RollIcon
                      originalLength={roll.originalLength}
                      swatchUrl={styleColour.swatchUrl}
                      glenRavenId={roll.glenRavenId}
                      remaining={calculateRemaining(roll)}
                    />
                  </Link>
                );
              })}

              {styleColourPage.incoming && styleColourPage.incoming.length ? (
                <h1>Incoming Fabric</h1>
              ) : null}
              {styleColourPage.incoming &&
                styleColourPage.incoming
                  .sort((a, b) => moment(a.expected) - moment(b.expected))
                  .map((incoming) => (
                    <Incoming
                      incoming={incoming}
                      styleColourId={styleColourId}
                      styleColourPage={styleColourPage}
                      key={incoming.id}
                      refetchQueries={[
                        {
                          query: QueryGetStyleColour,
                          variables: { id: styleColourId },
                        },
                      ]}
                    />
                  ))}

              <a name="holds" ref={this.holdsRef}>
                {styleColourPage.holds && styleColourPage.holds.length ? (
                  <h1>Holds</h1>
                ) : null}
                {styleColourPage.holds.map((hold) => (
                  <Hold
                    hold={hold}
                    styleColourId={styleColourId}
                    styleColourPage={styleColourPage}
                    key={hold.id}
                    refetchQueries={[
                      {
                        query: QueryGetStyleColour,
                        variables: { id: styleColourId },
                      },
                    ]}
                  />
                ))}
              </a>

              <div style={{ height: "3vh" }} />
              <AccessControl>
                <AddIncoming
                  colourStyleId={styleColourId}
                  refetchQueries={[
                    {
                      query: QueryGetStyleColour,
                      variables: { id: styleColourId },
                    },
                  ]}
                />
                <div style={{ height: "3vh" }} />
              </AccessControl>
              <AccessControl>
                <AddHold
                  colourStyleId={styleColourId}
                  refetchQueries={[
                    {
                      query: QueryGetStyleColour,
                      variables: { id: styleColourId },
                    },
                  ]}
                  onComplete={this.handleAddHoldComplete}
                />
                <div style={{ height: "3vh" }} />
              </AccessControl>
              <AccessControl>
                <AddRoll
                  shipments={styleColourPage.shipments}
                  styleColourId={styleColourId}
                  refetchQueries={[
                    {
                      query: QueryGetStyleColour,
                      variables: { id: styleColourId },
                    },
                  ]}
                />
                <div style={{ height: "3vh" }} />
              </AccessControl>
              {smallRolls.length ? <h1>Old Rolls</h1> : null}

              {smallRolls.map((roll) => {
                const rollStyle = {
                  display: "block",
                  opacity: roll.returned ? 0.25 : 1,
                };
                return (
                  <Link to={`/roll/${roll.id}`} key={roll.id} style={rollStyle}>
                    <RollIcon
                      originalLength={roll.originalLength}
                      swatchUrl={styleColour.swatchUrl}
                      glenRavenId={roll.glenRavenId}
                      remaining={calculateRemaining(roll)}
                    />
                  </Link>
                );
              })}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default StyleColour;
