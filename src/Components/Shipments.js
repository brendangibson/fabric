import React from "react";

import { Query } from "react-apollo";
import QueryGetShipments from "../GraphQL/QueryGetShipments";
import Loading from "./Loading";
import AddShipment from "./AddShipment";
import Table from "react-bootstrap/Table";
import AccessControl from "./AccessControl";
import moment from "moment";

const wrapperStyle = {
  display: "flex",
  flexDirection: "column",
};

const renderShipment = (shipment) => {
  return (
    <Table key={shipment.id} style={{ marginTop: "1vh", tableLayout: "fixed" }}>
      <tbody>
        <tr>
          <td>Name</td>
          <td>
            <strong>{shipment.name}</strong>
          </td>
        </tr>
        <tr>
          <td>Date Sent</td>
          <td>{moment(shipment.dateSent).format("MMMM Do, YYYY")}</td>
        </tr>
        <tr>
          <td>Date Received</td>
          <td>{moment(shipment.dateReceived).format("MMMM Do, YYYY")}</td>
        </tr>
        <tr>
          <td>Glenraven Id</td>
          <td>{shipment.glenRavenId}</td>
        </tr>
      </tbody>
    </Table>
  );
};

const Shipments = () => (
  <Query query={QueryGetShipments} fetchPolicy="network-only">
    {({ loading, error, data }) => {
      if (loading) return <Loading />;
      if (error) return `Error! ${error.message}`;

      return (
        <div style={wrapperStyle}>
          <AccessControl>
            <AddShipment refetchQueries={[{ query: QueryGetShipments }]} />
          </AccessControl>
          <div style={{ height: "3vh" }} />

          <h3>Shipments</h3>
          {data.getShipments
            .sort((a, b) => a.dateReceived < b.dateReceived)
            .map(renderShipment)}
        </div>
      );
    }}
  </Query>
);

export default Shipments;
