import React, {Component} from "react";
import { Query } from "react-apollo";

import RollIcon from "./RollIcon";
import AddCut from "./AddCut";
import Loading from "./Loading";
import QueryGetRoll from "../GraphQL/QueryGetRoll";
import Table from "react-bootstrap/Table";
import { getReasonName, humanize } from "../DataFunctions/Cuts";
import MutationCreateCut from '../GraphQL/MutationCreateCut';
import MutationDeleteHold from '../GraphQL/MutationDeleteHold';

const scissorStyle = {
  display: 'inline-block', 
  marginLeft: 16, 
  transform: 'rotate(90deg)', 
  verticalAlign:'middle',
  cursor: 'pointer'
}

class Roll extends Component {


  cutHold = hold => {
    return () => {
      const { length, reason, notes, orderId } = hold;
      const { rollId } = this.props;

      console.log('cutHold')

      MutationCreateCut({
        variables: { rollId, length, reason, notes, orderId },
        optimisticResponse: {
          __typename: "Mutation",
          createCut: {
            __typename: "Roll",
            id: "12345",
            rollId: rollId,
            length: length,
            reason: reason,
            notes: notes,
            orderId: orderId
          }
        }
      });
      MutationDeleteHold({
        variables: { id: hold.id }
      })
    };
  };
  
  render () {
    const {match} = this.props

  return (
  <Query query={QueryGetRoll} variables={{ id: match.params.id }}>
    {({ loading, error, data }) => {
      if (loading) return <Loading />;
      if (error) return `Error! ${error.message}`;
      const roll = data.roll;
      const label =
        roll.styleColour.style.name + " " + roll.styleColour.colour.name;
      const remaining =
        roll.originalLength -
        roll.cuts.reduce(
          (accumulator, currentValue) => accumulator + currentValue.length,
          0
        );

      return (
        <div>
          <RollIcon
            originalLength={roll.originalLength}
            swatchUrl={roll.styleColour.swatchUrl}
            glenRavenId={roll.glenRavenId}
            remaining={remaining}
          />
          <Table>
            <tbody>
              <tr>
                <td>Style Colour</td>
                <td>
                  <b>{label}</b>
                </td>
              </tr>
              <tr>
                <td>Length</td>
                <td>
                  {humanize(remaining)}/{roll.originalLength} yards
                </td>
              </tr>
              {roll.shipment && (
                <tr>
                  <td>Shipment</td>
                  <td>
                    {roll.shipment.name ||
                      roll.shipment.dateRecieved ||
                      roll.shipment.dateSent}
                  </td>
                </tr>
              )}
              {roll.notes && (
                <tr>
                  <td>Notes</td>
                  <td>{roll.notes}</td>
                </tr>
              )}
            </tbody>
          </Table>
          <h1>Cuts</h1>
          {roll.cuts.map(cut => (
            <Table key={cut.id}>
              <tbody>
                <tr>
                  <td>Length</td>
                  <td>
                    {humanize(cut.length)} yard{cut.length === 1 ? "" : "s"}
                  </td>
                </tr>
                <tr>
                  <td>Reason</td>
                  <td>{getReasonName(cut.reason)}</td>
                </tr>
                {cut.notes && (
                  <tr>
                    <td>Notes</td>
                    <td>{cut.notes}</td>
                  </tr>
                )}
                {cut.orderId && (
                  <tr>
                    <td>Order Id</td>
                    <td>{cut.orderId}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          ))}
          {roll.holds && roll.holds.length ? <h1>Holds</h1> : null}
          {roll.holds.map(hold => (
            <Table key={hold.id} style={{color: 'red'}}>
              <tbody>
                <tr>
                  <td>Length</td>
                  <td>
                    {humanize(hold.length)} yard{hold.length === 1 ? "" : "s"}
                    <span onClick={this.cutHold(hold)} style={scissorStyle}>✂</span>
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
              </tbody>
            </Table>
          ))}
          <AddCut
            rollId={match.params.id}
            remaining={remaining}
            refetchQueries={[
              { query: QueryGetRoll, variables: { id: match.params.id } }
            ]}
          />
        </div>
      );
    }}
  </Query>)
  }
}

export default Roll;
