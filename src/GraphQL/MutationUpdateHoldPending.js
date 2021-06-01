import gql from "graphql-tag";

export default gql(`
mutation UpdateHoldPending($id: ID!, $pending: Boolean!) {
  updateHoldPending(
    id: $id, pending: $pending
  ) {
    id
    length
    notes
    owner
    expires
    pending
  }
}`);
