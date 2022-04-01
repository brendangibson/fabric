import gql from "graphql-tag";

export default gql(`
mutation CreateStandby($length: Float!, $colourStyleId: ID!) {
  createStandby(
    length: $length, colourStyleId: $colourStyleId
  ) {
    id
    length
  }
}`);
