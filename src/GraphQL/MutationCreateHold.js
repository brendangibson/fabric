import gql from "graphql-tag";

export default gql(`
mutation CreateHold($length: Float!, $colourStyleId: ID!, $notes: String, $owner: String, $expires: String) {
  createHold(
    length: $length, colourStyleId: $colourStyleId, notes: $notes, owner: $owner, expires: $expires
  ) {
    id
    length
    notes
    owner
    expires
  }
}`);
