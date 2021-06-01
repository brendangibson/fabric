import gql from "graphql-tag";

export default gql(`
mutation CreateHold($length: Float!, $colourStyleId: ID!, $notes: String, $owner: String, $expires: String, $pending: Boolean) {
  createHold(
    length: $length, colourStyleId: $colourStyleId, notes: $notes, owner: $owner, expires: $expires, pending: $pending
  ) {
    id
    length
    notes
    owner
    expires
    pending
  }
}`);
