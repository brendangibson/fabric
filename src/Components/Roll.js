import React, {Component} from "react";
import { Query, Mutation } from "react-apollo";

import RollIcon from "./RollIcon";
import AddCut from "./AddCut";
import AddHold from "./AddHold";
import Loading from "./Loading";
import QueryGetRoll from "../GraphQL/QueryGetRoll";
import Table from "react-bootstrap/Table";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { getReasonName, humanize } from "../DataFunctions/Cuts";
import MutationDeleteHold from '../GraphQL/MutationDeleteHold';
import MutationCutHold from '../GraphQL/MutationCutHold';
import MutationReturnRoll from '../GraphQL/MutationReturnRoll';
import Dimensions from './Dimensions';
import Button from "react-bootstrap/Button";

const scissorStyle = {
  display: 'inline-block', 
  marginLeft: 16, 
  transform: 'rotate(90deg)', 
  verticalAlign:'middle',
  cursor: 'pointer'
}

const deleteStyle = {
  display: 'inline-block', 
  marginLeft: 16, 
  verticalAlign:'middle',
  cursor: 'pointer'
}

class Roll extends Component {


  cutHold = (mutator, id) => {
    return () => {
      mutator({
        variables: { id }
      });
    };
  };
  
  deleteHold = (mutator, id) => {
    return () => {
      mutator({
        variables: { id }
      });
    };
  };

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

{roll.holds && roll.holds.length ? <h1>Holds</h1> : null}
{roll.holds.map(hold => (
  <Table key={hold.id}>
    <tbody>
      <tr>
        <td>Length
        <OverlayTrigger rootClose trigger="click" placement="bottom" overlay={<Dimensions weight={roll.styleColour.style.weight} thickness={roll.styleColour.style.thickness} length={hold.length} />}>
            <span style={{position: 'relative'}}> ⓘ</span>
          </OverlayTrigger>
        </td>
        <td>
          {humanize(hold.length)} yard{hold.length === 1 ? "" : "s"}
          <Mutation
            mutation={MutationCutHold}
            refetchQueries={[
              { query: QueryGetRoll, variables: { id: match.params.id } }
            ]}
          >
            {(cutHold, { loading, error }) => (
              <span onClick={this.cutHold(cutHold, hold.id)} style={scissorStyle}>✂</span>
            )}
          </Mutation>
          <Mutation
            mutation={MutationDeleteHold}
            refetchQueries={[
              { query: QueryGetRoll, variables: { id: match.params.id } }
            ]}
          >
          {(deleteHold, { loading, error }) => (
            <span onClick={this.deleteHold(deleteHold, hold.id)} style={deleteStyle}>ⓧ</span>
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
          <AddHold
            rollId={match.params.id}
            remaining={remaining}
            refetchQueries={[
              { query: QueryGetRoll, variables: { id: match.params.id } }
            ]}
          />

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
