import gql from "graphql-tag";

export default gql(`
query($id: ID!) {
  getHold(id: $id) {
    id
    length
    reason
    orderId
    notes
  }
}`);
