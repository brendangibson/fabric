import gql from "graphql-tag";

export default gql(`
mutation CreateIncoming($length: Float!, $colourStyleId: ID!, $orderId: String, $notes: String, $expected: String) {
  createIncoming(
    length: $length, colourStyleId: $colourStyleId, orderId: $orderId, notes: $notes, expected: $expected
  ) {
    id
    length
    notes
    orderId
    expected
  }
}`);
