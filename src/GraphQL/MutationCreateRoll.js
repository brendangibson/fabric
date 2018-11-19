import gql from "graphql-tag";

export default gql(`
mutation CreateRoll($originalLength: Float, $colourStyleId: ID!, $glenRavenId: String, $notes: String, $shipmentId: ID) {
  createRoll(
    originalLength: $originalLength, colourStyleId: $colourStyleId, glenRavenId: $glenRavenId, notes: $notes, shipmentId: $shipmentId
  ) {
    id
    originalLength
    glenRavenId
    notes
  }
}`);
