import gql from "graphql-tag";

export default gql(`
mutation CreateHold($length: Float!, $rollId: ID!, $orderId: String, $notes: String, $reason: String) {
  createHold(
    length: $length, rollId: $rollId, orderId: $orderId, notes: $notes, reason: $reason
  ) {
    id
    rollId
    length
    reason
    notes
    orderId
  }
}`);
