import React from "react";

import { Query } from "react-apollo";
import QueryGetShipments from "../GraphQL/QueryGetShipments";
import Loading from "./Loading";
import AddShipment from "./AddShipment";
import Table from "react-bootstrap/Table";
import AccessControl from "./AccessControl";

const wrapperStyle = {
  display: "flex",
  flexDirection: "column",
};

const renderShipment = (shipment) => {
  return (
    <Table key={shipment.id}>
      <tbody>
        <tr>
          <td>id</td>
          <td>{shipment.id}</td>
        </tr>
        <tr>
          <td>name</td>
          <td>
            <strong>{shipment.name}</strong>
          </td>
        </tr>
        <tr>
          <td>dateSent</td>
          <td>{shipment.dateSent}</td>
        </tr>
        <tr>
          <td>dateReceived</td>
          <td>{shipment.dateReceived}</td>
        </tr>
        <tr>
          <td>glenRavenId</td>
          <td>{shipment.glenRavenId}</td>
        </tr>
      </tbody>
    </Table>
  );
};

const Shipments = () => (
  <Query query={QueryGetShipments}>
    {({ loading, error, data }) => {
      if (loading) return <Loading />;
      if (error) return `Error! ${error.message}`;

      return (
        <div style={wrapperStyle}>
          {data.getShipments.map(renderShipment)}
          <AccessControl>
            {" "}
            <AddShipment refetchQueries={[{ query: QueryGetShipments }]} />
          </AccessControl>
        </div>
      );
    }}
  </Query>
);

export default Shipments;
