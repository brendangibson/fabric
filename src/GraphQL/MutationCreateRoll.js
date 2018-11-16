import gql from "graphql-tag";

export default gql(`
mutation CreateRoll($originalLength: Float, $colourStyleId: ID!, $glenRavenId: String, $locationId: ID) {
  createRoll(
    originalLength: $originalLength, colourStyleId: $colourStyleId, glenRavenId: $glenRavenId, locationId: $locationId
  ) {
    id
    originalLength
    colourStyleId
    glenRavenId
    locationId
  }
}`);
