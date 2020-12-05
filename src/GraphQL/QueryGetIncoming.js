import gql from "graphql-tag";

export default gql(`
query($id: ID!) {
  getIncoming(id: $id) {
    id
    length
    orderId
    notes
  }
}`);
