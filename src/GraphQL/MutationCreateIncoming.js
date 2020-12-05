import gql from "graphql-tag";

export default gql(`
mutation CreateIncoming($length: Float!, $colourStyleId: ID!, $orderId: String, $notes: String) {
  createIncoming(
    length: $length, colourStyleId: $colourStyleId, orderId: $orderId, notes: $notes
  ) {
    id
    length
    notes
    orderId
  }
}`);
