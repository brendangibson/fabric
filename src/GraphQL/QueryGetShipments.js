import gql from "graphql-tag";

export default gql(`
query  {
  getShipments {
    id
    name
    dateSent
    dateReceived
    glenRavenId
  }
}`);