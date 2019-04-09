import gql from "graphql-tag";

export default gql(`
mutation CreateHold($length: Float!, $colourStyleId: ID!, $orderId: String, $notes: String, $reason: String) {
  createHold(
    length: $length, colourStyleId: $colourStyleId, orderId: $orderId, notes: $notes, reason: $reason
  ) {
    id
    length
    reason
    notes
    orderId
  }
}`);
