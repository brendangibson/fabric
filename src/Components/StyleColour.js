import React, { Component } from "react";
import { Query, Mutation } from "react-apollo";
import { Link } from "react-router-dom";
import Table from "react-bootstrap/Table";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import MutationDeleteHold from "../GraphQL/MutationDeleteHold";
import MutationDeleteIncoming from "../GraphQL/MutationDeleteIncoming";
import { getReasonName, humanize } from "../DataFunctions/Cuts";
import QueryGetStyleColour from "../GraphQL/QueryGetStyleColour";
import RollIcon from "./RollIcon";
import AddRoll from "./AddRoll";
import Loading from "./Loading";
import Swatch from "./Swatch";
import AddHold from "./AddHold";
import AddIncoming from "./AddIncoming";
import Dimensions from "./Dimensions";
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

const deleteStyle = {
  display: "inline-block",
  marginLeft: 16,
  verticalAlign: "middle",
  cursor: "pointer",
};

const lengthStyle = {};
const holdStyle = { color: "sienna" };

const calculateRemaining = (roll) =>
  roll.originalLength -
  roll.cuts.reduce(
    (accumulator, currentValue) => accumulator + currentValue.length,
    0
  );

class StyleColour extends Component {
  deleteHold = (mutator, id) => {
    return () => {
      mutator({
        variables: { id },
      });
    };
  };
  deleteIncoming = (mutator, id) => {
    return () => {
      mutator({
        variables: { id },
      });
    };
  };

  render() {
    const { match } = this.props;

    return (
      <Query
        query={QueryGetStyleColour}
        variables={{ id: match.params.id }}
        fetchPolicy="network-only"
      >
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return `Error! ${error.message}`;
          const styleColourPage = data.styleColourPage;
          if (!styleColourPage) return null;
          const styleColour = styleColourPage.styleColour;
          const label = styleColour.style.name + " " + styleColour.colour.name;
          const remaining = styleColourPage.rolls.reduce((outerAccum, roll) => {
            if (roll.returned) {
              return outerAccum;
            }
            const remaining = calculateRemaining(roll);
            if (remaining < 1) {
              return outerAccum;
            }

            return outerAccum + calculateRemaining(roll);
          }, 0);
          const holdLength = styleColourPage.holds.reduce(
            (accumulator, hold) => accumulator + hold.length,
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
                    {humanize(remaining)} yard{remaining === 1 ? "" : "s"}{" "}
                    remaining
                  </div>
                  <div style={holdStyle}>
                    {humanize(holdLength)} yard{holdLength === 1 ? "" : "s"} on
                    hold
                  </div>
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
                styleColourPage.incoming.map((incoming) => (
                  <Table key={incoming.id}>
                    <tbody>
                      <tr>
                        <td>Length</td>
                        <td>
                          {humanize(incoming.length)} yard
                          {incoming.length === 1 ? "" : "s"}
                          <Mutation
                            mutation={MutationDeleteIncoming}
                            refetchQueries={[
                              {
                                query: QueryGetStyleColour,
                                variables: { id: match.params.id },
                              },
                            ]}
                          >
                            {(deleteIncoming, { loading, error }) => (
                              <span
                                onClick={this.deleteIncoming(
                                  deleteIncoming,
                                  incoming.id
                                )}
                                style={deleteStyle}
                              >
                                ⓧ
                              </span>
                            )}
                          </Mutation>
                        </td>
                      </tr>
                      {incoming.notes && (
                        <tr>
                          <td>Notes</td>
                          <td>{incoming.notes}</td>
                        </tr>
                      )}
                      {incoming.orderId && (
                        <tr>
                          <td>Order Id</td>
                          <td>{incoming.orderId}</td>
                        </tr>
                      )}
                      {incoming.timestamp && (
                        <tr>
                          <td>Date requested</td>
                          <td>
                            {moment(incoming.timestamp).format("MMMM Do, YYYY")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                ))}

              {styleColourPage.holds && styleColourPage.holds.length ? (
                <h1>Holds</h1>
              ) : null}
              {styleColourPage.holds.map((hold) => (
                <Table key={hold.id}>
                  <tbody>
                    <tr>
                      <td>
                        Length
                        <OverlayTrigger
                          rootClose
                          trigger="click"
                          placement="bottom"
                          overlay={
                            <Dimensions
                              weight={styleColourPage.styleColour.style.weight}
                              thickness={
                                styleColourPage.styleColour.style.thickness
                              }
                              length={hold.length}
                            />
                          }
                        >
                          <span style={{ position: "relative" }}> ⓘ</span>
                        </OverlayTrigger>
                      </td>
                      <td>
                        {humanize(hold.length)} yard
                        {hold.length === 1 ? "" : "s"}
                        <Mutation
                          mutation={MutationDeleteHold}
                          refetchQueries={[
                            {
                              query: QueryGetStyleColour,
                              variables: { id: match.params.id },
                            },
                          ]}
                        >
                          {(deleteHold, { loading, error }) => (
                            <span
                              onClick={this.deleteHold(deleteHold, hold.id)}
                              style={deleteStyle}
                            >
                              ⓧ
                            </span>
                          )}
                        </Mutation>
                      </td>
                    </tr>
                    <tr>
                      <td>Reason</td>
                      <td>{getReasonName(hold.reason)}</td>
                    </tr>
                    {hold.notes && (
                      <tr>
                        <td>Notes</td>
                        <td>{hold.notes}</td>
                      </tr>
                    )}
                    {hold.orderId && (
                      <tr>
                        <td>Order Id</td>
                        <td>{hold.orderId}</td>
                      </tr>
                    )}
                    {hold.timestamp && (
                      <tr>
                        <td>Date requested</td>
                        <td>
                          {moment(hold.timestamp).format("MMMM Do, YYYY")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              ))}

              <div style={{ height: "3vh" }} />
              <AccessControl>
                <AddIncoming
                  colourStyleId={match.params.id}
                  refetchQueries={[
                    {
                      query: QueryGetStyleColour,
                      variables: { id: match.params.id },
                    },
                  ]}
                />
                <div style={{ height: "3vh" }} />
              </AccessControl>
              <AccessControl>
                <AddHold
                  colourStyleId={match.params.id}
                  refetchQueries={[
                    {
                      query: QueryGetStyleColour,
                      variables: { id: match.params.id },
                    },
                  ]}
                />
                <div style={{ height: "3vh" }} />
              </AccessControl>
              <AccessControl>
                <AddRoll
                  shipments={styleColourPage.shipments}
                  styleColourId={match.params.id}
                  refetchQueries={[
                    {
                      query: QueryGetStyleColour,
                      variables: { id: match.params.id },
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
