import gql from "graphql-tag";

export default gql(`
mutation UpdateHold($id: ID!, $length: Float!, $notes: String!, $owner: String!, $expires: String!) {
  updateHold(
    id: $id, length: $length, notes: $notes, owner: $owner, expires: $expires
  ) {
    id
    length
    notes
    owner
    expires
  }
}`);
