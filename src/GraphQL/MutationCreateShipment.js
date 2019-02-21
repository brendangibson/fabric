import gql from "graphql-tag";

export default gql(`
mutation CreateShipment($name: String!, $dateSent: String, $dateReceived: String, $glenRavenId: String) {
  createShipment(
    name: $name, dateSent: $dateSent, dateReceived: $dateReceived, glenRavenId: $glenRavenId
  ) {
    id
    name
    dateSent
    dateReceived
    glenRavenId
  }
}`);
