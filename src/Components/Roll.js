import React, {Component} from "react";
import { Query, Mutation } from "react-apollo";

import RollIcon from "./RollIcon";
import AddCut from "./AddCut";
import Loading from "./Loading";
import QueryGetRoll from "../GraphQL/QueryGetRoll";
import Table from "react-bootstrap/Table";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { getReasonName, humanize } from "../DataFunctions/Cuts";
import MutationReturnRoll from '../GraphQL/MutationReturnRoll';
import Dimensions from './Dimensions';
import Button from "react-bootstrap/Button";


class Roll extends Component {

  returnRoll = (mutator, id) => {
    return () => {
      mutator({
        variables: { id }
      });
    };
  };

  render () {
    const {match} = this.props

  return (
  <Query query={QueryGetRoll} variables={{ id: match.params.id }} fetchPolicy='network-only'>
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



          <AddCut
            rollId={match.params.id}
            remaining={remaining}
            refetchQueries={[
              { query: QueryGetRoll, variables: { id: match.params.id } }
            ]}
          />
          <div style={{height: '3vh'}} />

          <h1>Cuts</h1>
          {roll.cuts.map(cut => (
            <Table key={cut.id}>
              <tbody>
                <tr>
                  <td>Length
                    <OverlayTrigger rootClose trigger="click" placement="bottom" overlay={<Dimensions weight={roll.styleColour.style.weight} thickness={roll.styleColour.style.thickness} length={cut.length} />}>
                      <span style={{position: 'relative'}}> ⓘ</span>
                    </OverlayTrigger>
                  </td>
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
          

          

          <div style={{height: '3vh'}} />

          {roll.returned ? null :
          <Mutation
            mutation={MutationReturnRoll}
            refetchQueries={[
              { query: QueryGetRoll, variables: { id: match.params.id } }
            ]}
          >
          {(returnRoll, { loading, error }) => (
            <Button
            disabled={loading}
            variant="dark"
            size="lg"
            onClick={this.returnRoll(returnRoll, match.params.id)}
          >
            Return Roll
          </Button>
          )}
          </Mutation>}
        </div>
      );
    }}
  </Query>)
  }
}

export default Roll;
