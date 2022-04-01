import gql from "graphql-tag";

export default gql(`
mutation UpdateStandby($id: ID!, $length: Float!) {
  updateStandby(
    id: $id, length: $length
  ) {
    id
    length
  }
}`);
