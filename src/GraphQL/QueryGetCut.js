import gql from "graphql-tag";

export default gql(`
query($id: ID!) {
  getCut(id: $id) {
    id
    length
    reason
    orderId
    notes
  }
}`);
