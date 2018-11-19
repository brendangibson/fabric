import gql from "graphql-tag";

export default gql(`
mutation CreateCut($length: Float!, $rollId: ID!, $orderId: String, $notes: String, $reason: String) {
  createCut(
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
